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
  function showGate(notice){
    if(!gate){
      gate = document.createElement('div');
      gate.id = 'authGate';
      document.body.appendChild(gate);
    }
    document.documentElement.classList.add('gated');
    const render = () => {
      gate.innerHTML =
        '<div class="lms-card">'
        + '<div class="lms-welcome">\u00a1Bienvenido de nuevo!</div>'
        + '<img class="lms-logo" src="assets/Logo_Login.png" alt="UTECA">'
        + (notice ? '<div class="auth-notice">'+notice+'</div>' : '')
        + '<form id="authForm" autocomplete="off">'
        + '<div class="lms-title">Iniciar sesi\u00f3n</div>'
        + '<input id="aUser" maxlength="40" placeholder="Usuario" required autocapitalize="none" autocomplete="username" aria-label="Usuario">'
        + '<input id="aPin" type="password" maxlength="64" placeholder="Contrase\u00f1a" autocomplete="current-password" aria-label="Contrase\u00f1a">'
        + '<label class="lms-remember"><input type="checkbox" id="aRemember"><span>Recordar usuario</span></label>'
        + '<div class="auth-err hidden" id="aErr"></div>'
        + '<div class="lms-enter">'
        + '<img src="assets/svg_leftArrowLogin.svg" alt="" aria-hidden="true">'
        + '<button class="auth-btn" type="submit">Entrar</button>'
        + '<img src="assets/svg_rightArrowLogin.svg" alt="" aria-hidden="true">'
        + '</div>'
        + '</form>'
        + '<div class="lms-foot">AprendeUteca \u00b7 Comunidad UTECA \u00b7 Parte de la red de Grupo MVS</div>'
        + '</div>';
      gate.querySelector('#authForm').onsubmit = async (ev) => {
        ev.preventDefault();
        const errEl = gate.querySelector('#aErr');
        errEl.classList.add('hidden');
        const username = gate.querySelector('#aUser').value.trim();
        const pin = gate.querySelector('#aPin').value;
        const btn = gate.querySelector('.auth-btn');
        if(!username){ errEl.textContent = 'Escribe tu usuario.'; errEl.classList.remove('hidden'); return; }
        btn.disabled = true; btn.textContent = 'Un momento…';
        try{
          const r = await api('POST', '/api/login', {username, pin});
          try{
            const rm = gate.querySelector('#aRemember');
            if(rm && rm.checked) localStorage.setItem('aq_remember_user', username);
            else localStorage.removeItem('aq_remember_user');
          }catch(_e){}
          AQ.user = r.user;
          await enterApp();
        }catch(e){
          const msgs = {
            'usuario-vacio':'Escribe tu usuario.',
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
      const first = gate.querySelector('#aUser'); if(first) first.focus();
    };
    render();
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
    b.textContent = '👋 Cerrar sesión ('+(AQ.user ? AQ.user.username : '')+')';
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
