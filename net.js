"use strict";
/* ============================================================================
   net.js — capa de red y arranque con sesión (AprendeUteca)

   El estado del alumno YA NO vive en localStorage: vive en el servidor.
   Este archivo corre ANTES que app.js y:
     1. Verifica la sesión (GET /api/me). Sin sesión → pantalla de login/registro.
     2. Con sesión, descarga TODO el estado (GET /api/data) a una caché en
        memoria (AQ.cache). app.js lee/escribe esa caché a través de Store.
     3. Cada escritura se marca "sucia" y se sube con debounce (PUT /api/data).
        Al ocultar/cerrar la pestaña se manda un último flush con sendBeacon.
     4. Migración única: si el navegador tiene progreso viejo en localStorage
        (versión GitHub Pages), ofrece subirlo a la cuenta y luego lo borra.
   ========================================================================== */
(function(){
  const AQ = window.AQ = {
    cache: Object.create(null),
    dirty: new Set(),
    deleted: new Set(),
    user: null,
    ready: false,
    lastSaveOk: null
  };

  /* ---------- API helper ---------- */
  async function api(method, path, body){
    const res = await fetch(path, {
      method,
      headers: body !== undefined ? {'Content-Type':'application/json'} : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
      cache: 'no-store'
    });
    let data = null;
    try{ data = await res.json(); }catch(e){}
    if(!res.ok){
      const err = new Error((data && data.error) || ('http '+res.status));
      err.status = res.status; err.data = data;
      throw err;
    }
    return data;
  }
  AQ.api = api;

  /* ---------- persistencia (debounce + reintentos) ---------- */
  let saveTimer = null, retryTimer = null;
  AQ.persist = function(key){
    AQ.dirty.add(key); AQ.deleted.delete(key);
    scheduleFlush(1200);
  };
  AQ.persistDelete = function(key){
    AQ.deleted.add(key); AQ.dirty.delete(key);
    scheduleFlush(1200);
  };
  function scheduleFlush(ms){
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, ms);
  }
  async function flush(){
    saveTimer = null;
    if(!AQ.user || (!AQ.dirty.size && !AQ.deleted.size)) return;
    const sets = {}; AQ.dirty.forEach(k => { if(k in AQ.cache) sets[k] = AQ.cache[k]; });
    const dels = Array.from(AQ.deleted);
    const sentSet = Object.keys(sets), sentDel = dels.slice();
    try{
      await api('PUT', '/api/data', {set: sets, del: dels});
      sentSet.forEach(k => AQ.dirty.delete(k));
      sentDel.forEach(k => AQ.deleted.delete(k));
      AQ.lastSaveOk = Date.now();
      setSyncBadge('ok');
    }catch(e){
      setSyncBadge('err');
      if(e.status === 401){ showGate('⚠️ Tu sesión expiró. Vuelve a entrar; tu último avance podría no guardarse.'); return; }
      if(retryTimer) clearTimeout(retryTimer);
      retryTimer = setTimeout(flush, 8000);   // reintento
    }
  }
  AQ.flushNow = flush;
  window.addEventListener('online', () => { if(AQ.dirty.size || AQ.deleted.size) flush(); });
  /* último aliento: al cerrar/ocultar la pestaña, manda lo pendiente */
  window.addEventListener('pagehide', beaconFlush);
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden') beaconFlush(); });
  function beaconFlush(){
    if(!AQ.user || (!AQ.dirty.size && !AQ.deleted.size)) return;
    const sets = {}; AQ.dirty.forEach(k => { if(k in AQ.cache) sets[k] = AQ.cache[k]; });
    const payload = JSON.stringify({set: sets, del: Array.from(AQ.deleted)});
    try{
      const ok = navigator.sendBeacon('/api/data', new Blob([payload], {type:'application/json'}));
      if(ok){ AQ.dirty.clear(); AQ.deleted.clear(); }
    }catch(e){}
  }

  /* indicador discreto de sincronización (esquina inferior) */
  let syncEl = null, syncHideT = null;
  function setSyncBadge(state){
    if(!syncEl){
      syncEl = document.createElement('div');
      syncEl.id = 'syncBadge';
      document.body.appendChild(syncEl);
    }
    if(state === 'ok'){ syncEl.textContent = '☁️ Guardado'; syncEl.className = 'ok show'; }
    else { syncEl.textContent = '⚠️ Sin conexión — reintentando…'; syncEl.className = 'err show'; }
    if(syncHideT) clearTimeout(syncHideT);
    if(state === 'ok') syncHideT = setTimeout(()=> syncEl.classList.remove('show'), 1600);
  }

  /* ---------- pantalla de acceso ---------- */
  let gate = null;
  const CARRERAS = ['Actuaría','Ciencia de Datos','Mercadotecnia Digital','Comunicación y Contenidos Digitales',
    'Animación y Arte de Videojuegos','Diseño y Arte Multimedia','Interpretación y Traducción',
    'Negocios de Entretenimiento','Imagen y Relaciones Públicas','Inteligencia Artificial','Ciberseguridad','Otra'];

  function gateShell(inner){
    return '<img class="lms-mascot" src="assets/Logo_Login.png" alt="" aria-hidden="true">'
      + '<div class="lms-card">'
      + '<img class="lms-logo" src="assets/Logo_UTECA.png" alt="UTECA CDMX">'
      + inner
      + '<div class="lms-foot">AprendeUteca \u00b7 Comunidad UTECA \u00b7 Parte de la red de Grupo MVS</div>'
      + '</div>';
  }

  function showGate(notice){
    if(!gate){
      gate = document.createElement('div');
      gate.id = 'authGate';
      document.body.appendChild(gate);
    }
    document.documentElement.classList.add('gated');
    gate.innerHTML = gateShell(
        '<div class="lms-welcome">\u00a1Bienvenido de nuevo!</div>'
      + (notice ? '<div class="auth-notice">'+notice+'</div>' : '')
      + '<form id="authForm" autocomplete="off">'
      + '<div class="lms-title">Iniciar sesi\u00f3n</div>'
      + '<input id="aUser" type="email" maxlength="120" placeholder="Correo institucional" required autocapitalize="none" autocomplete="username" aria-label="Correo institucional">'
      + '<input id="aPin" type="password" maxlength="64" placeholder="Contrase\u00f1a" required autocomplete="current-password" aria-label="Contrase\u00f1a">'
      + '<label class="lms-remember"><input type="checkbox" id="aRemember"><span>Recordar mi correo</span></label>'
      + '<div class="auth-err hidden" id="aErr"></div>'
      + '<div class="lms-enter">'
      + '<img src="assets/svg_leftArrowLogin.svg" alt="" aria-hidden="true">'
      + '<button class="auth-btn" type="submit">Entrar</button>'
      + '<img src="assets/svg_rightArrowLogin.svg" alt="" aria-hidden="true">'
      + '</div>'
      + '<p class="lms-hint">Usa tu correo <b>@uteca.edu.mx</b>. Si es tu primera vez, la contrase\u00f1a es la que te compartieron en clase.</p>'
      + '</form>');
    gate.querySelector('#authForm').onsubmit = async (ev) => {
      ev.preventDefault();
      const errEl = gate.querySelector('#aErr');
      errEl.classList.add('hidden');
      const email = gate.querySelector('#aUser').value.trim().toLowerCase();
      const password = gate.querySelector('#aPin').value;
      const btn = gate.querySelector('.auth-btn');
      if(!email){ errEl.textContent = 'Escribe tu correo institucional.'; errEl.classList.remove('hidden'); return; }
      btn.disabled = true; btn.textContent = 'Un momento\u2026';
      try{
        const r = await api('POST', '/api/login', {email, password});
        try{
          const rm = gate.querySelector('#aRemember');
          if(rm && rm.checked) localStorage.setItem('aq_remember_user', email);
          else localStorage.removeItem('aq_remember_user');
        }catch(_e){}
        AQ.user = r.user;
        if(!r.user.onboarded) showSetup();
        else await enterApp();
      }catch(e){
        const msgs = {
          'correo-invalido':'Ese correo no parece v\u00e1lido.',
          'correo-no-permitido':'Solo se permiten correos @uteca.edu.mx o los autorizados por tu profe.',
          'credenciales':'Correo o contrase\u00f1a incorrectos.',
          'demasiados-intentos':'Demasiados intentos. Espera 5 minutos.'
        };
        errEl.textContent = msgs[e.data && e.data.error] || 'No se pudo conectar con el servidor. Intenta de nuevo.';
        errEl.classList.remove('hidden');
        btn.disabled = false; btn.textContent = 'Entrar';
      }
    };
    try{
      const saved = localStorage.getItem('aq_remember_user');
      if(saved){ gate.querySelector('#aUser').value = saved; gate.querySelector('#aRemember').checked = true; }
    }catch(_e){}
    const first = gate.querySelector(gate.querySelector('#aUser').value ? '#aPin' : '#aUser');
    if(first) first.focus();
  }

  /* ---------- alta de perfil (primer ingreso) ---------- */
  function showSetup(){
    if(!gate){
      gate = document.createElement('div');
      gate.id = 'authGate';
      document.body.appendChild(gate);
    }
    document.documentElement.classList.add('gated');
    const sugerido = (AQ.user && AQ.user.email ? AQ.user.email.split('@')[0] : '')
      .replace(/[^a-zA-Z0-9_.\-]/g,'').slice(0,24);
    gate.innerHTML = gateShell(
        '<div class="lms-welcome">\u00a1Bienvenido a AprendeUteca!</div>'
      + '<form id="setupForm" autocomplete="off">'
      + '<div class="lms-title">Crea tu perfil</div>'
      + '<p class="lms-hint" style="margin:0 0 12px">As\u00ed te ver\u00e1 tu grupo en la tabla de posiciones.</p>'
      + '<input id="sUser" maxlength="24" placeholder="Nombre de usuario" required autocapitalize="none" aria-label="Nombre de usuario" value="'+sugerido+'">'
      + '<input id="sName" maxlength="40" placeholder="Nombre y apellido" required aria-label="Nombre completo">'
      + '<select id="sCarrera" aria-label="Carrera"><option value="">\u00bfQu\u00e9 estudias?</option>'
      + CARRERAS.map(c => '<option>'+c+'</option>').join('') + '</select>'
      + '<select id="sSem" aria-label="Cuatrimestre"><option value="">Cuatrimestre</option>'
      + ['1\u00ba','2\u00ba','3\u00ba','4\u00ba','5\u00ba','6\u00ba','7\u00ba','8\u00ba','9\u00ba','10\u00ba','11\u00ba','12\u00ba'].map(s => '<option>'+s+'</option>').join('') + '</select>'
      + '<div class="auth-err hidden" id="sErr"></div>'
      + '<div class="lms-enter"><button class="auth-btn" type="submit">Empezar</button></div>'
      + '</form>');
    gate.querySelector('#setupForm').onsubmit = async (ev) => {
      ev.preventDefault();
      const errEl = gate.querySelector('#sErr');
      errEl.classList.add('hidden');
      const username = gate.querySelector('#sUser').value.trim();
      const name = gate.querySelector('#sName').value.trim();
      const carrera = gate.querySelector('#sCarrera').value;
      const semestre = gate.querySelector('#sSem').value;
      const btn = gate.querySelector('.auth-btn');
      if(!username || !name){ errEl.textContent = 'Completa tu usuario y tu nombre.'; errEl.classList.remove('hidden'); return; }
      btn.disabled = true; btn.textContent = 'Un momento\u2026';
      try{
        const r = await api('POST', '/api/profile', {username, name, carrera, semestre});
        AQ.user = r.user;
        AQ.setupProfile = {name, carrera, semestre};
        await enterApp();
      }catch(e){
        const msgs = {
          'usuario-invalido':'El usuario debe tener 2-24 letras o n\u00fameros, sin espacios.',
          'usuario-ocupado':'Ese nombre de usuario ya est\u00e1 tomado. Prueba con otro.',
          'nombre-corto':'Escribe tu nombre completo.'
        };
        errEl.textContent = msgs[e.data && e.data.error] || 'No se pudo guardar. Intenta de nuevo.';
        errEl.classList.remove('hidden');
        btn.disabled = false; btn.textContent = 'Empezar';
      }
    };
    const f = gate.querySelector('#sName'); if(f) f.focus();
  }

  function hideGate(){
    if(gate){ gate.remove(); gate = null; }
    document.documentElement.classList.remove('gated');
  }

  /* ---------- migración única desde localStorage (versión GitHub Pages) ---------- */
  function legacyKeys(){
    const ks = [];
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && k.indexOf('actuariq') === 0) ks.push(k);
      }
    }catch(e){}
    return ks;
  }
  async function maybeMigrateLegacy(serverEmpty){
    const ks = legacyKeys();
    if(!ks.length) return;
    if(serverEmpty && confirm('📦 Este navegador tiene progreso guardado de la versión anterior.\n¿Quieres subirlo a tu cuenta para conservarlo?')){
      const sets = {};
      ks.forEach(k => { try{ const v = localStorage.getItem(k); if(v!==null){ sets[k]=v; AQ.cache[k]=v; } }catch(e){} });
      try{ await api('PUT','/api/data',{set:sets, del:[]}); }catch(e){ return; }   // si falla, no borramos nada
    }
    try{ ks.forEach(k => localStorage.removeItem(k)); }catch(e){}   // adiós persistencia local
  }

  /* ---------- arranque ---------- */
  async function enterApp(){
    const d = await api('GET', '/api/data');
    AQ.cache = Object.create(null);
    Object.keys(d.data || {}).forEach(k => AQ.cache[k] = d.data[k]);
    await maybeMigrateLegacy(Object.keys(AQ.cache).length === 0);
    hideGate();
    AQ.ready = true;
    const s = document.createElement('script');
    s.src = 'app.js';
    s.onload = addLogoutItem;
    document.body.appendChild(s);
  }
  function addLogoutItem(){
    const menu = document.getElementById('moreMenu');
    if(!menu || document.getElementById('btnLogout')) return;
    const b = document.createElement('button');
    b.className = 'more-item'; b.id = 'btnLogout';
    b.textContent = 'Cerrar sesión ('+(AQ.user ? AQ.user.username : '')+')';
    b.onclick = async () => {
      try{ await AQ.flushNow(); }catch(e){}
      try{ await api('POST','/api/logout'); }catch(e){}
      location.reload();
    };
    menu.appendChild(b);
  }

  (async function boot(){
    try{
      const r = await api('GET', '/api/me');
      AQ.user = r.user;
      if(!r.user.onboarded) showSetup();
      else await enterApp();
    }catch(e){
      if(e.status === 401) showGate();
      else showGate('⚠️ No se pudo contactar al servidor ('+(e.message||'error')+'). Revisa que esté encendido e intenta de nuevo.');
    }
  })();
})();
