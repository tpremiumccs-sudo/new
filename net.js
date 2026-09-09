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
  /* Solo login: correo institucional + contrasena. Las credenciales se
     provisionan desde la escuela; aqui no se registra nada. */
  let gate = null;

  function showGate(notice){
    if(!gate){
      gate = document.createElement('div');
      gate.id = 'authGate';
      document.body.appendChild(gate);
    }
    document.documentElement.classList.add('gated');
    gate.innerHTML =
        '<img class="lg-art" src="assets/Logo_Login.png" alt="" aria-hidden="true">'
      + '<div class="lg-card">'
      + '<img class="lg-logo" src="assets/Logo_UTECA.png" alt="UTECA CDMX">'
      + '<h1 class="lg-title">Bienvenido de nuevo</h1>'
      + '<p class="lg-sub">Entra con tu correo institucional</p>'
      + (notice ? '<div class="lg-notice">'+notice+'</div>' : '')
      + '<form id="authForm" autocomplete="on" novalidate>'
      + '<label class="lg-field"><span>Correo institucional</span>'
      + '<input id="aUser" type="email" inputmode="email" maxlength="120" placeholder="nombre.apellido@uteca.edu.mx" autocapitalize="none" autocomplete="username" spellcheck="false"></label>'
      + '<label class="lg-field"><span>Contrase\u00f1a</span>'
      + '<span class="lg-pass"><input id="aPin" type="password" maxlength="64" placeholder="Tu contrase\u00f1a" autocomplete="current-password">'
      + '<button type="button" class="lg-eye" id="aEye" aria-label="Mostrar contrase\u00f1a">Ver</button></span></label>'
      + '<label class="lg-remember"><input type="checkbox" id="aRemember"><span>Recordar mi correo</span></label>'
      + '<div class="lg-err hidden" id="aErr" role="alert"></div>'
      + '<button class="lg-btn" type="submit" id="aGo">Entrar</button>'
      + '</form>'
      + '<p class="lg-help">\u00bfPrimera vez? Usa la contrase\u00f1a que te dieron en la escuela.</p>'
      + '<p class="lg-foot">AprendeUteca \u00b7 Comunidad UTECA</p>'
      + '</div>';

    const $g = s => gate.querySelector(s);
    const eye = $g('#aEye');
    eye.onclick = () => {
      const inp = $g('#aPin');
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      eye.textContent = show ? 'Ocultar' : 'Ver';
      eye.setAttribute('aria-label', show ? 'Ocultar contrase\u00f1a' : 'Mostrar contrase\u00f1a');
      inp.focus();
    };
    $g('#authForm').onsubmit = async (ev) => {
      ev.preventDefault();
      const errEl = $g('#aErr');
      errEl.classList.add('hidden');
      const email = $g('#aUser').value.trim().toLowerCase();
      const password = $g('#aPin').value;
      const btn = $g('#aGo');
      const fail = (msg, focus) => {
        errEl.textContent = msg; errEl.classList.remove('hidden');
        btn.disabled = false; btn.textContent = 'Entrar';
        if(focus) $g(focus).focus();
      };
      if(!email) return fail('Escribe tu correo institucional.', '#aUser');
      if(!password) return fail('Escribe tu contrase\u00f1a.', '#aPin');
      btn.disabled = true; btn.textContent = 'Entrando\u2026';
      try{
        const r = await api('POST', '/api/login', {email, password});
        try{
          if($g('#aRemember').checked) localStorage.setItem('aq_remember_user', email);
          else localStorage.removeItem('aq_remember_user');
        }catch(_e){}
        AQ.user = r.user;
        await enterApp();
      }catch(e){
        const code = e.data && e.data.error;
        const msgs = {
          'correo-invalido':'Ese correo no parece v\u00e1lido.',
          'correo-no-permitido':'Usa tu correo @uteca.edu.mx.',
          'credenciales':'Correo o contrase\u00f1a incorrectos.',
          'demasiados-intentos':'Demasiados intentos. Espera 5 minutos.'
        };
        fail(msgs[code] || 'No se pudo conectar con el servidor. Intenta de nuevo.',
             code === 'credenciales' ? '#aPin' : '#aUser');
      }
    };
    try{
      const saved = localStorage.getItem('aq_remember_user');
      if(saved){ $g('#aUser').value = saved; $g('#aRemember').checked = true; }
    }catch(_e){}
    setTimeout(() => { const f = $g('#aUser').value ? $g('#aPin') : $g('#aUser'); if(f) f.focus(); }, 60);
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
      await enterApp();
    }catch(e){
      if(e.status === 401) showGate();
      else showGate('⚠️ No se pudo contactar al servidor ('+(e.message||'error')+'). Revisa que esté encendido e intenta de nuevo.');
    }
  })();
})();
