#!/usr/bin/env python3
"""
AprendeUTeca / ActuarIQ — servidor de la app + API de persistencia.

Sin dependencias externas: Python 3.8+ (http.server + sqlite3 + hashlib).
Sirve los archivos estáticos de la app Y la API bajo /api/*.

Endpoints:
  POST /api/register    {username, pin, name?}        -> crea cuenta e inicia sesión
  POST /api/login       {username, pin}               -> inicia sesión (cookie HttpOnly)
  POST /api/logout                                    -> cierra sesión
  GET  /api/me                                        -> {user:{username,name,admin}}
  GET  /api/data                                      -> {data:{clave: valor_string}}  (todo el estado del usuario)
  PUT  /api/data        {set:{k:v,...}, del:[k,...]}  -> guarda/borra claves (también acepta POST, para sendBeacon)
  GET  /api/leaderboard                               -> {students:[...]}  (filas de todos los usuarios)
  POST /api/leaderboard {row}                         -> guarda MI fila (anti-suplantación real: 1 fila por cuenta)
  GET  /api/tasks                                     -> payload de tareas publicado por el admin
  PUT  /api/tasks       {payload}                     -> publica tareas (solo admin)
  GET  /api/health                                    -> {ok:true}

Compatibilidad con el cliente existente:
  GET /leaderboard.json -> {app, version, students, syncUrl:'/api/leaderboard'}
  GET /tasks.json       -> payload de tareas (mismo formato que el archivo antiguo)

Config por variables de entorno:
  AQ_PORT   (default 8099)         AQ_DB     (default ~/aprendeuteca-data/aq.db)
  AQ_ROOT   (default carpeta padre de este archivo)
  AQ_ADMINS (default "oliver")     usernames con permiso de publicar tareas
"""
import json, os, re, sqlite3, secrets, hashlib, hmac, time, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote
from http import cookies as http_cookies

ROOT   = os.environ.get('AQ_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT   = int(os.environ.get('AQ_PORT', '8099'))
DBPATH = os.path.expanduser(os.environ.get('AQ_DB', '~/aprendeuteca-data/aq.db'))
ADMINS = {u.strip().lower() for u in os.environ.get('AQ_ADMINS', 'oliver').split(',') if u.strip()}

MAX_BODY        = 8 * 1024 * 1024   # 8 MB (el estado incluye fotos de perfil en base64)
SESSION_DAYS    = 45
PBKDF2_ITERS    = 120_000
COOKIE_NAME     = 'aq_session'

MIME = {
    '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
    '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
    '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon',
    '.md':'text/markdown; charset=utf-8', '.webmanifest':'application/manifest+json',
    '.woff2':'font/woff2', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif',
}
NO_CACHE_EXT = {'.html', '.js', '.css', '.json', '.webmanifest'}

_local = threading.local()
def db():
    if getattr(_local, 'conn', None) is None:
        os.makedirs(os.path.dirname(DBPATH), exist_ok=True)
        c = sqlite3.connect(DBPATH)
        c.row_factory = sqlite3.Row
        c.execute('PRAGMA journal_mode=WAL')
        c.execute('PRAGMA busy_timeout=5000')
        _local.conn = c
    return _local.conn

def init_db():
    c = db()
    c.executescript('''
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL, pin_hash BLOB NOT NULL, salt BLOB NOT NULL,
      created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(
      token TEXT PRIMARY KEY, uid INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS data(
      uid INTEGER NOT NULL, k TEXT NOT NULL, v TEXT NOT NULL,
      updated INTEGER NOT NULL, PRIMARY KEY(uid, k));
    CREATE TABLE IF NOT EXISTS leaderboard(
      uid INTEGER PRIMARY KEY, row TEXT NOT NULL, updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL, updated INTEGER NOT NULL);
    ''')
    c.commit()

def hash_pin(pin: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac('sha256', pin.encode('utf-8'), salt, PBKDF2_ITERS)

# --- rate limit de login: máx 10 intentos por (ip,usuario) cada 5 min ---
_attempts = {}
_att_lock = threading.Lock()
def rate_limited(key):
    now = time.time()
    with _att_lock:
        lst = [t for t in _attempts.get(key, []) if now - t < 300]
        _attempts[key] = lst
        if len(lst) >= 10:
            return True
        lst.append(now)
        return False

VALID_USER = re.compile(r'^[a-zA-Z0-9_.\-áéíóúñÁÉÍÓÚÑ]{2,24}$')

class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    server_version = 'AprendeUTeca/1.0'

    # ---------- utilidades de respuesta ----------
    def _send(self, code, body: bytes, ctype='application/json; charset=utf-8', extra=None):
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        for k, v in (extra or []):
            self.send_header(k, v)
        self.end_headers()
        if self.command == 'HEAD':
            return
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def j(self, code, obj, extra=None):
        self._send(code, json.dumps(obj).encode('utf-8'), extra=extra)

    def err(self, code, msg):
        self.j(code, {'error': msg})

    def read_body(self):
        try:
            n = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            return None
        if n <= 0 or n > MAX_BODY:
            return None
        raw = self.rfile.read(n)
        try:
            return json.loads(raw.decode('utf-8'))
        except Exception:
            return None

    def is_https(self):
        return (self.headers.get('X-Forwarded-Proto', '').lower() == 'https')

    def set_session_cookie(self, token, expires):
        c = f'{COOKIE_NAME}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_DAYS*86400}'
        if self.is_https():
            c += '; Secure'
        return ('Set-Cookie', c)

    def clear_session_cookie(self):
        return ('Set-Cookie', f'{COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')

    def current_user(self):
        raw = self.headers.get('Cookie')
        if not raw:
            return None
        try:
            ck = http_cookies.SimpleCookie(raw)
        except Exception:
            return None
        if COOKIE_NAME not in ck:
            return None
        token = ck[COOKIE_NAME].value
        row = db().execute('SELECT s.token, s.expires, u.id, u.username, u.name FROM sessions s JOIN users u ON u.id=s.uid WHERE s.token=?', (token,)).fetchone()
        if not row or row['expires'] < time.time():
            return None
        return {'id': row['id'], 'username': row['username'], 'name': row['name'],
                'admin': row['username'].lower() in ADMINS, 'token': token}

    def log_message(self, fmt, *args):  # log compacto
        try:
            print('[%s] %s' % (time.strftime('%Y-%m-%d %H:%M:%S'), fmt % args), flush=True)
        except Exception:
            pass

    # ---------- rutas ----------
    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/health':
            return self.j(200, {'ok': True, 'ts': int(time.time())})
        if path == '/api/me':
            u = self.current_user()
            if not u: return self.err(401, 'no-session')
            return self.j(200, {'user': {'username': u['username'], 'name': u['name'], 'admin': u['admin']}})
        if path == '/api/data':
            u = self.current_user()
            if not u: return self.err(401, 'no-session')
            rows = db().execute('SELECT k, v FROM data WHERE uid=?', (u['id'],)).fetchall()
            return self.j(200, {'data': {r['k']: r['v'] for r in rows}})
        if path == '/api/leaderboard':
            return self.j(200, {'students': self.lb_students()})
        if path == '/leaderboard.json':
            return self.j(200, {'app': 'actuariq-board', 'version': 1, 'syncUrl': '/api/leaderboard',
                                'students': self.lb_students()})
        if path in ('/api/tasks', '/tasks.json'):
            row = db().execute('SELECT payload FROM tasks WHERE id=1').fetchone()
            if row:
                return self._send(200, row['payload'].encode('utf-8'),
                                  extra=[('Cache-Control', 'no-store')])
            seed = os.path.join(ROOT, 'seed-tasks.json')
            if os.path.isfile(seed):
                with open(seed, 'rb') as f:
                    return self._send(200, f.read(), extra=[('Cache-Control', 'no-store')])
            return self.j(200, {'app': 'actuariq-tasks', 'version': 1, 'tasks': {}, 'calendar': {}})
        return self.serve_static(path)

    def do_HEAD(self):
        return self.do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == '/api/register':   return self.api_register()
        if path == '/api/login':      return self.api_login()
        if path == '/api/logout':     return self.api_logout()
        if path == '/api/data':       return self.api_put_data()   # sendBeacon usa POST
        if path == '/api/leaderboard':return self.api_post_lb()
        return self.err(404, 'not-found')

    def do_PUT(self):
        path = urlparse(self.path).path
        if path == '/api/data':  return self.api_put_data()
        if path == '/api/tasks': return self.api_put_tasks()
        return self.err(404, 'not-found')

    # ---------- API ----------
    def api_register(self):
        b = self.read_body()
        if not b: return self.err(400, 'bad-json')
        username = str(b.get('username', '')).strip()
        pin      = str(b.get('pin', ''))
        name     = str(b.get('name', '')).strip()[:32] or username
        if not VALID_USER.match(username):
            return self.err(400, 'usuario-invalido')
        if len(pin) < 4 or len(pin) > 64:
            return self.err(400, 'pin-corto')
        salt = secrets.token_bytes(16)
        try:
            cur = db().execute('INSERT INTO users(username, name, pin_hash, salt, created) VALUES(?,?,?,?,?)',
                               (username, name, hash_pin(pin, salt), salt, int(time.time())))
            db().commit()
        except sqlite3.IntegrityError:
            return self.err(409, 'usuario-ocupado')
        return self.start_session(cur.lastrowid, username, name)

    def api_login(self):
        b = self.read_body()
        if not b: return self.err(400, 'bad-json')
        username = str(b.get('username', '')).strip()
        pin      = str(b.get('pin', ''))
        ip = self.headers.get('CF-Connecting-IP') or self.client_address[0]
        if rate_limited((ip, username.lower())):
            return self.err(429, 'demasiados-intentos')
        row = db().execute('SELECT * FROM users WHERE username=? COLLATE NOCASE', (username,)).fetchone()
        if not row or not hmac.compare_digest(hash_pin(pin, row['salt']), row['pin_hash']):
            return self.err(401, 'credenciales')
        return self.start_session(row['id'], row['username'], row['name'])

    def start_session(self, uid, username, name):
        token = secrets.token_urlsafe(32)
        exp = int(time.time()) + SESSION_DAYS * 86400
        db().execute('INSERT INTO sessions(token, uid, expires) VALUES(?,?,?)', (token, uid, exp))
        db().execute('DELETE FROM sessions WHERE expires < ?', (int(time.time()),))
        db().commit()
        return self.j(200, {'ok': True, 'user': {'username': username, 'name': name,
                                                 'admin': username.lower() in ADMINS}},
                      extra=[self.set_session_cookie(token, exp)])

    def api_logout(self):
        u = self.current_user()
        if u:
            db().execute('DELETE FROM sessions WHERE token=?', (u['token'],))
            db().commit()
        return self.j(200, {'ok': True}, extra=[self.clear_session_cookie()])

    def api_put_data(self):
        u = self.current_user()
        if not u: return self.err(401, 'no-session')
        b = self.read_body()
        if b is None: return self.err(400, 'bad-json')
        sets = b.get('set') or {}
        dels = b.get('del') or []
        if not isinstance(sets, dict) or not isinstance(dels, list):
            return self.err(400, 'bad-shape')
        now = int(time.time())
        c = db()
        for k, v in sets.items():
            if not isinstance(k, str) or len(k) > 128 or not isinstance(v, str):
                continue
            c.execute('INSERT INTO data(uid,k,v,updated) VALUES(?,?,?,?) '
                      'ON CONFLICT(uid,k) DO UPDATE SET v=excluded.v, updated=excluded.updated',
                      (u['id'], k, v, now))
        for k in dels:
            if isinstance(k, str):
                c.execute('DELETE FROM data WHERE uid=? AND k=?', (u['id'], k))
        c.commit()
        return self.j(200, {'ok': True, 'saved': len(sets), 'deleted': len(dels)})

    def lb_students(self):
        rows = db().execute('SELECT row FROM leaderboard ORDER BY updated DESC').fetchall()
        out = []
        for r in rows:
            try:
                out.append(json.loads(r['row']))
            except Exception:
                pass
        return out

    def api_post_lb(self):
        u = self.current_user()
        if not u: return self.err(401, 'no-session')
        b = self.read_body()
        if not isinstance(b, dict) or not b.get('name'):
            return self.err(400, 'bad-row')
        # 1 fila por cuenta: anti-suplantación real. pid = cuenta.
        b['pid'] = 'acct_' + str(u['id'])
        b['updated'] = int(time.time() * 1000)
        raw = json.dumps(b)
        if len(raw) > 400_000:   # fotos de avatar demasiado pesadas
            b.pop('photo', None); b.pop('custom', None)
            raw = json.dumps(b)
        db().execute('INSERT INTO leaderboard(uid,row,updated) VALUES(?,?,?) '
                     'ON CONFLICT(uid) DO UPDATE SET row=excluded.row, updated=excluded.updated',
                     (u['id'], raw, int(time.time())))
        db().commit()
        return self.j(200, {'ok': True, 'students': self.lb_students()})

    def api_put_tasks(self):
        u = self.current_user()
        if not u: return self.err(401, 'no-session')
        if not u['admin']: return self.err(403, 'solo-admin')
        b = self.read_body()
        if b is None: return self.err(400, 'bad-json')
        db().execute('INSERT INTO tasks(id,payload,updated) VALUES(1,?,?) '
                     'ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated=excluded.updated',
                     (json.dumps(b), int(time.time())))
        db().commit()
        return self.j(200, {'ok': True})

    # ---------- estáticos ----------
    def serve_static(self, path):
        path = unquote(path)
        if path == '/':
            path = '/index.html'
        # normalizar y evitar path traversal
        fpath = os.path.normpath(os.path.join(ROOT, path.lstrip('/')))
        if not fpath.startswith(os.path.abspath(ROOT)):
            return self.err(403, 'forbidden')
        if os.path.isdir(fpath):
            fpath = os.path.join(fpath, 'index.html')
        if not os.path.isfile(fpath):
            return self.err(404, 'not-found')
        ext = os.path.splitext(fpath)[1].lower()
        ctype = MIME.get(ext, 'application/octet-stream')
        try:
            with open(fpath, 'rb') as f:
                body = f.read()
        except OSError:
            return self.err(500, 'io')
        cache = 'no-store' if ext in NO_CACHE_EXT else 'public, max-age=86400'
        self._send(200, body, ctype=ctype, extra=[('Cache-Control', cache)])


def main():
    init_db()
    srv = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print(f'AprendeUTeca sirviendo {ROOT} en http://0.0.0.0:{PORT} (db: {DBPATH})', flush=True)
    srv.serve_forever()

if __name__ == '__main__':
    main()
