"use strict";
/* ============================================================================
   ActuarIQ · arquitectura del script (regiones en este orden)

   1. Utilidades           helpers puros: $, $$, azar, formato, esc, fechas CDMX
   2. Materias             SUBJECTS y claves por materia
   3. Almacenamiento       Store: único acceso a localStorage + download/readJSON
   4. Perfiles y estado    PROFILES, S (estado del perfil activo), save/loadState
   5. Sonido               AudioManager: WebAudio + fallback <audio>
   6. Tema                 applyTheme (claro/oscuro, acento, temas de la tienda)
   7. UI base              toast, confetti, navegación showView, header (HDR)
   8. Contenido            glosario, preguntas, lecciones, módulos, exámenes
   9. Modos de juego       memorama, escape, flashcards, blitz, muerte súbita…
  10. Leaderboard          datos (lbLoad/lbSave/sync) · orden · render · admin
  11. Tareas/calendario    tasks.json compartido + panel admin
  12. Insignias/estadíst.  BADGES + panel de estadísticas (builders por panel)
  13. Recompensas/tienda   catálogo, rarezas, equipar, avatar (render en capas)
  14. Perfil               vestidor, preferencias, respaldo import/export
  15. Arranque             render inicial, onboarding, sync remoto, PWA
   ========================================================================== */
/* ==================== Utilidades ==================== */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = a => a[ri(0,a.length-1)];
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];} return a; };
const money = n => '$' + Number(n).toLocaleString('es-MX',{maximumFractionDigits:2});
const r2 = n => Math.round(n*100)/100;
const pct = n => (Math.round(n*10000)/100) + '%';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Todas las fechas/horas usan la zona horaria de CDMX (America/Mexico_City, UTC-6). */
const CDMX_TZ = 'America/Mexico_City';
const todayKey = () => new Intl.DateTimeFormat('en-CA', {timeZone:CDMX_TZ, year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
const cdmxHour = (ts=Date.now()) => +new Intl.DateTimeFormat('en-US', {timeZone:CDMX_TZ, hour:'2-digit', hour12:false}).format(new Date(ts)) % 24;
const fmtDate = ts => new Date(ts).toLocaleString('es-MX',{timeZone:CDMX_TZ, day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const cdmxMonth = () => todayKey().slice(0,7);   // 'YYYY-MM' en CDMX
const daysBetweenKeys = (a,b) => Math.round((new Date(b+'T00:00') - new Date(a+'T00:00'))/86400000);
/* Clave de semana ISO (lunes-domingo) a partir de una fecha 'YYYY-MM-DD' de CDMX.
   Se usa para los retos semanales del hub de racha. */
function weekKey(dstr){
  const d = new Date((dstr || todayKey()) + 'T00:00');
  const t = new Date(d); t.setDate(t.getDate() + 4 - (t.getDay() || 7));   // jueves de esa semana ISO
  const yStart = new Date(t.getFullYear(), 0, 1);
  const wk = Math.ceil((((t - yStart) / 86400000) + 1) / 7);
  return t.getFullYear() + '-W' + String(wk).padStart(2, '0');
}
const fmtDur = sec => { sec=Math.round(sec); const h=Math.floor(sec/3600), m=Math.floor(sec%3600/60);
  return h>0 ? h+' h '+m+' min' : (m>0 ? m+' min' : sec+' s'); };
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));

/* ==================== Materias del cuatrimestre ====================
   Organización de datos multi-materia:
   - SUBJECTS ................. catálogo de materias (subjects)
   - MODULES_BY_SUBJECT ....... módulos y quizzes por materia (se define más
                                abajo, junto al contenido; los quizzes viven en
                                el build() de cada módulo)
   - S.subjectData ............ estadísticas por materia (statsBySubject):
                                avance, historial, conceptos, exámenes y SRS
   - S nivel superior ......... la materia ACTIVA desplegada + lo global
                                (globalStats): XP total, racha, insignias,
                                recompensas, preferencias
   - SEED_TASKS / SEED_CALENDAR tareas y calendario de exámenes (tasks,
                                archivedTasks, examCalendar) — el admin los
                                edita aquí en el HTML o desde su panel
   Para agregar temas/módulos a una materia solo hay que llenar su entrada en
   MODULES_BY_SUBJECT (y opcionalmente EXAM_BUILDERS_BY_SUBJECT). */
const SUBJECTS = [
  {id:'ca3',   icon:'🛡️', name:'Cálculo Actuarial III',              short:'Cálculo III',       wm:'🛡️📐'},
  {id:'modelos-regresion', icon:'📉', name:'Modelos de Regresión',        short:'Regresión',        wm:'📉📈'},
  {id:'estadistica-no-parametrica', icon:'📊', name:'Estadística No Paramétrica', short:'No Paramétrico', wm:'📊🎯'},
  {id:'stoch', icon:'🎲', name:'Procesos Estocásticos',               short:'Estocásticos',     wm:'🎲🔀'},
  {id:'administracion-financiera', icon:'💼', name:'Administración Financiera', short:'Admin. Financiera', wm:'💼💰'}
];
const subjectById = id => SUBJECTS.find(s=>s.id===id) || SUBJECTS[0];
/* Iconos SVG por materia (identidad UTECA: sin emojis en el chrome) */
const SUBJ_SVG = {
  'ca3': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  'modelos-regresion': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
  'estadistica-no-parametrica': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>',
  'stoch': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>',
  'administracion-financiera': '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>'
};
const subjSVG = id => SUBJ_SVG[id] || (subjectById(id).icon || '');
/* Claves del estado que pertenecen a la materia activa (se intercambian al
   cambiar de materia; el resto del estado es global) */
const SUBJ_KEYS = ['modules','history','concepts','examDay','examHistory','flashSRS','subjXP'];
const defaultSubjectData = () => ({ modules:{}, history:[], concepts:{}, examDay:null, examHistory:[], flashSRS:{}, subjXP:0 });

/* ==================== Almacenamiento (StorageManager) ====================
   Único punto de acceso al estado persistente. Ya NO usa localStorage:
   lee/escribe la caché en memoria de net.js (window.AQ.cache), y cada
   escritura se sincroniza al servidor vía /api/data (debounce + beacon).
   Nadie más toca el almacenamiento directo. */
const Store = {
  get(key){ const c = window.AQ.cache; return (key in c) ? c[key] : null; },
  set(key, val){ window.AQ.cache[key] = String(val); window.AQ.persist(key); return true; },
  remove(key){ delete window.AQ.cache[key]; window.AQ.persistDelete(key); },
  getJSON(key, fallback){ try{ const v = Store.get(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } },
  setJSON(key, obj){ return Store.set(key, JSON.stringify(obj)); }
};
/* Descarga un objeto como archivo .json (usado por respaldos, leaderboard y tareas) */
function downloadJSON(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 3000);
}
/* Lee un archivo del usuario y entrega el JSON parseado; si no es JSON válido
   (o el callback lanza por formato inesperado) muestra errMsg. */
function readJSONFile(file, errMsg, onData){
  const rd = new FileReader();
  rd.onload = () => {
    try{ onData(JSON.parse(rd.result)); }
    catch(e){ toast(errMsg); sfx('bad'); }
  };
  rd.readAsText(file);
}

/* ==================== Perfiles y estado persistente ==================== */
const PKEY = 'actuariq_profiles_v1';
const DEFAULT_STATE = () => ({
  xp:0, sound:true, theme:null,
  streak:0, lastDay:null, totalTime:0, bestBlitz:0, bestBlitzCombo:0, bestSudden:0, totalAnswered:0,
  examDay:null, examHistory:[],   // examen diario de la materia activa: {t, score, sec, n, xp, failedTopics}
  stepsOnOk:false, confetti:true,
  xpGoal:50, guideProgressive:true,
  dayXP:null,                     // {d:'YYYY-MM-DD', xp, goalHit}
  modules:{},           // materia activa: id -> {best, stars, attempts, done}
  history:[],           // materia activa: {t, mod, score, xp, sec}
  concepts:{},          // materia activa: topic -> {ok, bad}
  badges:[],            // ids de insignias ganadas (globales)
  gameModes:{exam:true, flash:true, blitz:true, sudden:true, review:true}, // modos de juego activos en el inicio
  unlockedRewards:[],   // ids de recompensas de la tienda ya desbloqueadas (globales)
  rewardLog:[],          // [{id, t}] historial de desbloqueos recientes
  flashSRS:{},          // repetición espaciada de la materia activa
  equip:{frame:null, bg:null, acc:null, title:null}, // recompensas equipadas actualmente
  accentColor:null,     // color principal personalizado (hex) o null = por defecto
  soundVolume:0.7,      // volumen de los efectos de sonido (0-1)
  lbRank:null,          // última posición conocida en el leaderboard (para detectar "subiste de rango")
  lateNight:false, earlyBird:false,   // estudió de madrugada / muy temprano (logros secretos)
  activeSubject:'ca3',  // materia actualmente desplegada
  subjectData:{},       // statsBySubject: materia -> {modules, history, concepts, examDay, examHistory, flashSRS, subjXP}
  subjXP:0,             // XP ganado en la materia activa
  taskDone:{},          // tareas marcadas como realizadas: taskId -> timestamp
  streakFreezes:0,      // 🧊 congeladores de racha disponibles (cubren días perdidos)
  freezeMonth:null,     // 'YYYY-MM' del último congelador mensual reclamado
  parcialFreezeAwarded:{}, // '<materia>|<idxParcial>' -> true (congelador ya otorgado por terminar ese parcial)
  missions:null,        // {d, w, base, wbase, dclaimed, wclaimed} progreso de retos diarios/semanales
  studyLog:[],          // ['YYYY-MM-DD', …] días con actividad (para retos semanales)
  hearts:5,             // ❤️ corazones disponibles (vidas, estilo Duolingo)
  heartsLast:0          // timestamp del último cálculo de regeneración
});
let PROFILES = Store.getJSON(PKEY, null);
if(!PROFILES || !Array.isArray(PROFILES.list) || !PROFILES.list.length){
  const pid = 'p' + Date.now().toString(36);
  PROFILES = { active:pid, onboarded:false, list:[{id:pid, name:'Estudiante', avatar:'🎓', created:Date.now()}] };
  // migración desde la versión sin perfiles
  const legacy = Store.get('actuariq_v1');
  if(legacy && Store.set('actuariq_u_'+pid, legacy)){ Store.remove('actuariq_v1'); PROFILES.onboarded = true; }
  Store.setJSON(PKEY, PROFILES);
}
const saveProfiles = () => Store.setJSON(PKEY, PROFILES);
const dataKey = () => 'actuariq_u_' + PROFILES.active;
const activeProfile = () => PROFILES.list.find(p => p.id === PROFILES.active) || PROFILES.list[0];
function loadState(){
  const st = Object.assign(DEFAULT_STATE(), Store.getJSON(dataKey(), {}));
  // migración a multi-materia: el progreso previo pertenece a Cálculo Actuarial III
  if(!st.subjectData) st.subjectData = {};
  if(!SUBJECTS.some(x => x.id === st.activeSubject)) st.activeSubject = 'ca3';
  if(st.subjXP === undefined || st.subjXP === null) st.subjXP = st.xp;
  if(!st.taskDone) st.taskDone = {};
  return st;
}
let S = loadState();
/* Recarga estado + módulos tras cambiar/crear/eliminar perfil o importar datos.
   (MODULES se declara más abajo, junto a los módulos por materia; para entonces
   esta función solo se ha definido, no ejecutado.) */
function reloadActiveState(){ S = loadState(); MODULES = MODULES_BY_SUBJECT[S.activeSubject] || []; }
/* Al guardar se sincroniza la copia por materia, así S.subjectData siempre
   refleja también la materia activa (útil para estadísticas generales). */
const save = () => {
  const snap = {}; SUBJ_KEYS.forEach(k => snap[k] = S[k]);
  S.subjectData[S.activeSubject] = snap;
  Store.setJSON(dataKey(), S);
};
/* Datos de una materia (la activa se lee del nivel superior) */
function subjSnapshot(id){
  if(id === S.activeSubject){ const snap = {}; SUBJ_KEYS.forEach(k => snap[k] = S[k]); return Object.assign(defaultSubjectData(), snap); }
  return Object.assign(defaultSubjectData(), S.subjectData[id] || {});
}
function switchSubject(id){
  if(!SUBJECTS.some(x => x.id === id) || id === S.activeSubject) return;
  save();                                        // guarda (y respalda) la materia actual
  const d = Object.assign(defaultSubjectData(), S.subjectData[id] || {});
  SUBJ_KEYS.forEach(k => { S[k] = d[k]; });
  S.activeSubject = id;
  save();
  MODULES = MODULES_BY_SUBJECT[id] || [];
  SES = null;
  renderHeader(); goHome();
  toast('Materia activa: '+subjectById(id).name);
}

/* Niveles: XP necesario crece cuadráticamente */
const levelOf   = xp => Math.floor(Math.sqrt(xp/60)) + 1;
const xpForLvl  = lvl => 60*(lvl-1)*(lvl-1);
function levelInfo(){
  const lvl = levelOf(S.xp), lo = xpForLvl(lvl), hi = xpForLvl(lvl+1);
  return { lvl, frac: (S.xp-lo)/(hi-lo), toNext: hi-S.xp };
}
function addXP(n){
  const t = todayKey();
  const hr = cdmxHour();
  if(hr >= 0 && hr < 5) S.lateNight = true;   // madrugada CDMX (logros secretos)
  if(hr >= 5 && hr < 8) S.earlyBird = true;   // muy temprano CDMX (logros secretos)
  if(!S.dayXP || S.dayXP.d !== t) S.dayXP = {d:t, xp:0, goalHit:false};
  S.dayXP.xp += n;
  S.subjXP = (S.subjXP||0) + n;   // acumulado de la materia activa
  const before = levelOf(S.xp);
  S.xp += n;
  const after = levelOf(S.xp);
  if(!S.dayXP.goalHit && S.dayXP.xp >= (S.xpGoal||50)){
    S.dayXP.goalHit = true;
    toast('🎯 ¡Objetivo diario de XP cumplido!');
  }
  save();
  if(typeof checkRewards === 'function') checkRewards();   // desbloquea recompensas al cruzar su XP
  scheduleLbPush();                                        // 🏆 leaderboard al día sin pasos manuales
  renderHeader();
  if(after > before){
    toast('🎉 ¡Subiste al nivel '+after+'!'); sfx('unlock');
    LEVEL_REWARDS.filter(r => r.lvl > before && r.lvl <= after).forEach(r => {
      const parts = [];
      if(r.title) parts.push('título “'+r.title+'”');
      if(r.avatars) parts.push('avatares '+r.avatars.join(' '));
      if(r.custom) parts.push(r.custom.toLowerCase());
      if(parts.length) setTimeout(()=>toast('🔓 Nivel '+r.lvl+' desbloquea: '+parts.join(' · '), 4200), 900);
    });
  }
}
/* ==================== ❤️ Corazones (vidas, estilo Duolingo) ====================
   - Fallar una pregunta en una LECCIÓN de módulo cuesta 1 corazón (los modos de
     práctica, flashcards, exámenes y juegos no quitan corazones).
   - Se regeneran solos: 1 corazón cada 30 min (hasta 5).
   - Practicar recupera: termina un modo de práctica con ≥80% y ganas 1.
   - Sin corazones no puedes iniciar lecciones de módulo (sí practicar). */
const HEART_MAX = 5, HEART_REGEN_MIN = 30;
function heartsNow(){
  if(typeof S.hearts !== 'number') S.hearts = HEART_MAX;
  if(S.hearts >= HEART_MAX){ if(S.heartsLast){ S.heartsLast = 0; save(); } return S.hearts; }
  const now = Date.now();
  if(!S.heartsLast){ S.heartsLast = now; save(); return S.hearts; }
  const gained = Math.floor((now - S.heartsLast) / (HEART_REGEN_MIN*60000));
  if(gained > 0){
    S.hearts = Math.min(HEART_MAX, S.hearts + gained);
    S.heartsLast = (S.hearts >= HEART_MAX) ? 0 : S.heartsLast + gained*HEART_REGEN_MIN*60000;
    save();
  }
  return S.hearts;
}
function msToNextHeart(){
  if(heartsNow() >= HEART_MAX || !S.heartsLast) return 0;
  return Math.max(0, S.heartsLast + HEART_REGEN_MIN*60000 - Date.now());
}
function loseHeart(){
  heartsNow();
  if(S.hearts <= 0) return;
  if(S.hearts === HEART_MAX) S.heartsLast = Date.now();   // arranca el reloj de regeneración
  S.hearts--; save(); renderHearts();
  toast(S.hearts > 0 ? '💔 Perdiste un corazón ('+S.hearts+' restante'+(S.hearts===1?'':'s')+')'
                     : '💔 ¡Te quedaste sin corazones!');
}
function gainHeart(n, reason){
  heartsNow();
  if(S.hearts >= HEART_MAX) return false;
  S.hearts = Math.min(HEART_MAX, S.hearts + (n||1));
  if(S.hearts >= HEART_MAX) S.heartsLast = 0;
  save(); renderHearts();
  toast('❤️ +1 corazón'+(reason ? ' por '+reason : '')+' ('+S.hearts+'/'+HEART_MAX+')');
  return true;
}
function heartsBarHTML(){
  let s = '';
  for(let i=0;i<HEART_MAX;i++) s += '<span class="hb'+(i < S.hearts ? '' : ' off')+'">'+(i < S.hearts ? '❤️' : '🤍')+'</span>';
  return '<div class="hearts-bar">'+s+'</div>';
}
function fmtMins(ms){
  const m = Math.ceil(ms/60000);
  return m >= 60 ? Math.floor(m/60)+' h '+(m%60)+' min' : m+' min';
}
function renderHearts(){
  const el = document.getElementById('heartsTxt');
  if(!el) return;
  const h = heartsNow();
  el.textContent = h;
  const chip = document.getElementById('btnHearts');
  if(chip){
    chip.classList.toggle('empty', h === 0);
    chip.title = h >= HEART_MAX ? 'Corazones llenos' : 'Corazones: '+h+'/'+HEART_MAX+' · siguiente en '+fmtMins(msToNextHeart());
  }
}
setInterval(renderHearts, 30000);
function openHeartsModal(){
  const h = heartsNow();
  const o = openModal('<div style="text-align:center">'
    + '<div style="font-size:3rem">'+(h===0?'💔':'❤️')+'</div>'
    + '<h2 style="margin:6px 0">'+(h===0 ? '¡Te quedaste sin corazones!' : 'Corazones: '+h+'/'+HEART_MAX)+'</h2>'
    + heartsBarHTML()
    + (h < HEART_MAX ? '<p style="color:var(--ink2)">⏳ Siguiente corazón en <b>'+fmtMins(msToNextHeart())+'</b> (1 cada '+HEART_REGEN_MIN+' min).</p>' : '<p style="color:var(--ink2)">Estás al máximo. 💪</p>')
    + '<p style="color:var(--ink2);font-size:.9rem">Fallar en una lección de módulo cuesta 1 corazón.<br>🎯 Termina un <b>modo de práctica con ≥80%</b> y recuperas 1.<br>Los modos de práctica no gastan corazones.</p>'
    + '<div class="q-actions" style="justify-content:center">'
    + (h===0 ? '<button class="btn good" id="hPractice">🎯 Practicar para recuperar</button>' : '')
    + '<button class="btn ghost" id="hClose">Cerrar</button>'
    + '</div></div>');
  o.querySelector('#hClose').onclick = ()=>{ sfx('click'); closeModal(); };
  const hp = o.querySelector('#hPractice');
  if(hp) hp.onclick = ()=>{ sfx('click'); closeModal(); goHome(); renderModes(); showView('modes'); toast('🎯 Elige un modo de práctica: con ≥80% recuperas un corazón'); };
}
/* Fin de lección por falta de corazones: cierra con lo acumulado */
function outOfHeartsEnd(){
  const o = openModal('<div style="text-align:center">'
    + '<div style="font-size:3rem">💔</div>'
    + '<h2 style="margin:6px 0">Sin corazones</h2>'
    + '<p style="color:var(--ink2)">La lección termina aquí, pero tu avance de esta sesión se registra.</p>'
    + '<div class="q-actions" style="justify-content:center"><button class="btn" id="ohRes">🏁 Ver resultado</button></div></div>');
  o.querySelector('#ohRes').onclick = ()=>{ sfx('click'); closeModal(); if(SES) finishActive(); };
}
function logStudyDay(){
  const today = todayKey();
  if(!Array.isArray(S.studyLog)) S.studyLog = [];
  if(S.studyLog[S.studyLog.length-1] !== today){
    if(!S.studyLog.includes(today)) S.studyLog.push(today);
    if(S.studyLog.length > 70) S.studyLog = S.studyLog.slice(-70);
  }
}
function touchStreak(){
  const today = todayKey();
  logStudyDay();
  if(S.lastDay === today) return;
  if(!S.lastDay){ S.streak = 1; S.lastDay = today; save(); return; }   // primer día
  const gap = daysBetweenKeys(S.lastDay, today);                        // días transcurridos desde la última vez
  if(gap === 1){                                                        // día consecutivo
    S.streak += 1;
  } else {
    const missed = gap - 1;                                             // días saltados
    if(missed > 0 && (S.streakFreezes||0) >= missed){                   // 🧊 se cubren con congeladores
      S.streakFreezes -= missed; S.streak += 1; S.everUsedFreeze = true;
      toast('🧊 Se usó '+(missed===1?'1 congelador':missed+' congeladores')+' para salvar tu racha ('+S.streak+' días). Quedan '+S.streakFreezes+'.');
      sfx('unlock');
    } else {
      S.streak = 1;                                                     // sin congeladores suficientes: se reinicia
    }
  }
  S.lastDay = today; save();
  if(S.streak>1) toast('🔥 Racha de '+S.streak+' días. ¡Sigue así!');
}
/* 🧊 Congelador mensual: 1 gratis por mes calendario (CDMX). Devuelve true si se otorgó. */
function claimMonthlyFreeze(){
  const m = cdmxMonth();
  if(S.freezeMonth === m) return false;
  S.freezeMonth = m; S.streakFreezes = (S.streakFreezes||0) + 1; save();
  return true;
}
/* 🧊 Congelador por terminar un parcial: al completar ≥90% de los módulos de un
   parcial (de cualquier materia) se otorga 1 congelador, una sola vez por parcial. */
function checkParcialFreezes(){
  let granted = 0;
  SUBJECTS.forEach(sx => {
    const par = SUBJECT_PARCIALES[sx.id]; if(!par) return;
    const snap = subjSnapshot(sx.id);
    const modsDone = snap.modules || {};
    par.groups.forEach((g, gi) => {
      const key = sx.id+'|'+gi;
      if(S.parcialFreezeAwarded[key]) return;
      const total = g.mods.length; if(!total) return;
      const done = g.mods.filter(id => modsDone[id] && modsDone[id].done).length;
      if(done/total >= 0.9){
        S.parcialFreezeAwarded[key] = true;
        S.streakFreezes = (S.streakFreezes||0) + 1; granted++;
        toast('🧊 ¡Terminaste el '+g.name+' de '+sx.short+' (≥90%)! +1 congelador de racha.');
        sfx('unlock');
      }
    });
  });
  if(granted) save();
  return granted;
}

/* ==================== Retos diarios / semanales (misiones) ====================
   Viven en el hub del icono de racha 🔥. El progreso se mide por deltas contra
   una "línea base" capturada al inicio de cada día/semana (CDMX), más contadores
   que ya existen (dayXP, examDay, studyLog). Al completar un reto se reclama su
   XP una sola vez. No dependen de enganchar cada pregunta: basta un save(). */
const DAILY_MISSIONS = [
  {id:'d_study',  ico:'📅', name:'Estudia hoy',                goal:1,  xp:20, desc:'Practica cualquier actividad hoy y mantén tu racha.',
    cur:()=> S.lastDay===todayKey() ? 1 : 0},
  {id:'d_answer', ico:'✍️', name:'Responde 15 preguntas',      goal:15, xp:25, desc:'Suma 15 respuestas a lo largo del día.',
    cur:()=> Math.max(0,(S.totalAnswered||0) - missionState().base.answered)},
  {id:'d_xp',     ico:'⚡', name:'Gana 80 XP',                 goal:80, xp:30, desc:'Consigue 80 XP durante el día.',
    cur:()=> (S.dayXP && S.dayXP.d===todayKey()) ? (S.dayXP.xp||0) : 0},
  {id:'d_exam',   ico:'📝', name:'Presenta el examen diario',  goal:1,  xp:35, desc:'Completa el examen diario de tu materia.',
    need:()=> typeof EXAM_BUILDERS_BY_SUBJECT!=='undefined' && !!EXAM_BUILDERS_BY_SUBJECT[S.activeSubject],
    cur:()=> S.examDay===todayKey() ? 1 : 0}
];
const WEEKLY_MISSIONS = [
  {id:'w_days',   ico:'🔥', name:'Estudia 5 días',             goal:5,   xp:80,  desc:'Ten actividad en 5 días distintos esta semana.',
    cur:()=> studyDaysThisWeek()},
  {id:'w_answer', ico:'🧠', name:'Responde 120 preguntas',     goal:120, xp:100, desc:'Acumula 120 respuestas en la semana.',
    cur:()=> Math.max(0,(S.totalAnswered||0) - missionState().wbase.answered)},
  {id:'w_xp',     ico:'🏆', name:'Gana 500 XP',                goal:500, xp:130, desc:'Consigue 500 XP a lo largo de la semana.',
    cur:()=> Math.max(0,(S.xp||0) - missionState().wbase.xp)},
  {id:'w_time',   ico:'⏱️', name:'Estudia 60 minutos', unit:'min', goal:60, xp:70, desc:'Acumula 60 minutos de estudio esta semana.',
    cur:()=> Math.floor(Math.max(0,(S.totalTime||0) - missionState().wbase.time)/60)}
];
/* Asegura la estructura de misiones y hace el "rollover" diario/semanal. */
function missionState(){
  const dk = todayKey(), wk = weekKey();
  let m = (S.missions && typeof S.missions==='object') ? S.missions : {};
  if(m.d !== dk){ m.d = dk; m.base = {answered:S.totalAnswered||0, xp:S.xp||0, time:S.totalTime||0}; m.dclaimed = {}; }
  if(m.w !== wk){ m.w = wk; m.wbase = {answered:S.totalAnswered||0, xp:S.xp||0, time:S.totalTime||0}; m.wclaimed = {}; }
  if(!m.base)  m.base  = {answered:S.totalAnswered||0, xp:S.xp||0, time:S.totalTime||0};
  if(!m.wbase) m.wbase = {answered:S.totalAnswered||0, xp:S.xp||0, time:S.totalTime||0};
  if(!m.dclaimed) m.dclaimed = {};
  if(!m.wclaimed) m.wclaimed = {};
  S.missions = m;
  return m;
}
function studyDaysThisWeek(){ const wk = weekKey(); return (S.studyLog||[]).filter(d=>weekKey(d)===wk).length; }
const missionCur = def => Math.max(0, def.cur());
const missionActive = def => !def.need || def.need();
function missionsReadyCount(){
  const m = missionState(); let c = 0;
  DAILY_MISSIONS.forEach(d => { if(missionActive(d) && !m.dclaimed[d.id] && missionCur(d) >= d.goal) c++; });
  WEEKLY_MISSIONS.forEach(d => { if(!m.wclaimed[d.id] && missionCur(d) >= d.goal) c++; });
  return c;
}
function claimMission(scope, id){
  const m = missionState();
  const def = (scope==='w'?WEEKLY_MISSIONS:DAILY_MISSIONS).find(x=>x.id===id);
  if(!def || !missionActive(def)) return;
  const claimed = scope==='w' ? m.wclaimed : m.dclaimed;
  if(claimed[id] || missionCur(def) < def.goal) return;
  claimed[id] = true; save();
  addXP(def.xp);                 // addXP guarda y refresca el encabezado
  toast('🎉 Reto '+(scope==='w'?'semanal':'diario')+' completado: '+def.name+' · +'+def.xp+' XP'); sfx('unlock');
  openStreakHub(scope==='w'?'weekly':'daily');
}
function modState(id){ return S.modules[id] || {best:0, stars:0, attempts:0, done:false}; }
function trackConcept(topic, ok){
  if(!topic) return;
  const c = S.concepts[topic] || (S.concepts[topic]={ok:0,bad:0});
  ok ? c.ok++ : c.bad++;
}

/* ==================== Sonido (WebAudio con fallback <audio>) ==================== */
let AC = null, audioBlocked = false;
const SFX_NOTES = {
  click:  [[440,.05,.03,'sine']],
  ok:     [[523,.09,.05,'sine'],[784,.12,.06,'sine',.09]],
  bad:    [[196,.18,.08,'square']],
  flip:   [[330,.06,.03,'triangle']],
  unlock: [[523,.1,.05,'sine'],[659,.1,.05,'sine',.1],[784,.14,.06,'sine',.2],[1047,.2,.07,'sine',.3]],
  win:    [[523,.12,.06,'sine'],[659,.12,.06,'sine',.12],[784,.2,.07,'sine',.24]]
};
function getAC(){
  if(AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if(!Ctx) return null;
  try{ AC = new Ctx(); }catch(e){ AC = null; }
  return AC;
}
function fallbackBeep(){
  try{
    const el = $('#sfxFallback');
    if(!el) return;
    el.volume = clamp(S.soundVolume!=null ? S.soundVolume : 0.7, 0, 1);
    el.currentTime = 0;
    el.play().catch(()=>{ audioBlocked = true; });
  }catch(e){}
}
function sfx(kind){
  if(!S.sound) return;
  const vol = clamp(S.soundVolume!=null ? S.soundVolume : 0.7, 0, 1);
  if(vol <= 0) return;
  try{
    const ctx = getAC();
    if(!ctx){ fallbackBeep(); return; }
    if(ctx.state==='suspended'){ ctx.resume(); }
    const notes = SFX_NOTES[kind] || [];
    if(!notes.length) return;
    notes.forEach(([f,dur,gain,type,delay])=>{
      const t = ctx.currentTime + (delay||0);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(gain*vol, t); g.gain.exponentialRampToValueAtTime(.0001, t+dur);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+dur+.02);
    });
  }catch(e){ audioBlocked = true; fallbackBeep(); }
}

/* ==================== Tema ==================== */
function applyTheme(){
  const root = document.documentElement;
  if(S.theme) root.setAttribute('data-theme', S.theme); else root.removeAttribute('data-theme');
  const dark = S.theme==='dark' || (!S.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  $('#btnTheme').textContent = dark ? '☀️ Tema claro' : '🌙 Tema oscuro';
  // color principal efectivo: manual > tema de interfaz equipado > predeterminado
  let accent = S.accentColor;
  const th = (S.equip && S.equip.theme) ? THEMES.find(t=>t.id===S.equip.theme) : null;
  if(!accent && th) accent = th.accent;
  if(accent){ root.style.setProperty('--accent', accent); root.style.setProperty('--accent-strong', accent); }
  else { root.style.removeProperty('--accent'); root.style.removeProperty('--accent-strong'); }
  // el tema equipado tiñe TODA la app (fondo y superficies) para que se note en
  // el inicio, los juegos y las preguntas, no solo el color de acento.
  const surfVars = ['--bg','--surface','--surface2','--surface3'];
  if(th){
    const c = th.accent;
    const baseBg      = dark ? '#0d0d0d' : '#f9f9f7';
    const baseSurface = dark ? '#1a1a19' : '#fcfcfb';
    const baseS2      = dark ? '#242423' : '#f0efec';
    const baseS3      = dark ? '#2c2c2a' : '#e9e8e3';
    const mix = (pct, base) => 'color-mix(in srgb, '+c+' '+pct+'%, '+base+')';
    const p = dark ? [16,12,14,16] : [12,8,12,14];
    root.style.setProperty('--bg',       mix(p[0], baseBg));
    root.style.setProperty('--surface',  mix(p[1], baseSurface));
    root.style.setProperty('--surface2', mix(p[2], baseS2));
    root.style.setProperty('--surface3', mix(p[3], baseS3));
    document.body.style.backgroundImage = '';
  } else {
    surfVars.forEach(v => root.style.removeProperty(v));
    document.body.style.backgroundImage = '';
    document.body.style.backgroundAttachment = '';
  }
}
$('#btnTheme').addEventListener('click', ()=>{
  const dark = S.theme==='dark' || (!S.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  S.theme = dark ? 'light' : 'dark'; save(); applyTheme(); sfx('click');
});
$('#btnSound').addEventListener('click', e=>{
  S.sound = !S.sound; save();
  e.currentTarget.setAttribute('aria-pressed', S.sound);
  e.currentTarget.textContent = S.sound ? '🔊 Sonido: activado' : '🔇 Sonido: apagado';
  if(S.sound) sfx('ok');
});
/* Menú "⋯" del encabezado */
$('#btnMore').addEventListener('click', e=>{
  e.stopPropagation();
  const m = $('#moreMenu'); const open = m.classList.toggle('hidden')===false;
  $('#btnMore').setAttribute('aria-expanded', open);
});
document.addEventListener('click', e=>{
  const m = $('#moreMenu'); if(!m || m.classList.contains('hidden')) return;
  if(!e.target.closest('.more-wrap')) { m.classList.add('hidden'); $('#btnMore').setAttribute('aria-expanded','false'); }
});
$$('#moreMenu .more-item').forEach(it => it.addEventListener('click', ()=>{ $('#moreMenu').classList.add('hidden'); $('#btnMore').setAttribute('aria-expanded','false'); }));

/* ==================== Toast + confetti ==================== */
function toast(msg, ms=3200){
  const t = document.createElement('div');
  t.className = 'toast'; t.innerHTML = msg;
  $('#toasts').appendChild(t);
  setTimeout(()=>{ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(()=>t.remove(),400); }, ms);
}
function confetti(n=60){
  if(S.confetti === false) return;
  const colors = ['#2a78d6','#1baf7a','#eda100','#4a3aa7','#e34948','#e87ba4','#eb6834'];
  for(let i=0;i<n;i++){
    const p = document.createElement('div');
    p.className='confetti-p';
    const size = ri(6,12);
    p.style.cssText = 'left:'+ri(2,98)+'vw;width:'+size+'px;height:'+(size*0.6)+'px;background:'+pick(colors)
      +';border-radius:'+(Math.random()<.4?'50%':'2px')+';animation-duration:'+(ri(18,32)/10)+'s;animation-delay:'+(ri(0,8)/10)+'s;';
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 4200);
  }
}
/* Efecto "Lluvia de confeti" equipado: pequeño estallido al responder bien. */
/* Efecto "al acertar" equipado: dispara partículas cuando respondes bien. */
function hitBurst(kind){
  if(S.confetti === false) return;
  if(kind === 'confetti'){ confetti(14); return; }
  const set = kind === 'stars' ? ['⭐','🌟','✨'] : kind === 'fire' ? ['🔥','✨','💥'] : ['❤️','💖','💕','💗'];
  for(let i=0;i<10;i++){
    const el = document.createElement('div'); el.className = 'hit-p'; el.textContent = pick(set);
    el.style.cssText = 'left:'+ri(38,62)+'vw; top:'+ri(38,58)+'vh; font-size:'+ri(14,26)+'px;'
      + '--dx:'+ri(-130,130)+'px; --dy:'+ri(-190,-60)+'px; animation-delay:'+(ri(0,3)/10)+'s';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1300);
  }
}
function celebrateCorrect(){
  if(S.confetti === false) return;
  const id = S.equip && S.equip.hitfx;
  if(!id) return;
  const r = HITFX.find(x=>x.id===id);
  if(r) hitBurst(r.kind);
}

/* ==================== Glosario (base de conceptos) ==================== */
const GLOSSARY = [
  {k:'riesgo',       t:'Riesgo',             d:'Posibilidad de que ocurra un evento incierto capaz de generar una pérdida.', s:'Posibilidad de pérdida'},
  {k:'riesgo',       t:'Riesgo puro',        d:'Riesgo que solo tiene dos resultados posibles: pérdida o que nada suceda. Es el único tipo de riesgo asegurable.', s:'Solo pérdida o nada; asegurable'},
  {k:'riesgo',       t:'Riesgo especulativo',d:'Riesgo que puede producir pérdida o ganancia (por ejemplo, invertir en bolsa). No es asegurable.', s:'Pérdida o ganancia; no asegurable'},
  {k:'exposicion',   t:'Exposición al riesgo', d:'Conjunto de unidades expuestas a sufrir un siniestro durante un periodo (p. ej., 1,000 autos asegurados-año).', s:'Unidades expuestas al riesgo'},
  {k:'siniestro',    t:'Siniestro',          d:'Materialización del riesgo cubierto: el evento que da origen a la reclamación y a la indemnización.', s:'Materialización del riesgo'},
  {k:'poliza',       t:'Póliza',             d:'Contrato del seguro: documento que establece derechos y obligaciones de la aseguradora y del contratante.', s:'Contrato del seguro'},
  {k:'prima',        t:'Prima',              d:'Precio del seguro; la cantidad que paga el contratante a la aseguradora por la cobertura.', s:'Precio del seguro'},
  {k:'prima',        t:'Prima pura (de riesgo)', d:'Costo esperado de los siniestros, sin gastos ni utilidad. Se calcula como frecuencia × severidad.', s:'Frecuencia × Severidad'},
  {k:'prima',        t:'Prima de tarifa',    d:'Prima pura más gastos de administración, gastos de adquisición y margen de utilidad de la aseguradora.', s:'Prima pura + gastos + utilidad'},
  {k:'sumaasegurada',t:'Suma asegurada',     d:'Monto máximo que la aseguradora se obliga a pagar en caso de siniestro.', s:'Límite máximo de pago'},
  {k:'indemnizacion',t:'Indemnización',      d:'Pago que realiza la aseguradora al ocurrir un siniestro cubierto, para resarcir la pérdida.', s:'Pago por el siniestro'},
  {k:'cobertura',    t:'Cobertura',          d:'Conjunto de riesgos amparados por la póliza; aquello por lo que la aseguradora sí responde.', s:'Riesgos amparados'},
  {k:'exclusiones',  t:'Exclusiones',        d:'Eventos o circunstancias que la póliza NO cubre y por los cuales la aseguradora no paga.', s:'Lo que la póliza NO cubre'},
  {k:'deducible',    t:'Deducible',          d:'Cantidad fija (o porcentaje) del siniestro que asume el asegurado antes de que la aseguradora empiece a pagar.', s:'Primera parte a cargo del asegurado'},
  {k:'coaseguro',    t:'Coaseguro',          d:'Porcentaje de la pérdida (después del deducible) que corre a cargo del asegurado.', s:'% de la pérdida a cargo del asegurado'},
  {k:'copago',       t:'Copago',             d:'Cantidad fija que paga el asegurado cada vez que utiliza un servicio cubierto (p. ej., $150 por consulta).', s:'Cuota fija por servicio'},
  {k:'personas',     t:'Beneficiario',       d:'Persona designada para recibir la indemnización o suma asegurada en caso de siniestro.', s:'Recibe la indemnización'},
  {k:'personas',     t:'Contratante',        d:'Persona que firma la póliza y se obliga a pagar la prima. Puede o no ser el asegurado.', s:'Firma y paga la prima'},
  {k:'personas',     t:'Asegurado',          d:'Persona o bien expuesto al riesgo que ampara la póliza.', s:'Expuesto al riesgo cubierto'},
  {k:'frecuencia',   t:'Frecuencia',         d:'Número esperado de siniestros por unidad expuesta: siniestros ÷ exposición.', s:'Siniestros ÷ Exposición'},
  {k:'severidad',    t:'Severidad',          d:'Costo promedio de cada siniestro: pérdidas totales ÷ número de siniestros.', s:'Costo promedio por siniestro'},
  {k:'inflacion',    t:'Inflación',          d:'Aumento generalizado y sostenido de los precios de bienes y servicios en una economía.', s:'Aumento general de precios'},
  {k:'devaluacion',  t:'Devaluación',        d:'Pérdida de valor de la moneda de un país frente a otras divisas (p. ej., el peso frente al dólar).', s:'La moneda pierde valor vs. divisas'},
  {k:'depreciacion', t:'Depreciación',       d:'Pérdida de valor de un activo por el uso, el paso del tiempo u obsolescencia (p. ej., un automóvil).', s:'Un activo pierde valor'},
  {k:'siniestralidad',t:'Siniestralidad',    d:'Proporción de las primas que se destina a pagar siniestros: siniestros pagados ÷ primas cobradas.', s:'Siniestros pagados ÷ Primas'}
];
const TOPIC_NAMES = {
  riesgo:'Riesgo', exposicion:'Exposición', siniestro:'Siniestro', poliza:'Póliza', prima:'Primas',
  sumaasegurada:'Suma asegurada', indemnizacion:'Indemnización', cobertura:'Cobertura', exclusiones:'Exclusiones',
  deducible:'Deducible', coaseguro:'Coaseguro', copago:'Copago', personas:'Partes del contrato',
  frecuencia:'Frecuencia', severidad:'Severidad', primariesgo:'Prima de riesgo', costoesperado:'Costo esperado',
  siniestralidad:'Siniestralidad', inflacion:'Inflación', devaluacion:'Devaluación', depreciacion:'Depreciación',
  formulas:'Fórmulas', casos:'Casos reales', escape:'Escape room'
};
const TIPS = [
  'La prima de riesgo (frecuencia × severidad) es el corazón de toda tarificación actuarial.',
  'Deducible y coaseguro existen para alinear incentivos: si el asegurado comparte la pérdida, cuida más el bien.',
  'La frecuencia se interpreta como probabilidad de siniestro cuando cada unidad puede tener a lo más un siniestro.',
  'Una siniestralidad mayor a 100% significa que la aseguradora pagó más en siniestros de lo que cobró en primas.',
  'La inflación erosiona las sumas aseguradas: por eso muchas pólizas se indexan (p. ej., en UDIS).',
  'Devaluación ≠ depreciación: la primera es de la moneda frente a divisas; la segunda, de un activo por uso o tiempo.',
  'El copago es fijo por evento; el coaseguro es proporcional a la pérdida. No los confundas en un examen.',
  'El riesgo especulativo (pérdida o ganancia) no es asegurable; los seguros cubren riesgos puros.',
  'La ley de los grandes números permite que la frecuencia observada se acerque a la probabilidad real al crecer la cartera.',
  'La prima de tarifa siempre es mayor que la prima pura: agrega gastos y utilidad.',
  'Un deducible alto reduce la prima: el asegurado retiene más riesgo.',
  'En seguros de autos, el vehículo se deprecia; la indemnización suele basarse en el valor comercial, no en el de compra.'
];

/* ==================== Navegación ==================== */
const VIEWS = ['home','lesson','session','result','memo','escape','flash','blitz','sudden','board','tasks','stats','guide','profile','levels','shop','modes'];
let memoTimerInt = null, blitzInt = null;
function showView(name){
  VIEWS.forEach(v => $('#view-'+v).classList.toggle('hidden', v!==name));
  window.scrollTo({top:0, behavior:'smooth'});
  if(name!=='memo' && memoTimerInt){ clearInterval(memoTimerInt); memoTimerInt=null; }
  if(name!=='blitz' && blitzInt){ clearInterval(blitzInt); blitzInt=null; }
}
$$('[data-nav="home"]').forEach(b => b.addEventListener('click', ()=>{ sfx('click'); goHome(); }));
$('#btnHome').addEventListener('click', ()=>{ sfx('click'); goHome(); });
function goHome(){ renderHome(); showView('home'); }

/* ==================== Header ==================== */
/* Nodos fijos del encabezado, consultados una sola vez (renderHeader corre
   tras casi cualquier acción). */
const HDR = {
  lvlNum:$('#lvlNum'), lvlBar:$('#lvlBar'), lvlXpTxt:$('#lvlXpTxt'), streakTxt:$('#streakTxt'),
  btnProfile:$('#btnProfile'), btnSound:$('#btnSound'), hdrBadge:$('#hdrBadge'),
  subjIcon:$('#subjIcon'), subjShort:$('#subjShort'), streakDot:$('#streakDot')
};
function renderHeader(){
  const li = levelInfo();
  HDR.lvlNum.textContent = li.lvl;
  HDR.lvlBar.style.width = Math.round(li.frac*100)+'%';
  HDR.lvlXpTxt.textContent = S.xp+' XP · faltan '+li.toNext;
  HDR.streakTxt.textContent = S.streak;
  if(HDR.streakDot){ const ready = missionsReadyCount(); HDR.streakDot.textContent = ready; HDR.streakDot.classList.toggle('hidden', ready===0); }
  HDR.btnProfile.innerHTML = avatarStack(activeProfile(), 26);
  HDR.btnSound.textContent = S.sound ? 'Sonido: activado' : 'Sonido: apagado';
  HDR.btnSound.setAttribute('aria-pressed', S.sound);
  // insignia destacada en el encabezado
  ensureEquip();
  const bd = S.equip.badge ? BADGES.find(b=>b.id===S.equip.badge) : null;
  if(bd){ HDR.hdrBadge.textContent = bd.ico; HDR.hdrBadge.title = 'Insignia destacada: '+bd.name; HDR.hdrBadge.classList.remove('hidden'); }
  else HDR.hdrBadge.classList.add('hidden');
  const subj = subjectById(S.activeSubject);
  HDR.subjIcon.innerHTML = subjSVG(subj.id);
  HDR.subjShort.textContent = subj.short;
  renderHearts();
  updateTaskBadge();
}
/* — Selector de materia — */
function openSubjectPicker(){
  const cards = SUBJECTS.map(s => {
    const d = subjSnapshot(s.id);
    const mods = MODULES_BY_SUBJECT[s.id] || [];
    const done = Object.values(d.modules).filter(m=>m.done).length;
    const active = s.id === S.activeSubject;
    return '<button class="profile-row'+(active?' active':'')+'" style="width:100%;text-align:left" data-subj="'+s.id+'">'
      + '<span class="pr-av">'+subjSVG(s.id)+'</span>'
      + '<span class="pr-name">'+esc(s.name)
      + '<br><small style="color:var(--muted);font-weight:600">'
      + (mods.length ? done+'/'+mods.length+' módulos · '+(d.subjXP||0)+' XP' : 'Contenido en preparación · tareas y calendario disponibles')
      + '</small></span>'
      + (active ? '<span class="tag dom">✔ Activa</span>' : '')
      + '</button>';
  }).join('');
  const o = openModal('<h2 style="margin-top:0">📚 Mis materias · 6.º cuatrimestre</h2>'
    + '<p style="color:var(--ink2);font-size:.88rem">Cada materia guarda su propio avance, exámenes y estadísticas. El XP, nivel, racha y recompensas son globales.</p>'
    + cards
    + '<div class="q-actions" style="justify-content:center"><button class="btn ghost" id="subjClose">Cerrar</button></div>');
  o.querySelectorAll('[data-subj]').forEach(b => b.addEventListener('click', () => { sfx('click'); closeModal(); switchSubject(b.dataset.subj); }));
  o.querySelector('#subjClose').addEventListener('click', () => { sfx('click'); closeModal(); });
}
$('#btnSubject').addEventListener('click', () => { sfx('click'); openSubjectPicker(); });

/* ==================== Pantalla de inicio ==================== */
function overallStats(){
  const n = MODULES.length;
  let done = 0, sumBest = 0;
  MODULES.forEach(m => { const st = modState(m.id); if(st.done) done++; sumBest += st.best; });
  let ok=0, bad=0;
  Object.values(S.concepts).forEach(c => { ok+=c.ok; bad+=c.bad; });
  const acc = (ok+bad) ? ok/(ok+bad) : 0;
  const scores = S.history.map(h=>h.score);
  const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;
  return { done, total:n, progress: n ? sumBest/(100*n) : 0, acc, avg, answered: ok+bad };
}
/* Estadísticas de cualquier materia (para el panel general y el calendario) */
function subjStats(id){
  const d = subjSnapshot(id);
  const mods = MODULES_BY_SUBJECT[id] || [];
  let done = 0, sumBest = 0;
  mods.forEach(m => { const st = d.modules[m.id] || {best:0,done:false}; if(st.done) done++; sumBest += st.best||0; });
  const scores = d.history.map(h=>h.score);
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  return { done, total: mods.length, progress: mods.length ? sumBest/(100*mods.length) : 0,
    avg, attempts: d.history.length, xp: d.subjXP||0, exams: d.examHistory||[], concepts: d.concepts||{} };
}
function renderHome(){
  renderHeader();
  const subj = subjectById(S.activeSubject);
  const hasContent = MODULES.length > 0;
  const o = overallStats();
  const dayXp = (S.dayXP && S.dayXP.d === todayKey()) ? S.dayXP.xp : 0;
  const goal = S.xpGoal || 50;
  const pend = pendingTasksCount();
  $('#homeStats').innerHTML =
    tile('','Avance en '+subj.short, Math.round(o.progress*100), '%', hasContent ? o.done+' de '+o.total+' módulos' : 'contenido en preparación') +
    tile('','Precisión', Math.round(o.acc*100), '%', o.answered+' respuestas en esta materia') +
    tile('','Promedio', Math.round(o.avg), '%', S.history.length+' actividades') +
    tile('','XP total', S.xp, '', 'Nivel '+levelInfo().lvl+' · '+currentTitle()) +
    tile('','Objetivo de hoy', dayXp+'<span class="unit">/'+goal+' XP</span>', '', dayXp>=goal ? '¡Cumplido!' : 'ajústalo en tu perfil') +
    tile('','Racha diaria', S.streak, S.streak===1?' día':' días', (S.lastDay===todayKey() ? '¡Ya estudiaste hoy!' : 'Estudia hoy para mantenerla') + ((S.streakFreezes||0) ? ' · '+S.streakFreezes+' congelador'+(S.streakFreezes===1?'':'es') : '')) +
    tile('','Tareas pendientes', pend, '', pend ? 'revísalas en Tareas' : 'todo al día');
  $('#subjSectionTitle').textContent = subj.name;
  $('#modMeta').textContent = hasContent ? o.done+' / '+o.total+' completados · se desbloquea con ≥ 80%' : 'en preparación';
  $('#futureUnits').classList.toggle('hidden', S.activeSubject !== 'ca3');
  // saludo según avance, personalizado con el perfil
  const pname = activeProfile().name.split(' ')[0];
  $('#heroTitle').textContent = !hasContent ? subj.name
    : o.done===0 ? '¡Bienvenido, '+pname+'!'
    : o.done===MODULES.length ? '¡Dominaste todos los módulos, '+pname+'!'
    : '¡Sigue así, '+pname+'! Vas '+o.done+' de '+o.total+' módulos';
  $('#heroDesc').innerHTML = hasContent
    ? 'Avanza por los '+o.total+' módulos de <b>'+esc(subj.name)+'</b>. Necesitas <b>80%</b> para desbloquear el siguiente. Gana XP, estrellas e insignias.'
    : 'Los módulos de <b>'+esc(subj.name)+'</b> están en preparación. Mientras tanto revisa sus tareas y su calendario de exámenes.';
  // estado del examen diario
  const doneToday = S.examDay === todayKey();
  $('#btnExam').innerHTML = (doneToday && S.examHistory.length)
    ? 'Examen de hoy: '+S.examHistory[0].score+'% ✓'
    : 'Examen diario';
  // modos de juego activos/inactivos (configurables en el perfil); sin contenido no hay juegos
  const gm = S.gameModes || {};
  $('#btnContinue').classList.toggle('hidden', !hasContent);
  $('#btnExam').classList.toggle('hidden', !hasContent || gm.exam === false);
  $('#btnFlash').classList.toggle('hidden', !hasContent || gm.flash === false);
  $('#btnBlitz').classList.toggle('hidden', !hasContent || gm.blitz === false);
  $('#btnSudden').classList.toggle('hidden', !hasContent || gm.sudden === false);
  $('#btnReview').classList.toggle('hidden', !hasContent || gm.review === false);
  // grid de módulos (o tarjeta de "en preparación" si la materia aún no tiene contenido)
  if(!hasContent){
    $('#moduleGrid').innerHTML = '<div class="mcard locked" style="--mc:var(--c5)">'
      + '<span class="lock">🚧</span>'
      + '<div class="m-top"><span class="m-ico">'+subjSVG(subj.id)+'</span><span><span class="m-num">Próximamente</span><h3>'+esc(subj.name)+'</h3></span></div>'
      + '<span class="m-desc">Los módulos y quizzes de esta materia se agregarán pronto. Mientras tanto ya puedes consultar sus tareas 📋 y su calendario de exámenes 📅.</span>'
      + '<span class="m-type">En preparación</span></div>';
    return;
  }
  $('#moduleGrid').innerHTML = lessonPathHTML();
  $$('#moduleGrid .lp-node[data-mod]:not(.locked)').forEach(c => c.addEventListener('click', ()=>{ sfx('click'); openModule(+c.dataset.mod); }));
  $$('#moduleGrid .lp-node.locked[data-mod]').forEach(c => c.addEventListener('click', ()=>{ sfx('bad'); toast('🔒 Consigue ≥80% en el módulo anterior para desbloquear éste.'); }));
  const cur = $('#moduleGrid .lp-node.current');
  if(cur && S.history.length) setTimeout(()=>cur.scrollIntoView({behavior:'smooth', block:'center'}), 150);
}
/* ==================== 🗺️ Árbol de lecciones (camino de nodos) ====================
   Camino serpenteante estilo Duolingo: un nodo por módulo, agrupado por parcial
   (SUBJECT_PARCIALES), con checkpoint al final de cada grupo. Estados:
   done (✓ + estrellas) · current (siguiente por jugar, con burbuja EMPEZAR)
   · available · locked. El desbloqueo sigue siendo lineal (≥80% en el previo). */
function lessonPathHTML(){
  const colors = ['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c7)','var(--c8)'];
  const par = (typeof SUBJECT_PARCIALES !== 'undefined' && SUBJECT_PARCIALES[S.activeSubject]) || null;
  const groups = (par && par.groups && par.groups.length)
    ? par.groups
    : [{name:'Todos los módulos', mods: MODULES.map(m=>m.id)}];
  const currentId = (MODULES.find(m => isUnlocked(m.id) && !modState(m.id).done) || {}).id;
  const OFF = [0, 1, 2, 1, 0, -1, -2, -1];   // patrón de zigzag
  let step = 0;
  const nodeHTML = (m, gi) => {
    const st = modState(m.id);
    const locked = !isUnlocked(m.id);
    const isCur = m.id === currentId;
    const stars = st.done ? '<span class="lp-stars">'+'★'.repeat(st.stars)+'<span class="off">'+'★'.repeat(Math.max(0,3-st.stars))+'</span></span>' : '';
    const cls = 'lp-node' + (locked?' locked':'') + (st.done?' done':'') + (isCur?' current':'');
    const x = OFF[step++ % OFF.length];
    return '<div class="lp-row" style="--x:'+x+'">'
      + '<button class="'+cls+'" data-mod="'+m.id+'" style="--mc:'+colors[m.id % colors.length]+'" '
      + 'title="Módulo '+(m.id+1)+': '+esc(m.name)+(locked?' (bloqueado)':'')+'" aria-label="Módulo '+(m.id+1)+': '+esc(m.name)+'">'
      + (isCur ? '<span class="lp-start">EMPEZAR</span>' : '')
      + '<span class="lp-ico">'+(locked ? '🔒' : (st.done ? m.icon : m.icon))+'</span>'
      + (st.done ? '<span class="lp-check">✓</span>' : '')
      + (!locked && !st.done && st.attempts ? '<span class="lp-best">'+st.best+'%</span>' : '')
      + '</button>'
      + '<div class="lp-label'+(locked?' dim':'')+'"><b>'+esc(m.name)+'</b>'+stars+'</div>'
      + '</div>';
  };
  const checkpointHTML = (g, gi) => {
    const total = g.mods.length;
    const done = g.mods.filter(id => modState(id).done).length;
    const complete = total > 0 && done === total;
    const x = OFF[step++ % OFF.length];
    return '<div class="lp-row" style="--x:'+x+'">'
      + '<div class="lp-node checkpoint'+(complete?' done':'')+'" title="'+esc(g.name)+': '+done+'/'+total+' módulos">'
      + '<span class="lp-ico">'+(complete?'🏆':'🛡️')+'</span>'
      + (complete ? '<span class="lp-check">✓</span>' : '')
      + '</div>'
      + '<div class="lp-label"><b>'+(complete ? '¡'+esc(g.name)+' completado!' : 'Checkpoint · '+esc(g.name))+'</b>'
      + '<span class="lp-stars" style="color:var(--muted)">'+done+'/'+total+'</span></div>'
      + '</div>';
  };
  return '<div class="lesson-path">' + groups.map((g, gi) => {
    const total = g.mods.length;
    const done = g.mods.filter(id => modState(id).done).length;
    return '<div class="lp-banner" style="--mc:'+colors[gi % colors.length]+'">'
      + '<span class="lp-banner-name">'+esc(g.name)+'</span>'
      + '<span class="lp-banner-meta">'+done+' / '+total+'</span></div>'
      + g.mods.filter(id => MODULES[id]).map(id => nodeHTML(MODULES[id], gi)).join('')
      + checkpointHTML(g, gi);
  }).join('') + '</div>';
}
function tile(icon,label,value,unit,sub){
  return '<div class="tile"><div class="t-label">'+(icon?icon+' ':'')+label+'</div>'
    + '<div class="t-value">'+value+(unit?'<span class="unit">'+unit+'</span>':'')+'</div>'
    + '<div class="t-sub">'+sub+'</div></div>';
}
function isUnlocked(id){ return id===0 || modState(id-1).best >= 80; }
$('#btnContinue').addEventListener('click', ()=>{
  sfx('click');
  if(!MODULES.length){ toast('🚧 Esta materia aún no tiene módulos.'); return; }
  const next = MODULES.find(m => isUnlocked(m.id) && !modState(m.id).done) || MODULES[0];
  openModule(next.id);
});
$('#btnStats').addEventListener('click', ()=>{ sfx('click'); renderStats(); showView('stats'); });
$('#btnStreak').addEventListener('click', ()=>{ sfx('click'); openStreakHub('daily'); });
$('#btnHearts').addEventListener('click', ()=>{ sfx('click'); openHeartsModal(); });
$('#btnGuide').addEventListener('click', ()=>{ sfx('click'); renderGuide(); showView('guide'); });
$('#lvlbox').addEventListener('click', ()=>{ sfx('click'); renderLevels(); showView('levels'); });
$('#lvlbox').setAttribute('role','button'); $('#lvlbox').setAttribute('tabindex','0');
$('#lvlbox').addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); renderLevels(); showView('levels'); } });
/* ==================== Apertura de módulos ==================== */
function openModule(id){
  const m = MODULES[id];
  if(heartsNow() <= 0){ sfx('bad'); openHeartsModal(); return; }   // ❤️ sin vidas no hay lección
  touchStreak();
  if(m.lesson){ showLesson(m); return; }
  launchModule(m);
}
function launchModule(m){
  if(m.special === 'memorama'){ startMemo(); return; }
  if(m.special === 'escape'){ startEscape(); return; }
  startSession(m.id);
}
function showLesson(m){
  $('#lessonTitleTop').textContent = m.icon+' '+m.name+' · mini lección';
  $('#lessonBody').innerHTML = m.lesson;
  $('#btnLessonStart').onclick = ()=>{ sfx('click'); startSession(m.id); };
  showView('lesson');
}

/* ==================== Sesión de preguntas ==================== */
let SES = null;
function startSession(id){
  const m = MODULES[id];
  SES = { id, qs:m.build(), i:0, pts:0, xp:0, t0:Date.now(), recap:[] };
  showView('session'); renderQ();
}
$('#btnQuit').addEventListener('click', ()=>{
  sfx('click');
  if(SES && SES.mode && SES.mode.endless && SES.recap.length){
    finishActive(); return;   // práctica/carrera: guarda lo logrado
  }
  if(SES && SES.i>0 && !confirm('¿Salir de la actividad? Perderás el avance de esta sesión.')) return;
  SES = null; goHome();
});
function renderQ(){
  const q = SES.qs[SES.i];
  $('#qCount').textContent = (SES.i+1)+' / '+SES.qs.length;
  $('#qProgBar').style.width = (SES.i/SES.qs.length*100)+'%';
  const host = $('#qHost'); host.innerHTML = '';
  const card = document.createElement('div'); card.className = 'qcard';
  card.innerHTML = '<span class="q-topic">'+(TOPIC_NAMES[q.topic]||'Concepto')+'</span>'
    + '<div class="q-prompt">'+q.prompt+'</div>' + (q.dataHtml||'');
  host.appendChild(card);
  RENDER[q.type](q, card);
}
/* Dificultad estimada según el tipo de pregunta */
const qDifficulty = q => q.type==='numeric' ? 'Difícil' : (q.type==='mc'||q.type==='tf') ? 'Fácil' : 'Media';
/* Cierra la pregunta: frac ∈ [0,1] */
function settle(q, frac, detailHtml){
  frac = clamp(frac, 0, 1);
  SES.pts += frac;
  const ok = frac >= 0.99;
  trackConcept(q.topic, frac >= 0.75);
  S.totalAnswered = (S.totalAnswered||0) + 1;
  // ❤️ solo las lecciones de módulo cuestan corazones (práctica/examen/repaso no)
  if(frac < 0.75 && SES.id !== undefined && !SES.mode && !SES.exam && !SES.review) loseHeart();
  const xp = Math.round(12*frac);
  SES.xp += xp;
  SES.recap.push({ ok, frac, prompt: q.plain || q.prompt.replace(/<[^>]*>/g,''), note: (SES.exam || !ok) ? (q.correctText||'') : '',
    topic: q.topic||'', diff: qDifficulty(q), chosen: q._chosen||'', explain: q.explain||'', steps: q.steps||null, correct: q.correctText||'' });
  if(SES.exam){
    // modo examen / parcial / final: no se revela la respuesta hasta el final
    sfx('flip');
    const card = $('#qHost .qcard');
    const note = document.createElement('div');
    note.className = 'fb';
    note.style.background = 'var(--surface2)'; note.style.borderColor = 'var(--line)';
    note.innerHTML = '<div class="fb-head" style="color:var(--ink2)">📩 Respuesta registrada ('+(SES.i+1)+' de '+SES.qs.length+')</div>';
    card.appendChild(note);
    setTimeout(() => { if(!SES) return; advanceSession(); }, 600);
    return;
  }
  sfx(ok ? 'ok' : 'bad');
  if(ok) celebrateCorrect();
  showFeedback(q, ok, frac, xp, detailHtml);
}
/* Avanza a la siguiente pregunta o finaliza según el tipo de sesión */
function advanceSession(){
  // ❤️ sin corazones a media lección: se corta y se registra lo acumulado
  if(SES && SES.id !== undefined && !SES.mode && !SES.exam && !SES.review
     && heartsNow() <= 0 && SES.i + 1 < SES.qs.length){
    outOfHeartsEnd(); return;
  }
  if(SES.mode && SES.mode.endless){
    // práctica infinita / carrera de XP: siempre hay otra pregunta
    if(SES.mode.target && SES.xp >= SES.mode.target){ finishActive(); return; }
    SES.qs.push(SES.mode.next());
  }
  SES.i++;
  if(SES.i < SES.qs.length) renderQ(); else finishActive();
}
function finishActive(){
  if(SES.mode) return finishGeneric();
  if(SES.exam) return finishExam();
  if(SES.review) return finishReview();
  return finishSession();
}
function showFeedback(q, ok, frac, xp, detailHtml){
  const card = $('#qHost .qcard');
  const fb = document.createElement('div');
  fb.className = 'fb ' + (ok ? 'ok' : 'bad');
  let inner = '<div class="fb-head">' + (ok ? '✅ ¡Correcto!' : (frac>0 ? '🟠 Casi ('+Math.round(frac*100)+'% de aciertos)' : '❌ Incorrecto'))
    + '<span class="xp-gain">+'+xp+' XP</span></div>';
  if(!ok && q.correctText) inner += '<div class="fb-exp">✔️ <b>Respuesta correcta:</b> '+q.correctText+'</div>';
  if(detailHtml) inner += detailHtml;
  if(!ok && q.explain) inner += '<div class="fb-exp" style="margin-top:6px">📌 '+q.explain+'</div>';
  if(q.steps && !ok) inner += '<div style="margin-top:10px;font-size:.85rem;font-weight:800">🧮 Solución paso a paso:</div><ol class="steps">'+q.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
  if(q.steps && ok && (q.showStepsOnOk || S.stepsOnOk)) inner += '<div style="margin-top:10px;font-size:.85rem;font-weight:800">🧮 Procedimiento:</div><ol class="steps">'+q.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
  if(ok) inner += '<div class="fb-tip">💡 <b>Tip actuarial:</b> '+(q.tip||pick(TIPS))+'</div>';
  fb.innerHTML = inner;
  card.appendChild(fb);
  const act = document.createElement('div'); act.className = 'q-actions';
  const btn = document.createElement('button'); btn.className = 'btn';
  const endless = SES.mode && SES.mode.endless;
  btn.textContent = endless ? 'Siguiente →' : ((SES.i+1 < SES.qs.length) ? 'Continuar →' : 'Ver resultados 🏁');
  btn.onclick = ()=>{ sfx('click'); advanceSession(); };
  act.appendChild(btn); card.appendChild(act);
  if(endless){
    const stop = document.createElement('button'); stop.className = 'btn ghost';
    stop.textContent = '🏁 Terminar';
    stop.onclick = ()=>{ sfx('click'); finishActive(); };
    act.appendChild(stop);
  }
  btn.focus({preventScroll:false});
  fb.scrollIntoView({behavior:'smooth', block:'nearest'});
}
function finishSession(){
  const n = SES.qs.length;
  const score = Math.round(100*SES.pts/n);
  const sec = (Date.now()-SES.t0)/1000;
  recordResult(SES.id, score, SES.xp, sec, SES.recap);
  SES = null;
}
function recordResult(id, score, xpEarned, sec, recap){
  const m = MODULES[id];
  const st = S.modules[id] || (S.modules[id] = {best:0, stars:0, attempts:0, done:false});
  st.attempts++;
  const nextWasLocked = (id+1 < MODULES.length) && !isUnlocked(id+1);
  const passed = score >= 80;
  const stars = score>=100 ? 3 : score>=90 ? 2 : score>=80 ? 1 : 0;
  st.best = Math.max(st.best, score);
  st.stars = Math.max(st.stars, stars);
  if(passed) st.done = true;
  S.totalTime += sec;
  S.history.unshift({t:Date.now(), mod:id, score, xp:xpEarned, sec:Math.round(sec)});
  if(S.history.length > 80) S.history.length = 80;
  let bonus = passed ? 30 : 0; if(score===100) bonus += 20;
  addXP(xpEarned + bonus);
  save(); checkBadges(); checkRewards(); if(passed) checkParcialFreezes(); renderHeader();
  const unlockedNext = nextWasLocked && isUnlocked(id+1);
  renderResult(m, score, stars, xpEarned+bonus, sec, recap, passed, unlockedNext);
  if(passed){ sfx('win'); confetti(score===100 ? 120 : 70); } else sfx('bad');
}
function renderResult(m, score, stars, xp, sec, recap, passed, unlockedNext){
  const R = 56, C = 2*Math.PI*R;
  const ringColor = passed ? 'var(--good)' : 'var(--bad)';
  const okCount = recap.filter(r=>r.ok).length;
  const starHtml = [1,2,3].map(i=>'<span class="'+(i<=stars?'':'off')+'">★</span>').join('');
  let html = '<div class="result-card">'
    + '<div class="big-ico">'+(score===100?'🏆':passed?'🎉':'📚')+'</div>'
    + '<h2>'+(score===100?'¡Perfecto!':passed?'¡Módulo aprobado!':'Sigue practicando')+'</h2>'
    + '<div class="r-sub">'+m.icon+' '+m.name+'</div>'
    + '<div class="r-stars">'+starHtml+'</div>'
    + '<div class="r-score-ring"><svg width="130" height="130">'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="var(--surface3)" stroke-width="12"/>'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="'+ringColor+'" stroke-width="12" stroke-linecap="round" '
    + 'stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-score/100))+'" style="transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)"/>'
    + '</svg><span class="val">'+score+'%</span></div>'
    + '<div class="r-meta"><span><b>'+okCount+'/'+recap.length+'</b>aciertos</span>'
    + '<span><b>+'+xp+'</b>XP</span><span><b>'+fmtDur(sec)+'</b>tiempo</span></div>'
    + (passed
        ? (unlockedNext ? '<p style="font-weight:700;color:var(--good-text)">🔓 ¡Desbloqueaste el siguiente módulo!</p>' : '')
        : '<p style="font-weight:600;color:var(--ink2);font-size:.9rem">Necesitas <b>80%</b> para aprobar. Revisa el repaso y vuelve a intentarlo: los ejercicios cambian cada vez. 💪</p>')
    + '<div class="q-actions" style="justify-content:center">'
    + '<button class="btn ghost" id="rHome">🏠 Inicio</button>'
    + '<button class="btn'+(passed?' ghost':'')+'" id="rRetry">🔄 Reintentar</button>'
    + (passed && m.id+1 < MODULES.length && isUnlocked(m.id+1) ? '<button class="btn good" id="rNext">Siguiente módulo →</button>' : '')
    + '</div></div>';
  if(recap.length) html += reviewSectionHTML(recap, '📋 Repaso de la sesión');
  $('#view-result').innerHTML = html;
  showView('result');
  if(recap.length) bindReview();
  $('#rHome').onclick = ()=>{ sfx('click'); goHome(); };
  $('#rRetry').onclick = ()=>{ sfx('click'); openModule(m.id); };
  const nx = $('#rNext'); if(nx) nx.onclick = ()=>{ sfx('click'); openModule(m.id+1); };
}

/* ==================== Renderizadores de pregunta ==================== */
const RENDER = {};
const KEYS = 'ABCDEFGH';
const PAIRC = ['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)'];

/* --- Opción múltiple --- */
RENDER.mc = (q, card) => {
  const wrap = document.createElement('div'); wrap.className = 'opts';
  q.options.forEach((op, i) => {
    const b = document.createElement('button'); b.className = 'opt';
    b.innerHTML = '<span class="key">'+KEYS[i]+'</span><span>'+op.t+'</span>';
    b.onclick = () => {
      wrap.querySelectorAll('.opt').forEach(o => o.disabled = true);
      q._chosen = op.t.replace(/<[^>]*>/g,'');
      if(SES && SES.exam){ b.classList.add('sel'); }
      else {
        q.options.forEach((o2, j) => { if(o2.ok) wrap.children[j].classList.add('correct'); });
        if(!op.ok) b.classList.add('wrong');
      }
      settle(q, op.ok ? 1 : 0);
    };
    wrap.appendChild(b);
  });
  card.appendChild(wrap);
};

/* --- Verdadero / Falso --- */
RENDER.tf = (q, card) => {
  const wrap = document.createElement('div'); wrap.className = 'tf-row';
  [['✅ Verdadero', true], ['❌ Falso', false]].forEach(([label, val]) => {
    const b = document.createElement('button'); b.className = 'opt'; b.textContent = label;
    b.onclick = () => {
      wrap.querySelectorAll('.opt').forEach(o => o.disabled = true);
      q._chosen = label;
      const ok = val === q.answer;
      if(SES && SES.exam){ b.classList.add('sel'); }
      else {
        b.classList.add(ok ? 'correct' : 'wrong');
        if(!ok) wrap.children[q.answer ? 0 : 1].classList.add('correct');
      }
      settle(q, ok ? 1 : 0);
    };
    wrap.appendChild(b);
  });
  card.appendChild(wrap);
};

/* --- Completar texto --- */
const normTxt = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ ]/g,'').replace(/\s+/g,' ').trim();
RENDER.fill = (q, card) => {
  const row = document.createElement('div'); row.className = 'answer-row';
  row.innerHTML = '<input class="ainput" type="text" placeholder="Escribe tu respuesta…" autocomplete="off">';
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Comprobar';
  row.appendChild(btn); card.appendChild(row);
  const inp = row.querySelector('input'); inp.focus();
  const go = () => {
    if(!inp.value.trim()) return;
    q._chosen = inp.value.trim();
    const ok = q.accept.map(normTxt).includes(normTxt(inp.value));
    inp.disabled = true; btn.disabled = true;
    if(!(SES && SES.exam)) inp.classList.add(ok ? 'ok' : 'err');
    settle(q, ok ? 1 : 0);
  };
  btn.onclick = go;
  inp.addEventListener('keydown', e => { if(e.key === 'Enter') go(); });
};

/* --- Respuesta numérica --- */
RENDER.numeric = (q, card) => {
  const row = document.createElement('div'); row.className = 'answer-row';
  if(q.unit === '$') row.innerHTML = '<span class="prefix">$</span>';
  row.innerHTML += '<input class="ainput" type="text" inputmode="decimal" placeholder="'+(q.placeholder||'Tu resultado…')+'" autocomplete="off">'
    + (q.unit && q.unit !== '$' ? '<span class="prefix">'+q.unit+'</span>' : '');
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Comprobar';
  row.appendChild(btn); card.appendChild(row);
  if(q.help){ const h = document.createElement('p'); h.className = 'q-help'; h.innerHTML = '💬 '+q.help; card.appendChild(h); }
  const inp = row.querySelector('input'); inp.focus();
  const go = () => {
    const raw = inp.value.replace(/\$|\s/g,'').replace(/,/g,'');
    if(raw === '' || isNaN(+raw)) { inp.classList.add('err'); setTimeout(()=>inp.classList.remove('err'), 500); return; }
    const val = +raw;
    q._chosen = (q.unit==='$'?'$':'') + val.toLocaleString('es-MX');
    const tol = q.tol != null ? q.tol : Math.max(0.01, Math.abs(q.answer)*0.005);
    const ok = Math.abs(val - q.answer) <= tol;
    inp.disabled = true; btn.disabled = true;
    if(!(SES && SES.exam)) inp.classList.add(ok ? 'ok' : 'err');
    settle(q, ok ? 1 : 0);
  };
  btn.onclick = go;
  inp.addEventListener('keydown', e => { if(e.key === 'Enter') go(); });
};

/* --- Relacionar columnas --- */
RENDER.match = (q, card) => {
  const n = q.pairs.length;
  const rights = shuffle(q.pairs.map((p, i) => ({txt: p.r, orig: i})));
  const wrap = document.createElement('div'); wrap.className = 'match-wrap';
  const colL = document.createElement('div'); colL.className = 'match-col'; colL.innerHTML = '<h4>Concepto</h4>';
  const colR = document.createElement('div'); colR.className = 'match-col'; colR.innerHTML = '<h4>Definición</h4>';
  const linkOf = {};       // leftIdx -> rightPos
  let selL = null, pairSeq = 0;
  const lBtns = [], rBtns = [];
  const repaint = () => {
    lBtns.forEach((b, i) => {
      b.classList.toggle('sel', selL === i);
      const has = linkOf[i] !== undefined;
      b.classList.toggle('paired', has);
      b.querySelector('.pairdot').style.display = has ? 'grid' : 'none';
    });
    rBtns.forEach((b, pos) => {
      const owner = Object.keys(linkOf).find(k => linkOf[k] === pos);
      b.classList.toggle('paired', owner !== undefined);
      b.querySelector('.pairdot').style.display = owner !== undefined ? 'grid' : 'none';
      if(owner !== undefined){
        const col = lBtns[owner].querySelector('.pairdot').style.background;
        b.querySelector('.pairdot').style.background = col;
        b.querySelector('.pairdot').textContent = +owner + 1;
      }
    });
    btn.disabled = Object.keys(linkOf).length !== n;
  };
  q.pairs.forEach((p, i) => {
    const b = document.createElement('button'); b.className = 'mitem';
    b.innerHTML = esc(p.l) + '<span class="pairdot" style="display:none">'+(i+1)+'</span>';
    b.onclick = () => { sfx('flip');
      if(linkOf[i] !== undefined){ delete linkOf[i]; selL = null; }
      else selL = (selL === i) ? null : i;
      repaint();
    };
    lBtns.push(b); colL.appendChild(b);
  });
  rights.forEach((r, pos) => {
    const b = document.createElement('button'); b.className = 'mitem';
    b.innerHTML = esc(r.txt) + '<span class="pairdot" style="display:none"></span>';
    b.onclick = () => { sfx('flip');
      const owner = Object.keys(linkOf).find(k => linkOf[k] === pos);
      if(owner !== undefined){ delete linkOf[owner]; repaint(); return; }
      if(selL === null) return;
      linkOf[selL] = pos;
      lBtns[selL].querySelector('.pairdot').style.background = PAIRC[pairSeq++ % PAIRC.length];
      lBtns[selL].querySelector('.pairdot').style.color = '#fff';
      selL = null; repaint();
    };
    rBtns.push(b); colR.appendChild(b);
  });
  wrap.appendChild(colL); wrap.appendChild(colR); card.appendChild(wrap);
  const hint = document.createElement('p'); hint.className = 'q-help';
  hint.textContent = 'Toca un concepto y luego su definición para unirlos. Toca de nuevo para deshacer.';
  card.appendChild(hint);
  const act = document.createElement('div'); act.className = 'q-actions';
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Comprobar'; btn.disabled = true;
  act.appendChild(btn); card.appendChild(act);
  btn.onclick = () => {
    const examMode = SES && SES.exam;
    let good = 0;
    q.pairs.forEach((p, i) => {
      const pos = linkOf[i];
      const isOk = pos !== undefined && rights[pos].orig === i;
      if(isOk) good++;
      if(!examMode){
        lBtns[i].style.borderColor = isOk ? 'var(--good)' : 'var(--bad)';
        if(pos !== undefined) rBtns[pos].style.borderColor = isOk ? 'var(--good)' : 'var(--bad)';
      }
      lBtns[i].disabled = true;
    });
    rBtns.forEach(b => b.disabled = true);
    act.remove();
    const detail = (examMode || good === n) ? '' :
      '<div class="fb-exp" style="margin-top:6px"><b>Parejas correctas:</b><br>' +
      q.pairs.map(p => '• '+esc(p.l)+' ↔ '+esc(p.r)).join('<br>') + '</div>';
    settle(q, good/n, detail);
  };
  repaint();
};

/* --- Arrastrar definiciones a su concepto --- */
RENDER.drag = (q, card) => {
  const n = q.items.length;
  const defs = shuffle(q.items.map((it, i) => ({txt: it.def, orig: i, id: 'chip'+i})));
  const pool = document.createElement('div'); pool.className = 'drag-pool';
  const zgrid = document.createElement('div'); zgrid.className = 'dz-grid';
  const placed = {};   // zoneIdx -> chip element
  let selChip = null;
  const mkChip = d => {
    const c = document.createElement('span'); c.className = 'dragchip'; c.textContent = d.txt;
    c.draggable = true; c.dataset.orig = d.orig;
    c.addEventListener('dragstart', e => { c.classList.add('dragging'); e.dataTransfer.setData('text/plain', d.orig); });
    c.addEventListener('dragend', () => c.classList.remove('dragging'));
    c.addEventListener('click', () => { sfx('flip');
      if(c.parentElement.classList.contains('dz-slot')){ returnChip(c); return; }
      if(selChip === c){ c.classList.remove('sel'); selChip = null; }
      else { if(selChip) selChip.classList.remove('sel'); selChip = c; c.classList.add('sel'); }
    });
    return c;
  };
  const returnChip = c => {
    const zone = c.closest('.dzone');
    if(zone){ const zi = +zone.dataset.zi; delete placed[zi]; zone.classList.remove('filled');
      zone.querySelector('.dz-slot').innerHTML = '<i>suelta aquí…</i>'; }
    c.classList.remove('sel'); pool.appendChild(c); selChip = null; updateBtn();
  };
  const placeChip = (c, zi) => {
    const zone = zgrid.children[zi];
    if(placed[zi]) returnChip(placed[zi]);
    const slot = zone.querySelector('.dz-slot');
    slot.innerHTML = ''; slot.appendChild(c); c.classList.remove('sel');
    zone.classList.add('filled'); placed[zi] = c; selChip = null; updateBtn(); sfx('click');
  };
  const updateBtn = () => { btn.disabled = Object.keys(placed).length !== n; };
  defs.forEach(d => pool.appendChild(mkChip(d)));
  q.items.forEach((it, zi) => {
    const z = document.createElement('div'); z.className = 'dzone'; z.dataset.zi = zi;
    z.innerHTML = '<span class="dz-label">'+esc(it.label)+'</span><span class="dz-slot"><i>suelta aquí…</i></span>';
    z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('over'); });
    z.addEventListener('dragleave', () => z.classList.remove('over'));
    z.addEventListener('drop', e => { e.preventDefault(); z.classList.remove('over');
      const orig = e.dataTransfer.getData('text/plain');
      const chip = [...document.querySelectorAll('.dragchip')].find(c => c.dataset.orig === orig);
      if(chip) placeChip(chip, zi);
    });
    z.addEventListener('click', e => { if(selChip && !e.target.closest('.dragchip')) placeChip(selChip, zi); });
    zgrid.appendChild(z);
  });
  card.appendChild(pool); card.appendChild(zgrid);
  const hint = document.createElement('p'); hint.className = 'q-help';
  hint.textContent = 'Arrastra cada definición a su concepto (o tócala y luego toca la casilla).';
  card.appendChild(hint);
  const act = document.createElement('div'); act.className = 'q-actions';
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Comprobar'; btn.disabled = true;
  act.appendChild(btn); card.appendChild(act);
  btn.onclick = () => {
    const examMode = SES && SES.exam;
    let good = 0;
    q.items.forEach((it, zi) => {
      const chip = placed[zi];
      const isOk = chip && +chip.dataset.orig === zi;
      if(isOk) good++;
      if(!examMode) zgrid.children[zi].style.borderColor = isOk ? 'var(--good)' : 'var(--bad)';
    });
    $$('.dragchip').forEach(c => { c.draggable = false; c.style.pointerEvents = 'none'; });
    act.remove();
    const detail = (examMode || good === n) ? '' :
      '<div class="fb-exp" style="margin-top:6px"><b>Combinación correcta:</b><br>' +
      q.items.map(it => '• '+esc(it.label)+' → '+esc(it.def)).join('<br>') + '</div>';
    settle(q, good/n, detail);
  };
};

/* --- Ordenar pasos --- */
RENDER.order = (q, card) => {
  const n = q.stepsList.length;
  const disp = shuffle(q.stepsList.map((s, i) => ({txt: s, orig: i})));
  const list = document.createElement('div'); list.className = 'order-list';
  let seq = [];   // posiciones (en disp) en el orden elegido
  const items = [];
  const repaint = () => {
    items.forEach((b, pos) => {
      const k = seq.indexOf(pos);
      b.classList.toggle('picked', k >= 0);
      b.querySelector('.onum').textContent = k >= 0 ? (k+1) : '·';
    });
    btn.disabled = seq.length !== n;
  };
  disp.forEach((d, pos) => {
    const b = document.createElement('button'); b.className = 'oitem';
    b.innerHTML = '<span class="onum">·</span><span>'+esc(d.txt)+'</span>';
    b.onclick = () => { sfx('flip');
      const k = seq.indexOf(pos);
      if(k >= 0) seq.splice(k, 1); else seq.push(pos);
      repaint();
    };
    items.push(b); list.appendChild(b);
  });
  card.appendChild(list);
  const hint = document.createElement('p'); hint.className = 'q-help';
  hint.textContent = 'Toca los pasos en el orden correcto (1→'+n+'). Vuelve a tocar para quitar un paso.';
  card.appendChild(hint);
  const act = document.createElement('div'); act.className = 'q-actions';
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Comprobar'; btn.disabled = true;
  act.appendChild(btn); card.appendChild(act);
  btn.onclick = () => {
    const examMode = SES && SES.exam;
    let good = 0;
    seq.forEach((pos, k) => {
      const isOk = disp[pos].orig === k;
      if(isOk) good++;
      if(!examMode) items[pos].style.borderColor = isOk ? 'var(--good)' : 'var(--bad)';
      items[pos].disabled = true;
    });
    items.forEach(b => b.disabled = true);
    act.remove();
    const detail = (examMode || good === n) ? '' :
      '<div class="fb-exp" style="margin-top:6px"><b>Orden correcto:</b><br>' +
      q.stepsList.map((s, i) => (i+1)+'. '+esc(s)).join('<br>') + '</div>';
    settle(q, good/n, detail);
  };
  repaint();
};

/* --- Escribir fórmula --- */
function normFormula(input){
  let s = String(input).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  s = s.replace(/[×·∗]/g,'*').replace(/÷|:/g,'/').replace(/=/g,'').replace(/[()]/g,'');
  s = s.replace(/(^|\s)x(\s|$)/g, '$1*$2');
  s = s.replace(/\bentre\b/g, ' / ').replace(/\bdividido\b/g, ' / ').replace(/\bpor\b/g, ' * ').replace(/\bmultiplicado\b/g, ' * ');
  const STOP = ['de','del','la','el','los','las','un','una','al','total','totales','totalde','numero','num','no','n','monto','montos','cantidad','importe','en','a','pagadas'];
  const SYN = {
    'siniestro':'siniestros', 'reclamaciones':'siniestros', 'reclamos':'siniestros', 'eventos':'siniestros',
    'perdida':'perdidas', 'perdidaspagadas':'perdidas', 'costosiniestros':'perdidas', 'montosiniestros':'perdidas',
    'exposiciones':'exposicion', 'expuestos':'exposicion', 'expuestas':'exposicion', 'unidadesexpuestas':'exposicion',
    'unidades':'exposicion', 'asegurados':'exposicion', 'polizas':'exposicion', 'riesgosexpuestos':'exposicion',
    'frecuencias':'frecuencia', 'frec':'frecuencia', 'f':'frecuencia',
    'severidades':'severidad', 'sev':'severidad', 'costopromedio':'severidad', 'costomedio':'severidad',
    'primas':'primas', 'primascobradas':'primas', 'primasemitidas':'primas', 'primasdevengadas':'primas', 'prima':'primas',
    'siniestrospagados':'siniestrospagados',
    'probabilidad':'probabilidad', 'prob':'probabilidad', 'p':'probabilidad',
    'primariesgo':'primariesgo', 'primapura':'primariesgo', 'primasriesgo':'primariesgo'
  };
  const canonTok = t => {
    if('*/+-'.includes(t)) return t;
    const words = t.split(/\s+/).filter(w => w && !STOP.includes(w));
    const joined = words.join('');
    return SYN[joined] !== undefined ? SYN[joined] : joined;
  };
  const toks = s.split(/([*/+\-])/).map(t => t.trim()).filter(t => t !== '').map(canonTok).filter(t => t !== '');
  const flat = toks.join('');
  return flat.split('/').map(side => side.split('*').filter(Boolean).sort().join('*')).join('/');
}
RENDER.formula = (q, card) => {
  const row = document.createElement('div'); row.className = 'answer-row';
  row.innerHTML = '<input class="ainput" type="text" placeholder="Ej.: siniestros / exposición" autocomplete="off">';
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Comprobar';
  row.appendChild(btn); card.appendChild(row);
  const h = document.createElement('p'); h.className = 'q-help';
  h.innerHTML = '💬 Puedes usar <b>/</b> para dividir y <b>×</b> o <b>*</b> para multiplicar. No importan mayúsculas, acentos ni espacios.';
  card.appendChild(h);
  const inp = row.querySelector('input'); inp.focus();
  const go = () => {
    if(!inp.value.trim()) return;
    q._chosen = inp.value.trim();
    const norm = normFormula(inp.value);
    const ok = q.accept.includes(norm);
    inp.disabled = true; btn.disabled = true;
    if(!(SES && SES.exam)) inp.classList.add(ok ? 'ok' : 'err');
    settle(q, ok ? 1 : 0);
  };
  btn.onclick = go;
  inp.addEventListener('keydown', e => { if(e.key === 'Enter') go(); });
};
/* ==================== Constructores de preguntas ==================== */
const dataBox = rows => '<div class="q-data">'+rows.map(r=>'📌 '+r).join('<br>')+'</div>';

/* --- Módulo 1: Conceptos básicos --- */
function qConceptMC(){
  const g = pick(GLOSSARY);
  const others = shuffle(GLOSSARY.filter(x => x.t !== g.t)).slice(0,3);
  return { type:'mc', topic:g.k,
    prompt:'¿Qué es <b>'+g.t.toLowerCase()+'</b>?',
    options: shuffle([{t:g.d, ok:true}, ...others.map(o=>({t:o.d, ok:false}))]),
    correctText:g.d,
    explain:'Recuerda: <b>'+g.t+'</b> = '+g.s.toLowerCase()+'.' };
}
function qConceptMCrev(){
  const g = pick(GLOSSARY);
  const others = shuffle(GLOSSARY.filter(x => x.t !== g.t)).slice(0,3);
  return { type:'mc', topic:g.k,
    prompt:'¿A qué concepto corresponde esta definición?<br><i>“'+g.d+'”</i>',
    options: shuffle([{t:g.t, ok:true}, ...others.map(o=>({t:o.t, ok:false}))]),
    correctText:g.t,
    explain:'La clave está en: '+g.s.toLowerCase()+'.' };
}
const TF_M1 = [
  {s:'El riesgo especulativo es asegurable.', a:false, e:'El riesgo especulativo puede producir ganancia o pérdida (como invertir en bolsa); los seguros solo cubren riesgos puros, donde únicamente hay posibilidad de pérdida.'},
  {s:'El riesgo puro solo tiene dos resultados posibles: que ocurra una pérdida o que no ocurra nada.', a:true, e:'Por eso es el único tipo de riesgo asegurable.'},
  {s:'El deducible es la cantidad que paga la aseguradora en cada siniestro.', a:false, e:'Es al revés: el deducible es la primera parte de la pérdida que asume el ASEGURADO antes de que la aseguradora pague.'},
  {s:'La prima pura ya incluye los gastos de administración de la aseguradora.', a:false, e:'La prima pura solo refleja el costo esperado de los siniestros. Los gastos y la utilidad se agregan en la prima de tarifa.'},
  {s:'El contratante y el asegurado pueden ser personas distintas.', a:true, e:'Ejemplo: una empresa (contratante) paga el seguro de vida de sus empleados (asegurados).'},
  {s:'La suma asegurada es el monto máximo que pagará la aseguradora.', a:true, e:'Es el límite de responsabilidad de la aseguradora establecido en la póliza.'},
  {s:'Las exclusiones son los riesgos que la póliza sí cubre.', a:false, e:'Las exclusiones son los eventos que la póliza NO cubre; lo cubierto es la cobertura.'},
  {s:'El copago es un porcentaje del costo del servicio.', a:false, e:'El copago es una cantidad FIJA por servicio (p. ej., $150 por consulta). El porcentaje de la pérdida a cargo del asegurado es el coaseguro.'},
  {s:'Un siniestro es la materialización del riesgo cubierto por la póliza.', a:true, e:'Cuando el riesgo se concreta (choque, incendio, enfermedad) hablamos de un siniestro.'},
  {s:'La póliza es el contrato que documenta los derechos y obligaciones del seguro.', a:true, e:'Es el documento contractual entre aseguradora y contratante.'},
  {s:'El coaseguro es la participación porcentual del asegurado en la pérdida.', a:true, e:'Después de aplicar el deducible, el asegurado asume un porcentaje (p. ej., 10%) del resto.'},
  {s:'El beneficiario es siempre la persona que paga la prima.', a:false, e:'Quien paga la prima es el contratante; el beneficiario es quien RECIBE la indemnización.'},
  {s:'La exposición mide cuántas unidades están sujetas al riesgo durante un periodo.', a:true, e:'Por ejemplo, 1,000 autos asegurados durante un año = 1,000 unidades-año de exposición.'},
  {s:'La prima de tarifa es menor que la prima pura.', a:false, e:'La prima de tarifa = prima pura + gastos + utilidad, por lo que siempre es MAYOR.'},
  {s:'La indemnización es el pago que hace la aseguradora al ocurrir un siniestro cubierto.', a:true, e:'Su propósito es resarcir la pérdida sufrida, sin generar lucro para el asegurado.'}
];
function qTF_M1(usedSet){
  let it = pick(TF_M1), guard = 0;
  while(usedSet.has(it.s) && guard++ < 20) it = pick(TF_M1);
  usedSet.add(it.s);
  return { type:'tf', topic:'riesgo', prompt:it.s, answer:it.a,
    correctText: it.a ? 'Verdadero' : 'Falso', explain: it.e };
}
const FILL_M1 = [
  {p:'La _______ es el precio que paga el contratante por la protección del seguro.', a:['prima'], e:'La prima es el precio del seguro.'},
  {p:'El _______ es la cantidad fija que asume el asegurado antes de que la aseguradora empiece a pagar.', a:['deducible'], e:'El deducible siempre corre a cargo del asegurado.'},
  {p:'El _______ es el porcentaje de la pérdida (después del deducible) que corre a cargo del asegurado.', a:['coaseguro'], e:'Coaseguro = participación porcentual del asegurado.'},
  {p:'El _______ es la cantidad fija que paga el asegurado cada vez que usa un servicio (p. ej., $150 por consulta).', a:['copago'], e:'El copago es fijo por evento; no depende del costo total.'},
  {p:'La _______ _______ es el monto máximo que la aseguradora se obliga a pagar.', a:['suma asegurada'], e:'Es el límite de responsabilidad de la póliza.'},
  {p:'El evento que materializa el riesgo y da origen a la reclamación se llama _______.', a:['siniestro'], e:'Sin siniestro no hay indemnización.'},
  {p:'La _______ es el documento contractual del seguro.', a:['poliza','póliza'], e:'La póliza documenta derechos y obligaciones.'},
  {p:'El _______ es la persona designada para recibir la indemnización.', a:['beneficiario'], e:'No confundir con el contratante (quien paga) ni el asegurado (quien está expuesto).'},
  {p:'La _______ es el pago de la aseguradora para resarcir la pérdida de un siniestro cubierto.', a:['indemnizacion','indemnización'], e:'Su fin es reponer, no enriquecer.'},
  {p:'Los eventos que la póliza NO cubre se llaman _______.', a:['exclusiones'], e:'Léelas siempre antes de contratar.'}
];
function qFill_M1(usedSet){
  let it = pick(FILL_M1), guard = 0;
  while(usedSet.has(it.p) && guard++ < 20) it = pick(FILL_M1);
  usedSet.add(it.p);
  return { type:'fill', topic:'poliza', prompt:'Completa la frase:<br><i>'+it.p+'</i>',
    accept: it.a, correctText: it.a[0], explain: it.e };
}
function qMatchGlossary(n, topics){
  const pool = topics ? GLOSSARY.filter(g=>topics.includes(g.k)) : GLOSSARY;
  const sel = shuffle(pool).slice(0, n);
  return { type:'match', topic: sel[0].k,
    prompt:'Relaciona cada concepto con su descripción:',
    pairs: sel.map(g => ({l:g.t, r:g.s})),
    correctText: '', explain:'Repasa el glosario en la Guía de estudio (botón 🖨️).' };
}
function qDragGlossary(n){
  const sel = shuffle(GLOSSARY).slice(0, n);
  return { type:'drag', topic: sel[0].k,
    prompt:'Arrastra cada definición hasta su concepto:',
    items: sel.map(g => ({label:g.t, def:g.s})),
    explain:'Repasa el glosario en la Guía de estudio (botón 🖨️).' };
}
function buildM1(){
  const usedTF = new Set(), usedF = new Set();
  return shuffle([
    qConceptMC(), qConceptMC(), qConceptMCrev(), qConceptMCrev(),
    qTF_M1(usedTF), qTF_M1(usedTF), qTF_M1(usedTF),
    qFill_M1(usedF), qFill_M1(usedF),
    qMatchGlossary(4), qDragGlossary(4)
  ]);
}

/* --- Módulo 2: Cálculos básicos (generador infinito) --- */
function qFreq(){
  const expo = pick([200,400,500,600,800,1000,1200,1500,2000]);
  const per = ri(2,15);                       // siniestros por cada 100 unidades
  const ns = per*expo/100;
  const ans = per/100;
  return { type:'numeric', topic:'frecuencia',
    prompt:'Calcula la <b>frecuencia</b> de siniestros:',
    dataHtml: dataBox(['Número de siniestros: <b>'+ns+'</b>', 'Exposición (unidades aseguradas): <b>'+expo.toLocaleString()+'</b>']),
    help:'Expresa el resultado como decimal (p. ej., 0.05).',
    answer: ans, tol: 0.0005,
    correctText: ans+' ('+per+' siniestros por cada 100 unidades)',
    steps:[ 'Fórmula: Frecuencia = Número de siniestros ÷ Exposición',
      'Sustituye: '+ns+' ÷ '+expo.toLocaleString(),
      'Resultado: '+ans,
      'Interpretación: ocurren '+per+' siniestros por cada 100 unidades expuestas.' ],
    explain:'La frecuencia mide qué tan seguido ocurren los siniestros por unidad expuesta.' };
}
function qSev(){
  const ns = ri(20,80);
  const sev = ri(8,60)*500;
  const total = ns*sev;
  return { type:'numeric', topic:'severidad', unit:'$',
    prompt:'Calcula la <b>severidad</b> (costo promedio por siniestro):',
    dataHtml: dataBox(['Monto total de pérdidas: <b>'+money(total)+'</b>', 'Número de siniestros: <b>'+ns+'</b>']),
    answer: sev, tol: 1,
    correctText: money(sev),
    steps:[ 'Fórmula: Severidad = Pérdidas totales ÷ Número de siniestros',
      'Sustituye: '+money(total)+' ÷ '+ns,
      'Resultado: '+money(sev)+' por siniestro.' ],
    explain:'La severidad es el costo promedio de cada siniestro.' };
}
function qPrimaRiesgo(){
  const per = ri(2,12);                        // frecuencia %
  const freq = per/100;
  const sev = ri(5,50)*1000;
  const ans = freq*sev;
  return { type:'numeric', topic:'primariesgo', unit:'$',
    prompt:'Calcula la <b>prima de riesgo</b> (prima pura):',
    dataHtml: dataBox(['Frecuencia: <b>'+freq+'</b>', 'Severidad: <b>'+money(sev)+'</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Fórmula: Prima de riesgo = Frecuencia × Severidad',
      'Sustituye: '+freq+' × '+money(sev),
      'Resultado: '+money(ans)+' por unidad asegurada.' ],
    explain:'La prima de riesgo es el costo esperado del siniestro por unidad asegurada, sin gastos ni utilidad.' };
}
function qCostoEsperado(){
  const expo = pick([500,800,1000,1500,2000]);
  const per = ri(2,10);
  const freq = per/100;
  const sev = ri(10,40)*1000;
  const ans = expo*freq*sev;
  return { type:'numeric', topic:'costoesperado', unit:'$',
    prompt:'Calcula el <b>costo esperado total</b> de la cartera:',
    dataHtml: dataBox(['Unidades expuestas: <b>'+expo.toLocaleString()+'</b>', 'Frecuencia: <b>'+freq+'</b>', 'Severidad: <b>'+money(sev)+'</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Fórmula: Costo esperado = Exposición × Frecuencia × Severidad',
      'Siniestros esperados: '+expo.toLocaleString()+' × '+freq+' = '+(expo*freq),
      'Costo esperado: '+(expo*freq)+' siniestros × '+money(sev)+' = '+money(ans)+'.' ],
    explain:'Es el total que la aseguradora espera pagar en siniestros de toda la cartera.' };
}
function qSiniestralidad(){
  const P = ri(8,20);                           // primas en cientos de miles
  const pctS = pick([45,50,55,60,65,70,75,80,85,90,95,110]);
  const primas = P*100000;
  const pagados = primas*pctS/100;
  return { type:'numeric', topic:'siniestralidad', unit:'%',
    prompt:'Calcula la <b>siniestralidad</b> de la cartera (en %):',
    dataHtml: dataBox(['Siniestros pagados: <b>'+money(pagados)+'</b>', 'Primas cobradas: <b>'+money(primas)+'</b>']),
    answer: pctS, tol: 0.2,
    correctText: pctS+'%',
    steps:[ 'Fórmula: Siniestralidad = Siniestros pagados ÷ Primas cobradas',
      'Sustituye: '+money(pagados)+' ÷ '+money(primas)+' = '+(pctS/100),
      'En porcentaje: '+pctS+'%.',
      pctS>100 ? '¡Alerta! Una siniestralidad mayor a 100% significa pérdida técnica.' : 'Cada $100 de prima, se destinan $'+pctS+' a pagar siniestros.' ],
    explain:'La siniestralidad compara lo pagado en siniestros contra lo cobrado en primas.' };
}
function buildM2(){
  return shuffle([qFreq(), qFreq(), qSev(), qSev(), qPrimaRiesgo(), qPrimaRiesgo(), qCostoEsperado(), qSiniestralidad()]);
}

/* --- Módulo 3: Copago --- */
const COPAY_SCEN = [
  {n:'Consulta médica general', lo:600, hi:1600},
  {n:'Consulta con especialista', lo:900, hi:2500},
  {n:'Medicamento cubierto', lo:400, hi:1800},
  {n:'Estudio de laboratorio', lo:500, hi:2200},
  {n:'Sesión de terapia física', lo:500, hi:1500},
  {n:'Consulta de urgencias', lo:1200, hi:3500}
];
function qCopagoIns(){
  const sc = pick(COPAY_SCEN);
  const cost = ri(sc.lo/100, sc.hi/100)*100;
  const cop = pick([100,150,200,250,300,350,400].filter(c=>c<cost));
  const ans = cost-cop;
  return { type:'numeric', topic:'copago', unit:'$',
    prompt:'<b>'+sc.n+'.</b> ¿Cuánto paga la <b>aseguradora</b>?',
    dataHtml: dataBox(['Costo del servicio: <b>'+money(cost)+'</b>', 'Copago del asegurado: <b>'+money(cop)+'</b>']),
    answer: ans, tol: 0.5,
    correctText: money(ans),
    steps:[ 'El copago es una cantidad fija a cargo del asegurado.',
      'Aseguradora = Costo − Copago',
      money(cost)+' − '+money(cop)+' = <b>'+money(ans)+'</b>.' ],
    explain:'El asegurado solo aporta el copago fijo; la aseguradora cubre el resto.' };
}
function qCopagoYear(){
  const sc = pick(COPAY_SCEN.slice(0,3));
  const cop = pick([100,150,200,250,300]);
  const visits = ri(3,8);
  const ans = cop*visits;
  return { type:'numeric', topic:'copago', unit:'$',
    prompt:'Durante el año, el asegurado tuvo <b>'+visits+'</b> servicios de tipo “'+sc.n.toLowerCase()+'”. ¿Cuánto pagó en total por <b>copagos</b>?',
    dataHtml: dataBox(['Copago por servicio: <b>'+money(cop)+'</b>', 'Número de servicios en el año: <b>'+visits+'</b>']),
    answer: ans, tol: 0.5,
    correctText: money(ans),
    steps:[ 'El copago se paga en CADA servicio.', 'Total = Copago × Número de servicios',
      money(cop)+' × '+visits+' = <b>'+money(ans)+'</b>.' ],
    explain:'El copago se cobra por evento, independientemente del costo de cada servicio.' };
}
function qCopagoMC(){
  const variants = [
    { prompt:'Una póliza de gastos médicos indica: “copago de $200 por consulta”. Si la consulta cuesta $1,450, ¿cuánto paga el asegurado?',
      options:[{t:'$200 (el copago fijo)', ok:true},{t:'$1,450 (todo el costo)', ok:false},{t:'$1,250', ok:false},{t:'20% del costo', ok:false}],
      correct:'$200 (el copago fijo)', e:'El copago es una cantidad fija por servicio; el asegurado paga $200 y la aseguradora $1,250.' },
    { prompt:'¿Cuál es la diferencia principal entre copago y coaseguro?',
      options:[{t:'El copago es una cantidad fija por servicio; el coaseguro es un porcentaje de la pérdida', ok:true},
               {t:'Son sinónimos', ok:false},
               {t:'El copago lo paga la aseguradora y el coaseguro el asegurado', ok:false},
               {t:'El coaseguro es fijo y el copago es porcentual', ok:false}],
      correct:'El copago es fijo por servicio; el coaseguro es porcentual', e:'Copago = cuota fija por evento. Coaseguro = % de la pérdida después del deducible.' },
    { prompt:'¿Cuál es el propósito principal del copago en un seguro médico?',
      options:[{t:'Moderar el uso de los servicios y compartir costos con el asegurado', ok:true},
               {t:'Aumentar la utilidad del hospital', ok:false},
               {t:'Sustituir a la prima', ok:false},
               {t:'Eliminar el deducible', ok:false}],
      correct:'Moderar el uso de servicios y compartir costos', e:'Al pagar una parte, el asegurado usa los servicios con más responsabilidad (control del riesgo moral).' }
  ];
  const v = pick(variants);
  return { type:'mc', topic:'copago', prompt:v.prompt, options:shuffle(v.options), correctText:v.correct, explain:v.e };
}
function buildM3(){
  return shuffle([qCopagoIns(), qCopagoIns(), qCopagoIns(), qCopagoIns(), qCopagoYear(), qCopagoYear(), qCopagoMC(), qCopagoMC()]);
}

/* --- Módulo 4: Coaseguro (con deducible y límite) --- */
function coasCase(withLimit){
  const D = ri(2,10)*1000;
  const c = pick([10,20,25,30]);
  const loss = D + ri(10,80)*1000;
  const base = loss - D;
  const insRaw = base*(1-c/100);
  const insured0 = D + base*c/100;
  let L = Infinity, ins = insRaw, extra = 0;
  if(withLimit){
    L = Math.max(1000, Math.floor(insRaw*pick([0.6,0.7,0.8])/1000)*1000);
    ins = Math.min(insRaw, L);
    extra = insRaw - ins;
  }
  return {D, c, loss, base, insRaw, ins, insured: insured0+extra, L, withLimit, extra};
}
function qCoasIns(){
  const k = coasCase(false);
  return { type:'numeric', topic:'coaseguro', unit:'$',
    prompt:'¿Cuánto paga la <b>aseguradora</b>?',
    dataHtml: dataBox(['Monto del siniestro: <b>'+money(k.loss)+'</b>', 'Deducible: <b>'+money(k.D)+'</b>', 'Coaseguro (a cargo del asegurado): <b>'+k.c+'%</b>']),
    answer: k.ins, tol: 1,
    correctText: money(k.ins),
    steps:[ 'Resta el deducible: '+money(k.loss)+' − '+money(k.D)+' = '+money(k.base),
      'El asegurado asume el coaseguro: '+k.c+'% de '+money(k.base)+' = '+money(k.base*k.c/100),
      'La aseguradora paga el resto: '+(100-k.c)+'% × '+money(k.base)+' = <b>'+money(k.ins)+'</b>.' ],
    explain:'Orden correcto: primero deducible, luego coaseguro sobre el remanente.' };
}
function qCoasInsured(){
  const k = coasCase(false);
  return { type:'numeric', topic:'coaseguro', unit:'$',
    prompt:'¿Cuánto paga en total el <b>asegurado</b>?',
    dataHtml: dataBox(['Monto del siniestro: <b>'+money(k.loss)+'</b>', 'Deducible: <b>'+money(k.D)+'</b>', 'Coaseguro (a cargo del asegurado): <b>'+k.c+'%</b>']),
    answer: k.insured, tol: 1,
    correctText: money(k.insured),
    steps:[ 'El asegurado siempre paga el deducible: '+money(k.D),
      'Base para coaseguro: '+money(k.loss)+' − '+money(k.D)+' = '+money(k.base),
      'Coaseguro: '+k.c+'% × '+money(k.base)+' = '+money(k.base*k.c/100),
      'Total asegurado = '+money(k.D)+' + '+money(k.base*k.c/100)+' = <b>'+money(k.insured)+'</b>.' ],
    explain:'Pago del asegurado = deducible + coaseguro. La aseguradora cubre el resto.' };
}
function qCoasLimit(){
  const k = coasCase(true);
  return { type:'numeric', topic:'coaseguro', unit:'$',
    prompt:'La póliza tiene un <b>límite de cobertura</b>. ¿Cuánto paga la <b>aseguradora</b>?',
    dataHtml: dataBox(['Monto del siniestro: <b>'+money(k.loss)+'</b>', 'Deducible: <b>'+money(k.D)+'</b>',
      'Coaseguro (a cargo del asegurado): <b>'+k.c+'%</b>', 'Límite máximo de pago: <b>'+money(k.L)+'</b>']),
    answer: k.ins, tol: 1,
    correctText: money(k.ins),
    steps:[ 'Base: '+money(k.loss)+' − '+money(k.D)+' = '+money(k.base),
      'Pago teórico de la aseguradora: '+(100-k.c)+'% × '+money(k.base)+' = '+money(k.insRaw),
      'Compara con el límite: '+money(k.insRaw)+' vs '+money(k.L),
      'Se paga el MENOR: <b>'+money(k.ins)+'</b>. El excedente ('+money(k.extra)+') corre a cargo del asegurado.' ],
    explain:'La aseguradora nunca paga más que el límite de cobertura (suma asegurada).' };
}
function buildM4(){
  return shuffle([qCoasIns(), qCoasIns(), qCoasInsured(), qCoasInsured(), qCoasLimit(), qCoasLimit(),
    { type:'tf', topic:'coaseguro', prompt:'El coaseguro se aplica sobre el monto del siniestro DESPUÉS de restar el deducible.',
      answer:true, correctText:'Verdadero', explain:'Primero se descuenta el deducible; el coaseguro se calcula sobre el remanente.' },
    qMatchGlossary(4, ['deducible','coaseguro','copago','sumaasegurada','indemnizacion','cobertura'])
  ]);
}

/* --- Módulo 5: Deducible --- */
function qDedBelow(){
  const D = ri(5,15)*1000;
  const loss = ri(Math.max(1,Math.floor(D/1000*0.3)), Math.floor(D/1000)-1)*1000;
  return { type:'numeric', topic:'deducible', unit:'$',
    prompt:'¿Cuánto paga la <b>aseguradora</b> en este siniestro?',
    dataHtml: dataBox(['Monto del siniestro: <b>'+money(loss)+'</b>', 'Deducible de la póliza: <b>'+money(D)+'</b>']),
    answer: 0, tol: 0.5,
    correctText: money(0),
    steps:[ 'Compara el siniestro con el deducible: '+money(loss)+' < '+money(D),
      'La pérdida no supera el deducible.',
      'La aseguradora paga <b>$0</b>: todo el siniestro corre a cargo del asegurado.' ],
    explain:'Si la pérdida es menor o igual al deducible, la aseguradora no paga nada.' };
}
function qDedSimple(){
  const D = ri(2,12)*1000;
  const loss = D + ri(8,60)*1000;
  const ans = loss - D;
  return { type:'numeric', topic:'deducible', unit:'$',
    prompt:'Con deducible fijo y <b>sin coaseguro</b>, ¿cuánto paga la <b>aseguradora</b>?',
    dataHtml: dataBox(['Monto del siniestro: <b>'+money(loss)+'</b>', 'Deducible: <b>'+money(D)+'</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Aseguradora = Siniestro − Deducible', money(loss)+' − '+money(D)+' = <b>'+money(ans)+'</b>.' ],
    explain:'El deducible es la primera capa de la pérdida y la asume el asegurado.' };
}
function qDedFull(who){
  const k = coasCase(false);
  const isClient = who === 'cliente';
  const ans = isClient ? k.insured : k.ins;
  return { type:'numeric', topic:'deducible', unit:'$',
    prompt:'Problema completo (deducible + coaseguro). ¿Cuánto paga el <b>'+(isClient?'cliente':'la aseguradora')+'</b>?',
    dataHtml: dataBox(['Monto del siniestro: <b>'+money(k.loss)+'</b>', 'Deducible fijo: <b>'+money(k.D)+'</b>', 'Coaseguro: <b>'+k.c+'%</b> a cargo del asegurado']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ '1) Deducible a cargo del cliente: '+money(k.D),
      '2) Remanente: '+money(k.loss)+' − '+money(k.D)+' = '+money(k.base),
      '3) Coaseguro del cliente: '+k.c+'% × '+money(k.base)+' = '+money(k.base*k.c/100),
      '4) Cliente paga: '+money(k.D)+' + '+money(k.base*k.c/100)+' = '+money(k.insured),
      '5) Aseguradora paga: '+money(k.base)+' − '+money(k.base*k.c/100)+' = '+money(k.ins)+'.' ],
    explain:'Divide siempre el problema en capas: deducible → coaseguro → resto.' };
}
function buildM5(){
  return shuffle([qDedBelow(), qDedSimple(), qDedSimple(), qDedFull('cliente'), qDedFull('cliente'), qDedFull('aseg'), qDedFull('aseg'),
    { type:'mc', topic:'deducible', prompt:'Si un asegurado elige un deducible MÁS ALTO, ¿qué pasa normalmente con su prima?',
      options: shuffle([{t:'La prima baja, porque el asegurado retiene más riesgo', ok:true},
        {t:'La prima sube', ok:false},{t:'La prima no cambia', ok:false},{t:'El seguro se cancela', ok:false}]),
      correctText:'La prima baja', explain:'A mayor deducible, la aseguradora espera pagar menos siniestros pequeños y cobra menos prima.' }
  ]);
}
/* ==================== Lecciones (Módulos 6-8) ==================== */
const LESSON_INF = [
'<div class="lesson-card"><h3>📈 ¿Qué es la inflación?</h3><p>Es el <b>aumento generalizado y sostenido</b> de los precios de bienes y servicios en una economía. No es que UN producto suba: es que el nivel general de precios sube, y por lo tanto el dinero pierde <b>poder adquisitivo</b> (con los mismos pesos compras menos).</p></div>',
'<div class="lesson-card"><h3>🔍 Causas principales</h3><ul><li><b>Inflación de demanda:</b> la gente quiere comprar más de lo que la economía produce.</li><li><b>Inflación de costos:</b> suben los insumos (energía, salarios, materias primas) y las empresas trasladan ese costo a los precios.</li><li><b>Inflación monetaria:</b> se emite dinero en exceso respecto a la producción.</li></ul></div>',
'<div class="lesson-card"><h3>⚠️ Consecuencias</h3><ul><li>El dinero pierde poder adquisitivo.</li><li>El ahorro sin intereses se “derrite”.</li><li>Se dificulta planear a largo plazo.</li><li>Los contratos a valores fijos quedan desactualizados.</li></ul></div>',
'<div class="lesson-card"><h3>🛡️ Efecto sobre los seguros</h3><table><tr><th>Elemento</th><th>Efecto de la inflación</th></tr><tr><td><b>Sumas aseguradas</b></td><td>Se vuelven insuficientes: reponer el bien cuesta más que cuando se contrató. Por eso se <b>indexan</b> (p. ej., en UDIS).</td></tr><tr><td><b>Primas</b></td><td>Suben: reparaciones, honorarios médicos y refacciones cuestan más, así que la severidad esperada crece.</td></tr><tr><td><b>Indemnizaciones</b></td><td>El costo de los siniestros aumenta con los precios; pagar el mismo daño cuesta más cada año.</td></tr></table></div>'
].join('');
const LESSON_DEV = [
'<div class="lesson-card"><h3>💱 ¿Qué es la devaluación?</h3><p>Es la <b>pérdida de valor de la moneda de un país frente a otras divisas</b>. Ejemplo: si el tipo de cambio pasa de $17 a $20 pesos por dólar, el peso se devaluó: ahora se necesitan más pesos para comprar el mismo dólar.</p></div>',
'<div class="lesson-card"><h3>🆚 Diferencia con la inflación</h3><table><tr><th></th><th>Inflación</th><th>Devaluación</th></tr><tr><td><b>¿Qué pierde valor?</b></td><td>El dinero frente a los <b>bienes internos</b></td><td>La moneda frente a <b>otras divisas</b></td></tr><tr><td><b>Se mide con…</b></td><td>Índices de precios (INPC)</td><td>El tipo de cambio</td></tr><tr><td><b>Ejemplo</b></td><td>La canasta básica sube 7% en el año</td><td>El dólar pasa de $17 a $20</td></tr></table><p>Ojo: suelen relacionarse — una devaluación encarece lo importado y puede <b>causar</b> inflación.</p></div>',
'<div class="lesson-card"><h3>🛡️ ¿Y en los seguros?</h3><p>Si el peso se devalúa, las <b>refacciones importadas</b>, equipos médicos y tratamientos en el extranjero cuestan más pesos → la <b>severidad</b> sube → las primas tienden a subir. Las pólizas en dólares protegen contra este riesgo cambiario.</p></div>'
].join('');
const LESSON_DEP = [
'<div class="lesson-card"><h3>🚗 ¿Qué es la depreciación?</h3><p>Es la <b>pérdida de valor de un activo</b> (auto, maquinaria, equipo) por el <b>uso, el paso del tiempo o la obsolescencia</b>. Un auto nuevo pierde valor en cuanto sale de la agencia.</p></div>',
'<div class="lesson-card"><h3>🚙 Depreciación de automóviles</h3><p>Los autos suelen perder entre <b>10% y 20% de su valor cada año</b> (más en el primero). Por eso, en seguros de autos la indemnización por pérdida total se basa en el <b>valor comercial</b> del vehículo al momento del siniestro, no en lo que costó nuevo.</p></div>',
'<div class="lesson-card"><h3>🧾 Depreciación contable (línea recta)</h3><p>En contabilidad, el costo del activo se reparte entre los años de su vida útil:</p><div class="formula">Depreciación anual = (Costo − Valor residual) ÷ Vida útil</div><p>El <b>valor en libros</b> tras k años = Costo − k × Depreciación anual.</p></div>',
'<div class="lesson-card"><h3>🆚 No confundir</h3><table><tr><th>Fenómeno</th><th>¿Qué pierde valor?</th></tr><tr><td><b>Depreciación</b></td><td>Un <b>activo</b> (auto, máquina) por uso/tiempo</td></tr><tr><td><b>Devaluación</b></td><td>La <b>moneda</b> frente a otras divisas</td></tr><tr><td><b>Inflación</b></td><td>El <b>dinero</b> frente a los bienes (suben los precios)</td></tr></table></div>'
].join('');

/* --- Módulo 6: Inflación --- */
const TF_INF = [
  {s:'La inflación es el aumento generalizado y sostenido de los precios.', a:true, e:'Es la definición clásica: general (muchos bienes) y sostenido (en el tiempo).'},
  {s:'Si hay inflación, el poder adquisitivo del dinero aumenta.', a:false, e:'Es lo contrario: con los mismos pesos compras menos.'},
  {s:'La inflación puede hacer que una suma asegurada resulte insuficiente al momento del siniestro.', a:true, e:'Reponer el bien cuesta más que cuando se contrató; por eso se indexan las sumas aseguradas.'},
  {s:'Las aseguradoras tienden a subir las primas cuando la inflación encarece reparaciones y servicios médicos.', a:true, e:'La severidad esperada crece con los precios, y la prima de riesgo con ella.'},
  {s:'La inflación de costos ocurre cuando suben los insumos y salarios de las empresas.', a:true, e:'Las empresas trasladan esos costos a sus precios.'},
  {s:'Una inflación anual de 5% significa que TODOS los productos subieron exactamente 5%.', a:false, e:'Es un promedio general medido con un índice de precios; cada producto varía distinto.'},
  {s:'Si un contrato de seguro está indexado (p. ej., en UDIS), la suma asegurada se actualiza con la inflación.', a:true, e:'La indexación protege el valor real de la cobertura.'},
  {s:'La inflación solo afecta a las primas, no a las indemnizaciones.', a:false, e:'También encarece las indemnizaciones: pagar el mismo daño cuesta más cada año.'}
];
function qInfPrima(){
  const prima = ri(8,30)*500;
  const inf = pick([4,5,6,8,10]);
  const ans = prima*(1+inf/100);
  return { type:'numeric', topic:'inflacion', unit:'$',
    prompt:'Si los costos de los siniestros crecen con la inflación, ¿cuál sería la <b>prima ajustada</b> para el próximo año?',
    dataHtml: dataBox(['Prima actual: <b>'+money(prima)+'</b>', 'Inflación anual esperada: <b>'+inf+'%</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Prima ajustada = Prima actual × (1 + inflación)',
      money(prima)+' × (1 + '+(inf/100)+') = '+money(prima)+' × '+(1+inf/100),
      'Resultado: <b>'+money(ans)+'</b>.' ],
    explain:'Si la severidad sube con los precios, la prima de riesgo debe actualizarse en la misma proporción.' };
}
function qInfSev(){
  const sev = ri(10,50)*1000;
  const inf = pick([5,10,15,20]);
  const ans = sev*(1+inf/100);
  return { type:'numeric', topic:'inflacion', unit:'$',
    prompt:'Las refacciones subieron con la inflación. ¿Cuál será la nueva <b>severidad promedio</b>?',
    dataHtml: dataBox(['Severidad actual por siniestro: <b>'+money(sev)+'</b>', 'Aumento de precios: <b>'+inf+'%</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Nueva severidad = Severidad × (1 + aumento)',
      money(sev)+' × '+(1+inf/100)+' = <b>'+money(ans)+'</b>.' ],
    explain:'La inflación impacta directamente la severidad: el mismo daño cuesta más repararlo.' };
}
const MC_INF = [
  { p:'El costo de las refacciones automotrices sube 12% en el año. ¿Qué efecto directo tiene esto en el seguro de autos?',
    ops:[{t:'Aumenta la severidad de los siniestros', ok:true},{t:'Aumenta la frecuencia de los siniestros', ok:false},
         {t:'Disminuye la prima', ok:false},{t:'No tiene ningún efecto', ok:false}],
    c:'Aumenta la severidad', e:'Los choques no ocurren más seguido (frecuencia), pero cada uno cuesta más reparar (severidad).' },
  { p:'Una familia contrató un seguro de casa por $1,000,000 hace 10 años y nunca actualizó la suma asegurada. Hoy reconstruir la casa cuesta $1,800,000. ¿Cuál es el problema?',
    ops:[{t:'Está infraasegurada: la inflación dejó corta la suma asegurada', ok:true},
         {t:'Está sobreasegurada', ok:false},{t:'No hay problema, el seguro paga el costo actual', ok:false},{t:'La póliza es ilegal', ok:false}],
    c:'Está infraasegurada por la inflación', e:'La aseguradora pagará como máximo la suma asegurada pactada; la inflación erosionó la cobertura real.' },
  { p:'¿Cuál de estas situaciones describe inflación de DEMANDA?',
    ops:[{t:'Los consumidores quieren comprar más de lo que la economía produce', ok:true},
         {t:'Sube el precio de la gasolina y las empresas trasladan el costo', ok:false},
         {t:'Un auto pierde valor por el uso', ok:false},{t:'El peso pierde valor frente al dólar', ok:false}],
    c:'Exceso de demanda sobre la producción', e:'Cuando la demanda supera la oferta, los precios suben: inflación de demanda.' },
  { p:'¿Por qué muchas pólizas de vida y ahorro en México se denominan en UDIS?',
    ops:[{t:'Porque las UDIS se actualizan con la inflación y protegen el valor real', ok:true},
         {t:'Porque es obligatorio por ley usar UDIS', ok:false},
         {t:'Para pagar menos impuestos', ok:false},{t:'Porque las UDIS son dólares', ok:false}],
    c:'Las UDIS se indexan a la inflación', e:'La UDI es una unidad de cuenta indexada al INPC: mantiene el poder adquisitivo de la suma asegurada.' }
];
function buildM6(){
  const used = new Set();
  const tf = () => { let it = pick(TF_INF), g=0; while(used.has(it.s)&&g++<20) it=pick(TF_INF); used.add(it.s);
    return {type:'tf', topic:'inflacion', prompt:it.s, answer:it.a, correctText: it.a?'Verdadero':'Falso', explain:it.e}; };
  const mcs = shuffle(MC_INF).slice(0,2).map(v => ({type:'mc', topic:'inflacion', prompt:v.p, options:shuffle(v.ops), correctText:v.c, explain:v.e}));
  const match = { type:'match', topic:'inflacion', prompt:'Relaciona cada tipo de inflación con su ejemplo:',
    pairs: shuffle([
      {l:'Inflación de demanda', r:'La gente quiere comprar más de lo que se produce'},
      {l:'Inflación de costos', r:'Sube la gasolina y las empresas suben sus precios'},
      {l:'Inflación monetaria', r:'Se emite dinero en exceso'},
      {l:'Indexación', r:'Actualizar la suma asegurada con la inflación'}
    ]).slice(0,4), explain:'Revisa la mini lección de este módulo.' };
  return shuffle([tf(), tf(), tf(), tf(), mcs[0], mcs[1], match, qInfPrima(), qInfSev()]);
}

/* --- Módulo 7: Devaluación --- */
const PHENO = [
  {s:'La moneda mexicana pierde valor frente al dólar.', a:'Devaluación', e:'Pérdida de valor de la moneda frente a una divisa = devaluación.'},
  {s:'El tipo de cambio pasa de $17 a $20 pesos por dólar.', a:'Devaluación', e:'Se necesitan más pesos por el mismo dólar: el peso se devaluó.'},
  {s:'La canasta básica subió 7% durante el año.', a:'Inflación', e:'Aumento generalizado de precios internos = inflación.'},
  {s:'Tu automóvil vale 20% menos que hace un año por el uso.', a:'Depreciación', e:'Un activo pierde valor por uso/tiempo = depreciación.'},
  {s:'Los precios de casi todos los bienes y servicios suben de forma sostenida.', a:'Inflación', e:'“Generalizado y sostenido” es la firma de la inflación.'},
  {s:'Una máquina industrial reduce su valor en libros cada año conforme se usa.', a:'Depreciación', e:'Depreciación contable de un activo fijo.'},
  {s:'Ahora se necesitan más pesos para comprar el mismo euro.', a:'Devaluación', e:'El peso perdió valor frente al euro.'},
  {s:'El valor de reposición de todos los electrodomésticos sube año con año.', a:'Inflación', e:'Aumento general del nivel de precios.'}
];
function qPheno(used){
  let it = pick(PHENO), g=0;
  while(used.has(it.s)&&g++<20) it = pick(PHENO);
  used.add(it.s);
  const ops = ['Inflación','Devaluación','Depreciación'].map(t=>({t, ok:t===it.a}));
  ops.push({t:'Ninguno de los anteriores', ok:false});
  return { type:'mc', topic:'devaluacion', prompt:'“'+it.s+'”<br>¿Qué fenómeno económico describe la frase?',
    options: ops, correctText: it.a, explain: it.e };
}
function qDevImport(){
  const usd = ri(2,9)*100;
  const tc = pick([17,18,19,20,21,22]);
  const ans = usd*tc;
  return { type:'numeric', topic:'devaluacion', unit:'$',
    prompt:'Una refacción importada cuesta <b>'+usd+' USD</b>. Con el tipo de cambio actual, ¿cuántos <b>pesos</b> cuesta?',
    dataHtml: dataBox(['Precio en dólares: <b>'+usd+' USD</b>', 'Tipo de cambio: <b>'+money(tc)+' por dólar</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Costo en pesos = Precio en USD × Tipo de cambio', usd+' × '+money(tc)+' = <b>'+money(ans)+'</b>.' ],
    explain:'Cuando el peso se devalúa (sube el tipo de cambio), lo importado cuesta más pesos.' };
}
function qDevPct(){
  const a = pick([16,17,18,20,25]);
  const b = a + ri(1,5);
  const ans = r2((b-a)/a*100);
  return { type:'numeric', topic:'devaluacion', unit:'%',
    prompt:'El tipo de cambio pasó de <b>'+money(a)+'</b> a <b>'+money(b)+'</b> por dólar. ¿En qué <b>porcentaje se encareció el dólar</b>?',
    dataHtml: dataBox(['Tipo de cambio inicial: <b>'+money(a)+'</b>', 'Tipo de cambio final: <b>'+money(b)+'</b>']),
    help:'Usa (final − inicial) ÷ inicial × 100. Redondea a 2 decimales.',
    answer: ans, tol: 0.15,
    correctText: ans+'%',
    steps:[ 'Variación = Final − Inicial = '+money(b)+' − '+money(a)+' = '+money(b-a),
      'Porcentaje = '+(b-a)+' ÷ '+a+' × 100 = <b>'+ans+'%</b>',
      'El dólar se encareció '+ans+'%: el peso se devaluó.' ],
    explain:'La variación porcentual siempre se calcula respecto al valor inicial.' };
}
const TF_DEV = [
  {s:'La devaluación y la inflación son exactamente lo mismo.', a:false, e:'La inflación es interna (precios); la devaluación es frente a otras divisas (tipo de cambio).'},
  {s:'Una devaluación encarece los bienes importados.', a:true, e:'Se necesitan más pesos por cada dólar de mercancía.'},
  {s:'Si el peso se devalúa, la severidad de siniestros con refacciones importadas puede subir.', a:true, e:'Las refacciones en dólares cuestan más pesos: siniestros más caros.'},
  {s:'Una devaluación del peso beneficia a quien tiene deudas en dólares.', a:false, e:'Al contrario: su deuda en pesos crece; beneficia a quien tiene INGRESOS en dólares.'},
  {s:'Una devaluación puede provocar inflación al encarecer los insumos importados.', a:true, e:'Es el llamado “traspaso” del tipo de cambio a precios.'}
];
function buildM7(){
  const used = new Set(), usedTF = new Set();
  const tf = () => { let it = pick(TF_DEV), g=0; while(usedTF.has(it.s)&&g++<20) it=pick(TF_DEV); usedTF.add(it.s);
    return {type:'tf', topic:'devaluacion', prompt:it.s, answer:it.a, correctText: it.a?'Verdadero':'Falso', explain:it.e}; };
  return shuffle([qPheno(used), qPheno(used), qPheno(used), tf(), tf(), tf(), qDevImport(), qDevPct()]);
}

/* --- Módulo 8: Depreciación --- */
function qDepLineal(){
  const costo = ri(2,9)*100000;
  const residual = costo/10;
  const vida = pick([4,5,8,10]);
  const ans = (costo-residual)/vida;
  return { type:'numeric', topic:'depreciacion', unit:'$',
    prompt:'Calcula la <b>depreciación anual</b> por línea recta:',
    dataHtml: dataBox(['Costo del activo: <b>'+money(costo)+'</b>', 'Valor residual: <b>'+money(residual)+'</b>', 'Vida útil: <b>'+vida+' años</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Fórmula: Depreciación anual = (Costo − Valor residual) ÷ Vida útil',
      '('+money(costo)+' − '+money(residual)+') ÷ '+vida+' = '+money(costo-residual)+' ÷ '+vida,
      'Resultado: <b>'+money(ans)+'</b> por año.' ],
    explain:'La línea recta reparte el costo depreciable en partes iguales durante la vida útil.' };
}
function qDepLibros(){
  const costo = ri(2,8)*100000;
  const residual = costo/10;
  const vida = pick([5,10]);
  const dep = (costo-residual)/vida;
  const k = ri(1, vida-1);
  const ans = costo - k*dep;
  return { type:'numeric', topic:'depreciacion', unit:'$',
    prompt:'¿Cuál es el <b>valor en libros</b> del activo después de <b>'+k+' año'+(k>1?'s':'')+'</b>?',
    dataHtml: dataBox(['Costo del activo: <b>'+money(costo)+'</b>', 'Valor residual: <b>'+money(residual)+'</b>', 'Vida útil: <b>'+vida+' años</b>', 'Método: línea recta']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Depreciación anual = ('+money(costo)+' − '+money(residual)+') ÷ '+vida+' = '+money(dep),
      'Depreciación acumulada en '+k+' año'+(k>1?'s':'')+': '+k+' × '+money(dep)+' = '+money(k*dep),
      'Valor en libros = '+money(costo)+' − '+money(k*dep)+' = <b>'+money(ans)+'</b>.' ],
    explain:'Valor en libros = costo menos la depreciación acumulada.' };
}
function qDepAuto(){
  const v = ri(15,45)*10000;
  const d = pick([10,15,20]);
  const ans = v*(1-d/100);
  return { type:'numeric', topic:'depreciacion', unit:'$',
    prompt:'Un auto se compró nuevo y en su primer año se depreció <b>'+d+'%</b>. ¿Cuál es su <b>valor comercial</b> ahora?',
    dataHtml: dataBox(['Valor de compra: <b>'+money(v)+'</b>', 'Depreciación del primer año: <b>'+d+'%</b>']),
    answer: ans, tol: 1,
    correctText: money(ans),
    steps:[ 'Valor actual = Valor de compra × (1 − depreciación)',
      money(v)+' × (1 − '+(d/100)+') = '+money(v)+' × '+(1-d/100),
      'Resultado: <b>'+money(ans)+'</b>. En caso de pérdida total, la indemnización se basa en este valor comercial.' ],
    explain:'En seguros de autos, la indemnización considera el valor comercial (depreciado), no el precio de compra.' };
}
const TF_DEP = [
  {s:'La depreciación es la pérdida de valor de un activo por uso, tiempo u obsolescencia.', a:true, e:'Es la definición de depreciación.'},
  {s:'Depreciación y devaluación son sinónimos.', a:false, e:'La depreciación es de ACTIVOS; la devaluación es de la MONEDA frente a divisas.'},
  {s:'En una pérdida total de auto, la aseguradora indemniza el precio que pagaste cuando era nuevo.', a:false, e:'Indemniza el valor COMERCIAL al momento del siniestro, ya depreciado.'},
  {s:'En el método de línea recta, la depreciación anual es la misma todos los años.', a:true, e:'El costo depreciable se divide en partes iguales entre los años de vida útil.'},
  {s:'El valor residual es lo que se espera que valga el activo al final de su vida útil.', a:true, e:'Por eso se resta del costo antes de repartir la depreciación.'}
];
function buildM8(){
  const usedTF = new Set();
  const tf = () => { let it = pick(TF_DEP), g=0; while(usedTF.has(it.s)&&g++<20) it=pick(TF_DEP); usedTF.add(it.s);
    return {type:'tf', topic:'depreciacion', prompt:it.s, answer:it.a, correctText: it.a?'Verdadero':'Falso', explain:it.e}; };
  const mc = { type:'mc', topic:'depreciacion',
    prompt:'¿Cuál opción describe correctamente la DIFERENCIA entre depreciación y devaluación?',
    options: shuffle([
      {t:'La depreciación afecta a activos (autos, máquinas); la devaluación, a la moneda frente a otras divisas', ok:true},
      {t:'Ambas se refieren a la moneda', ok:false},
      {t:'La devaluación afecta a los autos y la depreciación al dólar', ok:false},
      {t:'No hay ninguna diferencia', ok:false}
    ]),
    correctText:'Depreciación → activos; devaluación → moneda', explain:'Recuerda la tabla comparativa de la lección.' };
  return shuffle([qDepLineal(), qDepLineal(), qDepLibros(), qDepAuto(), qDepAuto(), tf(), tf(), mc]);
}

/* --- Módulo 10: Completar fórmulas --- */
function buildM10(){
  const f = (prompt, accept, pretty, explain) => ({ type:'formula', topic:'formulas',
    prompt, accept, correctText: pretty, explain });
  const qs = [
    f('Escribe la fórmula de la <b>frecuencia</b>:', ['siniestros/exposicion'],
      'Frecuencia = Número de siniestros ÷ Exposición', 'La frecuencia mide siniestros por unidad expuesta.'),
    f('Escribe la fórmula de la <b>severidad</b>:', ['perdidas/siniestros'],
      'Severidad = Monto total de pérdidas ÷ Número de siniestros', 'La severidad es el costo promedio por siniestro.'),
    f('Escribe la fórmula de la <b>prima de riesgo</b>:', ['frecuencia*severidad'],
      'Prima de riesgo = Frecuencia × Severidad', 'Es el costo esperado por unidad asegurada.'),
    f('Escribe la fórmula del <b>costo esperado total</b> de una cartera:', ['exposicion*frecuencia*severidad','exposicion*primariesgo'],
      'Costo esperado = Exposición × Frecuencia × Severidad', 'También puedes verlo como Exposición × Prima de riesgo.'),
    f('Escribe la fórmula de la <b>siniestralidad</b>:', ['siniestrospagados/primas','perdidas/primas','siniestros/primas'],
      'Siniestralidad = Siniestros pagados ÷ Primas cobradas', 'Mide qué proporción de la prima se va en pagar siniestros.'),
    { type:'mc', topic:'formulas', prompt:'¿Cuál de estas expresiones corresponde a la <b>prima de tarifa</b>?',
      options: shuffle([
        {t:'Prima pura + gastos de administración + gastos de adquisición + utilidad', ok:true},
        {t:'Frecuencia ÷ Severidad', ok:false},
        {t:'Siniestros pagados ÷ Primas', ok:false},
        {t:'Prima pura − deducible', ok:false}
      ]),
      correctText:'Prima pura + gastos + utilidad', explain:'La prima de tarifa “carga” sobre la prima pura los costos de operar y la ganancia.' },
    { type:'order', topic:'formulas', prompt:'Ordena los pasos para <b>tarificar</b> un seguro (de la base técnica al precio final):',
      stepsList:[ 'Reunir datos: siniestros, pérdidas y exposición',
        'Calcular la frecuencia (siniestros ÷ exposición)',
        'Calcular la severidad (pérdidas ÷ siniestros)',
        'Multiplicar frecuencia × severidad → prima de riesgo',
        'Agregar gastos y utilidad → prima de tarifa' ],
      explain:'Primero la estadística (frecuencia y severidad), luego el precio.' },
    { type:'tf', topic:'formulas', prompt:'La prima pura y la prima de riesgo son el mismo concepto.',
      answer:true, correctText:'Verdadero', explain:'Ambos nombres se usan para el costo esperado de siniestros: frecuencia × severidad.' }
  ];
  return shuffle(qs);
}

/* --- Módulo 12: Casos reales --- */
function caseAutos(){
  const n = pick([500,800,1000,1200,2000]);
  const per = ri(3,8);
  const ns = per*n/100;
  const sev = ri(20,60)*1000;
  const total = ns*sev;
  const freq = per/100;
  const prima = freq*sev;
  const recargo = pick([30,40,50]);
  const primaTarifa = prima*(1+recargo/100);
  const ctx = dataBox(['🚗 Flotilla asegurada: <b>'+n.toLocaleString()+' autos</b>',
    'Siniestros en el año: <b>'+ns+'</b>', 'Monto total pagado: <b>'+money(total)+'</b>']);
  return [
    { type:'numeric', topic:'casos', prompt:'<b>Caso: cartera de autos.</b> Calcula la <b>frecuencia</b>:', dataHtml:ctx,
      help:'Expresa el resultado como decimal (p. ej., 0.05).', answer:freq, tol:0.0005, correctText:String(freq),
      steps:['Frecuencia = Siniestros ÷ Exposición', ns+' ÷ '+n.toLocaleString()+' = '+freq, 'Interpretación: '+per+' de cada 100 autos tuvieron un siniestro.'],
      explain:'Divide siniestros entre unidades expuestas.' },
    { type:'numeric', topic:'casos', prompt:'Con los mismos datos, calcula la <b>severidad</b>:', dataHtml:ctx, unit:'$',
      answer:sev, tol:1, correctText:money(sev),
      steps:['Severidad = Pérdidas totales ÷ Siniestros', money(total)+' ÷ '+ns+' = <b>'+money(sev)+'</b>.'],
      explain:'Costo promedio de cada siniestro.' },
    { type:'numeric', topic:'casos', prompt:'Calcula la <b>prima de riesgo</b> por auto:', dataHtml:ctx, unit:'$',
      answer:prima, tol:1, correctText:money(prima),
      steps:['Prima de riesgo = Frecuencia × Severidad', freq+' × '+money(sev)+' = <b>'+money(prima)+'</b>.',
        'Verificación: '+money(total)+' ÷ '+n.toLocaleString()+' autos = '+money(total/n)+' ✓'],
      explain:'También puedes calcularla como pérdidas totales ÷ número de autos.' },
    { type:'mc', topic:'casos', prompt:'¿Cómo se interpreta una frecuencia de <b>'+freq+'</b> en esta cartera?', dataHtml:ctx,
      options: shuffle([
        {t:'Aproximadamente '+per+' de cada 100 autos tienen un siniestro al año', ok:true},
        {t:'Cada auto tiene '+per+' siniestros al año', ok:false},
        {t:'El '+per+'% de las primas se pierde', ok:false},
        {t:'Cada siniestro cuesta '+per+'% más', ok:false}
      ]),
      correctText: per+' de cada 100 autos se siniestran al año', explain:'La frecuencia por unidad expuesta se lee como proporción de unidades con siniestro.' },
    { type:'numeric', topic:'casos', unit:'$',
      prompt:'La aseguradora agrega <b>'+recargo+'%</b> de gastos y utilidad sobre la prima de riesgo. Calcula la <b>prima de tarifa</b>:', dataHtml:ctx,
      answer:primaTarifa, tol:1, correctText:money(primaTarifa),
      steps:['Prima de tarifa = Prima de riesgo × (1 + recargo)', money(prima)+' × '+(1+recargo/100)+' = <b>'+money(primaTarifa)+'</b>.'],
      explain:'La prima de tarifa financia siniestros, gastos y utilidad.' },
    { type:'mc', topic:'casos', prompt:'Si el próximo año la <b>frecuencia sube</b> y la severidad se mantiene, ¿qué pasa con la prima de riesgo?',
      options: shuffle([
        {t:'Aumenta en la misma proporción que la frecuencia', ok:true},
        {t:'Disminuye', ok:false},{t:'No cambia', ok:false},{t:'Se vuelve cero', ok:false}
      ]),
      correctText:'Aumenta proporcionalmente', explain:'Prima de riesgo = frecuencia × severidad: si un factor sube, la prima sube en esa proporción.' },
    { type:'tf', topic:'casos', prompt:'La prima de riesgo calculada ya incluye los gastos administrativos de la aseguradora.',
      answer:false, correctText:'Falso', explain:'La prima de riesgo solo cubre el costo esperado de siniestros; los gastos van en la prima de tarifa.' },
    { type:'mc', topic:'casos', prompt:'La flotilla instala dispositivos antirrobo y la frecuencia baja a la <b>mitad</b>. ¿Qué prima de riesgo esperarías?',
      options: shuffle([
        {t:'La mitad: '+money(prima/2), ok:true},
        {t:'El doble: '+money(prima*2), ok:false},
        {t:'La misma: '+money(prima), ok:false},
        {t:'Cero', ok:false}
      ]),
      correctText: money(prima/2), explain:'Con severidad constante, la prima de riesgo es proporcional a la frecuencia. Gestionar el riesgo abarata el seguro.' }
  ];
}
function caseGMM(){
  const H = ri(8,30)*10000;
  const D = ri(5,20)*1000;
  const c = pick([10,20]);
  const base = H - D;
  const coasMonto = base*c/100;
  const insHosp = base - coasMonto;
  const cliHosp = D + coasMonto;
  const nc = ri(2,5);
  const cc = pick([800,1000,1200]);
  const cop = 200;
  const ctx = dataBox(['🏥 <b>Caso: gastos médicos mayores.</b> Hospitalización: <b>'+money(H)+'</b>',
    'Deducible: <b>'+money(D)+'</b> · Coaseguro: <b>'+c+'%</b>',
    'Además: <b>'+nc+' consultas</b> de '+money(cc)+' cada una, con copago de <b>'+money(cop)+'</b> por consulta']);
  return [
    { type:'numeric', topic:'casos', unit:'$', prompt:'Sobre la hospitalización: ¿cuál es la <b>base</b> después del deducible?', dataHtml:ctx,
      answer:base, tol:1, correctText:money(base),
      steps:['Base = Gasto − Deducible', money(H)+' − '+money(D)+' = <b>'+money(base)+'</b>.'],
      explain:'El deducible se resta antes de aplicar el coaseguro.' },
    { type:'numeric', topic:'casos', unit:'$', prompt:'¿Cuánto suma el <b>coaseguro</b> a cargo del paciente?', dataHtml:ctx,
      answer:coasMonto, tol:1, correctText:money(coasMonto),
      steps:['Coaseguro = '+c+'% × Base', c+'% × '+money(base)+' = <b>'+money(coasMonto)+'</b>.'],
      explain:'El coaseguro es porcentual y se aplica después del deducible.' },
    { type:'numeric', topic:'casos', unit:'$', prompt:'¿Cuánto paga la <b>aseguradora</b> por la hospitalización?', dataHtml:ctx,
      answer:insHosp, tol:1, correctText:money(insHosp),
      steps:['Aseguradora = Base − Coaseguro', money(base)+' − '+money(coasMonto)+' = <b>'+money(insHosp)+'</b>.'],
      explain:'La aseguradora cubre el remanente tras deducible y coaseguro.' },
    { type:'numeric', topic:'casos', unit:'$', prompt:'¿Cuánto paga en total el <b>paciente</b> por la hospitalización?', dataHtml:ctx,
      answer:cliHosp, tol:1, correctText:money(cliHosp),
      steps:['Paciente = Deducible + Coaseguro', money(D)+' + '+money(coasMonto)+' = <b>'+money(cliHosp)+'</b>.'],
      explain:'Deducible + coaseguro = participación total del asegurado.' },
    { type:'numeric', topic:'casos', unit:'$', prompt:'¿Cuánto pagó el paciente en <b>copagos</b> por las consultas?', dataHtml:ctx,
      answer:nc*cop, tol:1, correctText:money(nc*cop),
      steps:['Copagos = Copago × Número de consultas', money(cop)+' × '+nc+' = <b>'+money(nc*cop)+'</b>.'],
      explain:'El copago es fijo por consulta.' },
    { type:'numeric', topic:'casos', unit:'$', prompt:'¿Cuánto pagó la <b>aseguradora</b> por las consultas?', dataHtml:ctx,
      answer:nc*(cc-cop), tol:1, correctText:money(nc*(cc-cop)),
      steps:['Por consulta: '+money(cc)+' − '+money(cop)+' = '+money(cc-cop), 'Total: '+nc+' × '+money(cc-cop)+' = <b>'+money(nc*(cc-cop))+'</b>.'],
      explain:'En cada consulta la aseguradora paga el costo menos el copago.' },
    { type:'mc', topic:'casos', prompt:'¿Para qué sirven el deducible y el coaseguro en esta póliza?',
      options: shuffle([
        {t:'Para compartir el riesgo con el asegurado y evitar el uso excesivo', ok:true},
        {t:'Para que la aseguradora gane más en cada siniestro', ok:false},
        {t:'Son castigos por enfermarse', ok:false},
        {t:'No tienen ninguna función técnica', ok:false}
      ]),
      correctText:'Compartir riesgo y moderar el uso', explain:'La participación del asegurado controla el riesgo moral y reduce la prima.' },
    { type:'tf', topic:'casos', prompt:'Si el gasto hospitalario hubiera sido MENOR que el deducible, la aseguradora no habría pagado nada.',
      answer:true, correctText:'Verdadero', explain:'El deducible es la primera capa: pérdidas por debajo de él corren por cuenta del asegurado.' }
  ];
}
function buildM12(){ return Math.random() < 0.5 ? caseAutos() : caseGMM(); }

/* ==================== Registro de módulos ==================== */
const MODULES_CA3 = [
  {id:0,  icon:'🛡️', name:'Conceptos básicos de seguros', desc:'Riesgo, prima, póliza, deducible, coaseguro, copago y las partes del contrato.', kind:'Quiz mixto', build:buildM1},
  {id:1,  icon:'📊', name:'Cálculos básicos', desc:'Frecuencia, severidad, prima de riesgo, costo esperado y siniestralidad.', kind:'Ejercicios ilimitados', build:buildM2},
  {id:2,  icon:'💊', name:'Copago', desc:'Escenarios médicos generados al azar: ¿cuánto paga cada quien?', kind:'Ejercicios ilimitados', build:buildM3},
  {id:3,  icon:'🤝', name:'Coaseguro', desc:'Siniestro, deducible, coaseguro y límite de cobertura.', kind:'Ejercicios ilimitados', build:buildM4},
  {id:4,  icon:'🧾', name:'Deducible', desc:'Problemas completos: deducible fijo + coaseguro, pago de cada parte.', kind:'Ejercicios ilimitados', build:buildM5},
  {id:5,  icon:'📈', name:'Inflación', desc:'Qué es, causas, consecuencias y su efecto sobre primas e indemnizaciones.', kind:'Lección + retos', lesson:LESSON_INF, build:buildM6},
  {id:6,  icon:'💱', name:'Devaluación', desc:'La moneda frente a otras divisas y su diferencia con la inflación.', kind:'Lección + retos', lesson:LESSON_DEV, build:buildM7},
  {id:7,  icon:'🚗', name:'Depreciación', desc:'Activos, automóviles y depreciación contable en línea recta.', kind:'Lección + retos', lesson:LESSON_DEP, build:buildM8},
  {id:8,  icon:'🧠', name:'Memorama de conceptos', desc:'Encuentra las parejas concepto ↔ definición. Menos intentos, más estrellas.', kind:'Juego de memoria', special:'memorama'},
  {id:9,  icon:'🧮', name:'Completar fórmulas', desc:'Escribe las fórmulas clave; se aceptan distintos formatos y sinónimos.', kind:'Fórmulas', build:buildM10},
  {id:10, icon:'🔐', name:'Escape Room actuarial', desc:'Resuelve 4 acertijos, gana las llaves y abre la caja fuerte con los códigos.', kind:'Escape room', special:'escape'},
  {id:11, icon:'📋', name:'Casos reales', desc:'Analiza una cartera completa: cálculo e interpretación de resultados.', kind:'Caso integrador', build:buildM12}
];

/* ==================== Procesos Estocásticos (materia "stoch") ====================
   Contenido fiel a los apuntes/pizarrón del profesor (Parcial 1: procesos,
   caminata aleatoria, cadenas de Markov, matrices de transición, distribución
   límite; Parcial 2: proceso de Poisson, exponencial, pérdida de memoria,
   Erlang, adelgazamiento/superposición, Binomial condicional, Poisson compuesto).
   No se agrega teoría externa avanzada. */

/* Alias a los helpers globales de azar (ri/pick/shuffle) para legibilidad local */
const peRi = ri, pePick = pick, peShuffle = shuffle;
/* — Helpers numéricos locales (probabilidades con más precisión que r2) — */
const peFact = n => { let r = 1; for(let i=2;i<=n;i++) r*=i; return r; };
const peComb = (n,k) => (k<0||k>n) ? 0 : peFact(n)/(peFact(k)*peFact(n-k));
const pePmf = (m,k) => Math.exp(-m)*Math.pow(m,k)/peFact(k);           // Poisson P(N=k), m=λt
const peCdf = (m,k) => { let s=0; for(let i=0;i<=k;i++) s+=pePmf(m,i); return s; }; // P(N≤k)
const peR = (x,d=4) => { const f=Math.pow(10,d); return Math.round(x*f)/f; };

/* ================= PARCIAL 1 ================= */

/* — M1: Fundamentos — */
function buildPE1(){
  return peShuffle([
    { type:'mc', topic:'pe_fund', prompt:'¿Qué es un <b>proceso estocástico</b>?',
      options:[ {t:'Una colección de variables aleatorias indexadas por el tiempo: {X<sub>t</sub> : t ∈ T}', ok:true},
        {t:'Una sola variable aleatoria constante en el tiempo', ok:false},
        {t:'Una función determinista del tiempo sin azar', ok:false},
        {t:'Un promedio de datos históricos', ok:false} ],
      explain:'Un proceso estocástico es una familia de variables aleatorias {X<sub>t</sub>} indexada por un conjunto de tiempos T.', correctText:'Colección de v.a. indexadas por el tiempo' },
    { type:'match', topic:'pe_fund', prompt:'Relaciona cada elemento de X: Ω × T → S con su significado:',
      pairs:[ {l:'Ω', r:'Espacio muestral (resultados del azar)'}, {l:'T', r:'Espacio temporal (índice)'},
        {l:'S', r:'Espacio de estados (valores posibles)'}, {l:'X(ω,t)', r:'Valor del proceso'} ],
      correctText:'Ω=muestral, T=tiempo, S=estados' },
    { type:'tf', topic:'pe_fund', prompt:'Si <b>fijamos ω</b> (un resultado del azar) y variamos t, obtenemos una <b>trayectoria</b> o realización del proceso.',
      answer:true, explain:'Fijar ω da una trayectoria (función del tiempo); fijar t da una variable aleatoria X<sub>t</sub>.', correctText:'Verdadero' },
    { type:'tf', topic:'pe_fund', prompt:'Si <b>fijamos t</b> y dejamos variar ω, obtenemos una trayectoria completa.',
      answer:false, explain:'Al fijar t obtenemos una variable aleatoria X<sub>t</sub>, no una trayectoria. La trayectoria surge al fijar ω.', correctText:'Falso' },
    { type:'mc', topic:'pe_fund', prompt:'En un proceso a <b>tiempo discreto</b>, el conjunto T es típicamente:',
      options:[ {t:'{0, 1, 2, 3, …}', ok:true}, {t:'Un intervalo [0, ∞)', ok:false}, {t:'Los números reales ℝ', ok:false}, {t:'Un único punto', ok:false} ],
      explain:'Tiempo discreto ⇒ T = {0,1,2,…}. Tiempo continuo ⇒ T = [0,∞).', correctText:'{0,1,2,3,…}' },
    { type:'fill', topic:'pe_fund', prompt:'El conjunto de todos los valores que puede tomar el proceso se llama espacio de ______.',
      accept:['estados','estado'], correctText:'estados' }
  ]);
}

/* — M2: Tipos y propiedades — */
function buildPE2(){
  const scen = peShuffle([
    {t:'El resultado de lanzar un dado en cada tiro, sin relación entre tiros', a:'iid'},
    {t:'El clima de mañana depende solo del clima de hoy, no del de días previos', a:'markov'},
    {t:'El número acumulado de llamadas donde cada intervalo aporta llamadas independientes', a:'incind'},
    {t:'La distribución del proceso no cambia si desplazamos el origen del tiempo', a:'estac'}
  ]);
  const names = {iid:'Ensayos i.i.d.', markov:'Propiedad de Markov', incind:'Incrementos independientes', estac:'Estacionariedad'};
  const first = scen[0];
  return peShuffle([
    { type:'mc', topic:'pe_tipos', prompt:'Clasifica: «'+first.t+'».',
      options: peShuffle(Object.entries(names).map(([k,v])=>({t:v, ok:k===first.a}))),
      explain:'Corresponde a: '+names[first.a]+'.', correctText:names[first.a] },
    { type:'tf', topic:'pe_tipos', prompt:'La <b>propiedad de Markov</b> dice que el futuro depende del presente y no de los estados anteriores.',
      answer:true, explain:'Markov: dado el presente, el futuro es independiente del pasado.', correctText:'Verdadero' },
    { type:'tf', topic:'pe_tipos', prompt:'Variables <b>i.i.d.</b> significa independientes y con la misma distribución.',
      answer:true, explain:'i.i.d. = independientes e idénticamente distribuidas.', correctText:'Verdadero' },
    { type:'mc', topic:'pe_tipos', prompt:'Que un proceso tenga <b>incrementos independientes</b> significa que:',
      options:[ {t:'Los cambios en intervalos de tiempo disjuntos son independientes entre sí', ok:true},
        {t:'El proceso nunca cambia de valor', ok:false},
        {t:'Todos los estados son igualmente probables', ok:false},
        {t:'El futuro depende de todo el pasado', ok:false} ],
      explain:'Incrementos independientes: lo que ocurre en intervalos que no se traslapan es independiente.', correctText:'Cambios en intervalos disjuntos son independientes' }
  ]);
}

/* — M3: Caminata aleatoria — */
/* X0=0, Xn = Xn-1 + εn, ε=+1 con prob p, −1 con prob q=1−p.
   E[Xn]=n(p−q), Var[Xn]=n·(1−(p−q)²)=4npq. P(Xn=k): r=(n+k)/2 pasos +1 ⇒ C(n,r)p^r q^(n−r). */
function qCaminataE(){
  const n = peRi(3,10), pPct = pePick([40,50,60,30,70]); const p = pPct/100, q = 1-p;
  const E = n*(p-q);
  return { type:'numeric', topic:'pe_caminata', tol:0.01,
    prompt:'Caminata aleatoria con X<sub>0</sub>=0 y pasos ε=+1 (prob p) o −1 (prob q). Con <b>p='+p+'</b>, q='+peR(q,2)+' y <b>n='+n+'</b> pasos, ¿cuánto vale <b>E[X<sub>'+n+'</sub>]</b>?',
    answer:E, correctText:E.toString(),
    explain:'E[X<sub>n</sub>] = n·(p − q).',
    steps:['Cada paso: E[ε] = (+1)·p + (−1)·q = p − q = '+p+' − '+peR(q,2)+' = '+peR(p-q,2),
      'E[X<sub>n</sub>] = n·(p − q) = '+n+'·('+peR(p-q,2)+') = '+peR(E,2)] };
}
function qCaminataVar(){
  const n = peRi(3,10), pPct = pePick([40,50,60,30,70]); const p = pPct/100, q = 1-p;
  const V = n*4*p*q;
  return { type:'numeric', topic:'pe_caminata', tol:0.01,
    prompt:'Caminata aleatoria (pasos ±1). Con <b>p='+p+'</b>, q='+peR(q,2)+' y <b>n='+n+'</b>, ¿cuánto vale <b>Var[X<sub>'+n+'</sub>]</b>?',
    answer:V, correctText:peR(V,4).toString(),
    explain:'Var[X<sub>n</sub>] = n·(1 − (p−q)²) = 4·n·p·q.',
    steps:['Var(ε) = 1 − (p − q)² = 4pq = 4·'+p+'·'+peR(q,2)+' = '+peR(4*p*q,3),
      'Var[X<sub>n</sub>] = n·4pq = '+n+'·'+peR(4*p*q,3)+' = '+peR(V,3)] };
}
function qCaminataPos(){
  const n = pePick([4,6,8]); const kAbs = peRi(0, n/2)*2 - (n%2); // misma paridad que n
  let k = pePick([1,-1])*Math.abs(kAbs); if(Math.abs(k)>n) k = 0;
  if((n+k)%2!==0) k = k+1;                        // asegurar paridad
  const r = (n+k)/2; const pPct = pePick([50,60,40]); const p=pPct/100, q=1-p;
  const prob = peComb(n,r)*Math.pow(p,r)*Math.pow(q,n-r);
  return { type:'numeric', topic:'pe_caminata', tol:0.01,
    prompt:'Caminata con p='+p+'. Tras <b>n='+n+'</b> pasos, ¿cuál es <b>P(X<sub>'+n+'</sub> = '+k+')</b>?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'Para llegar a k en n pasos se necesitan r = (n+k)/2 pasos «+1»: P = C(n,r)·p<sup>r</sup>·q<sup>n−r</sup>.',
    steps:['r = (n + k)/2 = ('+n+' + ('+k+'))/2 = '+r+' pasos hacia +1',
      'P = C('+n+','+r+')·'+p+'<sup>'+r+'</sup>·'+peR(q,2)+'<sup>'+(n-r)+'</sup>',
      'P = '+peComb(n,r)+'·'+peR(Math.pow(p,r),4)+'·'+peR(Math.pow(q,n-r),4)+' = '+peR(prob,4)] };
}
function buildPE3(){
  return peShuffle([ qCaminataE(), qCaminataE(), qCaminataVar(), qCaminataVar(), qCaminataPos(), qCaminataPos(),
    { type:'fill', topic:'pe_caminata', prompt:'En la caminata aleatoria simétrica, q = 1 − ____ .', accept:['p'], correctText:'p' },
    { type:'tf', topic:'pe_caminata', prompt:'Después de n pasos, X<sub>n</sub> solo puede tomar valores con la misma paridad que n.',
      answer:true, explain:'Cada paso cambia la posición en ±1, así que X<sub>n</sub> y n tienen la misma paridad.', correctText:'Verdadero' } ]);
}

/* — M4: Regreso al origen — */
function qRegreso2(){
  const pPct = pePick([50,60,40]); const p=pPct/100, q=1-p;
  const prob = 2*p*q; // P(X2=0)=P(+,-)+P(-,+)=2pq
  return { type:'numeric', topic:'pe_regreso', tol:0.005,
    prompt:'Caminata con p='+p+'. ¿Cuál es la probabilidad de <b>estar en el origen en el tiempo n=2</b>, P(X<sub>2</sub>=0)?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'Para volver a 0 en 2 pasos: subir y bajar (o bajar y subir): 2pq.',
    steps:['Caminos que regresan a 0 en 2 pasos: (+1,−1) y (−1,+1)',
      'P = pq + qp = 2pq = 2·'+p+'·'+peR(q,2)+' = '+peR(prob,4)] };
}
function buildPE4(){
  return peShuffle([ qRegreso2(), qRegreso2(),
    { type:'mc', topic:'pe_regreso', prompt:'¿Cuál es la diferencia entre <b>regresar al origen</b> y <b>regresar por primera vez</b>?',
      options:[ {t:'p<sub>n</sub> = prob. de estar en 0 al tiempo n (aunque ya hubiera pasado antes); f<sub>n</sub> = prob. del <i>primer</i> regreso en n', ok:true},
        {t:'Son exactamente lo mismo', ok:false},
        {t:'f<sub>n</sub> siempre es mayor que p<sub>n</sub>', ok:false},
        {t:'p<sub>n</sub> solo aplica a n impar', ok:false} ],
      explain:'p<sub>n</sub>: estar en 0 en el paso n. f<sub>n</sub>: que ese sea el primer regreso al 0.', correctText:'p_n = estar en 0; f_n = primer regreso' },
    { type:'tf', topic:'pe_regreso', prompt:'El regreso al origen solo puede ocurrir en un número <b>par</b> de pasos.',
      answer:true, explain:'Para volver a 0 hacen falta igual número de pasos +1 y −1, así que n debe ser par.', correctText:'Verdadero' },
    { type:'order', topic:'pe_regreso', prompt:'Ordena el análisis del primer regreso al origen:',
      stepsList:['Salir del origen en el primer paso','Observar la trayectoria sin tocar el 0','Registrar el primer instante n en que X<sub>n</sub>=0','Ese n define el primer regreso f<sub>n</sub>'],
      correctText:'Salir → no tocar 0 → primer instante en 0 → f_n' } ]);
}

/* — M5: Cadenas de Markov — */
function buildPE5(){
  return peShuffle([
    { type:'mc', topic:'pe_markov', prompt:'La <b>propiedad de Markov</b> se expresa como:',
      options:[ {t:'P(X<sub>n+1</sub>=j | X<sub>n</sub>=i, …, X<sub>0</sub>) = P(X<sub>n+1</sub>=j | X<sub>n</sub>=i)', ok:true},
        {t:'P(X<sub>n+1</sub>=j) = P(X<sub>n+1</sub>=j | todo el pasado)', ok:false},
        {t:'Todos los estados tienen la misma probabilidad', ok:false},
        {t:'X<sub>n+1</sub> es independiente de X<sub>n</sub>', ok:false} ],
      explain:'Dado el estado presente X<sub>n</sub>, el futuro no depende del pasado.', correctText:'El futuro depende solo del presente' },
    { type:'tf', topic:'pe_markov', prompt:'En una cadena de Markov, para predecir el siguiente estado basta conocer el estado actual.',
      answer:true, explain:'Esa es justamente la propiedad de Markov.', correctText:'Verdadero' },
    { type:'mc', topic:'pe_markov', prompt:'«El clima de mañana depende solo del de hoy». Los <b>estados</b> podrían ser:',
      options:[ {t:'{Soleado, Nublado, Lluvioso}', ok:true}, {t:'{1 día, 2 días, 3 días}', ok:false},
        {t:'{−1, 0, +1}', ok:false}, {t:'La temperatura exacta con infinitos decimales', ok:false} ],
      explain:'El espacio de estados es el conjunto de situaciones posibles del sistema.', correctText:'{Soleado, Nublado, Lluvioso}' },
    { type:'fill', topic:'pe_markov', prompt:'En una cadena de Markov, el futuro depende del ______ y no del pasado.',
      accept:['presente','estado presente','estado actual','actual'], correctText:'presente' }
  ]);
}

/* — M6: Diagramas de transición — */
function buildPE6(){
  return peShuffle([
    { type:'mc', topic:'pe_diagrama', prompt:'En un <b>diagrama de transición</b>, las <b>flechas</b> representan:',
      options:[ {t:'Las probabilidades de pasar de un estado a otro', ok:true}, {t:'El número de estados', ok:false},
        {t:'El tiempo total', ok:false}, {t:'La media del proceso', ok:false} ],
      explain:'Nodos = estados; flechas = transiciones con su probabilidad.', correctText:'Probabilidades de transición' },
    { type:'tf', topic:'pe_diagrama', prompt:'La suma de las probabilidades de las flechas que <b>salen</b> de un estado debe ser 1.',
      answer:true, explain:'Desde un estado, algo tiene que ocurrir: las salidas suman 1.', correctText:'Verdadero' },
    { type:'mc', topic:'pe_diagrama', prompt:'Un <b>lazo</b> (flecha de un estado hacia sí mismo) representa:',
      options:[ {t:'La probabilidad de permanecer en ese estado', ok:true}, {t:'Un error en el diagrama', ok:false},
        {t:'Que el estado es absorbente siempre', ok:false}, {t:'Una transición imposible', ok:false} ],
      explain:'El lazo es la probabilidad de quedarse en el mismo estado (p<sub>ii</sub>).', correctText:'Permanecer en el estado' },
    { type:'numeric', topic:'pe_diagrama', tol:0.001,
      prompt:'De un estado salen dos flechas: una con probabilidad 0.3 hacia otro estado y un lazo hacia sí mismo. ¿Qué probabilidad tiene el <b>lazo</b>?',
      answer:0.7, correctText:'0.7', explain:'Las salidas suman 1: lazo = 1 − 0.3 = 0.7.',
      steps:['Suma de salidas = 1','Lazo = 1 − 0.3 = 0.7'] }
  ]);
}

/* — M7: Matrices de transición — */
/* P²: multiplicación de matrices 2×2 fila·columna; vₙ = v₀·Pⁿ (vector fila × matriz). */
function qMatrizFila(){
  const a = peRi(1,8)/10; const rest = peR(1-a,2);
  return { type:'numeric', topic:'pe_matriz', tol:0.001,
    prompt:'En una matriz de transición, la primera fila es [ '+a+' , ? ]. Como cada fila debe <b>sumar 1</b>, ¿cuál es el valor que falta?',
    answer:rest, correctText:rest.toString(), explain:'Cada fila de P suma 1: el faltante es 1 − '+a+'.',
    steps:['Cada fila suma 1','Faltante = 1 − '+a+' = '+rest] };
}
function qMatrizP2(){
  // P 2x2 = [[a,1-a],[1-b,b]] ; (P²)_00 = a·a + (1-a)·(1-b)
  const a = peRi(2,8)/10, b = peRi(2,8)/10;
  const p2_00 = a*a + (1-a)*(1-b);
  return { type:'numeric', topic:'pe_matriz', tol:0.005,
    prompt:'Sea P = [ ['+a+', '+peR(1-a,2)+'] , ['+peR(1-b,2)+', '+b+'] ]. Calcula la entrada <b>(P²)<sub>11</sub></b> (fila 1, columna 1, empezando en 1).',
    answer:p2_00, correctText:peR(p2_00,4).toString(),
    explain:'(P²)<sub>11</sub> = fila 1 · columna 1 = P<sub>11</sub>·P<sub>11</sub> + P<sub>12</sub>·P<sub>21</sub>.',
    steps:['(P²)<sub>11</sub> = '+a+'·'+a+' + '+peR(1-a,2)+'·'+peR(1-b,2),
      '= '+peR(a*a,3)+' + '+peR((1-a)*(1-b),3)+' = '+peR(p2_00,4)] };
}
function qMatrizVector(){
  // v0 = [1,0] (empieza en estado 0). v1 = v0·P → primera fila de P.
  const a = peRi(2,8)/10;
  return { type:'numeric', topic:'pe_matriz', tol:0.005,
    prompt:'El vector inicial es v<sub>0</sub> = [1, 0] (empezamos seguro en el estado 0). Con P<sub>11</sub>='+a+' y P<sub>12</sub>='+peR(1-a,2)+', ¿cuál es la probabilidad de estar en el <b>estado 0</b> tras un paso (primera entrada de v<sub>1</sub> = v<sub>0</sub>P)?',
    answer:a, correctText:a.toString(),
    explain:'v<sub>1</sub> = v<sub>0</sub>·P. Como v<sub>0</sub>=[1,0], v<sub>1</sub> es la primera fila de P.',
    steps:['v<sub>1</sub> = [1,0]·P = primera fila de P',
      'Probabilidad de estado 0 = P<sub>11</sub> = '+a] };
}
function buildPE7(){
  return peShuffle([ qMatrizFila(), qMatrizFila(), qMatrizP2(), qMatrizP2(), qMatrizVector(), qMatrizVector(),
    { type:'tf', topic:'pe_matriz', prompt:'En P, la entrada p<sub>ij</sub> es la probabilidad de pasar del estado i al estado j en un paso.',
      answer:true, explain:'p<sub>ij</sub> = P(X<sub>n+1</sub>=j | X<sub>n</sub>=i).', correctText:'Verdadero' },
    { type:'tf', topic:'pe_matriz', prompt:'Para obtener las probabilidades en n pasos se usa P<sup>n</sup> (la matriz P elevada a la n).',
      answer:true, explain:'(P<sup>n</sup>)<sub>ij</sub> = P(X<sub>n</sub>=j | X<sub>0</sub>=i).', correctText:'Verdadero' } ]);
}

/* ================= PARCIAL 2 ================= */

/* — M8: Proceso de Poisson — */
function qPoisExact(){
  const lam = pePick([1.5,2,2.5,3,1.7,4]); const t = pePick([1,2,3]); const m = lam*t;
  const k = peRi(0, Math.max(2, Math.round(m)+1));
  const prob = pePmf(m,k);
  return { type:'numeric', topic:'pe_poisson', tol:0.01,
    prompt:'Un proceso de Poisson tiene tasa λ='+lam+' por unidad de tiempo. ¿Cuál es <b>P(N('+t+')='+k+')</b>?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'P(N(t)=k) = e<sup>−λt</sup>(λt)<sup>k</sup> / k!.',
    steps:['λt = '+lam+'·'+t+' = '+peR(m,2),
      'P(N('+t+')='+k+') = e<sup>−'+peR(m,2)+'</sup>·('+peR(m,2)+')<sup>'+k+'</sup> / '+k+'!',
      '= '+peR(prob,4)] };
}
function qPoisNone(){
  const lam = pePick([1.7,2,1.5,2.5,3]); const t = pePick([1,2]); const m = lam*t;
  const prob = pePmf(m,0);
  return { type:'numeric', topic:'pe_poisson', tol:0.01,
    prompt:'Proceso de Poisson con λ='+lam+' por unidad. ¿Cuál es la probabilidad de que <b>no ocurra ningún evento</b> en '+t+' unidad(es), P(N('+t+')=0)?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'P(N(t)=0) = e<sup>−λt</sup>.',
    steps:['λt = '+lam+'·'+t+' = '+peR(m,2), 'P(N=0) = e<sup>−'+peR(m,2)+'</sup> = '+peR(prob,4)] };
}
function qPoisAtLeast(){
  const lam = pePick([1.5,2,1.7,2.5,3]); const t = pePick([1,2]); const m = lam*t;
  const prob = 1 - peCdf(m,1); // P(N≥2)
  return { type:'numeric', topic:'pe_poisson', tol:0.01,
    prompt:'Proceso de Poisson con λ='+lam+', t='+t+'. ¿Cuál es <b>P(N('+t+') ≥ 2)</b>? (usa el complemento)',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'P(N≥2) = 1 − P(N=0) − P(N=1).',
    steps:['λt = '+peR(m,2),
      'P(N=0) = e<sup>−'+peR(m,2)+'</sup> = '+peR(pePmf(m,0),4)+'; P(N=1) = e<sup>−'+peR(m,2)+'</sup>·'+peR(m,2)+' = '+peR(pePmf(m,1),4),
      'P(N≥2) = 1 − '+peR(pePmf(m,0),4)+' − '+peR(pePmf(m,1),4)+' = '+peR(prob,4)] };
}
function qPoisAtMost(){
  const lam = pePick([1.5,2,2.5]); const t = pePick([1,2]); const m = lam*t; const k = peRi(1,2);
  const prob = peCdf(m,k);
  return { type:'numeric', topic:'pe_poisson', tol:0.01,
    prompt:'Proceso de Poisson con λ='+lam+', t='+t+'. ¿Cuál es <b>P(N('+t+') ≤ '+k+')</b>?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'P(N≤k) = Σ<sub>i=0</sub><sup>k</sup> e<sup>−λt</sup>(λt)<sup>i</sup>/i!.',
    steps:['λt = '+peR(m,2),
      'Suma P(N=0..'+k+') = '+peR(prob,4)] };
}
function qPoisUnit(){
  // tasa por hora, tiempo en minutos → convertir
  const perHour = pePick([6,12,3,4,10]); const mins = pePick([10,15,20,30]);
  const lamMin = perHour/60; const m = lamMin*mins; const k = peRi(0,2);
  const prob = pePmf(m,k);
  return { type:'numeric', topic:'pe_poisson', tol:0.01,
    prompt:'Llegan en promedio <b>'+perHour+' clientes por hora</b> (Poisson). ¿Cuál es la probabilidad de que lleguen exactamente <b>'+k+'</b> en <b>'+mins+' minutos</b>?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'Hay que ajustar la tasa a la unidad del tiempo: λt = ('+perHour+'/60)·'+mins+'.',
    steps:['λ por minuto = '+perHour+'/60 = '+peR(lamMin,4),
      'λt = '+peR(lamMin,4)+'·'+mins+' = '+peR(m,3),
      'P(N='+k+') = e<sup>−'+peR(m,3)+'</sup>·('+peR(m,3)+')<sup>'+k+'</sup>/'+k+'! = '+peR(prob,4)] };
}
function buildPE8(){
  return peShuffle([ qPoisExact(), qPoisExact(), qPoisNone(), qPoisAtLeast(), qPoisAtMost(), qPoisUnit(), qPoisUnit(),
    { type:'tf', topic:'pe_poisson', prompt:'En un proceso de Poisson, E[N(t)] = Var[N(t)] = λt.',
      answer:true, explain:'La Poisson tiene media y varianza iguales a λt.', correctText:'Verdadero' } ]);
}

/* — M9: Distribución exponencial — */
function qExpSurv(){
  const lam = pePick([0.5,0.25,1,2,0.2]); const t = peRi(1,5);
  const prob = Math.exp(-lam*t);
  return { type:'numeric', topic:'pe_exp', tol:0.01,
    prompt:'El tiempo entre eventos es Exponencial con λ='+lam+'. ¿Cuál es <b>P(X > '+t+')</b>?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'Función de supervivencia: P(X>t) = e<sup>−λt</sup>.',
    steps:['P(X>t) = e<sup>−λt</sup> = e<sup>−'+lam+'·'+t+'</sup> = e<sup>−'+peR(lam*t,3)+'</sup> = '+peR(prob,4)] };
}
function qExpBetween(){
  const lam = pePick([0.5,0.25,1,0.2]); let a=peRi(1,3), b=a+peRi(1,3);
  const prob = Math.exp(-lam*a) - Math.exp(-lam*b);
  return { type:'numeric', topic:'pe_exp', tol:0.01,
    prompt:'Tiempo de espera Exponencial con λ='+lam+'. ¿Cuál es <b>P('+a+' < X < '+b+')</b>?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'P(a<X<b) = P(X>a) − P(X>b) = e<sup>−λa</sup> − e<sup>−λb</sup>.',
    steps:['P(X>'+a+') = e<sup>−'+peR(lam*a,3)+'</sup> = '+peR(Math.exp(-lam*a),4),
      'P(X>'+b+') = e<sup>−'+peR(lam*b,3)+'</sup> = '+peR(Math.exp(-lam*b),4),
      'P('+a+'<X<'+b+') = '+peR(Math.exp(-lam*a),4)+' − '+peR(Math.exp(-lam*b),4)+' = '+peR(prob,4)] };
}
function qExpFindLambda(){
  const t = peRi(2,5); const pTarget = pePick([0.5,0.6,0.4,0.3]);
  const lam = -Math.log(pTarget)/t;
  return { type:'numeric', topic:'pe_exp', tol:0.01,
    prompt:'Se sabe que <b>P(X > '+t+') = '+pTarget+'</b> para un tiempo Exponencial. Despeja <b>λ</b>.',
    answer:lam, correctText:peR(lam,4).toString(),
    explain:'De e<sup>−λt</sup> = p se despeja λ = −ln(p)/t.',
    steps:['e<sup>−λ·'+t+'</sup> = '+pTarget,
      '−λ·'+t+' = ln('+pTarget+') = '+peR(Math.log(pTarget),4),
      'λ = −ln('+pTarget+')/'+t+' = '+peR(lam,4)] };
}
function qExpFindTime(){
  const lam = pePick([0.5,0.25,1,0.2]); const pTarget = pePick([0.5,0.6,0.4,0.3]);
  const t = -Math.log(pTarget)/lam;
  return { type:'numeric', topic:'pe_exp', tol:0.02,
    prompt:'Con λ='+lam+' (Exponencial), ¿para qué tiempo <b>t</b> se cumple <b>P(X > t) = '+pTarget+'</b>?',
    answer:t, correctText:peR(t,4).toString(),
    explain:'De e<sup>−λt</sup> = p ⇒ t = −ln(p)/λ.',
    steps:['e<sup>−'+lam+'·t</sup> = '+pTarget,
      't = −ln('+pTarget+')/'+lam+' = '+peR(t,4)] };
}
function qExpMean(){
  const lam = pePick([0.5,0.25,2,4,0.2]); const isVar = pePick([true,false]);
  const ans = isVar ? 1/(lam*lam) : 1/lam;
  return { type:'numeric', topic:'pe_exp', tol:0.02,
    prompt:'Para un tiempo Exponencial con λ='+lam+', ¿cuánto vale <b>'+(isVar?'Var(X)':'E[X]')+'</b>?',
    answer:ans, correctText:peR(ans,4).toString(),
    explain:isVar?'Var(X) = 1/λ².':'E[X] = 1/λ.',
    steps:[isVar? 'Var(X) = 1/λ² = 1/'+lam+'² = '+peR(ans,4) : 'E[X] = 1/λ = 1/'+lam+' = '+peR(ans,4)] };
}
function buildPE9(){
  return peShuffle([ qExpSurv(), qExpSurv(), qExpBetween(), qExpFindLambda(), qExpFindTime(), qExpMean(), qExpMean(),
    { type:'mc', topic:'pe_exp', prompt:'La distribución Exponencial modela:',
      options:[ {t:'El tiempo entre eventos consecutivos de un proceso de Poisson', ok:true},
        {t:'El número de eventos en un intervalo', ok:false}, {t:'La suma de todas las llegadas', ok:false},
        {t:'La probabilidad de un dado', ok:false} ],
      explain:'Poisson cuenta eventos; la Exponencial mide el tiempo entre ellos.', correctText:'Tiempo entre eventos consecutivos' } ]);
}

/* — M10: Pérdida de memoria — */
function qMemoria(){
  const mean = pePick([5,10,8,4,6]); const waited = peRi(1, mean-1);
  return { type:'numeric', topic:'pe_memoria', unit:'min', tol:0.001,
    prompt:'Un camión pasa en promedio cada <b>'+mean+' min</b> (tiempos Exponenciales). Llevas <b>'+waited+' min</b> esperando y no ha pasado. ¿Cuánto tiempo <b>esperado adicional</b> falta para que pase?',
    answer:mean, correctText:mean+' min',
    explain:'Por la pérdida de memoria, el tiempo que ya esperaste no cuenta: el tiempo esperado adicional sigue siendo la media.',
    steps:['Pérdida de memoria: P(X > t+s | X > s) = P(X > t)',
      'El proceso «olvida» los '+waited+' min ya esperados',
      'Tiempo esperado adicional = media = '+mean+' min'] };
}
function buildPE10(){
  return peShuffle([ qMemoria(), qMemoria(), qMemoria(),
    { type:'mc', topic:'pe_memoria', prompt:'La <b>propiedad de pérdida de memoria</b> de la Exponencial dice:',
      options:[ {t:'P(X > t+s | X > s) = P(X > t)', ok:true}, {t:'P(X > t+s) = P(X > t)·P(X > s)·2', ok:false},
        {t:'El tiempo esperado disminuye mientras esperas', ok:false}, {t:'X siempre vale su media', ok:false} ],
      explain:'Haber esperado s no cambia la distribución del tiempo restante.', correctText:'P(X>t+s | X>s) = P(X>t)' },
    { type:'tf', topic:'pe_memoria', prompt:'Si un componente con vida Exponencial ya funcionó 100 h, su probabilidad de durar 50 h más es la misma que la de uno nuevo de durar 50 h.',
      answer:true, explain:'Justamente eso implica la pérdida de memoria.', correctText:'Verdadero' } ]);
}

/* — M11: Erlang / Gamma (evento n-ésimo) — */
function qErlangMean(){
  const lam = pePick([2,0.5,4,1,0.25]); const n = peRi(2,6); const isVar = pePick([true,false]);
  const ans = isVar ? n/(lam*lam) : n/lam;
  return { type:'numeric', topic:'pe_erlang', tol:0.02,
    prompt:'El tiempo hasta el <b>evento n-ésimo</b> es S<sub>n</sub>=T<sub>1</sub>+…+T<sub>n</sub> (Erlang). Con λ='+lam+' y n='+n+', ¿cuánto vale <b>'+(isVar?'Var(S'+n+')':'E[S'+n+']')+'</b>?',
    answer:ans, correctText:peR(ans,4).toString(),
    explain:isVar?'Var(S<sub>n</sub>) = n/λ².':'E[S<sub>n</sub>] = n/λ.',
    steps:[isVar? 'Var(S<sub>n</sub>) = n/λ² = '+n+'/'+lam+'² = '+peR(ans,4) : 'E[S<sub>n</sub>] = n/λ = '+n+'/'+lam+' = '+peR(ans,4)] };
}
function buildPE11(){
  return peShuffle([ qErlangMean(), qErlangMean(), qErlangMean(),
    { type:'mc', topic:'pe_erlang', prompt:'El tiempo hasta la <b>n-ésima</b> llegada de un proceso de Poisson se distribuye:',
      options:[ {t:'Erlang/Gamma (suma de n exponenciales)', ok:true}, {t:'Poisson', ok:false},
        {t:'Uniforme', ok:false}, {t:'Binomial', ok:false} ],
      explain:'S<sub>n</sub> = T<sub>1</sub>+…+T<sub>n</sub>, suma de n exponenciales i.i.d. ⇒ Erlang/Gamma.', correctText:'Erlang/Gamma' },
    { type:'fill', topic:'pe_erlang', prompt:'La esperanza del tiempo hasta el evento n-ésimo es E[S<sub>n</sub>] = ____ (en términos de n y λ).',
      accept:['n/λ','n/lambda','n/l','n sobre lambda'], correctText:'n/λ' } ]);
}

/* — M12: Propiedades integradoras de Poisson — */
function qThinning(){
  const lam = pePick([1.7,2,3,4,5]); const pPct = pePick([60,40,30,25,15]); const p=pPct/100;
  const newLam = lam*p;
  return { type:'numeric', topic:'pe_integrador', tol:0.01,
    prompt:'Un proceso de Poisson tiene tasa λ='+lam+'. Cada evento es de «tipo A» con probabilidad p='+p+' (adelgazamiento). ¿Cuál es la <b>nueva tasa</b> λ<sub>A</sub> del proceso de eventos tipo A?',
    answer:newLam, correctText:peR(newLam,4).toString(),
    explain:'Al clasificar/adelgazar un Poisson, cada subproceso es Poisson con tasa λ·p.',
    steps:['λ<sub>A</sub> = λ·p = '+lam+'·'+p+' = '+peR(newLam,4)] };
}
function qThinningProb(){
  const lam = pePick([1.7,2,3]); const pPct = pePick([60,40,50]); const p=pPct/100;
  const m = lam*p; const t=1; const k=peRi(0,2);
  const prob = pePmf(m*t,k);
  return { type:'numeric', topic:'pe_integrador', tol:0.01,
    prompt:'Poisson con λ='+lam+'; los eventos son de «tipo A» con prob. p='+p+'. En t=1, ¿cuál es P(N<sub>A</sub>(1)='+k+')?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'El subproceso A es Poisson con tasa λp; luego se aplica la fórmula de Poisson.',
    steps:['λ<sub>A</sub> = λp = '+lam+'·'+p+' = '+peR(m,3),
      'P(N<sub>A</sub>(1)='+k+') = e<sup>−'+peR(m,3)+'</sup>·('+peR(m,3)+')<sup>'+k+'</sup>/'+k+'! = '+peR(prob,4)] };
}
function qThinAtLeast(){
  // caso de control 2: λ=1.7, p=0.6 → λp=1.02, P(N≥2)
  const lam = pePick([1.7,2,2.5]); const pPct = pePick([60,50,40]); const p=pPct/100;
  const m = lam*p; const prob = 1-peCdf(m,1);
  return { type:'numeric', topic:'pe_integrador', tol:0.01,
    prompt:'Un proceso de Poisson con λ='+lam+' se clasifica: una categoría ocurre con prob. p='+p+'. En t=1, ¿cuál es P(N<sub>cat</sub>(1) ≥ 2)?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'Nueva tasa λp; luego P(N≥2)=1−P(0)−P(1).',
    steps:['λp = '+lam+'·'+p+' = '+peR(m,3),
      'P(N=0)=e<sup>−'+peR(m,3)+'</sup>='+peR(pePmf(m,0),4)+'; P(N=1)='+peR(pePmf(m,1),4),
      'P(N≥2)=1−'+peR(pePmf(m,0),4)+'−'+peR(pePmf(m,1),4)+' = '+peR(prob,4)] };
}
function qSuperpos(){
  const l1 = pePick([1,2,1.5,3]); const l2 = pePick([2,1,2.5,1.5]);
  const tot = l1+l2;
  return { type:'numeric', topic:'pe_integrador', tol:0.01,
    prompt:'Se superponen (suman) dos procesos de Poisson independientes con tasas λ<sub>1</sub>='+l1+' y λ<sub>2</sub>='+l2+'. ¿Cuál es la <b>tasa del proceso combinado</b>?',
    answer:tot, correctText:tot.toString(),
    explain:'La superposición de Poisson independientes es Poisson con tasa λ<sub>1</sub>+λ<sub>2</sub>.',
    steps:['λ = λ<sub>1</sub> + λ<sub>2</sub> = '+l1+' + '+l2+' = '+tot] };
}
function qCondBin(){
  // caso de control 3: N(s)|N(t)=n ~ Bin(n, s/t)
  const t = pePick([4,5,6,8,10]); let s = peRi(1,t-1);
  const n = peRi(3,7); const k = peRi(1,n-1);
  const ratio = s/t; const prob = peComb(n,k)*Math.pow(ratio,k)*Math.pow(1-ratio,n-k);
  return { type:'numeric', topic:'pe_integrador', tol:0.01,
    prompt:'En un proceso de Poisson se sabe que ocurrieron <b>N('+t+')='+n+'</b> eventos. ¿Cuál es la probabilidad de que <b>'+k+'</b> de ellos ocurrieran antes de s='+s+', es decir P(N('+s+')='+k+' | N('+t+')='+n+')?',
    answer:prob, correctText:peR(prob,4).toString(),
    explain:'Dado N(t)=n, N(s) ~ Binomial(n, s/t): P = C(n,k)(s/t)<sup>k</sup>(1−s/t)<sup>n−k</sup>.',
    steps:['s/t = '+s+'/'+t+' = '+peR(ratio,4),
      'P = C('+n+','+k+')·('+peR(ratio,3)+')<sup>'+k+'</sup>·('+peR(1-ratio,3)+')<sup>'+(n-k)+'</sup>',
      '= '+peComb(n,k)+'·'+peR(Math.pow(ratio,k),4)+'·'+peR(Math.pow(1-ratio,n-k),4)+' = '+peR(prob,4)] };
}
function qCompound(){
  const lam = pePick([2,3,4,5]); const t = pePick([1,2,3]); const eY = pePick([10,50,100,200,20]);
  const ex = lam*t*eY;
  return { type:'numeric', topic:'pe_integrador', tol:1,
    prompt:'Proceso de Poisson compuesto X(t)=ΣY<sub>i</sub>, con λ='+lam+' eventos por unidad y monto medio E[Y]='+eY+' por evento. ¿Cuál es <b>E[X('+t+')]</b>?',
    answer:ex, correctText:ex.toString(),
    explain:'Para el Poisson compuesto, E[X(t)] = λt · E[Y].',
    steps:['E[X(t)] = λt · E[Y] = '+lam+'·'+t+'·'+eY,
      '= '+peR(lam*t,2)+'·'+eY+' = '+ex] };
}
function buildPE12(){
  return peShuffle([ qThinning(), qThinning(), qThinningProb(), qThinAtLeast(), qSuperpos(), qCondBin(), qCondBin(), qCompound(), qCompound(),
    { type:'mc', topic:'pe_integrador', prompt:'Dado que en (0,t) ocurrieron n eventos de Poisson, ¿cómo se distribuye el número que cae en (0,s) con s<t?',
      options:[ {t:'Binomial(n, s/t)', ok:true}, {t:'Poisson(λs)', ok:false}, {t:'Uniforme(0,n)', ok:false}, {t:'Exponencial(s/t)', ok:false} ],
      explain:'N(s) | N(t)=n ~ Binomial(n, s/t).', correctText:'Binomial(n, s/t)' } ]);
}

/* — Lecciones (mini-teoría para módulos conceptuales) — */
const LESSON_PE_FUND = { title:'📐 Fundamentos de procesos estocásticos', html:
  '<p>Un <b>proceso estocástico</b> es una colección de variables aleatorias {X<sub>t</sub> : t ∈ T} que describe cómo evoluciona un sistema con azar a lo largo del tiempo.</p>'
  +'<p>Formalmente X: Ω × T → S, donde:</p>'
  +'<ul><li><b>Ω</b>: espacio muestral (los resultados del azar).</li><li><b>T</b>: espacio temporal (discreto {0,1,2,…} o continuo [0,∞)).</li><li><b>S</b>: espacio de estados (los valores posibles).</li></ul>'
  +'<p>Si <b>fijamos ω</b> y variamos t, obtenemos una <b>trayectoria</b> (realización). Si <b>fijamos t</b> y variamos ω, obtenemos una <b>variable aleatoria</b> X<sub>t</sub>.</p>' };
const LESSON_PE_CAMINATA = { title:'🚶 Caminata aleatoria', html:
  '<p>Partimos de X<sub>0</sub>=0 y en cada paso sumamos ε<sub>n</sub> = +1 (con prob. p) o −1 (con prob. q=1−p):</p>'
  +'<p style="text-align:center">X<sub>n</sub> = X<sub>n−1</sub> + ε<sub>n</sub> = ε<sub>1</sub> + … + ε<sub>n</sub></p>'
  +'<ul><li><b>Esperanza:</b> E[X<sub>n</sub>] = n(p − q).</li><li><b>Varianza:</b> Var[X<sub>n</sub>] = n(1 − (p−q)²) = 4npq.</li>'
  +'<li><b>Posición:</b> para llegar a k en n pasos hacen falta r=(n+k)/2 pasos «+1»: P(X<sub>n</sub>=k) = C(n,r) p<sup>r</sup> q<sup>n−r</sup>.</li></ul>'
  +'<p>X<sub>n</sub> siempre tiene la misma <b>paridad</b> que n.</p>' };
const LESSON_PE_POISSON = { title:'⏱️ Proceso de Poisson', html:
  '<p>El proceso de Poisson <b>cuenta llegadas</b>: N(t) = número de eventos en [0,t]. Los tiempos entre eventos T<sub>i</sub> son Exponenciales(λ) independientes.</p>'
  +'<p style="text-align:center">N(t) ~ Poisson(λt) &nbsp;⇒&nbsp; P(N(t)=k) = e<sup>−λt</sup>(λt)<sup>k</sup> / k!</p>'
  +'<ul><li>Tiene <b>incrementos estacionarios e independientes</b> y la propiedad de Markov.</li>'
  +'<li><b>E[N(t)] = Var[N(t)] = λt.</b></li>'
  +'<li>«Al menos» y «a lo más» se resuelven con el <b>complemento</b> y sumas de la fórmula.</li>'
  +'<li>Ojo con las <b>unidades</b>: ajusta λ al tiempo (por hora, minuto, etc.).</li></ul>' };
const LESSON_PE_EXP = { title:'📉 Distribución exponencial', html:
  '<p>La Exponencial(λ) mide el <b>tiempo entre eventos</b> de un proceso de Poisson.</p>'
  +'<ul><li><b>Supervivencia:</b> P(X&gt;t) = e<sup>−λt</sup>.</li><li><b>Distribución:</b> F(t)=1−e<sup>−λt</sup>.</li>'
  +'<li><b>E[X]=1/λ</b>, <b>Var(X)=1/λ².</b></li>'
  +'<li><b>Pérdida de memoria:</b> P(X&gt;t+s | X&gt;s) = P(X&gt;t). Lo ya esperado no cuenta.</li></ul>'
  +'<p>El tiempo hasta la <b>n-ésima</b> llegada es S<sub>n</sub>=T<sub>1</sub>+…+T<sub>n</sub> ~ Erlang/Gamma, con E[S<sub>n</sub>]=n/λ y Var=n/λ².</p>' };

/* — Módulos de la materia — */
const MODULES_STOCH = [
  {id:0,  icon:'📐', name:'Fundamentos de procesos', desc:'Definición, Ω×T→S, trayectorias y notación básica.', kind:'Quiz mixto', lesson:LESSON_PE_FUND, build:buildPE1},
  {id:1,  icon:'🔀', name:'Tipos y propiedades', desc:'i.i.d., Markov, incrementos independientes y estacionariedad.', kind:'Clasificación', build:buildPE2},
  {id:2,  icon:'🚶', name:'Caminata aleatoria', desc:'Xₙ=Σεₖ, esperanza, varianza y probabilidad de posición.', kind:'Ejercicios ilimitados', lesson:LESSON_PE_CAMINATA, build:buildPE3},
  {id:3,  icon:'↩️', name:'Regreso al origen', desc:'Estar en 0 (pₙ) vs. primer regreso (fₙ) y paridad.', kind:'Ejercicios + retos', build:buildPE4},
  {id:4,  icon:'🔗', name:'Cadenas de Markov', desc:'Propiedad de Markov, estados y construcción de cadenas.', kind:'Quiz conceptual', build:buildPE5},
  {id:5,  icon:'🕸️', name:'Diagramas de transición', desc:'Nodos, flechas, lazos y probabilidades que suman 1.', kind:'Quiz conceptual', build:buildPE6},
  {id:6,  icon:'🔢', name:'Matrices de transición', desc:'Construir P, filas que suman 1, P² y vₙ=v₀Pⁿ.', kind:'Ejercicios ilimitados', build:buildPE7},
  {id:7,  icon:'⏱️', name:'Proceso de Poisson', desc:'N(t)~Poisson(λt): exacto, al menos, a lo más y unidades.', kind:'Ejercicios ilimitados', lesson:LESSON_PE_POISSON, build:buildPE8},
  {id:8,  icon:'📉', name:'Distribución exponencial', desc:'P(X>t)=e^(−λt), despejar λ o t, media y varianza.', kind:'Ejercicios ilimitados', lesson:LESSON_PE_EXP, build:buildPE9},
  {id:9,  icon:'🧠', name:'Pérdida de memoria', desc:'P(X>t+s|X>s)=P(X>t) y el tiempo esperado adicional.', kind:'Ejercicios + retos', build:buildPE10},
  {id:10, icon:'⛓️', name:'Erlang/Gamma (evento n)', desc:'Sₙ=T₁+…+Tₙ, E[Sₙ]=n/λ y Var=n/λ².', kind:'Ejercicios ilimitados', build:buildPE11},
  {id:11, icon:'🧩', name:'Propiedades de Poisson', desc:'Adelgazamiento λp, superposición, Binomial(n,s/t) y compuesto.', kind:'Casos integradores', build:buildPE12}
];

/* Temas → nombre legible (se fusiona con TOPIC_NAMES) */
const TOPIC_NAMES_STOCH = {
  pe_fund:'Fundamentos', pe_tipos:'Tipos de proceso', pe_caminata:'Caminata aleatoria', pe_regreso:'Regreso al origen',
  pe_markov:'Cadenas de Markov', pe_diagrama:'Diagramas', pe_matriz:'Matrices de transición',
  pe_poisson:'Proceso de Poisson', pe_exp:'Exponencial', pe_memoria:'Pérdida de memoria',
  pe_erlang:'Erlang/Gamma', pe_integrador:'Integrador Poisson'
};

/* Qué módulos entran en cada parcial (para el modo Repaso Examen y el examen diario) */
const STOCH_PARCIALES = { 1:[0,1,2,3,4,5,6], 2:[7,8,9,10,11] };

/* Examen diario de Procesos: mezcla de ambos parciales disponibles */
function buildExamStoch(){
  const pool = [];
  MODULES_STOCH.forEach(m => { if(m.build){ try{ pool.push(...m.build()); }catch(e){} } });
  return peShuffle(pool).slice(0, 12);
}
/* Registrar temas legibles de la materia en el mapa global */
Object.assign(TOPIC_NAMES, TOPIC_NAMES_STOCH);

/* modulesBySubject: para dar contenido a una materia nueva basta con llenar su
   arreglo aquí siguiendo el formato de MODULES_CA3 (id, icon, name, desc, kind,
   build → función que regresa las preguntas del quiz). */
/* ==================== Modelos de Regresión (materia "modelos-regresion") ====================
   Contenido fiel al cuaderno: regresión lineal simple (mínimos cuadrados,
   ajuste/residuos, propiedades y distribución de estimadores, inferencia
   sobre parámetros, respuesta media vs. predicción individual, ANOVA y R²).
   Los demás tipos de regresión (múltiple, logística, polinomial, Ridge/Lasso)
   solo se mencionan conceptualmente: NO se generan ejercicios de ellos. */

/* Reutiliza peR (redondeo) del bloque de Procesos; alias de azar */
const rgRi = ri, rgPick = pick, rgShuffle = shuffle;

/* Valores críticos (df = n−2) usados en el cuaderno; se muestran en el enunciado
   para no depender de la orientación de una tabla. */
const T_025 = {4:2.776, 5:2.571, 6:2.447, 7:2.365, 8:2.306, 9:2.262, 10:2.228};
const CHI_025 = {4:0.484, 5:0.831, 6:1.237, 7:1.690, 8:2.180, 9:2.700, 10:3.247}; // χ² con área izq. 0.025
const CHI_975 = {4:11.143, 5:12.833, 6:14.449, 7:16.013, 8:17.535, 9:19.023, 10:20.483}; // área izq. 0.975

/* Núcleo de cálculo de regresión lineal simple (una sola implementación) */
function regCompute(X, Y){
  const n = X.length;
  const sumX = X.reduce((a,b)=>a+b,0), sumY = Y.reduce((a,b)=>a+b,0);
  const sumXX = X.reduce((a,x)=>a+x*x,0), sumYY = Y.reduce((a,y)=>a+y*y,0);
  const sumXY = X.reduce((a,x,i)=>a+x*Y[i],0);
  const mX = sumX/n, mY = sumY/n;
  const Sxx = sumXX - sumX*sumX/n;
  const Sxy = sumXY - sumX*sumY/n;
  const Syy = sumYY - sumY*sumY/n;      // = SCT
  const b1 = Sxy/Sxx;
  const b0 = mY - b1*mX;
  const yhat = X.map(x => b0 + b1*x);
  const resid = Y.map((y,i) => y - yhat[i]);
  const SCT = Syy, SCR = b1*Sxy, SCE = SCT - SCR;
  const sigma2 = SCE/(n-2), s = Math.sqrt(sigma2);
  const R2 = SCR/SCT;
  return {X,Y,n,sumX,sumY,sumXX,sumYY,sumXY,mX,mY,Sxx,Sxy,Syy,b0,b1,yhat,resid,SCT,SCR,SCE,sigma2,s,R2};
}
/* Genera un conjunto (X,Y) con relación lineal clara y sin casos degenerados */
function regCase(){
  for(let tries=0; tries<60; tries++){
    const n = rgPick([6,7,8]);
    const b1t = rgPick([1.5,2,2.5,3,-1.5,-2]);
    const b0t = rgPick([5,10,15,20,30]);
    const X = []; let cur = rgRi(3,12);
    for(let i=0;i<n;i++){ cur += rgRi(1,4); X.push(cur); }        // X distintos y con dispersión ⇒ Sxx>0
    const Y = X.map(x => Math.round(b0t + b1t*x + rgRi(-3,3)));
    const c = regCompute(X,Y);
    if(c.Sxx>0 && c.R2>=0.6 && c.R2<0.999 && Math.abs(c.b1)>0.3 && Y.every(y=>Math.abs(y)<100000)) return c;
  }
  return regCompute([2,4,6,8,10,12],[7,11,15,19,23,27]);         // respaldo determinista
}
/* Tabla de datos (X,Y) para el enunciado */
function regDataTable(c){
  return '<table class="mini-tbl"><tr><th>X</th>'+c.X.map(x=>'<td>'+x+'</td>').join('')+'</tr>'
    + '<tr><th>Y</th>'+c.Y.map(y=>'<td>'+y+'</td>').join('')+'</tr></table>';
}
const CTX = ['gastos de promoción (X) y ventas (Y)','porcentaje de incremento (X) y ventas (Y)',
  'publicidad (X) y siniestros (Y)','costos (X) y producción (Y)','antigüedad (X) y prima (Y)','horas de estudio (X) y calificación (Y)'];

/* ---- Generadores numéricos (cada uno pide UN valor; steps con procedimiento) ---- */
function qRegMedia(){
  const c = regCase(); const which = rgPick(['X','Y']);
  const sum = which==='X'?c.sumX:c.sumY, m = which==='X'?c.mX:c.mY;
  return { type:'numeric', topic:'rg_minimos', tol:0.05,
    prompt:'Con los datos de '+rgPick(CTX)+', calcula la media <b>'+(which==='X'?'X̄':'Ȳ')+'</b>:'+regDataTable(c),
    answer:m, correctText:peR(m,4).toString(),
    explain:(which==='X'?'X̄':'Ȳ')+' = (Σ'+which+') / n.',
    steps:['n = '+c.n, 'Σ'+which+' = '+sum, (which==='X'?'X̄':'Ȳ')+' = '+sum+' / '+c.n+' = '+peR(m,4)] };
}
function qRegSuma(){
  const c = regCase(); const which = rgPick(['sumXX','sumXY']);
  const val = c[which], lab = which==='sumXX'?'ΣX²':'ΣXY';
  return { type:'numeric', topic:'rg_minimos', tol:0.5,
    prompt:'Con la tabla auxiliar, calcula <b>'+lab+'</b>:'+regDataTable(c),
    answer:val, correctText:val.toString(),
    explain:lab+' se obtiene sumando '+(which==='sumXX'?'cada X²':'cada producto X·Y')+'.',
    steps:[(which==='sumXX'? c.X.map(x=>x+'²').join(' + ') : c.X.map((x,i)=>x+'·'+c.Y[i]).join(' + ')),
      '= '+val] };
}
function qRegSxx(){
  const c = regCase();
  return { type:'numeric', topic:'rg_minimos', tol:0.5,
    prompt:'Se sabe que ΣX²='+c.sumXX+', ΣX='+c.sumX+' y n='+c.n+'. Calcula <b>Sxx = Σ(Xᵢ−X̄)² = ΣX² − (ΣX)²/n</b>.',
    answer:c.Sxx, correctText:peR(c.Sxx,4).toString(),
    explain:'Sxx = ΣX² − (ΣX)²/n.',
    steps:['(ΣX)²/n = '+c.sumX+'²/'+c.n+' = '+peR(c.sumX*c.sumX/c.n,3),
      'Sxx = '+c.sumXX+' − '+peR(c.sumX*c.sumX/c.n,3)+' = '+peR(c.Sxx,4)] };
}
function qRegPendiente(){
  const c = regCase();
  return { type:'numeric', topic:'rg_minimos', tol:0.02,
    prompt:'Con Sxy = '+peR(c.Sxy,3)+' y Sxx = '+peR(c.Sxx,3)+', calcula la pendiente <b>β̂₁</b>.',
    answer:c.b1, correctText:peR(c.b1,4).toString(),
    explain:'β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx.',
    steps:['β̂₁ = Sxy / Sxx = '+peR(c.Sxy,3)+' / '+peR(c.Sxx,3)+' = '+peR(c.b1,4)] };
}
function qRegIntercepto(){
  const c = regCase();
  return { type:'numeric', topic:'rg_minimos', tol:0.05,
    prompt:'Con β̂₁ = '+peR(c.b1,4)+', X̄ = '+peR(c.mX,3)+' y Ȳ = '+peR(c.mY,3)+', calcula el intercepto <b>β̂₀</b>.',
    answer:c.b0, correctText:peR(c.b0,4).toString(),
    explain:'β̂₀ = Ȳ − β̂₁·X̄.',
    steps:['β̂₀ = Ȳ − β̂₁·X̄ = '+peR(c.mY,3)+' − '+peR(c.b1,4)+'·'+peR(c.mX,3),
      '= '+peR(c.mY,3)+' − '+peR(c.b1*c.mX,3)+' = '+peR(c.b0,4)] };
}
function qRegPredict(){
  const c = regCase(); const x0 = c.X[rgRi(0,c.n-1)];
  const yh = c.b0 + c.b1*x0;
  return { type:'numeric', topic:'rg_ajuste', tol:0.1,
    prompt:'La recta ajustada es Ŷ = '+peR(c.b0,4)+' + '+peR(c.b1,4)+'·X. Predice <b>Ŷ</b> para X = '+x0+' (interpolación).',
    answer:yh, correctText:peR(yh,4).toString(),
    explain:'Se sustituye x₀ en la recta ajustada.',
    steps:['Ŷ = '+peR(c.b0,4)+' + '+peR(c.b1,4)+'·'+x0,
      '= '+peR(c.b0,4)+' + '+peR(c.b1*x0,3)+' = '+peR(yh,4)] };
}
function qRegResiduo(){
  const c = regCase(); const i = rgRi(0,c.n-1);
  const e = c.resid[i];
  return { type:'numeric', topic:'rg_ajuste', tol:0.1,
    prompt:'Para X = '+c.X[i]+' el valor observado es Y = '+c.Y[i]+' y el estimado es Ŷ = '+peR(c.yhat[i],4)+'. Calcula el <b>residuo eᵢ</b>.',
    answer:e, correctText:peR(e,4).toString(),
    explain:'eᵢ = Yᵢ − Ŷᵢ.',
    steps:['eᵢ = Yᵢ − Ŷᵢ = '+c.Y[i]+' − '+peR(c.yhat[i],4)+' = '+peR(e,4)] };
}
function qRegSCT(){
  const c = regCase();
  return { type:'numeric', topic:'rg_anova', tol:0.5,
    prompt:'Con ΣY² = '+c.sumYY+', ΣY = '+c.sumY+' y n = '+c.n+', calcula la suma de cuadrados total <b>SCT = ΣY² − (ΣY)²/n</b>.',
    answer:c.SCT, correctText:peR(c.SCT,4).toString(),
    explain:'SCT = Σ(Yᵢ−Ȳ)² = ΣY² − (ΣY)²/n.',
    steps:['(ΣY)²/n = '+c.sumY+'²/'+c.n+' = '+peR(c.sumY*c.sumY/c.n,3),
      'SCT = '+c.sumYY+' − '+peR(c.sumY*c.sumY/c.n,3)+' = '+peR(c.SCT,4)] };
}
function qRegSCR(){
  const c = regCase();
  return { type:'numeric', topic:'rg_anova', tol:0.5,
    prompt:'Con β̂₁ = '+peR(c.b1,4)+' y Sxy = '+peR(c.Sxy,3)+', calcula la suma de cuadrados de la regresión <b>SCR = β̂₁·Sxy</b>.',
    answer:c.SCR, correctText:peR(c.SCR,4).toString(),
    explain:'SCR = β̂₁·Sxy = Sxy²/Sxx.',
    steps:['SCR = β̂₁·Sxy = '+peR(c.b1,4)+'·'+peR(c.Sxy,3)+' = '+peR(c.SCR,4)] };
}
function qRegSCE(){
  const c = regCase();
  return { type:'numeric', topic:'rg_anova', tol:0.5,
    prompt:'Con SCT = '+peR(c.SCT,3)+' y SCR = '+peR(c.SCR,3)+', calcula la suma de cuadrados del error <b>SCE</b> usando la identidad SCT = SCR + SCE.',
    answer:c.SCE, correctText:peR(c.SCE,4).toString(),
    explain:'SCE = SCT − SCR.',
    steps:['SCE = SCT − SCR = '+peR(c.SCT,3)+' − '+peR(c.SCR,3)+' = '+peR(c.SCE,4)] };
}
function qRegR2(){
  const c = regCase();
  return { type:'numeric', topic:'rg_anova', tol:0.01,
    prompt:'Con SCR = '+peR(c.SCR,3)+' y SCT = '+peR(c.SCT,3)+', calcula el coeficiente de determinación <b>R²</b>.',
    answer:c.R2, correctText:peR(c.R2,4).toString(),
    explain:'R² = SCR/SCT = 1 − SCE/SCT.',
    steps:['R² = SCR / SCT = '+peR(c.SCR,3)+' / '+peR(c.SCT,3)+' = '+peR(c.R2,4)] };
}
function qRegSigma2(){
  const c = regCase();
  return { type:'numeric', topic:'rg_inferencia', tol:0.3,
    prompt:'Con SCE = '+peR(c.SCE,3)+' y n = '+c.n+', estima la varianza del error <b>σ̂² = SCE/(n−2)</b>.',
    answer:c.sigma2, correctText:peR(c.sigma2,4).toString(),
    explain:'σ̂² = SCE/(n−2) (la SCE se divide entre los grados de libertad n−2).',
    steps:['n − 2 = '+(c.n-2), 'σ̂² = SCE/(n−2) = '+peR(c.SCE,3)+'/'+(c.n-2)+' = '+peR(c.sigma2,4)] };
}
function qRegVarPendiente(){
  const c = regCase();
  const v = c.sigma2/c.Sxx;
  return { type:'numeric', topic:'rg_propiedades', tol:0.01,
    prompt:'Con σ̂² = '+peR(c.sigma2,3)+' y Sxx = '+peR(c.Sxx,3)+', calcula <b>Var(β̂₁) = σ²/Sxx</b>.',
    answer:v, correctText:peR(v,5).toString(),
    explain:'Var(β̂₁) = σ²/Sxx.',
    steps:['Var(β̂₁) = σ²/Sxx = '+peR(c.sigma2,3)+'/'+peR(c.Sxx,3)+' = '+peR(v,5)] };
}
function qRegT(){
  const c = regCase(); const se = c.s/Math.sqrt(c.Sxx);
  const tstat = c.b1/se;
  return { type:'numeric', topic:'rg_inferencia', tol:0.05,
    prompt:'Prueba H₀: β₁=0. Con β̂₁ = '+peR(c.b1,4)+', s = '+peR(c.s,3)+' y Sxx = '+peR(c.Sxx,3)+', calcula el estadístico <b>t = β̂₁ / (s/√Sxx)</b>.',
    answer:tstat, correctText:peR(tstat,4).toString(),
    explain:'t = (β̂₁ − 0) / (s/√Sxx), con n−2 grados de libertad.',
    steps:['Error estándar = s/√Sxx = '+peR(c.s,3)+'/√'+peR(c.Sxx,3)+' = '+peR(se,4),
      't = β̂₁ / EE = '+peR(c.b1,4)+' / '+peR(se,4)+' = '+peR(tstat,4)] };
}
function qRegCISlope(){
  const c = regCase(); const df = c.n-2; const tc = T_025[df]; const se = c.s/Math.sqrt(c.Sxx);
  const lo = c.b1 - tc*se, hi = c.b1 + tc*se;
  return { type:'numeric', topic:'rg_inferencia', tol:0.1,
    prompt:'IC al 95% para β₁: β̂₁ ± t·(s/√Sxx). Con β̂₁ = '+peR(c.b1,4)+', s = '+peR(c.s,3)+', Sxx = '+peR(c.Sxx,3)+' y t₍0.025,'+df+'₎ = '+tc+', calcula el <b>límite superior</b> del intervalo.',
    answer:hi, correctText:peR(hi,4).toString(),
    explain:'Límite superior = β̂₁ + t·(s/√Sxx).',
    steps:['s/√Sxx = '+peR(se,4),
      't·EE = '+tc+'·'+peR(se,4)+' = '+peR(tc*se,4),
      'Límite superior = '+peR(c.b1,4)+' + '+peR(tc*se,4)+' = '+peR(hi,4)] };
}
function qRegCIMean(){
  const c = regCase(); const df = c.n-2; const tc = T_025[df]; const x0 = c.X[rgRi(0,c.n-1)];
  const yh = c.b0 + c.b1*x0;
  const half = tc*c.s*Math.sqrt(1/c.n + Math.pow(x0-c.mX,2)/c.Sxx);
  const hi = yh + half;
  return { type:'numeric', topic:'rg_prediccion', tol:0.2,
    prompt:'IC 95% para la <b>respuesta media</b> E(Y|X='+x0+'): Ŷ₀ ± t·s·√(1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = '+peR(yh,3)+', s = '+peR(c.s,3)+', n = '+c.n+', X̄ = '+peR(c.mX,3)+', Sxx = '+peR(c.Sxx,3)+' y t = '+tc+', da el <b>límite superior</b>.',
    answer:hi, correctText:peR(hi,4).toString(),
    explain:'La respuesta media usa √(1/n + (x₀−X̄)²/Sxx).',
    steps:['(x₀−X̄)² = ('+x0+'−'+peR(c.mX,3)+')² = '+peR(Math.pow(x0-c.mX,2),3),
      'raíz = √(1/'+c.n+' + '+peR(Math.pow(x0-c.mX,2),3)+'/'+peR(c.Sxx,3)+') = '+peR(Math.sqrt(1/c.n + Math.pow(x0-c.mX,2)/c.Sxx),4),
      'semi-amplitud = t·s·raíz = '+peR(half,4),
      'Límite superior = Ŷ₀ + '+peR(half,4)+' = '+peR(hi,4)] };
}
function qRegPI(){
  const c = regCase(); const df = c.n-2; const tc = T_025[df]; const x0 = c.X[rgRi(0,c.n-1)];
  const yh = c.b0 + c.b1*x0;
  const half = tc*c.s*Math.sqrt(1 + 1/c.n + Math.pow(x0-c.mX,2)/c.Sxx);
  const hi = yh + half;
  return { type:'numeric', topic:'rg_prediccion', tol:0.2,
    prompt:'Intervalo de <b>predicción</b> 95% para una observación nueva en X='+x0+': Ŷ₀ ± t·s·√(1 + 1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = '+peR(yh,3)+', s = '+peR(c.s,3)+', n = '+c.n+', X̄ = '+peR(c.mX,3)+', Sxx = '+peR(c.Sxx,3)+' y t = '+tc+', da el <b>límite superior</b>.',
    answer:hi, correctText:peR(hi,4).toString(),
    explain:'El intervalo de predicción añade el término +1 dentro de la raíz (es más ancho que el de la media).',
    steps:['raíz = √(1 + 1/'+c.n+' + (x₀−X̄)²/Sxx) = '+peR(Math.sqrt(1+1/c.n+Math.pow(x0-c.mX,2)/c.Sxx),4),
      'semi-amplitud = t·s·raíz = '+peR(half,4),
      'Límite superior = Ŷ₀ + '+peR(half,4)+' = '+peR(hi,4)] };
}
function qRegCISigma(){
  const c = regCase(); const df = c.n-2;
  const chiLo = CHI_975[df], chiHi = CHI_025[df]; // límite inferior usa χ²(0.975), superior usa χ²(0.025)
  const lo = (df*c.sigma2)/chiLo, hi = (df*c.sigma2)/chiHi;
  return { type:'numeric', topic:'rg_anova', tol:0.3,
    prompt:'IC 95% para σ²: [ (n−2)σ̂² / χ²₍0.975₎ , (n−2)σ̂² / χ²₍0.025₎ ]. Con (n−2) = '+df+', σ̂² = '+peR(c.sigma2,3)+', χ²₍0.975,'+df+'₎ = '+chiLo+' y χ²₍0.025,'+df+'₎ = '+chiHi+', calcula el <b>límite inferior</b>.',
    answer:lo, correctText:peR(lo,4).toString(),
    explain:'El límite inferior divide (n−2)σ̂² entre el cuantil grande χ²₍0.975₎.',
    steps:['(n−2)σ̂² = '+df+'·'+peR(c.sigma2,3)+' = '+peR(df*c.sigma2,3),
      'Límite inferior = '+peR(df*c.sigma2,3)+' / '+chiLo+' = '+peR(lo,4)] };
}

/* ---- Módulos ---- */
function buildRG1(){   // Introducción
  return rgShuffle([
    { type:'mc', topic:'rg_intro', prompt:'En un estudio de «gastos de publicidad vs. ventas», ¿cuál es la variable <b>respuesta</b> (Y)?',
      options:[{t:'Las ventas', ok:true},{t:'Los gastos de publicidad', ok:false},{t:'El número de vendedores', ok:false},{t:'El mes', ok:false}],
      explain:'La respuesta Y es la que se quiere explicar/predecir: las ventas.', correctText:'Las ventas' },
    { type:'mc', topic:'rg_intro', prompt:'«Resumir los datos con medias y gráficas, sin generalizar» corresponde a estadística:',
      options:[{t:'Descriptiva', ok:true},{t:'Inferencial', ok:false},{t:'Predictiva', ok:false},{t:'Bayesiana', ok:false}],
      explain:'La estadística descriptiva resume; la inferencial generaliza a la población; la predictiva anticipa valores.', correctText:'Descriptiva' },
    { type:'match', topic:'rg_intro', prompt:'Relaciona cada rama con su objetivo:',
      pairs:[{l:'Descriptiva', r:'Resumir y describir los datos'},{l:'Inferencial', r:'Generalizar a la población'},{l:'Predictiva', r:'Anticipar valores futuros'}],
      correctText:'Descriptiva=resumir, Inferencial=generalizar, Predictiva=predecir' },
    { type:'mc', topic:'rg_intro', prompt:'¿Cuál de estos datos es <b>cualitativo</b>?',
      options:[{t:'Tipo de póliza (auto, vida, gastos médicos)', ok:true},{t:'Monto del siniestro', ok:false},{t:'Edad del asegurado', ok:false},{t:'Número de reclamaciones', ok:false}],
      explain:'Cualitativo = categorías (tipo de póliza). Los demás son cuantitativos.', correctText:'Tipo de póliza' },
    { type:'tf', topic:'rg_intro', prompt:'La regresión lineal <b>múltiple</b> usa dos o más variables explicativas.',
      answer:true, explain:'Simple: una X. Múltiple: varias X. (En este curso solo se desarrolla la simple.)', correctText:'Verdadero' },
    { type:'mc', topic:'rg_intro', prompt:'Un modelo de regresión sirve para:',
      options:[{t:'Explicar o predecir una variable respuesta a partir de otra(s)', ok:true},{t:'Ordenar datos alfabéticamente', ok:false},{t:'Calcular solo la moda', ok:false},{t:'Contar categorías', ok:false}],
      explain:'La regresión modela la relación para explicar/predecir Y con X.', correctText:'Explicar o predecir Y con X' }
  ]);
}
function buildRG2(){   // Proceso de construcción
  return rgShuffle([
    { type:'order', topic:'rg_proceso', prompt:'Ordena las etapas de construcción de un modelo (según el cuaderno):',
      stepsList:['Recolección de datos','Exploración de datos','Revisión de calidad (perdidos, erróneos, atípicos)','Diagrama de dispersión','Ajuste del modelo','Revisión de supuestos y diagnóstico','Predicción'],
      correctText:'Recolección → exploración → calidad → dispersión → ajuste → diagnóstico → predicción' },
    { type:'mc', topic:'rg_proceso', prompt:'Un modelo que se ajusta muy bien a los datos usados pero falla con datos nuevos está:',
      options:[{t:'Sobreajustado', ok:true},{t:'Insesgado', ok:false},{t:'Bien validado', ok:false},{t:'Subajustado por falta de datos', ok:false}],
      explain:'Sobreajuste: ajusta el ruido de la muestra y no generaliza.', correctText:'Sobreajustado' },
    { type:'tf', topic:'rg_proceso', prompt:'Un valor <b>atípico</b> es una observación que se aleja notablemente del resto.',
      answer:true, explain:'Los atípicos pueden distorsionar el ajuste y deben revisarse.', correctText:'Verdadero' },
    { type:'mc', topic:'rg_proceso', prompt:'Antes de ajustar la recta conviene ver el <b>diagrama de dispersión</b> para:',
      options:[{t:'Comprobar si la relación parece lineal', ok:true},{t:'Ordenar los datos', ok:false},{t:'Calcular la moda', ok:false},{t:'Eliminar la variable Y', ok:false}],
      explain:'El diagrama de dispersión muestra la forma de la relación (si es lineal, etc.).', correctText:'Ver si la relación parece lineal' },
    { type:'mc', topic:'rg_proceso', prompt:'Detectas una edad de «999 años» en la base. Es un valor:',
      options:[{t:'Erróneo', ok:true},{t:'Perdido', ok:false},{t:'Correcto', ok:false},{t:'Predicho', ok:false}],
      explain:'Es un valor erróneo (imposible). Un perdido sería un dato ausente.', correctText:'Erróneo' }
  ]);
}
function buildRG3(){   // Modelo lineal simple
  return rgShuffle([
    { type:'match', topic:'rg_modelo', prompt:'Relaciona cada símbolo con su significado en Yᵢ = β₀ + β₁Xᵢ + εᵢ:',
      pairs:[{l:'β₀', r:'Ordenada al origen'},{l:'β₁', r:'Pendiente'},{l:'εᵢ', r:'Error aleatorio'},{l:'Ŷᵢ', r:'Valor estimado'}],
      correctText:'β₀=intercepto, β₁=pendiente, εᵢ=error, Ŷ=estimado' },
    { type:'mc', topic:'rg_modelo', prompt:'Si β̂₁ = 3, ¿cómo se interpreta?',
      options:[{t:'Al aumentar X en 1 unidad, Y aumenta en promedio 3 unidades', ok:true},{t:'Y siempre vale 3', ok:false},{t:'X vale 3 cuando Y=0', ok:false},{t:'No hay relación lineal', ok:false}],
      explain:'β₁ es el cambio promedio en Y por cada unidad de aumento en X.', correctText:'Y aumenta 3 en promedio por unidad de X' },
    { type:'tf', topic:'rg_modelo', prompt:'β₁ = 0 indica ausencia de relación lineal entre X y Y en el modelo.',
      answer:true, explain:'Pendiente cero ⇒ X no aporta información lineal sobre Y.', correctText:'Verdadero' },
    { type:'mc', topic:'rg_modelo', prompt:'El <b>residuo</b> se define como:',
      options:[{t:'eᵢ = Yᵢ − Ŷᵢ', ok:true},{t:'eᵢ = Ŷᵢ − Xᵢ', ok:false},{t:'eᵢ = β₀ + β₁', ok:false},{t:'eᵢ = Yᵢ + Ŷᵢ', ok:false}],
      explain:'Residuo = observado − estimado.', correctText:'eᵢ = Yᵢ − Ŷᵢ' },
    { type:'fill', topic:'rg_modelo', prompt:'El supuesto de varianza constante de los errores se llama ______.',
      accept:['homocedasticidad','homocedasticidad'], correctText:'homocedasticidad' },
    { type:'tf', topic:'rg_modelo', prompt:'Para la inferencia se supone εᵢ ~ N(0, σ²) (errores normales, media 0 y varianza constante).',
      answer:true, explain:'Normalidad de los errores con E(εᵢ)=0 y Var(εᵢ)=σ².', correctText:'Verdadero' }
  ]);
}
function buildRG4(){   // Mínimos cuadrados
  return rgShuffle([ qRegMedia(), qRegMedia(), qRegSuma(), qRegSxx(), qRegSxx(), qRegPendiente(), qRegPendiente(), qRegIntercepto(), qRegIntercepto(),
    { type:'order', topic:'rg_minimos', prompt:'Ordena la derivación de mínimos cuadrados:',
      stepsList:['Escribir S(β₀,β₁)=Σ[Yᵢ−(β₀+β₁Xᵢ)]²','Derivar respecto de β₀ e igualar a 0','Derivar respecto de β₁ e igualar a 0','Obtener las ecuaciones normales','Despejar β̂₁ = Sxy/Sxx','Despejar β̂₀ = Ȳ − β̂₁X̄'],
      correctText:'Función → ∂/∂β₀=0 → ∂/∂β₁=0 → ecuaciones normales → β̂₁ → β̂₀' },
    { type:'fill', topic:'rg_minimos', prompt:'El método de mínimos cuadrados minimiza la suma de los ______ al cuadrado.',
      accept:['residuos','errores','residuales'], correctText:'residuos' } ]);
}
function buildRG5(){   // Ajuste, predicción y residuos
  return rgShuffle([ qRegPredict(), qRegPredict(), qRegResiduo(), qRegResiduo(),
    { type:'tf', topic:'rg_ajuste', prompt:'Una propiedad de mínimos cuadrados es que Σeᵢ = 0 (los residuos suman cero).',
      answer:true, explain:'Σeᵢ=0 y ē=0; además ΣeᵢXᵢ=0 y la recta pasa por (X̄,Ȳ).', correctText:'Verdadero' },
    { type:'mc', topic:'rg_ajuste', prompt:'Predecir Y para un X <b>fuera</b> del rango observado se llama:',
      options:[{t:'Extrapolación (riesgosa)', ok:true},{t:'Interpolación', ok:false},{t:'Residuo', ok:false},{t:'Homocedasticidad', ok:false}],
      explain:'Extrapolar fuera del rango es riesgoso; interpolar es dentro del rango.', correctText:'Extrapolación' },
    { type:'fill', topic:'rg_ajuste', prompt:'La recta de mínimos cuadrados siempre pasa por el punto (X̄, ____).',
      accept:['Ȳ','Y barra','media de Y','ybarra'], correctText:'Ȳ' },
    { type:'tf', topic:'rg_ajuste', prompt:'También se cumple ΣeᵢXᵢ = 0.', answer:true,
      explain:'Es una de las ecuaciones normales de mínimos cuadrados.', correctText:'Verdadero' } ]);
}
function buildRG6(){   // Propiedades y distribución de estimadores
  return rgShuffle([ qRegVarPendiente(), qRegVarPendiente(),
    { type:'match', topic:'rg_propiedades', prompt:'Relaciona cada propiedad de un estimador con su definición:',
      pairs:[{l:'Insesgado', r:'E(β̂ⱼ) = βⱼ'},{l:'Eficiente', r:'Menor varianza entre los insesgados'},{l:'Consistente', r:'Se acerca al parámetro al crecer n'},{l:'Suficiente', r:'Concentra la información de la muestra'}],
      correctText:'Insesgado=E(β̂)=β, Eficiente=mín. varianza, Consistente=n→∞, Suficiente=información' },
    { type:'mc', topic:'rg_propiedades', prompt:'La distribución de la pendiente bajo errores normales es:',
      options:[{t:'β̂₁ ~ N(β₁, σ²/Sxx)', ok:true},{t:'β̂₁ ~ N(0, 1)', ok:false},{t:'β̂₁ ~ Poisson(σ²)', ok:false},{t:'β̂₁ ~ Uniforme', ok:false}],
      explain:'β̂₁ ~ N(β₁, σ²/Sxx), con Sxx=Σ(Xᵢ−X̄)².', correctText:'β̂₁ ~ N(β₁, σ²/Sxx)' },
    { type:'fill', topic:'rg_propiedades', prompt:'La varianza de la pendiente es Var(β̂₁) = σ²/____ .',
      accept:['Sxx','sxx','S_xx'], correctText:'Sxx' },
    { type:'tf', topic:'rg_propiedades', prompt:'Un estimador insesgado cumple E(β̂ⱼ) = βⱼ.',
      answer:true, explain:'Insesgadez: su valor esperado es el parámetro verdadero.', correctText:'Verdadero' } ]);
}
function buildRG7(){   // σ² e inferencia
  return rgShuffle([ qRegSigma2(), qRegSigma2(), qRegT(), qRegT(), qRegCISlope(), qRegCISlope(),
    { type:'mc', topic:'rg_inferencia', prompt:'En la prueba H₀: β₁=0 vs H₁: β₁≠0, si se <b>rechaza</b> H₀:',
      options:[{t:'Hay evidencia estadística de relación lineal', ok:true},{t:'Se demuestra causalidad', ok:false},{t:'No hay relación', ok:false},{t:'El R² es 0', ok:false}],
      explain:'Rechazar H₀ indica relación lineal significativa, pero asociación ≠ causalidad.', correctText:'Evidencia de relación lineal' },
    { type:'fill', topic:'rg_inferencia', prompt:'Los grados de libertad para la inferencia sobre la pendiente son n − ____ .',
      accept:['2','dos'], correctText:'2' },
    { type:'tf', topic:'rg_inferencia', prompt:'Encontrar una relación lineal significativa demuestra que X causa Y.',
      answer:false, explain:'La asociación estadística no implica causalidad.', correctText:'Falso' } ]);
}
function buildRG8(){   // Respuesta media vs predicción
  return rgShuffle([ qRegCIMean(), qRegCIMean(), qRegPI(), qRegPI(),
    { type:'mc', topic:'rg_prediccion', prompt:'¿Cuál intervalo es normalmente <b>más ancho</b>?',
      options:[{t:'El de predicción de una nueva observación', ok:true},{t:'El de la respuesta media', ok:false},{t:'Siempre son iguales', ok:false},{t:'Ninguno tiene amplitud', ok:false}],
      explain:'El de predicción añade el término +1 dentro de la raíz ⇒ es más ancho.', correctText:'El de predicción individual' },
    { type:'tf', topic:'rg_prediccion', prompt:'La amplitud de los intervalos aumenta al alejarse x₀ de X̄.',
      answer:true, explain:'El término (x₀−X̄)²/Sxx crece al alejarse de la media.', correctText:'Verdadero' },
    { type:'mc', topic:'rg_prediccion', prompt:'La diferencia entre el intervalo de predicción y el de la media es:',
      options:[{t:'Un término adicional «+1» dentro de la raíz', ok:true},{t:'Cambiar t por z', ok:false},{t:'Usar n−1 en vez de n−2', ok:false},{t:'No hay diferencia', ok:false}],
      explain:'Predicción: √(1 + 1/n + (x₀−X̄)²/Sxx); media: √(1/n + (x₀−X̄)²/Sxx).', correctText:'El «+1» dentro de la raíz' } ]);
}
function buildRG9(){   // ANOVA y R²
  return rgShuffle([ qRegSCT(), qRegSCR(), qRegSCE(), qRegSCE(), qRegR2(), qRegR2(), qRegCISigma(),
    { type:'fill', topic:'rg_anova', prompt:'La identidad de la variabilidad es SCT = SCR + ____ .',
      accept:['SCE','sce'], correctText:'SCE' },
    { type:'mc', topic:'rg_anova', prompt:'Un R² = 0.88 se interpreta como:',
      options:[{t:'El modelo explica el 88% de la variabilidad de Y', ok:true},{t:'El 88% de las observaciones son correctas', ok:false},{t:'Existe causalidad del 88%', ok:false},{t:'El error es del 88%', ok:false}],
      explain:'R² = proporción de variabilidad de Y explicada por el modelo. No es % de aciertos ni causalidad.', correctText:'Explica el 88% de la variabilidad de Y' },
    { type:'tf', topic:'rg_anova', prompt:'Un R² alto por sí solo garantiza que el modelo es válido.',
      answer:false, explain:'Un R² alto no garantiza validez ni causalidad; hay que revisar supuestos.', correctText:'Falso' } ]);
}

/* ---- Lecciones ---- */
const LESSON_RG_MODELO = { title:'📊 Modelo de regresión lineal simple', html:
  '<p>Modelo poblacional: <b>Yᵢ = β₀ + β₁Xᵢ + εᵢ</b>. Recta estimada: <b>Ŷᵢ = β̂₀ + β̂₁Xᵢ</b>.</p>'
  +'<ul><li><b>β₀</b>: ordenada al origen (valor esperado de Y cuando X=0, si tiene sentido).</li>'
  +'<li><b>β₁</b>: pendiente (cambio promedio de Y por unidad de X).</li>'
  +'<li><b>εᵢ</b>: error aleatorio; <b>eᵢ = Yᵢ − Ŷᵢ</b>: residuo.</li></ul>'
  +'<p>Supuestos: E(εᵢ)=0, Var(εᵢ)=σ² constante (homocedasticidad), Cov(εᵢ,εⱼ)=0 y, para inferencia, εᵢ ~ N(0,σ²).</p>' };
const LESSON_RG_MINIMOS = { title:'📐 Mínimos cuadrados', html:
  '<p>Se minimiza <b>S(β₀,β₁) = Σ[Yᵢ − (β₀+β₁Xᵢ)]²</b>. Derivando e igualando a cero se obtienen las ecuaciones normales y:</p>'
  +'<p style="text-align:center"><b>β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx</b></p>'
  +'<p style="text-align:center"><b>β̂₀ = Ȳ − β̂₁X̄</b></p>'
  +'<p>Forma equivalente: β̂₁ = [nΣXY − (ΣX)(ΣY)] / [nΣX² − (ΣX)²]. Conviene armar una <b>tabla auxiliar</b> con ΣX, ΣY, ΣX², ΣXY.</p>' };
const LESSON_RG_ANOVA = { title:'📈 Variabilidad, ANOVA y R²', html:
  '<p>Descomposición de la variabilidad:</p>'
  +'<ul><li>Total: <b>SCT = Σ(Yᵢ−Ȳ)²</b></li><li>Error: <b>SCE = Σ(Yᵢ−Ŷᵢ)²</b></li><li>Regresión: <b>SCR = Σ(Ŷᵢ−Ȳ)²</b></li></ul>'
  +'<p style="text-align:center"><b>SCT = SCR + SCE</b> &nbsp;·&nbsp; <b>R² = SCR/SCT = 1 − SCE/SCT</b></p>'
  +'<p>R² es la proporción de variabilidad de Y explicada por el modelo. Un R² alto no prueba causalidad ni garantiza, por sí solo, un buen modelo.</p>' };

/* ---- Módulos de la materia ---- */
const MODULES_REG = [
  {id:0, icon:'📊', name:'Introducción a la regresión', desc:'Descriptiva/inferencial/predictiva, variables X e Y y tipos de regresión.', kind:'Quiz mixto', build:buildRG1},
  {id:1, icon:'🧭', name:'Construcción de un modelo', desc:'Recolección, calidad de datos, dispersión, ajuste, diagnóstico y sobreajuste.', kind:'Ordenar y decidir', build:buildRG2},
  {id:2, icon:'📈', name:'Regresión lineal simple', desc:'Yᵢ=β₀+β₁Xᵢ+εᵢ, interpretación de pendiente/intercepto y supuestos.', kind:'Quiz mixto', lesson:LESSON_RG_MODELO, build:buildRG3},
  {id:3, icon:'📐', name:'Mínimos cuadrados', desc:'Tabla auxiliar, Sxx, Sxy y estimadores β̂₀, β̂₁.', kind:'Ejercicios ilimitados', lesson:LESSON_RG_MINIMOS, build:buildRG4},
  {id:4, icon:'📉', name:'Ajuste, predicción y residuos', desc:'Ŷ, eᵢ, propiedades (Σeᵢ=0), interpolación vs. extrapolación.', kind:'Ejercicios ilimitados', build:buildRG5},
  {id:5, icon:'🎯', name:'Propiedades de los estimadores', desc:'Insesgado/eficiente/consistente/suficiente y distribución de β̂.', kind:'Quiz + cálculo', build:buildRG6},
  {id:6, icon:'🔬', name:'σ² e inferencia', desc:'σ̂²=SCE/(n−2), error estándar, IC y prueba t sobre la pendiente.', kind:'Ejercicios ilimitados', build:buildRG7},
  {id:7, icon:'📏', name:'Respuesta media y predicción', desc:'IC para E(Y|x₀) vs. intervalo de predicción individual.', kind:'Constructor de intervalos', build:buildRG8},
  {id:8, icon:'🧮', name:'Variabilidad, ANOVA y R²', desc:'SCT=SCR+SCE, R² y IC para σ². Caso integrador.', kind:'Ejercicios + caso', lesson:LESSON_RG_ANOVA, build:buildRG9}
];
const TOPIC_NAMES_REG = {
  rg_intro:'Introducción', rg_proceso:'Construcción del modelo', rg_modelo:'Modelo lineal', rg_minimos:'Mínimos cuadrados',
  rg_ajuste:'Ajuste y residuos', rg_propiedades:'Propiedades de estimadores', rg_inferencia:'Inferencia', rg_prediccion:'Predicción', rg_anova:'ANOVA y R²'
};
/* Examen diario de Regresión: mezcla de preguntas de los módulos */
function buildExamReg(){
  const pool = [];
  MODULES_REG.forEach(m => { if(m.build){ try{ pool.push(...m.build()); }catch(e){} } });
  return rgShuffle(pool).slice(0, 12);
}
Object.assign(TOPIC_NAMES, TOPIC_NAMES_REG);
/* Estructura reservada para el Repaso Examen con preguntas reales (aún sin poblar) */
const EXAM_REVIEWS_BY_SUBJECT = {
  'modelos-regresion': { pending:true, subject:'modelos-regresion', originals:[] /* {parcial, enunciado, datos, respuesta, procedimiento, tema, dificultad, tipo, variaciones, fijos, fuente, fecha} */ }
};

/* ==================== Estadística No Paramétrica (materia "estadistica-no-parametrica") ====================
   Fiel al cuaderno: fundamentos, función empírica/Glivenko-Cantelli, KS/Lilliefors,
   χ² bondad de ajuste, proporciones/binomial exacta, cuantiles/signos, McNemar,
   Cox-Stuart, Spearman y Mann-Whitney. Sin pruebas no desarrolladas (Wilcoxon,
   Kruskal-Wallis, Friedman, Kendall, rachas, etc. quedan solo como nombres).
   Reutiliza peR/peComb (redondeo y combinaciones) y ri/pick/shuffle. */
const npRi = ri, npPick = pick, npShuffle = shuffle;
/* Φ normal estándar (erf de Abramowitz-Stegun 7.1.26) */
function npErf(x){ const s=x<0?-1:1; x=Math.abs(x); const t=1/(1+0.3275911*x);
  const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return s*y; }
const npPhi = z => 0.5*(1+npErf(z/Math.SQRT2));
const npBinPmf = (n,k,p) => peComb(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);
const npBinTailGe = (n,x,p) => { let s=0; for(let k=x;k<=n;k++) s+=npBinPmf(n,k,p); return s; };
const npBinTailLe = (n,x,p) => { let s=0; for(let k=0;k<=x;k++) s+=npBinPmf(n,k,p); return s; };
/* D de Kolmogórov-Smirnov con Fn(xi)=i/n (convención del cuaderno) */
function npKsD(data, F){ const x=[...data].sort((a,b)=>a-b); const n=x.length; let D=0, at=x[0];
  x.forEach((xi,i)=>{ const d=Math.abs((i+1)/n - F(xi)); if(d>D){ D=d; at=xi; } }); return {D, at}; }
/* Rangos con promedio en empates */
function npRanks(arr){ const idx=arr.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]); const r=new Array(arr.length); let i=0;
  while(i<idx.length){ let j=i; while(j+1<idx.length && idx[j+1][0]===idx[i][0]) j++;
    const avg=(i+j+2)/2; for(let k=i;k<=j;k++) r[idx[k][1]]=avg; i=j+1; } return r; }
function npSpearman(X,Y){ const rx=npRanks(X), ry=npRanks(Y), n=X.length;
  const d2=rx.reduce((a,r,i)=>a+(r-ry[i])*(r-ry[i]),0); return {rho:1-6*d2/(n*(n*n-1)), d2, n, rx, ry}; }
function npMannWhitney(A,B){ const all=A.map(v=>['A',v]).concat(B.map(v=>['B',v])); const ranks=npRanks(all.map(x=>x[1]));
  let R1=0; all.forEach((x,i)=>{ if(x[0]==='A') R1+=ranks[i]; }); const n1=A.length,n2=B.length;
  const U1=n1*n2+n1*(n1+1)/2-R1, U2=n1*n2-U1; return {R1,U1,U2,U:Math.min(U1,U2),n1,n2}; }
const npMag = r => { r=Math.abs(r); return r<0.1?'prácticamente ninguna':r<0.3?'baja':r<0.5?'media':r<0.7?'alta':'muy alta'; };

/* ============ M1: Fundamentos ============ */
function buildNP1(){
  const scen = npShuffle([
    {t:'El tipo de sangre (A, B, AB, O)', a:'nominal'},
    {t:'El nivel de satisfacción (bajo, medio, alto)', a:'ordinal'},
    {t:'El monto exacto de un siniestro en pesos', a:'cuantitativo'}
  ])[0];
  const nombres={nominal:'Nominal',ordinal:'Ordinal',cuantitativo:'Cuantitativo'};
  return npShuffle([
    { type:'mc', topic:'np_fund', prompt:'¿Cuándo conviene una prueba <b>no paramétrica</b> en vez de una paramétrica?',
      options:[{t:'Con muestras pequeñas, datos ordinales o cuando no se cumple la normalidad', ok:true},
        {t:'Siempre que haya muchos datos y sean normales', ok:false},
        {t:'Solo cuando la varianza es conocida', ok:false},
        {t:'Únicamente para datos perfectamente normales', ok:false}],
      explain:'Las no paramétricas exigen menos supuestos sobre la distribución poblacional; útiles con muestras pequeñas, datos ordinales/nominales o distribuciones asimétricas.', correctText:'Muestras pequeñas / ordinales / sin normalidad' },
    { type:'tf', topic:'np_fund', prompt:'«No paramétrico» significa que la prueba <b>no tiene ningún supuesto</b>.',
      answer:false, explain:'No es ausencia total de supuestos: se requieren <i>menos</i> supuestos sobre la distribución poblacional.', correctText:'Falso' },
    { type:'mc', topic:'np_fund', prompt:'Clasifica el dato: «'+scen.t+'».',
      options: npShuffle(Object.entries(nombres).map(([k,v])=>({t:v, ok:k===scen.a}))),
      explain:'Es un dato de tipo '+nombres[scen.a]+'.', correctText:nombres[scen.a] },
    { type:'mc', topic:'np_fund', prompt:'El <b>error tipo I</b> consiste en:',
      options:[{t:'Rechazar H₀ siendo verdadera', ok:true},{t:'No rechazar H₀ siendo falsa', ok:false},
        {t:'Aceptar H₁ siendo verdadera', ok:false},{t:'Calcular mal la media', ok:false}],
      explain:'Error tipo I: rechazar H₀ cuando es verdadera (su probabilidad es α). Tipo II: no rechazar H₀ siendo falsa.', correctText:'Rechazar H₀ verdadera' },
    { type:'match', topic:'np_fund', prompt:'Relaciona cada concepto:',
      pairs:[{l:'α', r:'Nivel de significancia / P(error I)'},{l:'Error II', r:'No rechazar H₀ siendo falsa'},
        {l:'Región crítica', r:'Valores que llevan a rechazar H₀'},{l:'H₀', r:'Hipótesis nula'}],
      correctText:'α=signif., ErrorII=no rechazar H₀ falsa, R.crítica=rechazo, H₀=nula' },
    { type:'tf', topic:'np_fund', prompt:'La probabilidad del error tipo I es el nivel de significancia α.',
      answer:true, explain:'α = P(rechazar H₀ | H₀ verdadera).', correctText:'Verdadero' }
  ]);
}

/* ============ M2: Función empírica y Glivenko-Cantelli ============ */
function qFn(){
  const n = npPick([4,5,6]); const data=[]; let cur=npRi(1,4);
  for(let i=0;i<n;i++){ cur+=npRi(1,4); data.push(cur); }
  const x0 = data[npRi(1,n-2)] + (npPick([0,1])); // punto dentro del rango
  const cnt = data.filter(v=>v<=x0).length; const fn=cnt/n;
  return { type:'numeric', topic:'np_empirica', tol:0.001,
    prompt:'Para la muestra ordenada {'+data.join(', ')+'}, calcula la función de distribución empírica <b>Fₙ('+x0+')</b>.',
    answer:fn, correctText:peR(fn,4).toString(),
    explain:'Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ x): cuenta cuántos datos son ≤ x y divide entre n.',
    steps:['Observaciones ≤ '+x0+': '+cnt, 'n = '+n, 'Fₙ('+x0+') = '+cnt+'/'+n+' = '+peR(fn,4)] };
}
function buildNP2(){
  return npShuffle([ qFn(), qFn(),
    { type:'fill', topic:'np_empirica', prompt:'La función de distribución empírica es Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ ____ ).',
      accept:['x'], correctText:'x' },
    { type:'mc', topic:'np_empirica', prompt:'Para la muestra 3, 5, 7, 8, ¿cuánto vale Fₙ(6)?',
      options:[{t:'2/4 = 0.5', ok:true},{t:'3/4 = 0.75', ok:false},{t:'1/4 = 0.25', ok:false},{t:'6/4 = 1.5', ok:false}],
      explain:'Hay 2 datos ≤ 6 (el 3 y el 5): Fₙ(6)=2/4=0.5 ⇒ 50% de los datos son ≤ 6.', correctText:'2/4 = 0.5' },
    { type:'mc', topic:'np_empirica', prompt:'El teorema de <b>Glivenko-Cantelli</b> afirma que:',
      options:[{t:'sup|Fₙ(x) − F(x)| → 0 cuando n → ∞', ok:true},{t:'La media muestral → μ', ok:false},
        {t:'La suma estandarizada → Normal', ok:false},{t:'La varianza siempre es 0', ok:false}],
      explain:'Glivenko-Cantelli: la distribución empírica converge <i>uniformemente</i> a la verdadera. (La LGN es sobre la media; el TCL, sobre la suma estandarizada.)', correctText:'sup|Fₙ−F| → 0' },
    { type:'match', topic:'np_empirica', prompt:'Relaciona cada teorema con su convergencia:',
      pairs:[{l:'Glivenko-Cantelli', r:'Fₙ → F uniformemente'},{l:'Ley Grandes Números', r:'media muestral → μ'},{l:'Teorema Central del Límite', r:'suma estandarizada → Normal'}],
      correctText:'GC=Fₙ→F, LGN=media→μ, TCL=→Normal' },
    { type:'order', topic:'np_empirica', prompt:'Ordena los pasos para construir Fₙ(x):',
      stepsList:['Ordenar los datos de menor a mayor','Para cada x, contar cuántas observaciones son ≤ x','Dividir ese conteo entre n','Graficar la escalera resultante'],
      correctText:'Ordenar → contar ≤ x → dividir entre n → graficar' } ]);
}

/* ============ M3: Kolmogórov-Smirnov y Lilliefors ============ */
function qKSuniform(){
  const n = npPick([6,7,8]); const data=[]; for(let i=0;i<n;i++) data.push(peR(npRi(2,98)/100,2));
  data.sort((a,b)=>a-b); const {D,at}=npKsD(data, x=>x);
  return { type:'numeric', topic:'np_ks', tol:0.01,
    prompt:'Prueba KS de bondad de ajuste a <b>U(0,1)</b>. Datos ordenados: {'+data.join(', ')+'}. Con Fₙ(xᵢ)=i/n y F(x)=x, calcula <b>D = máx|Fₙ(xᵢ)−F(xᵢ)|</b>.',
    answer:D, correctText:peR(D,4).toString(),
    explain:'Para la Uniforme(0,1), F(xᵢ)=xᵢ. Se calcula |i/n − xᵢ| en cada punto y se toma el máximo.',
    steps:['En cada xᵢ: |i/n − xᵢ|', 'El máximo ocurre en x = '+at, 'D = '+peR(D,4)] };
}
function qKSnormal(){
  const mu = npPick([50,80,100,18]); const sd = npPick([5,6,10,4]);
  const n = npPick([6,8]); const data=[]; for(let i=0;i<n;i++) data.push(mu + Math.round((npRi(-18,18)/10)*sd));
  data.sort((a,b)=>a-b); const {D,at}=npKsD(data, x=>npPhi((x-mu)/sd));
  return { type:'numeric', topic:'np_ks', tol:0.015,
    prompt:'Prueba KS de ajuste a <b>N('+mu+','+sd+')</b> (parámetros conocidos). Datos: {'+data.join(', ')+'}. Usa z=(xᵢ−μ)/σ y F(xᵢ)=Φ(z). Calcula <b>D = máx|i/n − F(xᵢ)|</b>.',
    answer:D, correctText:peR(D,4).toString(),
    explain:'Con parámetros conocidos se estandariza z=(xᵢ−μ)/σ y se usa la tabla normal para F(xᵢ)=Φ(z); D es la mayor diferencia con i/n.',
    steps:['Para cada xᵢ: z=(xᵢ−'+mu+')/'+sd+', F(xᵢ)=Φ(z)', 'Diferencia máxima en x = '+at, 'D = '+peR(D,4)] };
}
function qZscore(){
  const known = npPick([true,false]); const mu = npPick([80,50,18]); const sd = npPick([6,4,10]);
  const xi = mu + npPick([-1,1])*npRi(1,2)*sd/2;
  const z = (xi-mu)/sd;
  return { type:'numeric', topic:'np_ks', tol:0.02,
    prompt:'Para estandarizar en KS'+(known?' (parámetros conocidos)':' (parámetros estimados con x̄ y s)')+', calcula <b>z = (xᵢ − '+(known?'μ':'x̄')+')/'+(known?'σ':'s')+'</b> con xᵢ='+xi+', '+(known?'μ':'x̄')+'='+mu+' y '+(known?'σ':'s')+'='+sd+'.',
    answer:z, correctText:peR(z,4).toString(),
    explain:'z=(xᵢ−centro)/dispersión. Con parámetros conocidos se usa μ,σ; si se estiman con la muestra, x̄,s (y la tabla de Lilliefors).',
    steps:['z = ('+xi+' − '+mu+')/'+sd+' = '+peR(z,4)] };
}
function buildNP3(){
  return npShuffle([ qKSuniform(), qKSuniform(), qKSnormal(), qKSnormal(), qZscore(), qZscore(),
    { type:'mc', topic:'np_ks', prompt:'Si la media y la desviación se <b>estiman con la propia muestra</b>, ¿qué tabla de valores críticos se usa?',
      options:[{t:'La de Lilliefors', ok:true},{t:'La de Kolmogórov-Smirnov estándar', ok:false},{t:'La χ² con gl=n', ok:false},{t:'La t de Student', ok:false}],
      explain:'Al estimar parámetros con la muestra se usa Lilliefors (no la tabla KS estándar).', correctText:'La de Lilliefors' },
    { type:'order', topic:'np_ks', prompt:'Ordena el procedimiento de la prueba KS:',
      stepsList:['Plantear H₀ (sigue la distribución) y H₁','Ordenar los datos','Calcular Fₙ(xᵢ)=i/n','Calcular F(xᵢ) teórica','Obtener |Fₙ(xᵢ)−F(xᵢ)| y tomar el máximo D','Comparar D con el valor crítico y concluir'],
      correctText:'H₀/H₁ → ordenar → Fₙ → F → máx|dif|=D → comparar' },
    { type:'tf', topic:'np_ks', prompt:'En KS, H₀ afirma que los datos <b>sí</b> provienen de la distribución propuesta.',
      answer:true, explain:'H₀: los datos siguen la distribución; H₁: no la siguen.', correctText:'Verdadero' } ]);
}

/* ============ M4: χ² bondad de ajuste ============ */
function qChiLambda(){
  const n = npPick([20,24,25,30]); const data=[]; let sum=0;
  for(let i=0;i<n;i++){ const t=npRi(1,60); data.push(t); sum+=t; }
  const lam = n/sum;
  return { type:'numeric', topic:'np_chi', tol:0.0005,
    prompt:'Para ajustar una <b>exponencial</b> a una muestra de tiempos con n='+n+' y Σtᵢ='+sum+', estima <b>λ̂ = n / Σtᵢ</b>.',
    answer:lam, correctText:peR(lam,6).toString(),
    explain:'El estimador de máxima verosimilitud de la exponencial es λ̂ = n/Σtᵢ.',
    steps:['λ̂ = n/Σtᵢ = '+n+'/'+sum+' = '+peR(lam,6)] };
}
function qChiGL(){
  const k = npPick([4,5,6]); const p = npPick([0,1,2]);
  const gl = k-p-1;
  return { type:'numeric', topic:'np_chi', tol:0.001,
    prompt:'En una prueba χ² de bondad de ajuste con <b>k='+k+'</b> clases y <b>p='+p+'</b> parámetro(s) estimado(s), ¿cuántos <b>grados de libertad</b> hay? (gl = k − p − 1)',
    answer:gl, correctText:gl.toString(),
    explain:'gl = k − p − 1.',
    steps:['gl = k − p − 1 = '+k+' − '+p+' − 1 = '+gl] };
}
function qChiStat(){
  const k = 4; const E = npPick([5,6,8,10]); const O=[]; let rem=E*k;
  for(let i=0;i<k-1;i++){ const o=Math.max(0,E+npRi(-3,3)); O.push(o); rem-=o; } O.push(Math.max(0,rem));
  const chi = O.reduce((a,o)=>a+(o-E)*(o-E)/E,0);
  return { type:'numeric', topic:'np_chi', tol:0.02,
    prompt:'Con frecuencias esperadas Eᵢ='+E+' en las '+k+' clases y observadas Oᵢ = ['+O.join(', ')+'], calcula <b>χ² = Σ(Oᵢ−Eᵢ)²/Eᵢ</b>.',
    answer:chi, correctText:peR(chi,4).toString(),
    explain:'χ² suma, en cada clase, (Oᵢ−Eᵢ)²/Eᵢ.',
    steps:[O.map(o=>'('+o+'−'+E+')²/'+E).join(' + '), '= '+peR(chi,4)] };
}
function buildNP4(){
  return npShuffle([ qChiLambda(), qChiLambda(), qChiGL(), qChiGL(), qChiStat(), qChiStat(),
    { type:'match', topic:'np_chi', prompt:'Relaciona los símbolos de la prueba χ²:',
      pairs:[{l:'Oᵢ', r:'Frecuencia observada'},{l:'Eᵢ', r:'Frecuencia esperada'},{l:'k', r:'Número de clases'},{l:'gl', r:'k − p − 1'}],
      correctText:'O=observada, E=esperada, k=clases, gl=k−p−1' },
    { type:'tf', topic:'np_chi', prompt:'Para la exponencial, F(t) = 1 − e^(−λt).',
      answer:true, explain:'Es la función de distribución de la exponencial.', correctText:'Verdadero' },
    { type:'order', topic:'np_chi', prompt:'Ordena la prueba χ² de bondad de ajuste:',
      stepsList:['Proponer una distribución y estimar parámetros si hace falta','Formar clases (aquí, con probabilidades iguales)','Calcular las frecuencias esperadas Eᵢ','Contar las observadas Oᵢ','Sumar χ²=Σ(Oᵢ−Eᵢ)²/Eᵢ','Comparar con el valor crítico y concluir'],
      correctText:'Proponer → clases → Eᵢ → Oᵢ → χ² → concluir' } ]);
}

/* ============ M5: Proporciones y binomial exacta ============ */
function qPropZ(){
  const n = npPick([80,100,120,150]); const p0 = npPick([0.10,0.20,0.30,0.50]);
  const x = Math.round(p0*n) + npPick([-1,1])*npRi(2,8); const phat=x/n;
  const z = (phat-p0)/Math.sqrt(p0*(1-p0)/n);
  return { type:'numeric', topic:'np_prop', tol:0.02,
    prompt:'Prueba de proporción: n='+n+', x='+x+' éxitos, H₀: p=p₀='+p0+'. Calcula el estadístico <b>z = (p̂ − p₀) / √[p₀(1−p₀)/n]</b>. (Bajo H₀ se usa p₀ en el error estándar.)',
    answer:z, correctText:peR(z,4).toString(),
    explain:'Bajo H₀ el error estándar usa p₀ (no p̂): z = (p̂−p₀)/√[p₀(1−p₀)/n].',
    steps:['p̂ = x/n = '+x+'/'+n+' = '+peR(phat,4),
      'EE = √[p₀(1−p₀)/n] = √['+p0+'·'+peR(1-p0,2)+'/'+n+'] = '+peR(Math.sqrt(p0*(1-p0)/n),4),
      'z = ('+peR(phat,4)+' − '+p0+')/'+peR(Math.sqrt(p0*(1-p0)/n),4)+' = '+peR(z,4)] };
}
function qBinExact(){
  const n = npPick([12,15,18,20]); const p0=0.5; const x = npRi(Math.ceil(n*0.6), n-1);
  const tail = npBinTailGe(n,x,p0);
  return { type:'numeric', topic:'np_prop', tol:0.005,
    prompt:'Muestra pequeña: X ~ Bin('+n+', 0.5). Calcula el valor p de cola derecha <b>P(X ≥ '+x+')</b>.',
    answer:tail, correctText:peR(tail,4).toString(),
    explain:'P(X≥x) = Σ_{k=x}^{n} C(n,k) p₀^k (1−p₀)^{n−k}.',
    steps:['P(X≥'+x+') = Σ desde k='+x+' hasta '+n+' de C('+n+',k)·0.5^'+n,
      '= '+peR(tail,4)] };
}
function qPhat(){
  const n = npPick([50,80,100,200]); const x = npRi(5,Math.round(n*0.4));
  return { type:'numeric', topic:'np_prop', tol:0.005,
    prompt:'En una muestra de n='+n+' con x='+x+' defectuosos, calcula la <b>proporción muestral p̂ = x/n</b>.',
    answer:x/n, correctText:peR(x/n,4).toString(),
    explain:'p̂ = X/n.', steps:['p̂ = '+x+'/'+n+' = '+peR(x/n,4)] };
}
function buildNP5(){
  return npShuffle([ qPropZ(), qPropZ(), qBinExact(), qBinExact(), qPhat(),
    { type:'mc', topic:'np_prop', prompt:'¿Cuándo conviene la <b>prueba binomial exacta</b> en vez de la aproximación normal?',
      options:[{t:'Con muestras pequeñas', ok:true},{t:'Con muestras muy grandes', ok:false},{t:'Cuando p₀=0', ok:false},{t:'Nunca', ok:false}],
      explain:'La aproximación normal requiere n grande; con muestras pequeñas se usa la binomial exacta.', correctText:'Con muestras pequeñas' },
    { type:'tf', topic:'np_prop', prompt:'Bajo H₀, el error estándar de la prueba z de proporción usa p₀ (no p̂).',
      answer:true, explain:'Como H₀ fija p=p₀, el error estándar se calcula con p₀.', correctText:'Verdadero' },
    { type:'mc', topic:'np_prop', prompt:'Para una prueba binomial exacta de <b>cola derecha</b>, el valor p es:',
      options:[{t:'P(X ≥ x_obs)', ok:true},{t:'P(X ≤ x_obs)', ok:false},{t:'P(X = x_obs)', ok:false},{t:'1 − p₀', ok:false}],
      explain:'Cola derecha: p = P(X ≥ x_obs). Cola izquierda: P(X ≤ x_obs).', correctText:'P(X ≥ x_obs)' } ]);
}

/* ============ M6: Cuantiles y prueba de los signos ============ */
function qSignos(){
  const n0 = npPick([9,10,11]); const med = npPick([20,50,100]);
  const data=[]; for(let i=0;i<n0;i++){ let v=med+npRi(-6,6); data.push(v); }
  if(!data.includes(med) && npPick([true,false])) data[npRi(0,n0-1)]=med; // a veces con empate
  const ties = data.filter(v=>v===med).length;
  const neff = n0 - ties;
  const less = data.filter(v=>v<med).length;
  const more = data.filter(v=>v>med).length;
  return { type:'numeric', topic:'np_signos', tol:0.001,
    prompt:'Prueba de los signos para la mediana propuesta '+med+'. Datos: {'+data.join(', ')+'}. Tras <b>eliminar los empates</b> con '+med+', ¿cuál es el <b>tamaño efectivo n</b>?',
    answer:neff, correctText:neff.toString(),
    explain:'Se descartan los valores iguales a la mediana propuesta; el tamaño efectivo es n menos los empates.',
    steps:['Empates con '+med+': '+ties, 'Menores: '+less+' · Mayores: '+more, 'n efectivo = '+n0+' − '+ties+' = '+neff] };
}
function qSignBin(){
  const n = npPick([8,9,10]); const x = npRi(0,2);
  const tail = npBinTailLe(n,x,0.5);
  return { type:'numeric', topic:'np_signos', tol:0.005,
    prompt:'En la prueba de los signos, bajo H₀ el número de signos «+» es X ~ Bin('+n+', 0.5). Calcula <b>P(X ≤ '+x+')</b>.',
    answer:tail, correctText:peR(tail,4).toString(),
    explain:'Bajo H₀ (la mediana es la propuesta), cada signo es + o − con probabilidad 0.5.',
    steps:['P(X ≤ '+x+') = Σ desde k=0 hasta '+x+' de C('+n+',k)·0.5^'+n+' = '+peR(tail,4)] };
}
function buildNP6(){
  return npShuffle([ qSignos(), qSignos(), qSignBin(), qSignBin(),
    { type:'tf', topic:'np_signos', prompt:'La prueba de los signos usa solo la <b>dirección</b> (signo) de las diferencias, no su magnitud.',
      answer:true, explain:'Solo importa el signo (+/−); la magnitud se ignora.', correctText:'Verdadero' },
    { type:'mc', topic:'np_signos', prompt:'En datos pareados antes/después, un empate (diferencia = 0) se debe:',
      options:[{t:'Eliminar y reducir el tamaño efectivo', ok:true},{t:'Contar como signo +', ok:false},{t:'Contar como signo −', ok:false},{t:'Duplicar', ok:false}],
      explain:'Los empates se eliminan y n se reduce al tamaño efectivo.', correctText:'Eliminar y reducir n' },
    { type:'fill', topic:'np_signos', prompt:'Bajo H₀, en la prueba de los signos X ~ Bin(n, ____ ).',
      accept:['0.5','.5','1/2','0,5'], correctText:'0.5' },
    { type:'mc', topic:'np_signos', prompt:'El valor que divide la muestra en dos mitades iguales (50% a cada lado) es:',
      options:[{t:'La mediana', ok:true},{t:'La media', ok:false},{t:'La moda', ok:false},{t:'El rango', ok:false}],
      explain:'La mediana es el cuantil 0.5.', correctText:'La mediana' } ]);
}

/* ============ M7: McNemar ============ */
function qMcNemar(){
  const A=npRi(100,400), D=npRi(80,300);
  let B, C;
  const big = npPick([true,false]);
  if(big){ B=npRi(5,20); C=npRi(15,35); if(B+C<20){ C+=20; } }        // B+C>=20 → χ² con Yates
  else { B=npRi(1,8); C=npRi(1,8); if(B+C>=20) C=5; if(B===C) C=B+2; } // B+C<20 → exacta
  const bc=B+C;
  if(bc>=20){
    const chi=Math.pow(Math.abs(B-C)-1,2)/bc;
    return { type:'numeric', topic:'np_mcnemar', tol:0.02,
      prompt:'Prueba de McNemar (datos pareados). Tabla 2×2: A='+A+', B='+B+', C='+C+', D='+D+'. Como B+C='+bc+' ≥ 20, usa χ² con <b>corrección de Yates: (|B−C|−1)²/(B+C)</b>.',
      answer:chi, correctText:peR(chi,4).toString(),
      explain:'Solo los discordantes B y C aportan evidencia. Yates: (|B−C|−1)²/(B+C), con gl=1.',
      steps:['|B−C| = |'+B+'−'+C+'| = '+Math.abs(B-C),
        'χ² = (|B−C|−1)²/(B+C) = ('+Math.abs(B-C)+'−1)²/'+bc+' = '+peR(chi,4)] };
  } else {
    const tail=npBinTailLe(bc, Math.min(B,C), 0.5);
    return { type:'numeric', topic:'np_mcnemar', tol:0.01,
      prompt:'Prueba de McNemar. Discordantes B='+B+', C='+C+' (B+C='+bc+' < 20 ⇒ método <b>exacto</b>). Con X ~ Bin('+bc+', 0.5), calcula P(X ≤ '+Math.min(B,C)+') (cola con el menor de B y C).',
      answer:tail, correctText:peR(tail,4).toString(),
      explain:'Con B+C<20 se usa la binomial exacta sobre los pares discordantes: X ~ Bin(B+C, 0.5).',
      steps:['menor(B,C) = '+Math.min(B,C), 'P(X ≤ '+Math.min(B,C)+') con Bin('+bc+',0.5) = '+peR(tail,4)] };
  }
}
function buildNP7(){
  return npShuffle([ qMcNemar(), qMcNemar(), qMcNemar(),
    { type:'match', topic:'np_mcnemar', prompt:'En la tabla 2×2 de McNemar (antes → después):',
      pairs:[{l:'A', r:'éxito → éxito'},{l:'B', r:'éxito → fracaso'},{l:'C', r:'fracaso → éxito'},{l:'D', r:'fracaso → fracaso'}],
      correctText:'A=éxito/éxito, B=éxito/fracaso, C=fracaso/éxito, D=fracaso/fracaso' },
    { type:'mc', topic:'np_mcnemar', prompt:'¿Qué celdas aportan evidencia sobre el <b>cambio</b> en McNemar?',
      options:[{t:'Solo B y C (los discordantes)', ok:true},{t:'A y D', ok:false},{t:'Todas por igual', ok:false},{t:'Solo A', ok:false}],
      explain:'Los pares concordantes (A, D) no informan sobre el cambio; solo B y C.', correctText:'Solo B y C' },
    { type:'tf', topic:'np_mcnemar', prompt:'Con B+C < 20 se prefiere el método exacto (binomial); con B+C ≥ 20, la χ² (con corrección de Yates).',
      answer:true, explain:'Esa es la regla de decisión del método.', correctText:'Verdadero' },
    { type:'fill', topic:'np_mcnemar', prompt:'Los grados de libertad de la χ² de McNemar son ____ .',
      accept:['1','uno'], correctText:'1' } ]);
}

/* ============ M8: Cox-Stuart ============ */
function qCox(){
  const trend = npPick(['dec','inc']); const m = npPick([5,6]); const N=2*m;
  const serie=[]; let base=npRi(50,90);
  for(let i=0;i<N;i++){ base += (trend==='dec'? -npRi(1,5) : npRi(1,5)); serie.push(base); }
  // parejas (i, i+m); signo de segunda-primera
  let pos=0, neg=0;
  for(let i=0;i<m;i++){ const d=serie[i+m]-serie[i]; if(d>0) pos++; else if(d<0) neg++; }
  const C=pos+neg;
  const k = trend==='dec'? pos : neg;             // signos a favor de "no tendencia" en la cola
  const tail = npBinTailLe(C, Math.min(pos,neg), 0.5);
  return { type:'numeric', topic:'np_cox', tol:0.005,
    prompt:'Prueba de Cox-Stuart de tendencia. Serie cronológica: {'+serie.join(', ')+'}. Se forman '+m+' parejas (xᵢ, xᵢ₊'+m+'). Con C='+C+' parejas efectivas y T ~ Bin('+C+', 0.5), calcula P(T ≤ '+Math.min(pos,neg)+') (cola del menor número de signos).',
    answer:tail, correctText:peR(tail,4).toString(),
    explain:'Se comparan las dos mitades formando parejas; el signo indica aumento/disminución. Bajo H₀ (sin tendencia), T ~ Bin(C, 0.5).',
    steps:['Signos +: '+pos+' · signos −: '+neg+' · C = '+C, 'menor = '+Math.min(pos,neg), 'P(T ≤ '+Math.min(pos,neg)+') con Bin('+C+',0.5) = '+peR(tail,4)] };
}
function buildNP8(){
  return npShuffle([ qCox(), qCox(),
    { type:'order', topic:'np_cox', prompt:'Ordena la prueba de Cox-Stuart:',
      stepsList:['Conservar el orden temporal','Si n es impar, eliminar la observación central','Dividir la serie en dos mitades y formar parejas','Calcular el signo de cada diferencia y eliminar empates','Contar los signos y usar T ~ Bin(C, 0.5)','Construir la región crítica y concluir sobre la tendencia'],
      correctText:'Orden temporal → quitar central → parejas → signos → Bin(C,0.5) → concluir' },
    { type:'mc', topic:'np_cox', prompt:'La prueba de Cox-Stuart sirve para detectar:',
      options:[{t:'Una tendencia creciente o decreciente en el tiempo', ok:true},{t:'Diferencia entre dos grupos independientes', ok:false},{t:'Normalidad', ok:false},{t:'Asociación entre rangos', ok:false}],
      explain:'Cox-Stuart detecta tendencia en una serie ordenada cronológicamente.', correctText:'Tendencia en el tiempo' },
    { type:'numeric', topic:'np_cox', tol:0.0001,
      prompt:'Si las 6 parejas de Cox-Stuart muestran todas disminución (0 signos «+»), el valor p de esa cola es P(T ≤ 0) = (0.5)⁶. Calcula ese valor.',
      answer:Math.pow(0.5,6), correctText:'0.015625', explain:'(0.5)⁶ = 1/64 = 0.015625.', steps:['(0.5)⁶ = '+Math.pow(0.5,6)] },
    { type:'tf', topic:'np_cox', prompt:'En Cox-Stuart, si n es impar se elimina la observación <b>central</b> antes de formar las parejas.',
      answer:true, explain:'Así las dos mitades tienen el mismo tamaño.', correctText:'Verdadero' } ]);
}

/* ============ M9: Spearman y Mann-Whitney ============ */
function qSpearman(){
  const n = npPick([6,7,8]); const X=[], Y=[]; let cx=npRi(1,5), cy=npRi(1,5);
  for(let i=0;i<n;i++){ cx+=npRi(1,4); X.push(cx); }
  const desc = npPick([true,false]);
  const Ys = X.map((_,i)=> desc ? (100-2*i+npRi(-1,1)) : (10+2*i+npRi(-1,1)));
  const {rho,d2} = npSpearman(X, Ys);
  return { type:'numeric', topic:'np_rangos', tol:0.02,
    prompt:'Correlación de Spearman con n='+n+' y Σdᵢ²='+d2+' (dᵢ = Rxᵢ − Ryᵢ). Calcula <b>ρs = 1 − 6Σdᵢ² / [n(n²−1)]</b>.',
    answer:rho, correctText:peR(rho,4).toString(),
    explain:'ρs = 1 − 6Σdᵢ²/[n(n²−1)]. Signo + relación creciente, − decreciente.',
    steps:['n(n²−1) = '+n+'·('+n+'²−1) = '+(n*(n*n-1)),
      'ρs = 1 − 6·'+d2+'/'+(n*(n*n-1))+' = '+peR(rho,4)] };
}
function qSpearmanFormula(){
  const cases=[{n:8,d2:168},{n:10,d2:196},{n:6,d2:24},{n:7,d2:40}];
  const c=npPick(cases); const rho=1-6*c.d2/(c.n*(c.n*c.n-1));
  return { type:'numeric', topic:'np_rangos', tol:0.02,
    prompt:'Con n='+c.n+' y Σdᵢ²='+c.d2+', aplica <b>ρs = 1 − 6Σdᵢ²/[n(n²−1)]</b>.',
    answer:rho, correctText:peR(rho,4).toString(),
    explain:'Sustitución directa en la fórmula de Spearman.',
    steps:['ρs = 1 − 6('+c.d2+')/['+c.n+'('+c.n+'²−1)] = 1 − '+(6*c.d2)+'/'+(c.n*(c.n*c.n-1))+' = '+peR(rho,4)] };
}
function qMannWhitneyU(){
  const n1=npPick([4,5]), n2=npPick([4,5]);
  // grupo A menor, grupo B mayor (separables → U extremo, pero variamos)
  const A=[], B=[]; let base=npRi(8,14);
  for(let i=0;i<n1;i++){ base+=npRi(1,3); A.push(base); }
  for(let i=0;i<n2;i++){ base+=npRi(1,3); B.push(base); }
  const {R1,U1,U2,U}=npMannWhitney(A,B);
  return { type:'numeric', topic:'np_rangos', tol:0.01,
    prompt:'Mann-Whitney con Grupo A={'+A.join(', ')+'} (n₁='+n1+') y Grupo B={'+B.join(', ')+'} (n₂='+n2+'). Al ordenar todo, la suma de rangos de A es R₁='+R1+'. Calcula <b>U = mín(U₁, U₂)</b> con U₁=n₁n₂+n₁(n₁+1)/2−R₁ y U₂=n₁n₂−U₁.',
    answer:U, correctText:U.toString(),
    explain:'U₁=n₁n₂+n₁(n₁+1)/2−R₁; U₂=n₁n₂−U₁; U=mín(U₁,U₂). Se rechaza H₀ si U ≤ U_crítico.',
    steps:['U₁ = '+n1+'·'+n2+' + '+n1+'·'+(n1+1)+'/2 − '+R1+' = '+U1,
      'U₂ = '+n1+'·'+n2+' − '+U1+' = '+U2,
      'U = mín('+U1+', '+U2+') = '+U] };
}
function buildNP9(){
  return npShuffle([ qSpearmanFormula(), qSpearmanFormula(), qSpearman(), qMannWhitneyU(), qMannWhitneyU(),
    { type:'mc', topic:'np_rangos', prompt:'Un ρs de Spearman cercano a <b>−1</b> indica:',
      options:[{t:'Asociación monótona decreciente muy fuerte', ok:true},{t:'Ninguna asociación', ok:false},{t:'Asociación creciente', ok:false},{t:'Datos normales', ok:false}],
      explain:'ρs≈−1: relación monótona decreciente muy alta; ≈+1 creciente; ≈0 débil/nula.', correctText:'Decreciente muy fuerte' },
    { type:'mc', topic:'np_rangos', prompt:'La prueba de <b>Mann-Whitney</b> es la alternativa no paramétrica a:',
      options:[{t:'La t de dos muestras independientes', ok:true},{t:'La χ² de bondad de ajuste', ok:false},{t:'La prueba de los signos', ok:false},{t:'Cox-Stuart', ok:false}],
      explain:'Mann-Whitney compara dos grupos independientes sin suponer normalidad.', correctText:'t de dos muestras independientes' },
    { type:'mc', topic:'np_rangos', prompt:'En Mann-Whitney se rechaza H₀ cuando:',
      options:[{t:'U ≤ U_crítico', ok:true},{t:'U ≥ U_crítico', ok:false},{t:'U = n₁n₂', ok:false},{t:'U > 0', ok:false}],
      explain:'Se rechaza H₀ si U ≤ U_crítico (tabla de Mann-Whitney).', correctText:'U ≤ U_crítico' } ]);
}

/* ---- Lecciones ---- */
const LESSON_NP_FUND = { title:'📊 Fundamentos no paramétricos', html:
  '<p>Las pruebas <b>no paramétricas</b> requieren <b>menos supuestos</b> sobre la distribución poblacional (no que no tengan ninguno). Son útiles con muestras pequeñas, datos ordinales o nominales, distribuciones asimétricas o presencia de atípicos (mayor <b>robustez</b>).</p>'
  +'<ul><li><b>H₀</b>: hipótesis nula · <b>H₁</b>: alternativa.</li><li><b>α</b>: nivel de significancia = P(error tipo I).</li>'
  +'<li><b>Error I</b>: rechazar H₀ verdadera. <b>Error II</b>: no rechazar H₀ falsa.</li>'
  +'<li><b>Región crítica</b>: valores del estadístico que llevan a rechazar H₀.</li></ul>' };
const LESSON_NP_EMP = { title:'📈 Función empírica y Glivenko-Cantelli', html:
  '<p>La <b>función de distribución empírica</b> es Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ x): se ordenan los datos, se cuenta cuántos son ≤ x y se divide entre n. Para 3,5,7,8: Fₙ(6)=2/4=0.5 (50% de los datos ≤ 6).</p>'
  +'<p><b>Glivenko-Cantelli</b>: sup|Fₙ(x)−F(x)| → 0 cuando n → ∞ (la empírica converge uniformemente a la verdadera). Se distingue de la LGN (media→μ) y del TCL (suma estandarizada→Normal).</p>' };
const LESSON_NP_KS = { title:'📉 Kolmogórov-Smirnov y Lilliefors', html:
  '<p>Comprueban si una muestra proviene de una distribución propuesta. H₀: los datos siguen la distribución; H₁: no.</p>'
  +'<p style="text-align:center"><b>D = máx|Fₙ(xᵢ) − F(xᵢ)|</b> con Fₙ(xᵢ)=i/n.</p>'
  +'<ul><li>Parámetros <b>conocidos</b>: z=(xᵢ−μ)/σ, tabla KS.</li>'
  +'<li>Parámetros <b>estimados</b> con la muestra: z=(xᵢ−x̄)/s, tabla de <b>Lilliefors</b>.</li></ul>'
  +'<p>Se compara D con D_crítico: si D &gt; D_crítico se rechaza H₀.</p>' };
const LESSON_NP_RANK = { title:'🔢 Spearman y Mann-Whitney', html:
  '<p><b>Spearman</b> mide asociación monótona con rangos: ρs = 1 − 6Σdᵢ²/[n(n²−1)], con dᵢ=Rxᵢ−Ryᵢ. Escala de |ρs|: 0–0.1 ninguna · 0.1–0.3 baja · 0.3–0.5 media · 0.5–0.7 alta · 0.7–1 muy alta.</p>'
  +'<p><b>Mann-Whitney</b> compara dos grupos independientes: U₁=n₁n₂+n₁(n₁+1)/2−R₁, U₂=n₁n₂−U₁, U=mín(U₁,U₂). Se rechaza H₀ si U ≤ U_crítico.</p>' };

/* ---- Módulos ---- */
const MODULES_NP = [
  {id:0, icon:'⚖️', name:'Fundamentos no paramétricos', desc:'Paramétrico vs. no paramétrico, tipos de dato, H₀/H₁, errores I y II.', kind:'Quiz mixto', lesson:LESSON_NP_FUND, build:buildNP1},
  {id:1, icon:'📶', name:'Función empírica y Glivenko-Cantelli', desc:'Fₙ(x)=(1/n)ΣI(Xᵢ≤x) y convergencia uniforme.', kind:'Quiz + cálculo', lesson:LESSON_NP_EMP, build:buildNP2},
  {id:2, icon:'📉', name:'Kolmogórov-Smirnov y Lilliefors', desc:'D=máx|Fₙ−F|, parámetros conocidos vs. estimados.', kind:'Ejercicios ilimitados', lesson:LESSON_NP_KS, build:buildNP3},
  {id:3, icon:'🎲', name:'Bondad de ajuste χ²', desc:'χ²=Σ(Oᵢ−Eᵢ)²/Eᵢ, gl=k−p−1, ajuste exponencial.', kind:'Ejercicios ilimitados', build:buildNP4},
  {id:4, icon:'📊', name:'Proporciones y binomial exacta', desc:'z de proporción (con p₀) y prueba binomial exacta.', kind:'Ejercicios ilimitados', build:buildNP5},
  {id:5, icon:'➕', name:'Cuantiles y prueba de los signos', desc:'Mediana, empates, tamaño efectivo y X~Bin(n,0.5).', kind:'Ejercicios ilimitados', build:buildNP6},
  {id:6, icon:'🔀', name:'Prueba de McNemar', desc:'Tabla 2×2 pareada, discordantes B/C, Yates o exacta.', kind:'Ejercicios + tabla', build:buildNP7},
  {id:7, icon:'📈', name:'Prueba de Cox-Stuart', desc:'Tendencia temporal formando parejas y T~Bin(C,0.5).', kind:'Ejercicios + serie', build:buildNP8},
  {id:8, icon:'🏅', name:'Rangos: Spearman y Mann-Whitney', desc:'ρs de asociación monótona y U de dos grupos.', kind:'Ejercicios + caso', lesson:LESSON_NP_RANK, build:buildNP9}
];
const TOPIC_NAMES_NP = {
  np_fund:'Fundamentos', np_empirica:'Función empírica', np_ks:'KS / Lilliefors', np_chi:'Bondad de ajuste χ²',
  np_prop:'Proporciones / binomial', np_signos:'Cuantiles y signos', np_mcnemar:'McNemar', np_cox:'Cox-Stuart', np_rangos:'Rangos (Spearman/MW)'
};
function buildExamNP(){
  const pool=[]; MODULES_NP.forEach(m=>{ if(m.build){ try{ pool.push(...m.build()); }catch(e){} } });
  return npShuffle(pool).slice(0,12);
}
Object.assign(TOPIC_NAMES, TOPIC_NAMES_NP);
/* Añadir la materia a la estructura reservada de repaso de examen */
EXAM_REVIEWS_BY_SUBJECT['estadistica-no-parametrica'] = { pending:true, subject:'estadistica-no-parametrica', originals:[] };

/* ---- Laboratorio No Paramétrico: selector de prueba ---- */
const NP_TESTS = [
  {id:'ks', name:'Kolmogórov-Smirnov'}, {id:'lillie', name:'Lilliefors'}, {id:'chi', name:'Chi cuadrada de bondad de ajuste'},
  {id:'prop', name:'Prueba de proporciones (z)'}, {id:'binom', name:'Binomial exacta'}, {id:'cuantil', name:'Prueba de cuantiles'},
  {id:'signos', name:'Prueba de los signos'}, {id:'mcnemar', name:'McNemar'}, {id:'cox', name:'Cox-Stuart'},
  {id:'spearman', name:'Spearman'}, {id:'mw', name:'Mann-Whitney'}
];
const NP_SCENARIOS = [
  {m:'ks', s:'Quieres comprobar si una muestra proviene de una N(80,6) con media y desviación <b>conocidas</b>.'},
  {m:'lillie', s:'Quieres comprobar normalidad pero <b>estimas</b> μ y σ con la propia muestra.'},
  {m:'chi', s:'Tienes datos agrupados en clases y comparas frecuencias observadas contra las esperadas de una distribución propuesta.'},
  {m:'prop', s:'En una muestra grande (n=100) pruebas si la proporción de defectuosos es 0.10.'},
  {m:'binom', s:'Con una muestra pequeña (n=20) pruebas si una proporción es 0.5 usando probabilidades exactas.'},
  {m:'cuantil', s:'Quieres probar una afirmación sobre un cuantil poblacional contando cuántos datos quedan por debajo.'},
  {m:'signos', s:'Comparas mediciones antes/después en los mismos sujetos usando solo el signo de la diferencia.'},
  {m:'mcnemar', s:'Datos pareados con respuesta dicotómica (sí/no) antes y después: ¿cambió la proporción?'},
  {m:'cox', s:'Una serie de robos mensuales ordenada en el tiempo: ¿hay tendencia creciente o decreciente?'},
  {m:'spearman', s:'Mides la asociación monótona entre dos variables ordinales mediante sus rangos.'},
  {m:'mw', s:'Comparas dos grupos independientes de asegurados sin suponer normalidad.'}
];
function npLabQuestion(){
  const sc = npPick(NP_SCENARIOS);
  const correct = NP_TESTS.find(t=>t.id===sc.m);
  let distract = npShuffle(NP_TESTS.filter(t=>t.id!==sc.m)).slice(0,3);
  const options = npShuffle([{t:correct.name, ok:true}, ...distract.map(t=>({t:t.name, ok:false}))]);
  return { type:'mc', topic:'np_fund', stage:'lab',
    prompt:'<b>🧪 Laboratorio No Paramétrico.</b> '+sc.s+'<br>¿Qué prueba usarías?',
    options, explain:'La prueba adecuada es: <b>'+correct.name+'</b>.', correctText:correct.name };
}
function startNPLab(){
  if(S.activeSubject!=='estadistica-no-parametrica'){ toast('🧪 El Laboratorio No Paramétrico está en Estadística No Paramétrica.'); sfx('bad'); return; }
  const qs = []; for(let i=0;i<10;i++) qs.push(npLabQuestion());
  startMode({ id:'nplab', title:'🧪 Laboratorio No Paramétrico', icon:'🧪', qs,
    introToast:'🧪 Identifica la prueba correcta para cada escenario.' });
}

/* ==================== Administración Financiera (materia "administracion-financiera") ====================
   Fiel al cuaderno: rentabilidad y apalancamiento, estructura óptima de capital,
   políticas de crédito (Sartoris-Hill), Gallinger + riesgo de insolvencia,
   inventarios/EOQ, descuentos por volumen, flujo libre/CAPM/WACC/DuPont y
   valuación de empresas (una y dos etapas). Sin VPN/TIR/bonos/opciones/etc.
   Reutiliza npPhi (Φ), peR y ri/pick/shuffle (sin duplicar). */
const afRi = ri, afPick = pick, afShuffle = shuffle;
const afR = (x,d=4) => peR(x,d);
const afMoney = x => '$'+peR(x,2).toLocaleString('es-MX');

/* ============ M1: Rentabilidad y apalancamiento ============ */
function qROA(){
  const AT = afPick([2000,2500,3000,4000,5000]); const UO = Math.round(AT*afPick([0.15,0.2,0.25,0.275,0.3]));
  const r = UO/AT;
  return { type:'numeric', topic:'af_rent', tol:0.005,
    prompt:'Una empresa tiene utilidad operativa UO='+afMoney(UO)+' y activos totales A_T='+afMoney(AT)+'. Calcula el <b>retorno sobre activos ROA = UO / A_T</b>.',
    answer:r, correctText:afR(r,4).toString(),
    explain:'ROA = r = UO / A_T.', steps:['ROA = '+UO+' / '+AT+' = '+afR(r,4)] };
}
function qROEdir(){
  const C = afPick([1000,2000,2500,3000]); const UN = Math.round(C*afPick([0.15,0.2,0.2485,0.3]));
  return { type:'numeric', topic:'af_rent', tol:0.005,
    prompt:'Con utilidad neta U_N='+afMoney(UN)+' y capital contable C='+afMoney(C)+', calcula el <b>retorno sobre capital ROE = U_N / C</b>.',
    answer:UN/C, correctText:afR(UN/C,4).toString(),
    explain:'ROE = U_N / C.', steps:['ROE = '+UN+' / '+C+' = '+afR(UN/C,4)] };
}
function qROElev(){
  const r = afPick([0.20,0.25,0.275,0.30]); const i = afPick([0.10,0.115,0.12,0.15]);
  const D = afPick([1000,1500,2000]); const C = afPick([2000,2500,3000]); const t = afPick([0.30,0.35]);
  const roe = (r+(r-i)*(D/C))*(1-t);
  return { type:'numeric', topic:'af_rent', tol:0.005,
    prompt:'Con deuda: <b>ROE = [r + (r−i)(D/C)](1−t)</b>. Con r='+r+', i='+i+', D='+D+', C='+C+' y t='+t+', calcula el ROE.',
    answer:roe, correctText:afR(roe,4).toString(),
    explain:'El apalancamiento amplifica el ROE cuando r>i.',
    steps:['D/C = '+D+'/'+C+' = '+afR(D/C,4),
      'r−i = '+r+'−'+i+' = '+afR(r-i,4),
      'ROE = ['+r+' + '+afR(r-i,4)+'·'+afR(D/C,4)+']·(1−'+t+') = '+afR(roe,4)] };
}
function qUN(){
  const roe = afPick([0.20,0.2485,0.26,0.30]); const C = afPick([1000,2000,2500,3000]);
  return { type:'numeric', topic:'af_rent', tol:1,
    prompt:'Con ROE='+roe+' y capital C='+afMoney(C)+', calcula la <b>utilidad neta U_N = ROE · C</b>.',
    answer:roe*C, correctText:afR(roe*C,2).toString(),
    explain:'U_N = ROE · C.', steps:['U_N = '+roe+' · '+C+' = '+afR(roe*C,2)] };
}
function buildAF1(){
  return afShuffle([ qROA(), qROA(), qROEdir(), qROElev(), qROElev(), qUN(),
    { type:'fill', topic:'af_rent', prompt:'Los activos totales se reparten en A_T = C + ____ .', accept:['D','deuda'], correctText:'D (deuda)' },
    { type:'mc', topic:'af_rent', prompt:'El apalancamiento financiero <b>aumenta</b> el ROE cuando:',
      options:[{t:'r > i (el retorno de activos supera el costo de la deuda)', ok:true},{t:'r < i', ok:false},{t:'D = 0', ok:false},{t:'la tasa de impuestos es 0', ok:false}],
      explain:'Si r>i, endeudarse amplifica el ROE; si r<i, lo reduce (incluso puede volverlo negativo).', correctText:'r > i' },
    { type:'tf', topic:'af_rent', prompt:'La razón D/C representa el nivel de apalancamiento.',
      answer:true, explain:'D/C mide cuánta deuda hay por cada unidad de capital.', correctText:'Verdadero' },
    { type:'mc', topic:'af_rent', prompt:'No debes confundir:',
      options:[{t:'ROA = UO/A_T con ROE = U_N/C', ok:true},{t:'ROA = U_N/C con ROE = UO/A_T', ok:false},{t:'ROA y ROE son idénticos', ok:false},{t:'ROE = UO/D', ok:false}],
      explain:'ROA usa utilidad operativa sobre activos; ROE, utilidad neta sobre capital.', correctText:'ROA=UO/A_T, ROE=U_N/C' } ]);
}

/* ============ M2: Estructura óptima de capital ============ */
function qIx(){
  const a = afPick([0.08,0.09,0.10]); const b = afPick([0.08,0.10,0.12]); const x = afPick([0.3,0.5,0.6,0.8]);
  const i = a+b*x*x;
  return { type:'numeric', topic:'af_estructura', tol:0.005,
    prompt:'El costo de la deuda crece con el apalancamiento: <b>i(x) = a + b·x²</b>, con x=D/C. Con a='+a+', b='+b+' y x='+x+', calcula i(x).',
    answer:i, correctText:afR(i,5).toString(),
    explain:'i(x) = a + b·x².', steps:['x² = '+x+'² = '+afR(x*x,4), 'i = '+a+' + '+b+'·'+afR(x*x,4)+' = '+afR(i,5)] };
}
function qXopt(){
  const a = afPick([0.08,0.09,0.10]); const b = afPick([0.08,0.10,0.12]); const r = afPick([0.25,0.275,0.30]);
  const x = Math.sqrt((r-a)/(3*b));
  return { type:'numeric', topic:'af_estructura', tol:0.005,
    prompt:'La estructura óptima de capital es <b>(D/C)* = √[(r − a)/(3b)]</b>. Con r='+r+', a='+a+' y b='+b+', calcula x*. (Requiere r>a y b>0.)',
    answer:x, correctText:afR(x,5).toString(),
    explain:'x* = √[(r−a)/(3b)] surge de derivar ROE(x) e igualar a cero.',
    steps:['(r−a)/(3b) = ('+r+'−'+a+')/(3·'+b+') = '+afR((r-a)/(3*b),5),
      'x* = √'+afR((r-a)/(3*b),5)+' = '+afR(x,5)] };
}
function qROEopt(){
  const a=0.09,b=0.10,r=0.275,t=0.30; const x=Math.sqrt((r-a)/(3*b)); const i=a+b*x*x; const roe=(r+(r-i)*x)*(1-t);
  return { type:'numeric', topic:'af_estructura', tol:0.005,
    prompt:'En la estructura óptima x*='+afR(x,5)+' con i*='+afR(i,5)+', r='+r+' y t='+t+', calcula el <b>ROE óptimo = [r + (r − i*)x*](1 − t)</b>.',
    answer:roe, correctText:afR(roe,5).toString(),
    explain:'Se evalúa ROE(x) en el óptimo x*.',
    steps:['(r − i*)·x* = ('+r+'−'+afR(i,5)+')·'+afR(x,5)+' = '+afR((r-i)*x,5),
      'ROE* = ['+r+' + '+afR((r-i)*x,5)+']·(1−'+t+') = '+afR(roe,5)] };
}
function buildAF2(){
  return afShuffle([ qIx(), qIx(), qXopt(), qXopt(), qROEopt(),
    { type:'order', topic:'af_estructura', prompt:'Ordena la obtención de la estructura óptima:',
      stepsList:['Definir x = D/C','Sustituir i(x)=a+bx² en ROE(x)','Derivar ROE(x) respecto de x','Igualar la derivada a cero','Despejar x* = √[(r−a)/(3b)]','Verificar que sea real y positivo (r>a, b>0)'],
      correctText:'x=D/C → sustituir i(x) → derivar → =0 → x* → verificar' },
    { type:'mc', topic:'af_estructura', prompt:'¿Cuándo la fórmula x*=√[(r−a)/(3b)] da una <b>raíz inválida</b>?',
      options:[{t:'Cuando r ≤ a (el radicando sería ≤ 0)', ok:true},{t:'Cuando r > a', ok:false},{t:'Cuando b > 0', ok:false},{t:'Nunca', ok:false}],
      explain:'Si r≤a el radicando es negativo o cero y no hay óptimo válido.', correctText:'Cuando r ≤ a' },
    { type:'tf', topic:'af_estructura', prompt:'El óptimo x* se obtiene derivando ROE(x) e igualando a cero.',
      answer:true, explain:'Es un problema de máximo: dROE/dx = 0.', correctText:'Verdadero' } ]);
}

/* ============ M3: Sartoris-Hill ============ */
function qKdiario(){
  const cppc = afPick([0.10,0.12,0.15,0.18]);
  return { type:'numeric', topic:'af_credito', tol:0.00001,
    prompt:'El costo de capital anual es CPPC='+cppc+'. Calcula el <b>costo de capital diario k = CPPC/365</b>.',
    answer:cppc/365, correctText:afR(cppc/365,6).toString(),
    explain:'k_diario = CPPC / 365.', steps:['k = '+cppc+'/365 = '+afR(cppc/365,6)] };
}
function qVP(){
  const P=afPick([10,12,15,20]); const Q=afPick([500,1000,1500]); const c=afPick([6,8,10,12]);
  if(c>=P){ return qVP(); }
  const cppc=afPick([0.10,0.12,0.15]); const DSO=afPick([30,45,60,75]); const k=cppc/365;
  const vp=P*Q/Math.pow(1+k,DSO)-c*Q;
  return { type:'numeric', topic:'af_credito', tol:1,
    prompt:'Modelo de Sartoris-Hill: <b>VP = PQ/(1+k)^DSO − cQ</b>. Con P='+P+', Q='+Q+', c='+c+', k=CPPC/365='+afR(k,6)+' (CPPC='+cppc+') y DSO='+DSO+' días, calcula VP.',
    answer:vp, correctText:afR(vp,2).toString(),
    explain:'Se descuenta el ingreso PQ al costo diario durante DSO días y se resta el costo variable cQ.',
    steps:['(1+k)^DSO = (1+'+afR(k,6)+')^'+DSO+' = '+afR(Math.pow(1+k,DSO),5),
      'PQ/(1+k)^DSO = '+(P*Q)+'/'+afR(Math.pow(1+k,DSO),5)+' = '+afR(P*Q/Math.pow(1+k,DSO),2),
      'VP = '+afR(P*Q/Math.pow(1+k,DSO),2)+' − '+(c*Q)+' = '+afR(vp,2)] };
}
function qVPb(){
  const P=afPick([10,12,15]); const Q=afPick([1000,1500]); const c=afPick([8,10]);
  const cppc=afPick([0.12,0.15]); const DSO=afPick([60,75]); const k=cppc/365; const bb=afPick([0.02,0.03,0.05]);
  const vp=P*Q*(1-bb)/Math.pow(1+k,DSO)-c*Q;
  return { type:'numeric', topic:'af_credito', tol:1,
    prompt:'Con cuentas incobrables: <b>VP = PQ(1−b)/(1+k)^DSO − cQ</b>. Con P='+P+', Q='+Q+', c='+c+', k='+afR(k,6)+', DSO='+DSO+' y b='+bb+', calcula VP.',
    answer:vp, correctText:afR(vp,2).toString(),
    explain:'La fracción incobrable b reduce el ingreso cobrable a PQ(1−b).',
    steps:['PQ(1−b) = '+(P*Q)+'·(1−'+bb+') = '+afR(P*Q*(1-bb),2),
      'VP = '+afR(P*Q*(1-bb),2)+'/'+afR(Math.pow(1+k,DSO),5)+' − '+(c*Q)+' = '+afR(vp,2)] };
}
function buildAF3(){
  return afShuffle([ qKdiario(), qKdiario(), qVP(), qVP(), qVPb(), qVPb(),
    { type:'mc', topic:'af_credito', prompt:'En el modelo con descuento/plazo neto/cobro, las proporciones PDR, PN y PRC deben cumplir:',
      options:[{t:'PDR + PN + PRC = 1 (y cada una entre 0 y 1)', ok:true},{t:'PDR + PN + PRC = DSO', ok:false},{t:'Pueden sumar más de 1', ok:false},{t:'Deben ser negativas', ok:false}],
      explain:'Son proporciones de clientes por forma de pago: suman 1 y están en [0,1].', correctText:'Suman 1, cada una en [0,1]' },
    { type:'fill', topic:'af_credito', prompt:'Si el costo de capital es anual, el diario es k = CPPC / ____ .', accept:['365'], correctText:'365' },
    { type:'tf', topic:'af_credito', prompt:'En Sartoris-Hill el ingreso PQ se descuenta durante el periodo promedio de cobro (DSO).',
      answer:true, explain:'El cobro llega en promedio a los DSO días, por eso se descuenta ese plazo.', correctText:'Verdadero' } ]);
}

/* ============ M4: Gallinger + insolvencia ============ */
function qGallinger(){
  const S=afPick([10000,20000,50000]); const c=afPick([100,200,300]); const V=afPick([0.01,0.02,0.03]); const k=afPick([0.01,0.02]); const n=afRi(2,6);
  const pn=(c/S)*(n-1)+V*Math.pow(1+k,n);
  return { type:'numeric', topic:'af_insolvencia', tol:0.01,
    prompt:'Modelo de Gallinger: <b>pₙ = (c/S)(n−1) + V(1+k)ⁿ</b>. Con S='+S+', c='+c+', V='+V+', k='+k+' y n='+n+' meses, calcula pₙ.',
    answer:pn, correctText:afR(pn,5).toString(),
    explain:'Se aplica la fórmula del cuaderno directamente (S: ventas mensuales, c: costo de cobranza, V: proporción incobrable, k: costo de capital por periodo).',
    steps:['(c/S)(n−1) = ('+c+'/'+S+')·'+(n-1)+' = '+afR((c/S)*(n-1),5),
      'V(1+k)ⁿ = '+V+'·(1+'+k+')^'+n+' = '+afR(V*Math.pow(1+k,n),5),
      'pₙ = '+afR((c/S)*(n-1),5)+' + '+afR(V*Math.pow(1+k,n),5)+' = '+afR(pn,5)] };
}
function qLambda(){
  const L0=afPick([4000,5000,6000]); const muT=afPick([-570,-400,-800,-300]); const sig=afPick([800,941.19,1000,1200]); const T=afPick([4,6,9]);
  const lam=(L0+muT)/(sig*Math.sqrt(T));
  return { type:'numeric', topic:'af_insolvencia', tol:0.01,
    prompt:'Índice de liquidez: <b>λ = (L₀ + μT)/(σ√T)</b>. Con L₀='+L0+', μT='+muT+', σ='+sig+' y T='+T+', calcula λ.',
    answer:lam, correctText:afR(lam,4).toString(),
    explain:'λ estandariza la reserva más el flujo neto esperado acumulado.',
    steps:['L₀ + μT = '+L0+' + ('+muT+') = '+(L0+muT),
      'σ√T = '+sig+'·√'+T+' = '+afR(sig*Math.sqrt(T),4),
      'λ = '+(L0+muT)+' / '+afR(sig*Math.sqrt(T),4)+' = '+afR(lam,4)] };
}
function qPinsolv(){
  const lam=afPick([1.5,1.9215,2.0,1.65,2.33]);
  const p=1-npPhi(lam);
  return { type:'numeric', topic:'af_insolvencia', tol:0.005,
    prompt:'La probabilidad de insolvencia es <b>P = 1 − Φ(λ)</b> (cola derecha de la normal). Con λ='+lam+', calcula P.',
    answer:p, correctText:afR(p,4).toString(),
    explain:'Se consulta Φ(λ) en la normal estándar y se toma 1−Φ(λ).',
    steps:['Φ('+lam+') = '+afR(npPhi(lam),4), 'P = 1 − '+afR(npPhi(lam),4)+' = '+afR(p,4)] };
}
function buildAF4(){
  return afShuffle([ qGallinger(), qGallinger(), qLambda(), qLambda(), qPinsolv(), qPinsolv(),
    { type:'order', topic:'af_insolvencia', prompt:'Ordena el cálculo del riesgo de insolvencia:',
      stepsList:['Registrar los flujos netos de caja','Calcular la media μ y la desviación σ','Establecer T e identificar L₀','Calcular λ = (L₀+μT)/(σ√T)','Consultar la normal estándar Φ(λ)','Obtener P = 1−Φ(λ) e interpretar el riesgo'],
      correctText:'flujos → μ,σ → T,L₀ → λ → Φ(λ) → 1−Φ(λ)' },
    { type:'tf', topic:'af_insolvencia', prompt:'Una λ más grande (mayor reserva relativa) implica menor probabilidad de insolvencia.',
      answer:true, explain:'P=1−Φ(λ) decrece cuando λ crece.', correctText:'Verdadero' } ]);
}

/* ============ M5: Inventarios / EOQ ============ */
function qEOQ(){
  const D=afPick([2000,5000,10000,50000]); const Co=afPick([50,95,4.5,120]); const Cm=afPick([42,0.5,20,10]);
  const Q=Math.sqrt(2*D*Co/Cm);
  return { type:'numeric', topic:'af_inventario', tol:0.5,
    prompt:'Lote económico: <b>Q* = √(2·D·C_o / C_m)</b>. Con demanda D='+D+', costo de ordenar C_o='+Co+' y costo de mantener C_m='+Cm+', calcula Q*.',
    answer:Q, correctText:afR(Q,4).toString(),
    explain:'Q* minimiza CT(Q)=(Q/2)C_m+(D/Q)C_o.',
    steps:['2·D·C_o = 2·'+D+'·'+Co+' = '+(2*D*Co), 'Q* = √('+(2*D*Co)+'/'+Cm+') = '+afR(Q,4)] };
}
function qEOQcost(){
  const D=afPick([2000,5000,10000]); const Co=afPick([50,95,120]); const Cm=afPick([42,20,10]);
  const Q=Math.sqrt(2*D*Co/Cm); const which=afPick(['mantener','ordenar']);
  const val=which==='mantener'?(Q/2*Cm):(D/Q*Co);
  return { type:'numeric', topic:'af_inventario', tol:0.5,
    prompt:'Con D='+D+', C_o='+Co+', C_m='+Cm+' y Q*='+afR(Q,4)+', calcula el <b>costo de '+which+'</b> ('+(which==='mantener'?'(Q/2)·C_m':'(D/Q)·C_o')+').',
    answer:val, correctText:afR(val,4).toString(),
    explain:'En el óptimo el costo de mantener ≈ el costo de ordenar.',
    steps:[which==='mantener'? '(Q/2)·C_m = ('+afR(Q,4)+'/2)·'+Cm+' = '+afR(val,4) : '(D/Q)·C_o = ('+D+'/'+afR(Q,4)+')·'+Co+' = '+afR(val,4)] };
}
function qReorden(){
  const D=afPick([36500,50000,73000]); const dias=365; const Cd=D/dias; const Te=afPick([2,3,5]); const Is=afPick([100,136,200]);
  const pr=Te*Cd+Is;
  return { type:'numeric', topic:'af_inventario', tol:0.5,
    prompt:'Punto de reorden: <b>PR = ΔT_e·C_d + I_s</b>, con consumo diario C_d = D/días. Con D='+D+', días=365, ΔT_e='+Te+', I_s='+Is+', calcula PR.',
    answer:pr, correctText:afR(pr,4).toString(),
    explain:'Primero el consumo diario C_d=D/días; luego PR=ΔT_e·C_d+I_s.',
    steps:['C_d = '+D+'/365 = '+afR(Cd,4), 'PR = '+Te+'·'+afR(Cd,4)+' + '+Is+' = '+afR(pr,4)] };
}
function buildAF5(){
  return afShuffle([ qEOQ(), qEOQ(), qEOQcost(), qEOQcost(), qReorden(), qReorden(),
    { type:'order', topic:'af_inventario', prompt:'Ordena la derivación del lote económico:',
      stepsList:['Escribir CT(Q)=(Q/2)C_m+(D/Q)C_o','Derivar dCT/dQ = C_m/2 − DC_o/Q²','Igualar a cero: C_m/2 = DC_o/Q²','Despejar Q* = √(2DC_o/C_m)'],
      correctText:'CT(Q) → derivar → =0 → Q*=√(2DC_o/C_m)' },
    { type:'tf', topic:'af_inventario', prompt:'En el lote óptimo, el costo de mantener es aproximadamente igual al costo de ordenar.',
      answer:true, explain:'Es una propiedad del EOQ: ambos costos se igualan en Q*.', correctText:'Verdadero' },
    { type:'fill', topic:'af_inventario', prompt:'El inventario promedio es Q/____ .', accept:['2','dos'], correctText:'2' } ]);
}

/* ============ M6: Descuentos por volumen ============ */
function qEOQdisc(){
  const D=afPick([5000,10000,20000]); const Co=afPick([50,80,100]); const rr=afPick([0.15,0.20,0.25]); const P=afPick([10,20,50]);
  const Cm=rr*P; const Q=Math.sqrt(2*D*Co/Cm);
  return { type:'numeric', topic:'af_descuentos', tol:0.5,
    prompt:'Cuando el costo de mantener es un % del precio (C_m=r·P), el lote es <b>Q* = √(2·D·C_o/(r·P))</b>. Con D='+D+', C_o='+Co+', r='+rr+' y P='+P+', calcula Q*.',
    answer:Q, correctText:afR(Q,4).toString(),
    explain:'Se sustituye C_m=r·P en la fórmula del EOQ.',
    steps:['C_m = r·P = '+rr+'·'+P+' = '+afR(Cm,4), 'Q* = √(2·'+D+'·'+Co+'/'+afR(Cm,4)+') = '+afR(Q,4)] };
}
function qCTI(){
  const D=afPick([5000,10000]); const Co=afPick([50,80]); const rr=afPick([0.20,0.25]); const P=afPick([10,20]);
  const Cm=rr*P; const Q=Math.round(Math.sqrt(2*D*Co/Cm));
  const cti=P*D+(D/Q)*Co+(Q/2)*Cm;
  return { type:'numeric', topic:'af_descuentos', tol:2,
    prompt:'Costo total del inventario: <b>CTI = P·D + (D/Q)C_o + (Q/2)C_m</b>. Con P='+P+', D='+D+', Q='+Q+', C_o='+Co+' y C_m=r·P='+afR(Cm,2)+', calcula CTI.',
    answer:cti, correctText:afR(cti,2).toString(),
    explain:'Incluye el costo de compra P·D, el de ordenar y el de mantener.',
    steps:['P·D = '+P+'·'+D+' = '+(P*D),
      '(D/Q)C_o = ('+D+'/'+Q+')·'+Co+' = '+afR(D/Q*Co,2),
      '(Q/2)C_m = ('+Q+'/2)·'+afR(Cm,2)+' = '+afR(Q/2*Cm,2),
      'CTI = '+(P*D)+' + '+afR(D/Q*Co,2)+' + '+afR(Q/2*Cm,2)+' = '+afR(cti,2)] };
}
function buildAF6(){
  return afShuffle([ qEOQdisc(), qEOQdisc(), qCTI(), qCTI(),
    { type:'order', topic:'af_descuentos', prompt:'Ordena la decisión con descuentos por volumen:',
      stepsList:['Calcular Q* para cada precio','Verificar si Q* pertenece a su rango','Si no pertenece, usar el mínimo factible del rango','Calcular el CTI (incluyendo el costo de compra P·D)','Comparar candidatos y elegir el de menor costo total'],
      correctText:'Q* por precio → factibilidad → ajustar al rango → CTI → comparar' },
    { type:'mc', topic:'af_descuentos', prompt:'Al comparar alternativas con descuento por volumen, se elige:',
      options:[{t:'La de menor <b>costo total</b> (incluyendo el precio de compra)', ok:true},{t:'Siempre el Q* más pequeño', ok:false},{t:'El precio más bajo sin importar el lote', ok:false},{t:'El lote más grande posible', ok:false}],
      explain:'No se elige por Q* solo: hay que comparar el CTI completo, que incluye P·D.', correctText:'La de menor costo total' },
    { type:'tf', topic:'af_descuentos', prompt:'Si el Q* calculado no cae en su rango de precio, se usa el punto mínimo factible de ese rango.',
      answer:true, explain:'Se ajusta Q al límite factible del rango antes de comparar costos.', correctText:'Verdadero' } ]);
}

/* ============ M7: FLE, CAPM, WACC, crecimiento ============ */
function qFLE(){
  const UO=afPick([500,825,1000,1500]); const T=afPick([0.30,0.35]); const Dep=afPick([100,200,300]); const CAPEX=afPick([150,300,400]); const dCWT=afPick([50,100,-50]);
  const fle=UO*(1-T)+Dep-CAPEX-dCWT;
  return { type:'numeric', topic:'af_wacc', tol:1,
    prompt:'Flujo libre de efectivo: <b>FLE = UO(1−T) + Dep − CAPEX − ΔCWT</b>. Con UO='+UO+', T='+T+', Dep='+Dep+', CAPEX='+CAPEX+' y ΔCWT='+dCWT+', calcula FLE.',
    answer:fle, correctText:afR(fle,2).toString(),
    explain:'La depreciación se suma (no es salida de efectivo); CAPEX y el aumento de capital de trabajo se restan.',
    steps:['UO(1−T) = '+UO+'·(1−'+T+') = '+afR(UO*(1-T),2),
      'FLE = '+afR(UO*(1-T),2)+' + '+Dep+' − '+CAPEX+' − ('+dCWT+') = '+afR(fle,2)] };
}
function qCAPM(){
  const Rf=afPick([0.03,0.04,0.05]); const beta=afPick([0.8,1.0,1.2,1.5]); const Rm=afPick([0.10,0.12,0.14]);
  const Re=Rf+beta*(Rm-Rf);
  return { type:'numeric', topic:'af_wacc', tol:0.005,
    prompt:'CAPM: <b>R_e = R_f + β(R_m − R_f)</b>. Con R_f='+Rf+', β='+beta+' y R_m='+Rm+', calcula el costo del capital propio R_e.',
    answer:Re, correctText:afR(Re,5).toString(),
    explain:'R_e = tasa libre de riesgo + beta × prima de riesgo del mercado.',
    steps:['R_m − R_f = '+Rm+'−'+Rf+' = '+afR(Rm-Rf,4), 'R_e = '+Rf+' + '+beta+'·'+afR(Rm-Rf,4)+' = '+afR(Re,5)] };
}
function qBeta(){
  const cov=afPick([0.004,0.006,0.009,0.012]); const varm=afPick([0.004,0.005,0.006]);
  return { type:'numeric', topic:'af_wacc', tol:0.02,
    prompt:'La beta se obtiene con <b>β = Cov(R_i,R_m) / Var(R_m)</b>. Con Cov='+cov+' y Var(R_m)='+varm+', calcula β.',
    answer:cov/varm, correctText:afR(cov/varm,4).toString(),
    explain:'β mide la sensibilidad del activo respecto al mercado.', steps:['β = '+cov+'/'+varm+' = '+afR(cov/varm,4)] };
}
function qWACC(){
  const D=afPick([1000,2000,3000]); const C=afPick([2000,3000,4000]); const AT=D+C; const Rd=afPick([0.08,0.10,0.12]); const Re=afPick([0.12,0.15,0.18]); const T=afPick([0.30,0.35]);
  const wacc=(D/AT)*Rd*(1-T)+(C/AT)*Re;
  return { type:'numeric', topic:'af_wacc', tol:0.003,
    prompt:'WACC = <b>(D/A_T)·R_d(1−T) + (C/A_T)·R_e</b>. Con D='+D+', C='+C+' (A_T=D+C='+AT+'), R_d='+Rd+', R_e='+Re+' y T='+T+', calcula el WACC.',
    answer:wacc, correctText:afR(wacc,5).toString(),
    explain:'Promedio ponderado del costo de la deuda (después de impuestos) y del capital propio.',
    steps:['(D/A_T)·R_d(1−T) = ('+D+'/'+AT+')·'+Rd+'·(1−'+T+') = '+afR((D/AT)*Rd*(1-T),5),
      '(C/A_T)·R_e = ('+C+'/'+AT+')·'+Re+' = '+afR((C/AT)*Re,5),
      'WACC = '+afR((D/AT)*Rd*(1-T),5)+' + '+afR((C/AT)*Re,5)+' = '+afR(wacc,5)] };
}
function qGrowth(){
  const roe=afPick([0.15,0.20,0.25]); const d=afPick([0.2,0.3,0.4]); const TR=1-d; const g=roe*TR;
  return { type:'numeric', topic:'af_wacc', tol:0.003,
    prompt:'Crecimiento sostenible: <b>g = ROE · TR</b>, con tasa de retención TR = 1 − d. Con ROE='+roe+' y tasa de pago de dividendos d='+d+', calcula g.',
    answer:g, correctText:afR(g,5).toString(),
    explain:'TR es lo que la empresa reinvierte; g = ROE × TR.',
    steps:['TR = 1 − d = 1 − '+d+' = '+afR(TR,4), 'g = '+roe+'·'+afR(TR,4)+' = '+afR(g,5)] };
}
function buildAF7(){
  return afShuffle([ qFLE(), qFLE(), qCAPM(), qCAPM(), qBeta(), qWACC(), qWACC(), qGrowth(),
    { type:'mc', topic:'af_wacc', prompt:'La descomposición DuPont del ROE es:',
      options:[{t:'margen neto × rotación de activos × multiplicador del capital', ok:true},{t:'margen × precio × cantidad', ok:false},{t:'deuda × capital × impuestos', ok:false},{t:'ventas − costos', ok:false}],
      explain:'ROE = (UN/Ventas)(Ventas/Activos)(Activos/Capital).', correctText:'Margen × rotación × multiplicador' },
    { type:'tf', topic:'af_wacc', prompt:'La depreciación se suma al calcular el FLE porque no representa una salida de efectivo.',
      answer:true, explain:'Es un gasto contable no monetario, por eso se reintegra.', correctText:'Verdadero' } ]);
}

/* ============ M8: Valuación de empresas ============ */
function qVF1(){
  const FLE0=afPick([800,1000,1200,1500]); const g=afPick([0.02,0.03,0.04]); const WACC=afPick([0.08,0.10,0.12]);
  const FLE1=FLE0*(1+g); const vf=FLE1/(WACC-g);
  return { type:'numeric', topic:'af_valuacion', tol:5,
    prompt:'Valuación en una etapa (Gordon): <b>V_F = FLE₁/(WACC − g)</b>, con FLE₁=FLE₀(1+g). Con FLE₀='+FLE0+', g='+g+' y WACC='+WACC+' (WACC>g), calcula V_F.',
    answer:vf, correctText:afR(vf,2).toString(),
    explain:'Requiere WACC>g. Primero se proyecta FLE₁, luego se capitaliza a (WACC−g).',
    steps:['FLE₁ = FLE₀(1+g) = '+FLE0+'·(1+'+g+') = '+afR(FLE1,2),
      'V_F = '+afR(FLE1,2)+'/('+WACC+'−'+g+') = '+afR(FLE1,2)+'/'+afR(WACC-g,4)+' = '+afR(vf,2)] };
}
function qVTn(){
  const FLEn=afPick([1200,1500,1800]); const g2=afPick([0.02,0.03]); const WACC=afPick([0.09,0.10,0.12]);
  const vtn=FLEn*(1+g2)/(WACC-g2);
  return { type:'numeric', topic:'af_valuacion', tol:5,
    prompt:'Valor terminal (segunda etapa): <b>VT_n = FLE_n(1+g₂)/(WACC − g₂)</b>. Con FLE_n='+FLEn+', g₂='+g2+' y WACC='+WACC+', calcula VT_n.',
    answer:vtn, correctText:afR(vtn,2).toString(),
    explain:'Es una perpetuidad creciente al final de la primera etapa.',
    steps:['FLE_n(1+g₂) = '+FLEn+'·(1+'+g2+') = '+afR(FLEn*(1+g2),2),
      'VT_n = '+afR(FLEn*(1+g2),2)+'/('+WACC+'−'+g2+') = '+afR(vtn,2)] };
}
function buildAF8(){
  return afShuffle([ qVF1(), qVF1(), qVTn(), qVTn(),
    { type:'mc', topic:'af_valuacion', prompt:'Si al valuar resulta <b>WACC ≤ g</b>, se debe:',
      options:[{t:'No calcular un valor convencional y revisar los supuestos', ok:true},{t:'Usar el valor negativo tal cual', ok:false},{t:'Cambiar g por WACC', ok:false},{t:'Ignorar la advertencia', ok:false}],
      explain:'La fórmula de Gordon exige WACC>g; si no, el resultado no tiene sentido y hay que revisar supuestos.', correctText:'No calcular y revisar supuestos' },
    { type:'order', topic:'af_valuacion', prompt:'Ordena la valuación en dos etapas:',
      stepsList:['Calcular el FLE base y el crecimiento g₁','Proyectar y descontar cada FLE de la primera etapa','Calcular FLE del año n','Calcular el valor terminal VT_n = FLE_n(1+g₂)/(WACC−g₂)','Descontar el valor terminal','Sumar todos los valores presentes'],
      correctText:'FLE base → proyectar/descontar → FLE_n → VT_n → descontar VT → sumar' },
    { type:'tf', topic:'af_valuacion', prompt:'No hay que confundir FLE₀ con FLE₁: FLE₁ = FLE₀(1+g).',
      answer:true, explain:'El numerador de Gordon usa el flujo del <i>siguiente</i> periodo, FLE₁.', correctText:'Verdadero' },
    { type:'mc', topic:'af_valuacion', prompt:'Si la empresa <b>no paga dividendos</b>, entonces:',
      options:[{t:'d = 0 y TR = 1', ok:true},{t:'d = 1 y TR = 0', ok:false},{t:'g = WACC', ok:false},{t:'no se puede valuar', ok:false}],
      explain:'Sin dividendos, la tasa de pago d=0 y la retención TR=1.', correctText:'d = 0, TR = 1' } ]);
}

/* ---- Lecciones ---- */
const LESSON_AF_RENT = { title:'💰 Rentabilidad y apalancamiento', html:
  '<p>A_T = C + D. <b>ROA = r = UO/A_T</b> y <b>ROE = U_N/C</b>. Con deuda:</p>'
  +'<p style="text-align:center"><b>ROE = [r + (r − i)(D/C)](1 − t)</b>, &nbsp; U_N = ROE·C</p>'
  +'<ul><li>Si r&gt;i, el apalancamiento (D/C) <b>aumenta</b> el ROE.</li><li>Si r&lt;i, la deuda lo <b>reduce</b> (puede volverlo negativo).</li>'
  +'<li>No confundir ROA (UO/A_T) con ROE (U_N/C), ni D/A con D/C.</li></ul>' };
const LESSON_AF_INV = { title:'📦 Inventarios y lote económico', html:
  '<p>Costo total: CT(Q)=(Q/2)C_m+(D/Q)C_o. Derivando e igualando a cero:</p>'
  +'<p style="text-align:center"><b>Q* = √(2·D·C_o / C_m)</b></p>'
  +'<p>En Q* el costo de mantener ≈ el de ordenar. Inventario promedio = Q/2; número de pedidos = D/Q. '
  +'Punto de reorden <b>PR = ΔT_e·C_d + I_s</b>, con consumo diario C_d = D/días.</p>' };
const LESSON_AF_WACC = { title:'🏦 FLE, CAPM y WACC', html:
  '<p><b>FLE = UO(1−T) + Dep − CAPEX − ΔCWT</b> (la depreciación se suma; CAPEX y el aumento de capital de trabajo se restan).</p>'
  +'<p><b>CAPM: R_e = R_f + β(R_m−R_f)</b>, β = Cov/Var. Costo de deuda después de impuestos: R_d(1−T).</p>'
  +'<p><b>WACC = (D/A_T)R_d(1−T) + (C/A_T)R_e</b>. Crecimiento sostenible g = ROE·TR, con TR=1−d. '
  +'DuPont: ROE = margen × rotación × multiplicador del capital.</p>' };

/* ---- Módulos ---- */
const MODULES_AF = [
  {id:0, icon:'💰', name:'Rentabilidad y apalancamiento', desc:'ROA, ROE, utilidad neta y efecto de la deuda (D/C).', kind:'Ejercicios ilimitados', lesson:LESSON_AF_RENT, build:buildAF1},
  {id:1, icon:'⚖️', name:'Estructura óptima de capital', desc:'i(x)=a+bx², ROE(x) y (D/C)*=√[(r−a)/(3b)].', kind:'Ejercicios ilimitados', build:buildAF2},
  {id:2, icon:'🧾', name:'Políticas de crédito (Sartoris-Hill)', desc:'VP con costo de capital diario, incobrables y descuentos.', kind:'Ejercicios ilimitados', build:buildAF3},
  {id:3, icon:'🚨', name:'Gallinger y riesgo de insolvencia', desc:'pₙ de Gallinger y λ=(L₀+μT)/(σ√T), P=1−Φ(λ).', kind:'Ejercicios ilimitados', build:buildAF4},
  {id:4, icon:'📦', name:'Inventarios y lote económico', desc:'Q*=√(2DC_o/C_m), costos y punto de reorden.', kind:'Ejercicios ilimitados', lesson:LESSON_AF_INV, build:buildAF5},
  {id:5, icon:'🏷️', name:'Descuentos por volumen', desc:'C_m=rP, Q* por rango y comparación de costo total.', kind:'Ejercicios + caso', build:buildAF6},
  {id:6, icon:'🏦', name:'FLE, CAPM, WACC y crecimiento', desc:'Flujo libre, costo de capital, WACC, DuPont y g sostenible.', kind:'Ejercicios ilimitados', lesson:LESSON_AF_WACC, build:buildAF7},
  {id:7, icon:'🏢', name:'Valuación de empresas', desc:'Gordon en una etapa y modelo de dos etapas con valor terminal.', kind:'Ejercicios + caso', build:buildAF8}
];
const TOPIC_NAMES_AF = {
  af_rent:'Rentabilidad', af_estructura:'Estructura de capital', af_credito:'Políticas de crédito', af_insolvencia:'Insolvencia',
  af_inventario:'Inventarios', af_descuentos:'Descuentos por volumen', af_wacc:'FLE/CAPM/WACC', af_valuacion:'Valuación'
};
function buildExamAF(){
  const pool=[]; MODULES_AF.forEach(m=>{ if(m.build){ try{ pool.push(...m.build()); }catch(e){} } });
  return afShuffle(pool).slice(0,12);
}
Object.assign(TOPIC_NAMES, TOPIC_NAMES_AF);
EXAM_REVIEWS_BY_SUBJECT['administracion-financiera'] = { pending:true, subject:'administracion-financiera', originals:[] };

/* ---- Juego: Director Financiero (secuencia de decisiones con las fórmulas de los módulos) ---- */
function startDirectorFinanciero(){
  if(S.activeSubject!=='administracion-financiera'){ toast('🏢 El Director Financiero está en Administración Financiera.'); sfx('bad'); return; }
  // una empresa con parámetros válidos; cada decisión usa una fórmula ya implementada
  const r = afPick([0.25,0.275,0.30]); const i = afPick([0.10,0.115,0.12]); const D=afPick([1000,1500,2000]); const C=afPick([2000,2500,3000]); const t=0.30;
  const roe=(r+(r-i)*(D/C))*(1-t);
  const L0=5000, muT=afPick([-570,-400,-300]), sig=afPick([900,941.19,1000]), T=6; const lam=(L0+muT)/(sig*Math.sqrt(T)); const pins=1-npPhi(lam);
  const Dd=afPick([2000,5000]), Co=afPick([50,95]), Cm=afPick([20,42]); const Q=Math.sqrt(2*Dd*Co/Cm);
  const wD=D/(D+C), wC=C/(D+C), Rd=i, Re=afPick([0.15,0.18]); const wacc=wD*Rd*(1-t)+wC*Re;
  const FLE0=afPick([800,1000,1200]), g=afPick([0.02,0.03]); const vf=FLE0*(1+g)/(wacc-g);
  const qs = afShuffle([
    { type:'numeric', topic:'af_rent', tol:0.005, stage:'cfo', prompt:'<b>🏢 Director Financiero — Decisión 1 (apalancamiento).</b> Con r='+r+', i='+i+', D='+D+', C='+C+', t='+t+', ¿cuál es el ROE = [r+(r−i)(D/C)](1−t)?', answer:roe, correctText:afR(roe,4).toString(), explain:'ROE apalancado.', steps:['ROE = ['+r+'+('+r+'−'+i+')('+D+'/'+C+')]·0.7 = '+afR(roe,4)] },
    { type:'numeric', topic:'af_insolvencia', tol:0.005, stage:'cfo', prompt:'<b>Decisión 2 (liquidez).</b> Con L₀='+L0+', μT='+muT+', σ='+sig+', T='+T+', calcula P(insolvencia)=1−Φ(λ), λ=(L₀+μT)/(σ√T).', answer:pins, correctText:afR(pins,4).toString(), explain:'Riesgo de insolvencia.', steps:['λ = '+afR(lam,4), 'P = 1−Φ(λ) = '+afR(pins,4)] },
    { type:'numeric', topic:'af_inventario', tol:0.5, stage:'cfo', prompt:'<b>Decisión 3 (inventario).</b> Con D='+Dd+', C_o='+Co+', C_m='+Cm+', ¿cuál es el lote económico Q*=√(2DC_o/C_m)?', answer:Q, correctText:afR(Q,4).toString(), explain:'EOQ.', steps:['Q* = √(2·'+Dd+'·'+Co+'/'+Cm+') = '+afR(Q,4)] },
    { type:'numeric', topic:'af_wacc', tol:0.003, stage:'cfo', prompt:'<b>Decisión 4 (costo de capital).</b> Con D='+D+', C='+C+', R_d='+Rd+', R_e='+Re+', t='+t+', calcula el WACC.', answer:wacc, correctText:afR(wacc,5).toString(), explain:'WACC ponderado.', steps:['WACC = (D/A_T)R_d(1−t)+(C/A_T)R_e = '+afR(wacc,5)] },
    { type:'numeric', topic:'af_valuacion', tol:5, stage:'cfo', prompt:'<b>Decisión 5 (valuación).</b> Con FLE₀='+FLE0+', g='+g+' y WACC='+afR(wacc,4)+', calcula V_F = FLE₀(1+g)/(WACC−g).', answer:vf, correctText:afR(vf,2).toString(), explain:'Valor de la empresa (Gordon).', steps:['V_F = '+FLE0+'(1+'+g+')/('+afR(wacc,4)+'−'+g+') = '+afR(vf,2)] }
  ]);
  startMode({ id:'cfo', title:'🏢 Director Financiero', icon:'🏢', qs,
    introToast:'🏢 Toma 5 decisiones financieras usando las fórmulas del curso.' });
}

const MODULES_BY_SUBJECT = { ca3: MODULES_CA3, 'modelos-regresion': MODULES_REG, 'estadistica-no-parametrica': MODULES_NP, stoch: MODULES_STOCH, 'administracion-financiera': MODULES_AF };
/* MODULES siempre apunta a los módulos de la materia activa */
let MODULES = MODULES_BY_SUBJECT[S.activeSubject] || [];
/* ==================== Modal ==================== */
function openModal(html){
  const o = document.createElement('div'); o.className = 'overlay';
  o.innerHTML = '<div class="modal">'+html+'</div>';
  o.addEventListener('click', e => { if(e.target === o) closeModal(); });
  $('#modalHost').innerHTML = ''; $('#modalHost').appendChild(o);
  return o;
}
function closeModal(){ $('#modalHost').innerHTML = ''; }

/* ==================== Módulo 9: Memorama ==================== */
let MEMO = null;
function startMemo(){
  const sel = shuffle(GLOSSARY).slice(0,8);
  const cards = shuffle(sel.flatMap((g,i) => [ {pid:i, kind:'c', txt:g.t}, {pid:i, kind:'d', txt:g.s} ]));
  MEMO = { cards, open:[], found:0, tries:0, lock:false, t0:Date.now() };
  $('#memoGrid').innerHTML = cards.map((c,i) =>
    '<button class="memo-card" data-i="'+i+'" aria-label="carta"><span class="memo-inner">'
    + '<span class="memo-face memo-front">🛡️</span>'
    + '<span class="memo-face memo-back'+(c.kind==='c' ? ' concept' : '')+'">'+esc(c.txt)+'</span>'
    + '</span></button>').join('');
  $$('#memoGrid .memo-card').forEach(b => b.addEventListener('click', () => memoFlip(+b.dataset.i)));
  showView('memo');
  updateMemoHud();
  memoTimerInt = setInterval(updateMemoHud, 1000);
}
function updateMemoHud(){
  if(!MEMO) return;
  $('#memoPairs').textContent = MEMO.found+'/8';
  $('#memoTries').textContent = MEMO.tries;
  const s = Math.floor((Date.now()-MEMO.t0)/1000);
  $('#memoTime').textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}
function memoFlip(i){
  if(!MEMO || MEMO.lock) return;
  const el = $$('#memoGrid .memo-card')[i];
  if(el.classList.contains('flipped') || el.classList.contains('matched')) return;
  sfx('flip');
  el.classList.add('flipped');
  MEMO.open.push(i);
  if(MEMO.open.length === 2){
    MEMO.tries++;
    const [a,b] = MEMO.open;
    const els = $$('#memoGrid .memo-card');
    if(MEMO.cards[a].pid === MEMO.cards[b].pid){
      els[a].classList.add('matched'); els[b].classList.add('matched');
      MEMO.found++; MEMO.open = []; sfx('ok'); updateMemoHud();
      if(MEMO.found === 8) setTimeout(memoDone, 650);
    } else {
      MEMO.lock = true;
      setTimeout(() => { els[a].classList.remove('flipped'); els[b].classList.remove('flipped');
        MEMO.open = []; MEMO.lock = false; updateMemoHud(); }, 850);
    }
  }
}
function memoDone(){
  clearInterval(memoTimerInt); memoTimerInt = null;
  const sec = (Date.now()-MEMO.t0)/1000;
  const eff = 8/MEMO.tries;
  const score = Math.round(100*Math.min(1, eff/0.6));
  const xp = 48 + (score>=100 ? 12 : 0);
  MEMO = null;
  recordResult(8, score, xp, sec, []);
}

/* ==================== Módulo 11: Escape Room ==================== */
let ESC = null;
function startEscape(){
  const expo = pick([500,800,1000]);
  const perF = ri(3,9);
  const nsF = perF*expo/100;
  const nsS = ri(20,60), sevK = ri(12,48);
  const freqP = ri(2,8), sevP = ri(10,40)*1000, prima = freqP/100*sevP;
  const D = ri(5,20)*1000, c = pick([10,20,25]);
  const loss = D + ri(20,80)*1000, base = loss - D, insPay = base*(1-c/100);
  ESC = { hints:0, wrongAns:0, wrongSafe:0, t0:Date.now(),
    puzzles:[
      { icon:'🗄️', title:'Sala de archivo', code:perF,
        prompt:'En el archivo encuentras el expediente de una cartera con <b>'+expo.toLocaleString()+' pólizas</b> y <b>'+nsF+' siniestros</b> en el año. El código de la puerta es la <b>frecuencia × 100</b>.',
        help:'Frecuencia = siniestros ÷ exposición. Luego multiplica por 100.',
        steps:['Frecuencia = '+nsF+' ÷ '+expo.toLocaleString()+' = '+(perF/100), 'Código = '+(perF/100)+' × 100 = <b>'+perF+'</b>'] },
      { icon:'💾', title:'Bóveda de datos', code:sevK,
        prompt:'La bóveda registra <b>'+nsS+' siniestros</b> con pérdidas totales de <b>'+money(nsS*sevK*1000)+'</b>. El código es la <b>severidad en miles de pesos</b>.',
        help:'Severidad = pérdidas totales ÷ número de siniestros. Divide entre 1,000.',
        steps:['Severidad = '+money(nsS*sevK*1000)+' ÷ '+nsS+' = '+money(sevK*1000), 'Código = '+(sevK*1000).toLocaleString()+' ÷ 1,000 = <b>'+sevK+'</b>'] },
      { icon:'🖋️', title:'Oficina del suscriptor', code:prima,
        prompt:'Para autorizar la póliza necesitas la <b>prima de riesgo en pesos</b>: frecuencia <b>'+(freqP/100)+'</b> y severidad <b>'+money(sevP)+'</b>.',
        help:'Prima de riesgo = frecuencia × severidad.',
        steps:['Prima = '+(freqP/100)+' × '+money(sevP)+' = <b>'+money(prima)+'</b>', 'Código = <b>'+prima+'</b>'] },
      { icon:'⚖️', title:'Sala de reclamaciones', code:insPay,
        prompt:'Última llave: un siniestro de <b>'+money(loss)+'</b> con deducible de <b>'+money(D)+'</b> y coaseguro de <b>'+c+'%</b>. El código es lo que <b>paga la aseguradora en pesos</b>.',
        help:'Resta el deducible, luego quita el coaseguro del asegurado.',
        steps:['Base = '+money(loss)+' − '+money(D)+' = '+money(base), 'Aseguradora = '+(100-c)+'% × '+money(base)+' = <b>'+money(insPay)+'</b>', 'Código = <b>'+insPay+'</b>'] }
    ].map(p => Object.assign(p, {solved:false}))
  };
  renderEscape();
  showView('escape');
}
function renderEscape(){
  const solved = ESC.puzzles.filter(p=>p.solved).length;
  let html = '<div class="esc-story"><h2>🕵️ El expediente perdido</h2>'
    + '<p>Eres el nuevo <b>analista actuarial</b> de Aseguradora Delta. El director dejó una póliza urgente dentro de la caja fuerte… y las 4 llaves están escondidas detrás de acertijos actuariales. Resuelve cada sala para obtener su código.</p>'
    + '<p style="font-weight:700">🔑 Llaves obtenidas: '+solved+' / 4</p></div>';
  html += '<div class="doors">' + ESC.puzzles.map((p,i) =>
    '<div class="door'+(p.solved?' solved':'')+'" data-p="'+i+'" role="button" tabindex="0">'
    + '<div class="d-ico">'+(p.solved?'🔑':p.icon)+'</div><h4>'+p.title+'</h4>'
    + '<div class="d-state">'+(p.solved ? '✔ Resuelta' : 'Haz clic para entrar')+'</div>'
    + (p.solved ? '<div class="d-code">CÓDIGO: '+p.code+'</div>' : '')
    + '</div>').join('') + '</div>';
  if(solved === 4){
    html += '<div class="safe" id="escSafe"><div class="dial">🔐</div><h3>La caja fuerte</h3>'
      + '<p style="font-size:.9rem;color:var(--ink2)">Introduce los 4 códigos <b>en orden</b> (sala 1 → sala 4). Si alguno es incorrecto, la caja no abrirá.</p>'
      + '<div class="code-row">' + [0,1,2,3].map(i =>
          '<input class="code-in" id="code'+i+'" inputmode="decimal" placeholder="Código '+(i+1)+'" aria-label="Código '+(i+1)+'">').join('') + '</div>'
      + '<button class="btn" id="btnSafe" style="font-size:1rem">🗝️ Abrir la caja fuerte</button></div>';
  } else {
    html += '<div class="safe locked-visual"><div class="dial">🔒</div><h3>La caja fuerte</h3>'
      + '<p style="font-size:.9rem;color:var(--ink2)">Consigue las 4 llaves para intentar abrirla.</p></div>';
  }
  $('#escBody').innerHTML = html;
  $$('#escBody .door:not(.solved)').forEach(d => {
    const go = () => openPuzzle(+d.dataset.p);
    d.addEventListener('click', go);
    d.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); go(); } });
  });
  const bs = $('#btnSafe'); if(bs) bs.addEventListener('click', trySafe);
}
function openPuzzle(i){
  sfx('click');
  const p = ESC.puzzles[i];
  const o = openModal('<h3 style="display:flex;gap:8px;align-items:center">'+p.icon+' '+p.title+'</h3>'
    + '<p style="font-size:.93rem">'+p.prompt+'</p>'
    + '<div class="answer-row"><input class="ainput" id="pzIn" inputmode="decimal" placeholder="Código…"><button class="btn" id="pzGo">Probar</button></div>'
    + '<div id="pzFb"></div>'
    + '<div class="q-actions" style="justify-content:space-between">'
    + '<button class="btn ghost small" id="pzHint">💡 Pista (−8 pts)</button>'
    + '<button class="btn ghost small" id="pzClose">Cerrar</button></div>');
  const inp = o.querySelector('#pzIn'); inp.focus();
  const tryIt = () => {
    const raw = inp.value.replace(/\$|\s|,/g,'');
    if(raw==='' || isNaN(+raw)) return;
    if(Math.abs(+raw - p.code) <= 0.01){
      p.solved = true; sfx('unlock'); closeModal();
      toast('🔑 ¡Llave de “'+p.title+'” obtenida!');
      renderEscape();
      if(ESC.puzzles.every(x=>x.solved)) setTimeout(()=>{ const s=$('#escSafe'); if(s) s.scrollIntoView({behavior:'smooth'}); }, 300);
    } else {
      ESC.wrongAns++; sfx('bad');
      inp.classList.add('err'); setTimeout(()=>inp.classList.remove('err'), 500);
      o.querySelector('#pzFb').innerHTML = '<div class="fb bad" style="margin-top:10px"><div class="fb-head">❌ Código incorrecto</div><div class="fb-exp">'+p.help+'</div></div>';
    }
  };
  o.querySelector('#pzGo').addEventListener('click', tryIt);
  inp.addEventListener('keydown', e => { if(e.key==='Enter') tryIt(); });
  o.querySelector('#pzHint').addEventListener('click', () => {
    ESC.hints++; sfx('flip');
    o.querySelector('#pzFb').innerHTML = '<div class="fb ok" style="margin-top:10px"><div class="fb-head">💡 Pista</div><ol class="steps">'+p.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol></div>';
  });
  o.querySelector('#pzClose').addEventListener('click', closeModal);
}
function trySafe(){
  const vals = [0,1,2,3].map(i => +($('#code'+i).value.replace(/\$|\s|,/g,'')));
  const ok = ESC.puzzles.every((p,i) => Math.abs(vals[i]-p.code) <= 0.01);
  const safe = $('#escSafe');
  if(!ok){
    ESC.wrongSafe++; sfx('bad');
    safe.classList.remove('shake'); void safe.offsetWidth; safe.classList.add('shake');
    toast('🚨 La caja no abre: revisa los códigos y su orden.');
    return;
  }
  safe.classList.add('open-anim');
  safe.querySelector('.dial').textContent = '🎉';
  sfx('win'); confetti(120);
  const sec = (Date.now()-ESC.t0)/1000;
  const score = clamp(100 - 4*ESC.wrongAns - 8*ESC.hints - 5*ESC.wrongSafe, 55, 100);
  ESC = null;
  setTimeout(() => recordResult(10, score, 80, sec, [
    {ok:true, prompt:'Sala de archivo — frecuencia', note:''},
    {ok:true, prompt:'Bóveda de datos — severidad', note:''},
    {ok:true, prompt:'Oficina del suscriptor — prima de riesgo', note:''},
    {ok:true, prompt:'Sala de reclamaciones — deducible y coaseguro', note:''}
  ]), 900);
}

/* ==================== Flashcards (repetición espaciada) ==================== */
/* Cada tarjeta guarda intervalo (días) y fecha de vencimiento. El mazo se
   ordena: vencidas primero, luego nuevas (priorizando los temas con más
   errores según S.concepts), y al final las que aún no vencen. */
const SRS_DAY = 86400000;
let FL = null;
function srsOf(t){ return (S.flashSRS||{})[t] || null; }
function topicErrRate(k){ const c = S.concepts[k]; if(!c) return 0; const n = c.ok+c.bad; return n ? c.bad/n : 0; }
function srsDueCounts(){
  const now = Date.now();
  let due = 0, fresh = 0;
  GLOSSARY.forEach(g => { const r = srsOf(g.t); if(!r) fresh++; else if(r.due <= now) due++; });
  return {due, fresh};
}
function startFlash(){
  const now = Date.now();
  const cat = g => { const r = srsOf(g.t); return !r ? 1 : (r.due <= now ? 0 : 2); };
  const deck = shuffle(GLOSSARY).sort((a,b) => {
    const ca = cat(a), cb = cat(b);
    if(ca !== cb) return ca - cb;
    if(ca === 0) return srsOf(a.t).due - srsOf(b.t).due;            // más vencida primero
    if(ca === 1) return topicErrRate(b.k) - topicErrRate(a.k);      // temas más fallados primero
    return srsOf(a.t).due - srsOf(b.t).due;
  });
  FL = { deck, i:0 };
  renderFlash(); showView('flash');
}
function renderFlash(){
  const g = FL.deck[FL.i];
  const cardEl = $('#flashCard');
  cardEl.classList.remove('flipped');
  $('#flashRate').classList.add('hidden');
  $('#flashFront').textContent = g.t;
  $('#flashBack').textContent = g.d;
  const c = srsDueCounts();
  const r = srsOf(g.t);
  const state = !r ? '🆕 nueva' : (r.due <= Date.now() ? '🔴 por repasar' : '✅ al día');
  $('#flashCount').textContent = 'Tarjeta '+(FL.i+1)+' de '+FL.deck.length+' ('+state+') · 🔴 '+c.due+' por repasar · 🆕 '+c.fresh+' nuevas';
}
function flashFlip(){
  sfx('flip');
  const flipped = $('#flashCard').classList.toggle('flipped');
  $('#flashRate').classList.toggle('hidden', !flipped);
}
function rateFlash(quality){
  const g = FL.deck[FL.i];
  if(!S.flashSRS) S.flashSRS = {};
  const r = S.flashSRS[g.t] || {iv:0, reps:0};
  if(quality === 'again'){
    r.iv = 0; r.due = Date.now(); r.reps = 0;
    // la tarjeta reaparece unas posiciones más adelante en esta misma sesión
    const card = FL.deck.splice(FL.i, 1)[0];
    FL.deck.splice(Math.min(FL.i+3, FL.deck.length), 0, card);
    sfx('bad');
  } else if(quality === 'hard'){
    r.iv = 1; r.due = Date.now() + SRS_DAY; r.reps++;
    FL.i = (FL.i+1) % FL.deck.length;
    sfx('flip');
  } else {
    r.iv = Math.max(2, Math.round((r.iv||1)*2.2));
    r.due = Date.now() + r.iv*SRS_DAY; r.reps++;
    FL.i = (FL.i+1) % FL.deck.length;
    sfx('ok');
  }
  S.flashSRS[g.t] = r; save();
  renderFlash();
}
$('#flashCard').addEventListener('click', flashFlip);
$('#flashFlip').addEventListener('click', flashFlip);
$('#flashAgain').addEventListener('click', () => rateFlash('again'));
$('#flashHard').addEventListener('click', () => rateFlash('hard'));
$('#flashEasy').addEventListener('click', () => rateFlash('easy'));
$('#flashPrev').addEventListener('click', () => { sfx('click'); FL.i = (FL.i-1+FL.deck.length)%FL.deck.length; renderFlash(); });
$('#flashNext').addEventListener('click', () => { sfx('click'); FL.i = (FL.i+1)%FL.deck.length; renderFlash(); });
$('#flashShuffle').addEventListener('click', () => { sfx('click'); FL.deck = shuffle(FL.deck); FL.i=0; renderFlash(); toast('🔀 Mazo barajado'); });
$('#btnFlash').addEventListener('click', () => { sfx('click'); touchStreak(); startFlash(); });

/* ==================== Reto contrarreloj ==================== */
const BLITZ_BASE_T = 60, BLITZ_MAX_T = 90, BLITZ_BONUS_S = 5;
let BL = null;
function startBlitz(){
  blitzQueue = buildBlitzPool();
  BL = { ok:0, total:0, t:BLITZ_BASE_T, combo:0, bestCombo:0, fails:0 };
  $('#blitzOk').textContent = '0';
  $('#blitzCombo').textContent = '0';
  $('#blitzBest').textContent = '0';
  $('#blitzBonus').textContent = '';
  $('#blitzTimer').textContent = String(BLITZ_BASE_T);
  $('#blitzTimer').classList.remove('low');
  showView('blitz'); blitzNext();
  blitzInt = setInterval(() => {
    if(!BL) return;
    BL.t--;
    const el = $('#blitzTimer'); el.textContent = BL.t;
    el.classList.toggle('low', BL.t <= 10);
    if(BL.t <= 0) endBlitz();
  }, 1000);
}
/* Banco de preguntas del contrarreloj: una cola barajada que se rellena al
   agotarse, para que no se repitan las primeras preguntas tan pronto. */
let blitzQueue = [];
function buildBlitzPool(){
  const pool = [];
  // definiciones de concepto (glosario)
  GLOSSARY.forEach(g => {
    const others = shuffle(GLOSSARY.filter(x => x.s !== g.s)).slice(0,2);
    pool.push({ prompt:'¿Qué es <b>'+g.t.toLowerCase()+'</b>?', options: shuffle([{t:g.s, ok:true}, ...others.map(o=>({t:o.s, ok:false}))]) });
  });
  // concepto inverso: dada la definición corta, ¿cuál es?
  GLOSSARY.forEach(g => {
    const others = shuffle(GLOSSARY.filter(x => x.t !== g.t)).slice(0,2);
    pool.push({ prompt:'“'+g.s+'” corresponde a…', options: shuffle([{t:g.t, ok:true}, ...others.map(o=>({t:o.t, ok:false}))]) });
  });
  // verdadero / falso de varios módulos
  [].concat(TF_M1, TF_INF, TF_DEV, TF_DEP).forEach(it => {
    pool.push({ prompt: it.s, options: [{t:'✅ Verdadero', ok:it.a},{t:'❌ Falso', ok:!it.a}] });
  });
  // identificar el fenómeno económico
  PHENO.forEach(it => {
    pool.push({ prompt:'“'+it.s+'”', options: shuffle(['Inflación','Devaluación','Depreciación'].map(t => ({t, ok:t===it.a}))) });
  });
  // fórmulas relámpago
  const FORMULAS = [
    {q:'Prima de riesgo =', ok:'Frecuencia × Severidad', bad:['Frecuencia ÷ Severidad','Siniestros ÷ Primas']},
    {q:'Frecuencia =', ok:'Siniestros ÷ Exposición', bad:['Pérdidas ÷ Siniestros','Primas ÷ Siniestros']},
    {q:'Severidad =', ok:'Pérdidas ÷ Siniestros', bad:['Siniestros ÷ Exposición','Primas × Frecuencia']},
    {q:'Siniestralidad =', ok:'Siniestros pagados ÷ Primas', bad:['Primas ÷ Siniestros','Frecuencia × Severidad']},
    {q:'Prima de tarifa =', ok:'Prima pura + gastos + utilidad', bad:['Prima pura − deducible','Frecuencia ÷ Severidad']}
  ];
  FORMULAS.forEach(f => pool.push({ prompt:'<b>'+f.q+'</b>', options: shuffle([{t:f.ok, ok:true}, ...f.bad.map(b=>({t:b, ok:false}))]) }));
  return shuffle(pool);
}
function blitzQ(){
  if(!blitzQueue.length) blitzQueue = buildBlitzPool();
  return blitzQueue.pop();
}
function blitzNext(){
  if(!BL) return;
  const q = blitzQ();
  const host = $('#blitzHost'); host.innerHTML = '';
  const card = document.createElement('div'); card.className = 'qcard';
  card.innerHTML = '<div class="q-prompt" style="font-size:1rem">'+q.prompt+'</div>';
  const wrap = document.createElement('div'); wrap.className = 'opts';
  q.options.forEach(op => {
    const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = '<span>'+op.t+'</span>';
    b.onclick = () => {
      if(!BL) return;
      BL.total++; S.totalAnswered = (S.totalAnswered||0) + 1;
      wrap.querySelectorAll('.opt').forEach(o => o.disabled = true);
      if(op.ok){
        BL.ok++; BL.combo++;
        if(BL.combo > BL.bestCombo) BL.bestCombo = BL.combo;
        $('#blitzOk').textContent = BL.ok;
        $('#blitzCombo').textContent = BL.combo;
        $('#blitzBest').textContent = BL.bestCombo;
        const before = BL.t;
        BL.t = Math.min(BLITZ_MAX_T, BL.t + BLITZ_BONUS_S);
        const gained = BL.t - before;
        const timerEl = $('#blitzTimer');
        timerEl.textContent = BL.t;
        timerEl.classList.toggle('low', BL.t <= 10);
        const bonusEl = $('#blitzBonus');
        if(gained > 0){
          bonusEl.textContent = '+'+gained+' s ⚡';
          bonusEl.style.color = 'var(--good-text)';
          bonusEl.classList.remove('pop-anim'); void bonusEl.offsetWidth; bonusEl.classList.add('pop-anim');
        }
        sfx('ok'); celebrateCorrect(); b.classList.add('correct');
      } else {
        BL.combo = 0; $('#blitzCombo').textContent = '0';
        // penalización que crece con cada falla: −5 s, −10 s, −15 s, …
        BL.fails++;
        const penalty = 5 * BL.fails;
        BL.t = Math.max(0, BL.t - penalty);
        const timerEl = $('#blitzTimer');
        timerEl.textContent = BL.t;
        timerEl.classList.toggle('low', BL.t <= 10);
        const bonusEl = $('#blitzBonus');
        bonusEl.textContent = '−'+penalty+' s ❌';
        bonusEl.style.color = 'var(--bad-text)';
        bonusEl.classList.remove('pop-anim'); void bonusEl.offsetWidth; bonusEl.classList.add('pop-anim');
        sfx('bad'); b.classList.add('wrong');
        if(BL.t <= 0){ setTimeout(endBlitz, 400); return; }
      }
      setTimeout(blitzNext, op.ok ? 260 : 650);
    };
    wrap.appendChild(b);
  });
  card.appendChild(wrap); host.appendChild(card);
}
function endBlitz(){
  clearInterval(blitzInt); blitzInt = null;
  const res = BL; BL = null;
  const xp = res.ok*4 + res.bestCombo*2;
  if(res.ok > S.bestBlitz) S.bestBlitz = res.ok;
  if(res.bestCombo > (S.bestBlitzCombo||0)) S.bestBlitzCombo = res.bestCombo;
  addXP(xp); S.totalTime += 60; save(); touchStreak(); checkBadges(); checkRewards(); renderHeader();
  sfx(res.ok >= 8 ? 'win' : 'bad');
  if(res.ok >= 10) confetti(60);
  const o = openModal('<div style="text-align:center"><div style="font-size:48px">⚡</div>'
    + '<h2>'+res.ok+' aciertos en el contrarreloj</h2>'
    + '<p style="color:var(--ink2)">'+res.total+' preguntas respondidas · 🔥 Mejor racha: <b>'+res.bestCombo+'</b> · <b style="color:var(--accent)">+'+xp+' XP</b> · Mejor marca: <b>'+S.bestBlitz+'</b></p>'
    + '<div class="q-actions" style="justify-content:center"><button class="btn ghost" id="blz2">🔄 Otra ronda</button><button class="btn" id="blz1">Aceptar</button></div></div>');
  o.querySelector('#blz1').addEventListener('click', () => { closeModal(); goHome(); });
  o.querySelector('#blz2').addEventListener('click', () => { closeModal(); startBlitz(); });
}
$('#btnBlitz').addEventListener('click', () => { sfx('click'); touchStreak(); startBlitz(); });
$('#btnBlitzQuit').addEventListener('click', () => { sfx('click'); if(blitzInt){clearInterval(blitzInt); blitzInt=null;} BL=null; goHome(); });

/* ==================== Muerte súbita ==================== */
let SD = null;
function startSudden(){
  SD = { combo:0, best:0 };
  $('#sdCombo').textContent = '0';
  $('#sdBest').textContent = '0';
  showView('sudden'); suddenNext();
}
function suddenNext(){
  if(!SD) return;
  const q = blitzQ();
  const host = $('#sdHost'); host.innerHTML = '';
  const card = document.createElement('div'); card.className = 'qcard';
  card.innerHTML = '<div class="q-prompt" style="font-size:1rem">'+q.prompt+'</div>';
  const wrap = document.createElement('div'); wrap.className = 'opts';
  q.options.forEach(op => {
    const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = '<span>'+op.t+'</span>';
    b.onclick = () => {
      if(!SD) return;
      S.totalAnswered = (S.totalAnswered||0) + 1;
      wrap.querySelectorAll('.opt').forEach(o => o.disabled = true);
      if(op.ok){
        SD.combo++;
        if(SD.combo > SD.best) SD.best = SD.combo;
        $('#sdCombo').textContent = SD.combo;
        $('#sdBest').textContent = SD.best;
        sfx('ok'); celebrateCorrect(); b.classList.add('correct');
        setTimeout(suddenNext, 260);
      } else {
        sfx('bad'); b.classList.add('wrong');
        setTimeout(endSudden, 750);
      }
    };
    wrap.appendChild(b);
  });
  card.appendChild(wrap); host.appendChild(card);
}
function endSudden(){
  const res = SD; SD = null;
  const xp = res.best*3;
  if(res.best > (S.bestSudden||0)) S.bestSudden = res.best;
  addXP(xp); save(); touchStreak(); checkBadges(); checkRewards(); renderHeader();
  sfx(res.best >= 10 ? 'win' : 'bad');
  if(res.best >= 15) confetti(80);
  const o = openModal('<div style="text-align:center"><div style="font-size:48px">💀</div>'
    + '<h2>Racha de '+res.best+'</h2>'
    + '<p style="color:var(--ink2)">Un error termina la racha · <b style="color:var(--accent)">+'+xp+' XP</b> · Mejor marca: <b>'+S.bestSudden+'</b></p>'
    + '<div class="q-actions" style="justify-content:center"><button class="btn ghost" id="sd2">🔄 Otra ronda</button><button class="btn" id="sd1">Aceptar</button></div></div>');
  o.querySelector('#sd1').addEventListener('click', () => { closeModal(); goHome(); });
  o.querySelector('#sd2').addEventListener('click', () => { closeModal(); startSudden(); });
}
$('#btnSudden').addEventListener('click', () => { sfx('click'); touchStreak(); startSudden(); });
$('#btnSuddenQuit').addEventListener('click', () => { sfx('click'); SD=null; goHome(); });

/* ==================== Repaso mixto ==================== */
function startReview(){
  const pool = MODULES.filter(m => m.build && isUnlocked(m.id)).flatMap(m => m.build());
  if(pool.length < 5){ toast('🎯 Desbloquea más módulos para tener variedad en el repaso mixto.'); return; }
  touchStreak();
  SES = { id:'review', review:true, qs: shuffle(pool).slice(0,10), i:0, pts:0, xp:0, t0:Date.now(), recap:[] };
  showView('session'); renderQ();
  toast('🎯 Repaso mixto: 10 preguntas variadas de tus módulos desbloqueados, sin presión de tiempo.');
}
function finishReview(){
  const n = SES.qs.length;
  const score = Math.round(100*SES.pts/n);
  const sec = (Date.now()-SES.t0)/1000;
  const recap = SES.recap;
  const xpEarned = SES.xp;
  SES = null;
  S.totalTime += sec;
  const bonus = score===100 ? 15 : 0;
  addXP(xpEarned + bonus);
  save(); checkBadges(); checkRewards(); renderHeader();
  renderReviewResult(score, xpEarned+bonus, sec, recap);
  if(score>=80){ sfx('win'); confetti(50); } else sfx('bad');
}
function renderReviewResult(score, xp, sec, recap){
  const R = 56, C = 2*Math.PI*R;
  const passed = score>=80;
  const okCount = recap.filter(r=>r.ok).length;
  let html = '<div class="result-card">'
    + '<div class="big-ico">'+(score===100?'🏆':passed?'🎉':'📚')+'</div>'
    + '<h2>Repaso mixto terminado</h2>'
    + '<div class="r-sub">🎯 Repaso mixto · práctica libre</div>'
    + '<div class="r-score-ring"><svg width="130" height="130">'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="var(--surface3)" stroke-width="12"/>'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="'+(passed?'var(--good)':'var(--bad)')+'" stroke-width="12" stroke-linecap="round" '
    + 'stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-score/100))+'" style="transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)"/>'
    + '</svg><span class="val">'+score+'%</span></div>'
    + '<div class="r-meta"><span><b>'+okCount+'/'+recap.length+'</b>aciertos</span>'
    + '<span><b>+'+xp+'</b>XP</span><span><b>'+fmtDur(sec)+'</b>tiempo</span></div>'
    + '<p style="font-size:.85rem;color:var(--ink2)">Este repaso no cuenta para las estrellas de los módulos: es solo práctica libre.</p>'
    + '<div class="q-actions" style="justify-content:center">'
    + '<button class="btn ghost" id="rHome">🏠 Inicio</button>'
    + '<button class="btn" id="rAgain">🔄 Otro repaso</button>'
    + '</div></div>';
  if(recap.length) html += reviewSectionHTML(recap, '📋 Repaso de la sesión');
  $('#view-result').innerHTML = html;
  showView('result');
  if(recap.length) bindReview();
  $('#rHome').onclick = ()=>{ sfx('click'); goHome(); };
  $('#rAgain').onclick = ()=>{ sfx('click'); startReview(); };
}
$('#btnReview').addEventListener('click', () => { sfx('click'); startReview(); });

/* ==================== Modos de juego ==================== */
/* Banco de preguntas de la materia activa (reutiliza los generadores de los módulos) */
function subjPool(unlockedOnly){
  return MODULES.filter(m => m.build && (unlockedOnly===false || isUnlocked(m.id)))
    .flatMap(m => { try{ return m.build(); }catch(e){ return []; } });
}
function poolByType(t){ return subjPool().filter(q => q.type===t); }
function simplePool(){ return subjPool().filter(q => ['mc','tf','numeric','formula'].includes(q.type)); }
function weakTopics(){
  return Object.entries(S.concepts||{}).filter(([k,c]) => c.bad>0)
    .sort((a,b) => (b[1].bad/(b[1].ok+b[1].bad)) - (a[1].bad/(a[1].ok+a[1].bad))).map(x=>x[0]);
}
/* Motor genérico de sesión de preguntas (reutiliza renderQ/settle/showFeedback) */
function startMode(cfg){
  const qs = cfg.qs || (cfg.endless ? [cfg.next()] : (cfg.build ? cfg.build() : null));
  if(!cfg.endless && (!qs || qs.length < 1)){ toast('🚧 Este modo aún no tiene preguntas para esta materia.'); sfx('bad'); return; }
  touchStreak();
  SES = { id:'mode', mode:cfg, qs, i:0, pts:0, xp:0, t0:Date.now(), recap:[], exam: !!cfg.hideAnswers };
  showView('session'); renderQ();
  if(cfg.introToast) toast(cfg.introToast);
}
function finishGeneric(){
  const cfg = SES.mode;
  const n = SES.recap.length || SES.qs.length;
  const score = n ? Math.round(100*SES.pts/n) : 0;
  const sec = (Date.now()-SES.t0)/1000;
  const recap = SES.recap;
  const baseXp = SES.xp;
  SES = null;
  S.totalTime += sec;
  const bonus = (cfg.bonus||0) + (score>=90 && !cfg.endless ? 15 : 0);
  addXP(baseXp + bonus);
  if(!S.modeStats) S.modeStats = {};
  const ms = S.modeStats[cfg.id] || (S.modeStats[cfg.id] = {plays:0, best:0});
  ms.plays++; ms.best = Math.max(ms.best, score); ms.last = Date.now();
  if(score >= 80 && recap.length >= 5) gainHeart(1, 'practicar');   // ❤️ la práctica recupera
  save(); checkBadges(); checkRewards(); renderHeader();
  renderModeResult(cfg, score, baseXp+bonus, sec, recap);
  if(score>=80){ sfx('win'); confetti(50); } else sfx('bad');
  if(cfg.onFinish) cfg.onFinish(score, recap, sec);   // hook opcional (p. ej. reto entre compañeros)
}
function renderModeResult(cfg, score, xp, sec, recap){
  const R = 56, C = 2*Math.PI*R;
  const okCount = recap.filter(r=>r.ok).length;
  const passed = score>=80;
  let html = '<div class="result-card">'
    + '<div class="big-ico">'+(cfg.icon||'🎮')+'</div>'
    + '<h2>'+esc(cfg.title||'Modo de juego')+'</h2>'
    + '<div class="r-sub">'+esc(subjectById(S.activeSubject).name)+'</div>'
    + '<div class="r-score-ring"><svg width="130" height="130">'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="var(--surface3)" stroke-width="12"/>'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="'+(passed?'var(--good)':'var(--bad)')+'" stroke-width="12" stroke-linecap="round" '
    + 'stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-score/100))+'" style="transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)"/>'
    + '</svg><span class="val">'+score+'%</span></div>'
    + '<div class="r-meta"><span><b>'+okCount+'/'+recap.length+'</b>aciertos</span>'
    + '<span><b>+'+xp+'</b>XP</span><span><b>'+fmtDur(sec)+'</b>tiempo</span></div>'
    + '<div class="q-actions" style="justify-content:center">'
    + '<button class="btn ghost" id="rHome">🏠 Inicio</button>'
    + '<button class="btn ghost" id="rModes">🎮 Modos</button>'
    + '<button class="btn" id="rAgain">🔄 Otra vez</button></div></div>';
  if(recap.length) html += reviewSectionHTML(recap, '📋 Revisión');
  $('#view-result').innerHTML = html;
  showView('result');
  if(recap.length) bindReview();
  $('#rHome').onclick = ()=>{ sfx('click'); goHome(); };
  $('#rModes').onclick = ()=>{ sfx('click'); renderModes(); showView('modes'); };
  $('#rAgain').onclick = ()=>{ sfx('click'); (MODE_RUN[cfg.id]||(()=>{ renderModes(); showView('modes'); }))(); };
}
/* — Modos basados en el motor genérico — */
function startVF(){ startMode({id:'vf', title:'Verdadero / Falso rápido', icon:'⚖️', qs: shuffle(poolByType('tf')).slice(0,12), introToast:'⚖️ Responde 12 afirmaciones a toda velocidad.'}); }
function startFormulaMode(){ startMode({id:'formula', title:'Completar fórmula', icon:'🧮', qs: shuffle(poolByType('formula')).slice(0,8)}); }
function startOrderMode(){ startMode({id:'order', title:'Ordenar procedimiento', icon:'🔢', qs: shuffle(poolByType('order')).slice(0,6)}); }
function startErrorReview(){
  const weak = weakTopics();
  const pool = subjPool().filter(q => weak.includes(q.topic));
  startMode({id:'errors', title:'Repaso de errores', icon:'🔁', qs: shuffle(pool.length?pool:subjPool()).slice(0,10),
    introToast: weak.length ? '🔁 Preguntas de tus temas más fallados.' : '🎯 Sin errores registrados: repaso general.'});
}
function startWrongOnly(){
  const ex = (S.examHistory||[])[0];
  const topics = (ex && ex.failedTopics) || [];
  if(!topics.length){ toast('🎉 No hay incorrectas recientes. Presenta un examen diario primero.'); sfx('bad'); return; }
  const pool = subjPool().filter(q => topics.includes(q.topic));
  startMode({id:'wrong', title:'Solo incorrectas', icon:'❌', qs: shuffle(pool.length?pool:subjPool()).slice(0,10),
    introToast:'❌ A vencer lo que fallaste en tu último examen.'});
}
function startInfinite(){ startMode({id:'infinite', title:'Práctica infinita', icon:'♾️', endless:true, next:()=>pick(subjPool()), introToast:'♾️ Practica sin fin. Toca “🏁 Terminar” cuando quieras.'}); }
function startCarrera(){ startMode({id:'carrera', title:'Carrera de XP', icon:'🏁', endless:true, target:100, next:()=>pick(subjPool()), introToast:'🏁 ¡Llega a 100 XP lo antes posible!'}); }

/* ==================== Reto entre compañeros ====================
   Sin servidor en tiempo real: el reto viaja en un CÓDIGO que se comparte.
   Con la misma "semilla" (seed) ambos generan EXACTAMENTE las mismas preguntas,
   juegan por separado y comparan resultados. */
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function withSeed(seed, fn){ const orig=Math.random; Math.random = mulberry32(seed>>>0); try{ return fn(); } finally { Math.random = orig; } }
/* Preguntas reproducibles de una materia a partir de la semilla (independiente del progreso). */
function challengePool(subjectId, seed, n){
  return withSeed(seed, ()=>{
    const mods = MODULES_BY_SUBJECT[subjectId] || [];
    let pool = [];
    mods.forEach(m => { if(m.build){ try{ pool.push(...m.build()); }catch(e){} } });
    return shuffle(pool).slice(0, n);
  });
}
/* Código compartible: 'AIQ1' + base64(JSON) tolerante a nombres con acentos. */
function challengeEncode(obj){ return 'AIQ1'+btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=+$/,''); }
function challengeDecode(code){
  try{
    const s = String(code).trim().replace(/\s+/g,'');
    if(!s.startsWith('AIQ1')) return null;
    const json = decodeURIComponent(escape(atob(s.slice(4))));
    const o = JSON.parse(json);
    if(!o || !o.s || o.seed==null || !o.n) return null;
    if(!MODULES_BY_SUBJECT[o.s]) return null;
    return o;
  }catch(e){ return null; }
}
async function copyToClipboard(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(e){
    try{ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); const ok=document.execCommand('copy'); ta.remove(); return ok; }
    catch(e2){ return false; }
  }
}
const RETO_SUBJECTS = () => SUBJECTS.filter(s => (MODULES_BY_SUBJECT[s.id]||[]).some(m=>m.build));
function openRetoHub(){
  const o = openModal('<h2 style="margin-top:0">🤺 Reto entre compañeros</h2>'
    + '<p style="color:var(--ink2);font-size:.92rem">Mismas preguntas para los dos: quien saque más, gana. Todo viaja en un código que se comparte (no necesitas internet).</p>'
    + '<div class="q-actions" style="justify-content:center;flex-wrap:wrap"><button class="btn" id="retoCreate">➕ Crear un reto</button>'
    + '<button class="btn ghost" id="retoRespond">📥 Responder un reto</button></div>');
  o.querySelector('#retoCreate').addEventListener('click', ()=>{ sfx('click'); retoCreateForm(); });
  o.querySelector('#retoRespond').addEventListener('click', ()=>{ sfx('click'); retoRespondForm(); });
}
function retoCreateForm(){
  const subs = RETO_SUBJECTS();
  const o = openModal('<h2 style="margin-top:0">➕ Crear un reto</h2>'
    + '<label class="q-help" style="display:block;margin-bottom:4px">Materia</label>'
    + '<select class="ainput" id="retoSubj">'+subs.map(s=>'<option value="'+s.id+'"'+(s.id===S.activeSubject?' selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select>'
    + '<label class="q-help" style="display:block;margin:10px 0 4px">Número de preguntas</label>'
    + '<select class="ainput" id="retoN"><option value="6">6</option><option value="8" selected>8</option><option value="10">10</option><option value="12">12</option></select>'
    + '<div class="q-actions" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" id="retoBack">← Volver</button><button class="btn" id="retoGo">🎮 Jugar mi reto</button></div>');
  o.querySelector('#retoBack').addEventListener('click', ()=>{ sfx('click'); openRetoHub(); });
  o.querySelector('#retoGo').addEventListener('click', ()=>{
    const subject = o.querySelector('#retoSubj').value;
    const n = +o.querySelector('#retoN').value || 8;
    const seed = (Math.floor(Math.random()*1e9)) >>> 0;
    closeModal(); sfx('click');
    startChallenge({subject, seed, n, mode:'create'});
  });
}
function retoRespondForm(){
  const o = openModal('<h2 style="margin-top:0">📥 Responder un reto</h2>'
    + '<p class="q-help">Pega el código que te compartió tu compañero.</p>'
    + '<textarea class="ainput" id="retoCode" rows="3" placeholder="AIQ1…" style="width:100%;resize:vertical;font-family:ui-monospace,monospace"></textarea>'
    + '<div class="q-actions" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" id="retoBack">← Volver</button><button class="btn" id="retoAccept">✅ Aceptar reto</button></div>');
  o.querySelector('#retoBack').addEventListener('click', ()=>{ sfx('click'); openRetoHub(); });
  o.querySelector('#retoAccept').addEventListener('click', ()=>{
    const data = challengeDecode(o.querySelector('#retoCode').value);
    if(!data){ toast('❌ Código de reto no válido'); sfx('bad'); return; }
    closeModal(); sfx('click');
    startChallenge({subject:data.s, seed:data.seed, n:data.n, mode:'respond', rivalName:data.by||'Tu rival', rivalScore:+data.sc||0});
  });
}
function startChallenge(cfg){
  if(cfg.subject !== S.activeSubject) switchSubject(cfg.subject);   // contexto de la materia del reto
  const qs = challengePool(cfg.subject, cfg.seed, cfg.n);
  if(!qs.length){ toast('🚧 Esa materia no tiene preguntas para el reto.'); sfx('bad'); return; }
  const subj = subjectById(cfg.subject);
  const intro = cfg.mode==='respond'
    ? '🤺 Reto de '+esc(cfg.rivalName)+' ('+cfg.rivalScore+'%). ¡Supéralo!'
    : '🤺 Juega tu reto; al final te doy el código para compartir.';
  startMode({ id:'reto', title:'🤺 Reto · '+subj.short, icon:'🤺', qs, hideAnswers:true, introToast:intro,
    onFinish:(score)=> retoResult(cfg, score) });
}
function retoResult(cfg, myScore){
  const myName = activeProfile().name;
  const code = challengeEncode({v:1, s:cfg.subject, seed:cfg.seed, n:cfg.n, by:myName, sc:myScore});
  const subj = subjectById(cfg.subject);
  let head, body;
  if(cfg.mode==='respond'){
    const win = myScore>cfg.rivalScore ? '🏆 ¡Ganaste!' : myScore<cfg.rivalScore ? '😮 Ganó '+esc(cfg.rivalName) : '🤝 ¡Empate!';
    head = '🤺 Resultado del reto';
    body = '<div class="reto-vs"><div><b>'+esc(myName)+'</b><div class="reto-sc">'+myScore+'%</div></div>'
      + '<div class="reto-mid">vs</div><div><b>'+esc(cfg.rivalName)+'</b><div class="reto-sc">'+cfg.rivalScore+'%</div></div></div>'
      + '<p class="lb-motiv" style="text-align:center">'+win+'</p>'
      + '<p class="q-help">Envía este código de vuelta a '+esc(cfg.rivalName)+' para que vea tu resultado:</p>';
  } else {
    head = '🤺 ¡Reto listo!';
    body = '<p style="text-align:center;font-size:1.05rem">Sacaste <b>'+myScore+'%</b> en '+esc(subj.short)+'.</p>'
      + '<p class="q-help">Comparte este código con un compa para que juegue las MISMAS preguntas y se comparen:</p>';
  }
  const o = openModal('<h2 style="margin-top:0">'+head+'</h2>'+body
    + '<textarea class="ainput" id="retoOut" rows="3" readonly style="width:100%;resize:vertical;font-family:ui-monospace,monospace">'+esc(code)+'</textarea>'
    + '<div class="q-actions" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" id="retoDone">Cerrar</button><button class="btn" id="retoCopy">📋 Copiar código</button></div>');
  o.querySelector('#retoCopy').addEventListener('click', async ()=>{ const ok=await copyToClipboard(code); toast(ok?'📋 Código copiado':'Selecciona y copia el código'); sfx(ok?'ok':'bad'); });
  o.querySelector('#retoDone').addEventListener('click', ()=>{ sfx('click'); closeModal(); });
}
function openModulePicker(){
  const avail = MODULES.filter(m => m.build && isUnlocked(m.id));
  if(!avail.length){ toast('🔒 Desbloquea módulos para el quiz clásico.'); return; }
  const o = openModal('<h2 style="margin-top:0">📝 Quiz clásico</h2><p style="color:var(--ink2);font-size:.9rem">Elige el módulo que quieres practicar.</p>'
    + avail.map(m => '<button class="profile-row" style="width:100%;text-align:left" data-mod="'+m.id+'"><span class="pr-av">'+m.icon+'</span><span class="pr-name">'+esc(m.name)+'</span></button>').join('')
    + '<div class="q-actions" style="justify-content:center"><button class="btn ghost" id="mpClose">Cerrar</button></div>');
  o.querySelectorAll('[data-mod]').forEach(b => b.addEventListener('click', () => { closeModal(); openModule(+b.dataset.mod); }));
  o.querySelector('#mpClose').addEventListener('click', closeModal);
}
/* — Preguntas simples embebidas (para juegos bespoke: ruleta, jeopardy, bingo, código, versus) — */
function miniAsk(host, q, cb){
  host.innerHTML = '';
  const card = document.createElement('div'); card.className = 'qcard';
  card.innerHTML = '<span class="q-topic">'+(TOPIC_NAMES[q.topic]||'Concepto')+'</span><div class="q-prompt">'+q.prompt+'</div>'+(q.dataHtml||'');
  host.appendChild(card);
  const done = (ok, chosenShown) => {
    const fb = document.createElement('div'); fb.className = 'fb '+(ok?'ok':'bad');
    fb.innerHTML = '<div class="fb-head">'+(ok?'✅ ¡Correcto!':'❌ Incorrecto')+'</div>'
      + (!ok && q.correctText ? '<div class="fb-exp">✔️ Respuesta: '+q.correctText+'</div>' : '');
    card.appendChild(fb);
    S.totalAnswered = (S.totalAnswered||0)+1; trackConcept(q.topic, ok);
    sfx(ok?'ok':'bad');
    setTimeout(()=>cb(ok), 950);
  };
  if(q.type==='mc'){
    const wrap = document.createElement('div'); wrap.className='opts';
    q.options.forEach(op => { const b=document.createElement('button'); b.className='opt'; b.innerHTML='<span>'+op.t+'</span>';
      b.onclick=()=>{ wrap.querySelectorAll('.opt').forEach(o=>o.disabled=true); if(op.ok)b.classList.add('correct'); else{b.classList.add('wrong'); q.options.forEach((o2,j)=>{if(o2.ok)wrap.children[j].classList.add('correct');});} done(!!op.ok); };
      wrap.appendChild(b); });
    card.appendChild(wrap);
  } else if(q.type==='tf'){
    const wrap=document.createElement('div'); wrap.className='tf-row';
    [['✅ Verdadero',true],['❌ Falso',false]].forEach(([lb,val])=>{ const b=document.createElement('button'); b.className='opt'; b.textContent=lb;
      b.onclick=()=>{ wrap.querySelectorAll('.opt').forEach(o=>o.disabled=true); const ok=val===q.answer; b.classList.add(ok?'correct':'wrong'); done(ok); };
      wrap.appendChild(b); });
    card.appendChild(wrap);
  } else {
    const row=document.createElement('div'); row.className='answer-row';
    row.innerHTML='<input class="ainput" type="text" placeholder="Tu respuesta…" autocomplete="off">';
    const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Comprobar'; row.appendChild(btn); card.appendChild(row);
    const inp=row.querySelector('input'); inp.focus();
    const go=()=>{ if(!inp.value.trim())return; let ok;
      if(q.type==='formula') ok=q.accept.includes(normFormula(inp.value));
      else { const raw=inp.value.replace(/\$|\s|,/g,''); ok = !isNaN(+raw) && Math.abs(+raw - q.answer) <= (q.tol!=null?q.tol:Math.max(0.01,Math.abs(q.answer)*0.005)); }
      inp.disabled=true; btn.disabled=true; inp.classList.add(ok?'ok':'err'); done(ok); };
    btn.onclick=go; inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  }
}
/* — Ruleta de preguntas — */
function startRuleta(){
  const mods = MODULES.filter(m => m.build && isUnlocked(m.id));
  if(!mods.length){ toast('🔒 Desbloquea módulos para la ruleta.'); return; }
  touchStreak();
  let idx = 0, spinning = false, round = 0, ok = 0, xp = 0;
  const rounds = 6;
  const host = $('#modesBody');
  const draw = () => {
    host.innerHTML = '<div class="panel" style="text-align:center"><button class="btn ghost small" id="ruBack" style="float:left">← Modos</button>'
      + '<h3>🎡 Ruleta de preguntas</h3><p class="q-help">Ronda '+(round+1)+' de '+rounds+' · ✅ '+ok+'</p>'
      + '<div id="ruWheel" style="font-size:1.4rem;font-weight:800;min-height:2em;display:grid;place-items:center;border:2px dashed var(--line);border-radius:14px;margin:10px 0;padding:14px">'+mods[idx].icon+' '+esc(mods[idx].name)+'</div>'
      + '<button class="btn" id="ruSpin">🎡 ¡Girar!</button></div><div id="ruQ"></div>';
    $('#ruBack').onclick = ()=>{ sfx('click'); renderModes(); };
    $('#ruSpin').onclick = spin;
  };
  const spin = () => {
    if(spinning) return; spinning = true; sfx('flip');
    let ticks = ri(14,24);
    const iv = setInterval(() => {
      idx = (idx+1) % mods.length;
      $('#ruWheel').innerHTML = mods[idx].icon+' '+esc(mods[idx].name);
      if(--ticks<=0){ clearInterval(iv); spinning=false; ask(); }
    }, 80);
  };
  const ask = () => {
    const q = pick(mods[idx].build());
    $('#ruSpin').disabled = true;
    miniAsk($('#ruQ'), q, (correct) => {
      if(correct){ ok++; xp += 10; }
      round++;
      if(round >= rounds){ addXP(xp); if(!S.modeStats)S.modeStats={}; const ms=S.modeStats.ruleta||(S.modeStats.ruleta={plays:0,best:0}); ms.plays++; ms.best=Math.max(ms.best,ok); save(); checkRewards(); renderHeader();
        host.innerHTML = '<div class="result-card"><div class="big-ico">🎡</div><h2>Ruleta terminada</h2><p style="font-weight:700">✅ '+ok+' de '+rounds+' · +'+xp+' XP</p><div class="q-actions" style="justify-content:center"><button class="btn ghost" id="ruHome">🏠 Inicio</button><button class="btn" id="ruAgain">🔄 Otra vez</button></div></div>';
        $('#ruHome').onclick=()=>{sfx('click');goHome();}; $('#ruAgain').onclick=()=>{sfx('click');startRuleta();};
        if(ok>=rounds*0.7){ sfx('win'); confetti(40);} }
      else draw();
    });
  };
  showView('modes'); draw();
}
/* — Jeopardy por temas — */
function startJeopardy(){
  const mods = shuffle(MODULES.filter(m => m.build && isUnlocked(m.id))).slice(0,4);
  if(mods.length<3){ toast('🔒 Desbloquea al menos 3 módulos para Jeopardy.'); return; }
  touchStreak();
  const vals = [100,200,300];
  const used = {}; let score = 0, answered = 0, total = mods.length*vals.length;
  const host = $('#modesBody');
  const draw = () => {
    let html = '<div class="panel"><button class="btn ghost small" id="jBack">← Modos</button>'
      + '<h3 style="display:inline-block;margin-left:8px">🎯 Jeopardy · '+score+' pts</h3>'
      + '<div style="overflow-x:auto"><table class="hist-table" style="min-width:420px"><tr>'+mods.map(m=>'<th style="text-align:center">'+m.icon+'<br>'+esc(m.name.split(' ')[0])+'</th>').join('')+'</tr>';
    vals.forEach(v => { html += '<tr>'+mods.map((m,ci)=>{ const key=ci+'-'+v; return '<td style="text-align:center">'+(used[key]?'<span style="opacity:.3">—</span>':'<button class="btn small" data-cell="'+key+'">'+v+'</button>')+'</td>'; }).join('')+'</tr>'; });
    html += '</table></div><p class="q-help">Elige una casilla, responde y suma puntos.</p></div><div id="jQ"></div>';
    host.innerHTML = html;
    $('#jBack').onclick=()=>{ sfx('click'); renderModes(); };
    $$('#modesBody [data-cell]').forEach(b => b.addEventListener('click', ()=>{
      const [ci,v] = b.dataset.cell.split('-'); const m = mods[+ci];
      const q = pick(m.build());
      $$('#modesBody [data-cell]').forEach(x=>x.disabled=true);
      miniAsk($('#jQ'), q, (ok)=>{ used[b.dataset.cell]=true; answered++; if(ok) score += +v;
        if(answered>=total){ const xp=Math.round(score/10); addXP(xp); if(!S.modeStats)S.modeStats={}; const ms=S.modeStats.jeopardy||(S.modeStats.jeopardy={plays:0,best:0}); ms.plays++; ms.best=Math.max(ms.best,score); save(); checkRewards(); renderHeader();
          host.innerHTML='<div class="result-card"><div class="big-ico">🎯</div><h2>Jeopardy terminado</h2><p style="font-weight:700">'+score+' puntos · +'+xp+' XP</p><div class="q-actions" style="justify-content:center"><button class="btn ghost" id="jHome">🏠 Inicio</button><button class="btn" id="jAgain">🔄 Otra vez</button></div></div>';
          $('#jHome').onclick=()=>{sfx('click');goHome();}; $('#jAgain').onclick=()=>{sfx('click');startJeopardy();}; if(score>=total*100){sfx('win');confetti(50);} }
        else draw(); });
    }));
  };
  showView('modes'); draw();
}
/* — Bingo de conceptos — */
function startBingo(){
  touchStreak();
  const concepts = shuffle(GLOSSARY).slice(0,16);
  const marked = new Array(16).fill(false);
  let current = null, called = 0, hits = 0;
  const host = $('#modesBody');
  const lines = () => {
    let n=0; const g=(r,c)=>marked[r*4+c];
    for(let i=0;i<4;i++){ if(g(i,0)&&g(i,1)&&g(i,2)&&g(i,3))n++; if(g(0,i)&&g(1,i)&&g(2,i)&&g(3,i))n++; }
    if(g(0,0)&&g(1,1)&&g(2,2)&&g(3,3))n++; if(g(0,3)&&g(1,2)&&g(2,1)&&g(3,0))n++;
    return n;
  };
  const draw = () => {
    host.innerHTML = '<div class="panel"><button class="btn ghost small" id="biBack">← Modos</button>'
      + '<h3 style="display:inline-block;margin-left:8px">🎱 Bingo de conceptos</h3>'
      + '<p class="q-help">Se describe un concepto: toca el que corresponda en tu tablero. Completa líneas para ganar.</p>'
      + '<div class="panel" style="text-align:center;background:var(--surface2)"><b id="biClue">'+(current?esc(current.s):'Toca “Cantar” para empezar')+'</b></div>'
      + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0">'
      + concepts.map((g,i)=>'<button class="btn '+(marked[i]?'good':'ghost')+' small" data-bi="'+i+'" style="min-height:52px;font-size:.72rem">'+(marked[i]?'✔ ':'')+esc(g.t)+'</button>').join('')
      + '</div>'
      + '<div class="q-actions" style="justify-content:center"><button class="btn" id="biCall">📢 Cantar concepto</button></div>'
      + '<p class="q-help" style="text-align:center">Líneas: '+lines()+' · Aciertos: '+hits+'</p></div>';
    $('#biBack').onclick=()=>{ sfx('click'); renderModes(); };
    $('#biCall').onclick = () => {
      const rem = concepts.filter((g,i)=>!marked[i]);
      if(!rem.length){ finishBingo(); return; }
      current = pick(rem); called++; sfx('flip'); draw();
    };
    $$('#modesBody [data-bi]').forEach(b => b.addEventListener('click', ()=>{
      if(!current){ toast('Primero toca “Cantar concepto”'); return; }
      const i = +b.dataset.bi; if(marked[i]) return;
      if(concepts[i].t === current.t){ marked[i]=true; hits++; sfx('ok'); current=null;
        if(lines()>=3 || marked.every(Boolean)){ finishBingo(); return; } draw(); }
      else { sfx('bad'); toast('❌ Ese no era. El concepto sigue en juego.'); }
    }));
  };
  const finishBingo = () => {
    const xp = hits*4 + lines()*10;
    addXP(xp); if(!S.modeStats)S.modeStats={}; const ms=S.modeStats.bingo||(S.modeStats.bingo={plays:0,best:0}); ms.plays++; ms.best=Math.max(ms.best,lines()); save(); checkRewards(); renderHeader();
    host.innerHTML='<div class="result-card"><div class="big-ico">🎱</div><h2>¡Bingo!</h2><p style="font-weight:700">'+lines()+' líneas · '+hits+' aciertos · +'+xp+' XP</p><div class="q-actions" style="justify-content:center"><button class="btn ghost" id="biHome">🏠 Inicio</button><button class="btn" id="biAgain">🔄 Otra vez</button></div></div>';
    $('#biHome').onclick=()=>{sfx('click');goHome();}; $('#biAgain').onclick=()=>{sfx('click');startBingo();};
    if(lines()>=3){ sfx('win'); confetti(50); }
  };
  showView('modes'); draw();
}
/* — Código secreto — */
function startCodigo(){
  touchStreak();
  const clues = shuffle(subjPool().filter(q => q.type==='numeric' && Number.isFinite(q.answer))).slice(0,3);
  if(clues.length<3){ toast('🔒 Desbloquea más módulos de cálculo para el código secreto.'); return; }
  const host = $('#modesBody');
  let solved = 0, wrong = 0;
  const digits = clues.map(q => Math.abs(Math.round(q.answer)) % 10);   // último dígito de cada resultado
  const draw = () => {
    host.innerHTML = '<div class="panel"><button class="btn ghost small" id="coBack">← Modos</button>'
      + '<h3 style="display:inline-block;margin-left:8px">🔑 Código secreto</h3>'
      + '<p class="q-help">Resuelve los 3 cálculos. El <b>último dígito</b> de cada resultado forma el código de la caja.</p>'
      + clues.map((q,i)=>'<div class="cal-exam"><span class="ce-date">Pista '+(i+1)+'</span><span style="flex:1">'+q.prompt.replace(/<[^>]*>/g,'')+'</span>'
          + '<span class="due-chip'+(i<solved?' soon':'')+'">'+(i<solved?'✔ '+digits[i]:'🔒')+'</span></div>').join('')
      + '<div id="coQ"></div>'
      + (solved>=3 ? '<div class="panel" style="text-align:center;margin-top:10px"><h4>🔐 Ingresa el código de 3 dígitos</h4>'
          + '<input class="ainput" id="coCode" inputmode="numeric" maxlength="3" style="max-width:140px;text-align:center;font-size:1.4rem;letter-spacing:6px" placeholder="•••">'
          + '<div class="q-actions" style="justify-content:center"><button class="btn" id="coOpen">🔓 Abrir</button></div></div>' : '')
      + '</div>';
    $('#coBack').onclick=()=>{ sfx('click'); renderModes(); };
    if(solved<3){
      miniAsk($('#coQ'), clues[solved], (ok)=>{ if(ok){ solved++; sfx('unlock'); } else { wrong++; } draw(); });
    } else {
      $('#coOpen').onclick = () => {
        const val = ($('#coCode').value||'').replace(/\D/g,'');
        if(val === digits.join('')){ const xp = clamp(60 - wrong*6, 20, 60); addXP(xp); if(!S.modeStats)S.modeStats={}; const ms=S.modeStats.codigo||(S.modeStats.codigo={plays:0,best:0}); ms.plays++; ms.best=Math.max(ms.best,xp); save(); checkRewards(); renderHeader(); sfx('win'); confetti(80);
          host.innerHTML='<div class="result-card"><div class="big-ico">🎉</div><h2>¡Caja abierta!</h2><p style="font-weight:700">Código '+digits.join('')+' · +'+xp+' XP</p><div class="q-actions" style="justify-content:center"><button class="btn ghost" id="coHome">🏠 Inicio</button><button class="btn" id="coAgain">🔄 Otra vez</button></div></div>';
          $('#coHome').onclick=()=>{sfx('click');goHome();}; $('#coAgain').onclick=()=>{sfx('click');startCodigo();}; }
        else { sfx('bad'); toast('🚨 Código incorrecto. Revisa los últimos dígitos.'); }
      };
    }
  };
  showView('modes'); draw();
}
/* — Todos contra todos (por turnos en el mismo dispositivo) — */
function startHotseat(){
  const o = openModal('<h2 style="margin-top:0">👥 Todos contra todos</h2>'
    + '<p style="color:var(--ink2);font-size:.9rem">Por turnos en el mismo dispositivo. ¿Cuántos jugadores?</p>'
    + '<div class="q-actions" style="justify-content:center">'+[2,3,4].map(n=>'<button class="btn" data-n="'+n+'">'+n+' jugadores</button>').join('')+'</div>');
  o.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', ()=>{ const n=+b.dataset.n; closeModal(); hotseatSetup(n); }));
}
function hotseatSetup(n){
  const host = $('#modesBody'); showView('modes');
  host.innerHTML = '<div class="panel"><h3>👥 Nombres de los jugadores</h3>'
    + Array.from({length:n}).map((_,i)=>'<label class="fld">Jugador '+(i+1)+'<input class="ainput hsname" maxlength="14" value="Jugador '+(i+1)+'"></label>').join('')
    + '<div class="q-actions"><button class="btn" id="hsGo">▶ Empezar (5 preguntas c/u)</button></div></div>';
  $('#hsGo').onclick = () => {
    const names = $$('.hsname').map(i=>i.value.trim()||'Jugador');
    const rounds = 5, pool = simplePool();
    if(pool.length<3){ toast('🔒 Desbloquea más módulos.'); return; }
    const scores = names.map(()=>0);
    let turn = 0, round = 0;
    const nextTurn = () => {
      if(round>=rounds && turn===0){ return finishHot(); }
      const q = pick(pool);
      host.innerHTML = '<div class="panel"><button class="btn ghost small" id="hsBack">← Modos</button>'
        + '<h3 style="display:inline-block;margin-left:8px">👥 Turno de '+esc(names[turn])+'</h3>'
        + '<p class="q-help">Ronda '+(round+1)+' de '+rounds+' · '+names.map((nm,i)=>esc(nm)+': '+scores[i]).join(' · ')+'</p><div id="hsQ"></div></div>';
      $('#hsBack').onclick=()=>{ sfx('click'); renderModes(); };
      miniAsk($('#hsQ'), q, (ok)=>{ if(ok) scores[turn] += 10;
        turn++; if(turn>=names.length){ turn=0; round++; } nextTurn(); });
    };
    const finishHot = () => {
      const order = names.map((nm,i)=>({nm, s:scores[i]})).sort((a,b)=>b.s-a.s);
      addXP(20); save(); renderHeader();
      host.innerHTML = '<div class="result-card"><div class="big-ico">🏆</div><h2>Resultados</h2>'
        + order.map((p,i)=>'<div class="profile-row"><span class="pr-av">'+(i===0?'🥇':i===1?'🥈':i===2?'🥉':'🎯')+'</span><span class="pr-name">'+esc(p.nm)+'</span><b>'+p.s+' pts</b></div>').join('')
        + '<div class="q-actions" style="justify-content:center"><button class="btn ghost" id="hsHome">🏠 Inicio</button><button class="btn" id="hsAgain">🔄 Otra vez</button></div></div>';
      $('#hsHome').onclick=()=>{sfx('click');goHome();}; $('#hsAgain').onclick=()=>{sfx('click');startHotseat();}; sfx('win'); confetti(60);
    };
    nextTurn();
  };
}
/* — Registro de modos + para el botón "Otra vez" — */
const MODE_RUN = {
  vf:startVF, formula:startFormulaMode, order:startOrderMode, errors:startErrorReview, wrong:startWrongOnly,
  infinite:startInfinite, carrera:startCarrera
};
/* ============ Repaso Examen (para TODAS las materias) ============
   Disponible en cualquier materia con parciales definidos (SUBJECT_PARCIALES).
   Primero eliges el parcial; luego la modalidad:
     • 📄 Examen real → el examen tal cual del profesor (solo donde el alumno lo
       envió: Procesos 2.º parcial y No Paramétrica 2.º parcial). Se califica al
       final, como en el examen de verdad.
     • 📖 Repaso de módulos (Estudio) / 📝 Examen de práctica (Simulación) →
       preguntas GENERADAS con los temas del parcial. Esta es la diferencia real:
       el modo examen real usa el examen del profesor; el de módulos, práctica. */
/* Modelos que se pueden «reconocer» en cada parcial de Procesos */
const STOCH_MODELOS = {
  1:[ {id:'caminata',name:'Caminata aleatoria'}, {id:'markov',name:'Cadena de Markov'}, {id:'matriz',name:'Matriz de transición'} ],
  2:[ {id:'poisson',name:'Proceso de Poisson'}, {id:'exp',name:'Distribución Exponencial'}, {id:'erlang',name:'Erlang/Gamma (evento n-ésimo)'},
      {id:'condbin',name:'Binomial condicional N(s)|N(t)'}, {id:'thin',name:'Clasificación / adelgazamiento'},
      {id:'super',name:'Superposición de procesos'}, {id:'comp',name:'Poisson compuesto'} ]
};
const STOCH_ESCENARIOS = [
  {p:1, m:'caminata', s:'Una partícula parte de 0 y en cada paso sube o baja 1 con probabilidades p y q. Quieres la probabilidad de su posición tras n pasos.'},
  {p:1, m:'markov',   s:'El clima de mañana depende solo del clima de hoy (soleado/nublado/lluvioso), no de días previos.'},
  {p:1, m:'matriz',   s:'Tienes las probabilidades de pasar entre 3 estados y quieres las probabilidades después de 2 pasos.'},
  {p:2, m:'poisson',  s:'Llegan clientes a razón de λ por hora y quieres la probabilidad de que lleguen exactamente k en t minutos.'},
  {p:2, m:'exp',      s:'Quieres la probabilidad de esperar más de t minutos entre dos llegadas consecutivas.'},
  {p:2, m:'erlang',   s:'Quieres el tiempo esperado hasta que ocurra la n-ésima llegada.'},
  {p:2, m:'condbin',  s:'Sabes que en (0,t) ocurrieron n eventos y quieres cuántos cayeron antes del instante s.'},
  {p:2, m:'thin',     s:'Cada evento del proceso es de «tipo A» con probabilidad p; quieres la tasa del proceso de eventos tipo A.'},
  {p:2, m:'super',    s:'Sumas (superpones) dos procesos de Poisson independientes y quieres la tasa del proceso combinado.'},
  {p:2, m:'comp',     s:'Cada evento trae asociado un monto Y y quieres el monto total esperado acumulado E[X(t)].'}
];
/* Etapa 1: reconoce el modelo — pregunta mc con solo los modelos del parcial */
function qReconoceModelo(parcial){
  const esc0 = pick(STOCH_ESCENARIOS.filter(e=>e.p===parcial));
  const modelos = STOCH_MODELOS[parcial];
  const correct = modelos.find(m=>m.id===esc0.m);
  let opts = modelos.filter(m=>m.id!==esc0.m);
  opts = shuffle(opts).slice(0, Math.min(3, opts.length));
  const options = shuffle([{t:correct.name, ok:true}, ...opts.map(m=>({t:m.name, ok:false}))]);
  return { type:'mc', topic:'pe_'+(parcial===1?'markov':'poisson'), stage:'reconoce',
    prompt:'<b>🔎 Reconoce el modelo.</b> '+esc0.s+'<br>¿Qué modelo debes usar?',
    options, explain:'El modelo adecuado es: <b>'+correct.name+'</b>.', correctText:correct.name };
}
/* Caso final tipo examen: varios incisos ligados con el mismo contexto (Poisson) */
function casoFinalP2(){
  const lam = pick([1.7,2,2.5,3]); const p = pick([0.6,0.5,0.4]);
  const ctx = '<div class="q-help" style="margin-bottom:6px">🧪 <b>Caso final.</b> Un proceso de Poisson tiene tasa λ='+lam+' por unidad. Cada evento es de «tipo A» con probabilidad p='+p+'.</div>';
  const m = lam, mA = lam*p;
  const inc = [
    { type:'numeric', topic:'pe_poisson', tol:0.01, stage:'caso',
      prompt:ctx+'a) ¿Cuál es P(N(1)=0)?', answer:pePmf(m,0), correctText:peR(pePmf(m,0),4).toString(),
      explain:'P(N(1)=0)=e^(−λ).', steps:['λt='+lam,'P(N=0)=e^(−'+lam+')='+peR(pePmf(m,0),4)] },
    { type:'numeric', topic:'pe_integrador', tol:0.01, stage:'caso',
      prompt:ctx+'b) Tasa de eventos tipo A: λ<sub>A</sub> = ?', answer:mA, correctText:peR(mA,4).toString(),
      explain:'λ_A = λ·p.', steps:['λ_A = '+lam+'·'+p+' = '+peR(mA,4)] },
    { type:'numeric', topic:'pe_integrador', tol:0.01, stage:'caso',
      prompt:ctx+'c) ¿Cuál es P(N<sub>A</sub>(1) ≥ 1)?', answer:1-pePmf(mA,0), correctText:peR(1-pePmf(mA,0),4).toString(),
      explain:'P(N_A≥1)=1−e^(−λ_A).', steps:['P(N_A≥1)=1−e^(−'+peR(mA,3)+')='+peR(1-pePmf(mA,0),4)] }
  ];
  return inc;
}
/* Grupos (parciales) de la materia, tomados de SUBJECT_PARCIALES (definido más abajo). */
function subjectGroups(sid){ const p = (typeof SUBJECT_PARCIALES!=='undefined') ? SUBJECT_PARCIALES[sid] : null; return (p && p.groups) ? p.groups : null; }

/* ===== Exámenes reales transcritos (el examen tal cual del profesor) =====
   Solo existen donde el alumno envió su examen. Se enganchan a un grupo por su
   índice dentro de SUBJECT_PARCIALES[sid].groups. Las respuestas están fijas
   (no se aleatorizan): son las mismas preguntas del examen original. */
function buildRealExamStochP2(){ return [
  {type:'numeric', topic:'pe_poisson', tol:0.001, prompt:'<b>1.</b> Un proceso de Poisson tiene λ=1.5 y t=2. Calcula P(N(2) ≤ 1).',
    answer:0.1991, correctText:'0.1991', explain:'P(N≤k)=Σ e^(−λt)(λt)^i/i!, con λt=3.',
    steps:['λt = 1.5·2 = 3','P(N=0)=e^(−3)=0.0498','P(N=1)=e^(−3)·3=0.1494','P(N≤1)=0.0498+0.1494=0.1991']},
  {type:'numeric', topic:'pe_poisson', tol:0.001, prompt:'<b>2.</b> Un proceso de Poisson tiene tasa λ=4 por unidad de tiempo. Calcula P(N(1)=4).',
    answer:0.1954, correctText:'0.1954', explain:'P(N(t)=k)=e^(−λt)(λt)^k/k!.',
    steps:['λt = 4·1 = 4','P(N=4)=e^(−4)·4⁴/4! = e^(−4)·256/24','= 0.1954']},
  {type:'numeric', topic:'pe_poisson', tol:0.001, prompt:'<b>3.</b> Llegan en promedio 6 clientes por hora (Poisson). ¿Probabilidad de que lleguen exactamente 0 en 10 minutos?',
    answer:0.3679, correctText:'0.3679', explain:'Ajusta la tasa a la unidad del tiempo: λ por minuto = 6/60.',
    steps:['λ = 6/60 = 0.1 por minuto','λt = 0.1·10 = 1','P(N=0)=e^(−1)=0.3679']},
  {type:'numeric', topic:'pe_poisson', tol:0.001, prompt:'<b>4.</b> Proceso de Poisson con λ=2, t=2. Calcula P(N(2) ≥ 2) usando el complemento.',
    answer:0.9084, correctText:'0.9084', explain:'P(N≥2)=1−P(N=0)−P(N=1).',
    steps:['λt = 4','P(N=0)=e^(−4)=0.0183','P(N=1)=e^(−4)·4=0.0733','P(N≥2)=1−0.0183−0.0733=0.9084']},
  {type:'numeric', topic:'pe_exp', tol:0.001, prompt:'<b>5.</b> El tiempo entre eventos es Exponencial con λ=2. Calcula P(X > 1).',
    answer:0.1353, correctText:'0.1353', explain:'Función de supervivencia: P(X>t)=e^(−λt).',
    steps:['P(X>1)=e^(−2·1)=e^(−2)=0.1353']},
  {type:'numeric', topic:'pe_exp', tol:0.001, prompt:'<b>6.</b> Se sabe que P(X > 2) = 0.5 para un tiempo Exponencial. Despeja λ.',
    answer:0.3466, correctText:'0.3466', explain:'De e^(−λt)=p ⇒ λ=−ln(p)/t.',
    steps:['e^(−2λ)=0.5','−2λ = ln(0.5) = −0.6931','λ = 0.6931/2 = 0.3466']},
  {type:'numeric', topic:'pe_exp', tol:0.001, prompt:'<b>7.</b> Con λ=0.5 (Exponencial), ¿para qué tiempo t se cumple P(X > t) = 0.5?',
    answer:1.3863, correctText:'1.3863', explain:'De e^(−λt)=p ⇒ t=−ln(p)/λ.',
    steps:['e^(−0.5t)=0.5','t = −ln(0.5)/0.5','t = 0.6931/0.5 = 1.3863']},
  {type:'numeric', topic:'pe_erlang', tol:0.01, prompt:'<b>8.</b> El tiempo hasta el n-ésimo evento es Sₙ=T₁+…+Tₙ (Erlang). Con λ=0.25 y n=3, ¿cuánto vale Var(S₃)?',
    answer:48, correctText:'48', explain:'Var(Sₙ)=n/λ².',
    steps:['Var(S₃) = 3/0.25²','= 3/0.0625','= 48']},
  {type:'mc', topic:'pe_erlang', prompt:'<b>9.</b> El tiempo hasta la n-ésima llegada de un proceso de Poisson se distribuye:',
    options:[{t:'Erlang/Gamma (suma de n exponenciales)', ok:true},{t:'Poisson',ok:false},{t:'Uniforme',ok:false},{t:'Binomial',ok:false}],
    correctText:'Erlang/Gamma (suma de n exponenciales)', explain:'Sₙ=T₁+…+Tₙ, suma de n exponenciales i.i.d. ⇒ Erlang/Gamma.'},
  {type:'numeric', topic:'pe_integrador', tol:0.001, prompt:'<b>10.</b> Un proceso de Poisson tiene λ=2. Cada evento es de «tipo A» con probabilidad p=0.3 (adelgazamiento). ¿Nueva tasa λ_A?',
    answer:0.6, correctText:'0.6', explain:'Al adelgazar/clasificar un Poisson, el subproceso es Poisson con tasa λ·p.',
    steps:['λ_A = λ·p','= 2·0.3','= 0.6']},
  {type:'numeric', topic:'pe_integrador', tol:0.001, prompt:'<b>11.</b> En un proceso de Poisson se sabe que N(6)=5. ¿Cuál es P(N(5)=2 | N(6)=5)?',
    answer:0.0322, correctText:'0.0322', explain:'Dado N(t)=n, N(s) ~ Binomial(n, s/t).',
    steps:['s/t = 5/6 = 0.8333','P = C(5,2)·(0.8333)²·(0.1667)³','= 10·0.6944·0.00463 = 0.0322']},
  {type:'mc', topic:'pe_memoria', prompt:'<b>12.</b> La propiedad de pérdida de memoria de la Exponencial dice:',
    options:[{t:'P(X > t+s | X > s) = P(X > t)', ok:true},{t:'P(X > t+s) = P(X > t)·P(X > s)·2',ok:false},{t:'El tiempo esperado disminuye mientras esperas',ok:false},{t:'X siempre vale su media',ok:false}],
    correctText:'P(X > t+s | X > s) = P(X > t)', explain:'Haber esperado s no cambia la distribución del tiempo restante.'}
]; }
function buildRealExamNpP2(){ return [
  {type:'mc', topic:'np_signos', prompt:'<b>1.</b> El valor que divide la muestra en dos mitades iguales (50% a cada lado) es:',
    options:[{t:'La mediana',ok:true},{t:'La media',ok:false},{t:'La moda',ok:false},{t:'El rango',ok:false}],
    correctText:'La mediana', explain:'La mediana es el cuantil 0.5.'},
  {type:'numeric', topic:'np_signos', tol:0.001, prompt:'<b>2.</b> Prueba de los signos para la mediana propuesta 50. Datos: {54, 55, 44, 53, 51, 56, 55, 53, 47, 51, 49}. Tras eliminar los empates con 50, ¿cuál es el tamaño efectivo n?',
    answer:11, correctText:'11', explain:'Se descartan los valores iguales a la mediana propuesta; n efectivo = n − empates.',
    steps:['Empates con 50: 0','Menores: 3 · Mayores: 8','n efectivo = 11 − 0 = 11']},
  {type:'numeric', topic:'np_signos', tol:0.0005, prompt:'<b>3.</b> En la prueba de los signos, bajo H₀ el número de signos «+» es X ~ Bin(10, 0.5). Calcula P(X ≤ 1).',
    answer:0.0107, correctText:'0.0107', explain:'P(X≤1)=Σ_{k=0}^{1} C(10,k)·0.5¹⁰.',
    steps:['P(X=0)=0.5¹⁰=0.000977','P(X=1)=10·0.5¹⁰=0.009766','P(X≤1)=0.0107']},
  {type:'numeric', topic:'np_signos', tol:0.001, prompt:'<b>4.</b> Prueba de los signos para la mediana propuesta 100. Datos: {102, 95, 105, 100, 102, 101, 99, 105, 99, 103}. Tras eliminar los empates con 100, ¿cuál es el tamaño efectivo n?',
    answer:9, correctText:'9', explain:'Se descartan los valores iguales a la mediana propuesta.',
    steps:['Empates con 100: 1','Menores: 3 · Mayores: 6','n efectivo = 10 − 1 = 9']},
  {type:'numeric', topic:'np_mcnemar', tol:0.001, prompt:'<b>5.</b> McNemar (datos pareados). Tabla 2×2: A=280, B=16, C=20, D=174. Como B+C=36 ≥ 20, usa χ² con corrección de Yates: (|B−C|−1)²/(B+C).',
    answer:0.25, correctText:'0.25', explain:'Solo los discordantes B y C aportan evidencia; gl=1.',
    steps:['|B−C| = |16−20| = 4','χ² = (4−1)²/36','= 9/36 = 0.25']},
  {type:'numeric', topic:'np_mcnemar', tol:0.001, prompt:'<b>6.</b> McNemar con discordantes B=3, C=7 (B+C=10 exacto). Con X ~ Bin(10, 0.5), calcula P(X ≤ 3).',
    answer:0.1719, correctText:'0.1719', explain:'Con B+C<20 se usa la binomial exacta sobre los pares discordantes: X ~ Bin(B+C, 0.5).',
    steps:['menor(B,C) = 3','P(X≤3) con Bin(10,0.5)','= 0.1719']},
  {type:'numeric', topic:'np_cox', tol:0.001, prompt:'<b>7.</b> Cox-Stuart de tendencia. Serie: {70, 66, 65, 60, 59, 55, 53, 49, 48, 43}. 5 parejas (xᵢ, xᵢ₊5), C=5 y T ~ Bin(5, 0.5). Calcula P(T ≤ 0).',
    answer:0.0313, correctText:'0.0313', explain:'Bajo H₀ (sin tendencia), T ~ Bin(C, 0.5).',
    steps:['Signos +: 0 · signos −: 5','menor = 0','P(T≤0) = 0.5⁵ = 0.0313']},
  {type:'numeric', topic:'np_cox', tol:0.0001, prompt:'<b>8.</b> Si las 6 parejas de Cox-Stuart muestran todas disminución (0 signos «+»), el valor p de esa cola es (0.5)⁶. Calcula ese valor.',
    answer:0.015625, correctText:'0.015625', explain:'(0.5)⁶ = 1/64.',
    steps:['(0.5)⁶ = 1/64','= 0.015625']},
  {type:'numeric', topic:'np_rangos', tol:0.001, prompt:'<b>9.</b> Correlación de Spearman con n=8 y Σdᵢ²=0.5. Calcula ρs = 1 − 6Σdᵢ²/[n(n²−1)].',
    answer:0.994, correctText:'0.994', explain:'ρs = 1 − 6Σdᵢ²/[n(n²−1)].',
    steps:['n(n²−1) = 8·63 = 504','ρs = 1 − 6·0.5/504','= 1 − 3/504 = 0.994']},
  {type:'numeric', topic:'np_rangos', tol:0.001, prompt:'<b>10.</b> Con n=7 y Σdᵢ²=40, aplica ρs = 1 − 6Σdᵢ²/[n(n²−1)].',
    answer:0.2857, correctText:'0.2857', explain:'Sustitución directa en la fórmula de Spearman.',
    steps:['n(n²−1) = 7·48 = 336','ρs = 1 − 240/336','= 0.2857']},
  {type:'numeric', topic:'np_rangos', tol:0.01, prompt:'<b>11.</b> Mann-Whitney con A={15, 18, 19, 20} (n₁=4) y B={23, 24, 25, 26} (n₂=4). La suma de rangos de A es R₁=10. Calcula U = mín(U₁, U₂).',
    answer:0, correctText:'0', explain:'U₁=n₁n₂+n₁(n₁+1)/2−R₁; U₂=n₁n₂−U₁; U=mín(U₁,U₂).',
    steps:['U₁ = 4·4 + 4·5/2 − 10 = 16','U₂ = 16 − 16 = 0','U = mín(16, 0) = 0']},
  {type:'mc', topic:'np_rangos', prompt:'<b>12.</b> En Mann-Whitney se rechaza H₀ cuando:',
    options:[{t:'U ≤ U_crítico',ok:true},{t:'U ≥ U_crítico',ok:false},{t:'U = n₁n₂',ok:false},{t:'U > 0',ok:false}],
    correctText:'U ≤ U_crítico', explain:'Se rechaza H₀ si U ≤ U_crítico (tabla de Mann-Whitney).'}
]; }
const REAL_EXAMS_BY_SUBJECT = {
  stoch: { 1: { note:'Poisson, exponencial, Erlang/Gamma y propiedades del 2.º parcial.', build:buildRealExamStochP2 } },
  'estadistica-no-parametrica': { 1: { note:'Signos, McNemar, Cox-Stuart, Spearman y Mann-Whitney del 2.º parcial.', build:buildRealExamNpP2 } }
};
function realExamFor(sid, gi){ const e = REAL_EXAMS_BY_SUBJECT[sid]; return e ? e[gi] : null; }

/* Banco GENERADO de un parcial: preguntas de sus módulos (+ etapas de Procesos). */
function repasoPool(sid, mods, parcialNum, withStages){
  const modList = MODULES_BY_SUBJECT[sid] || MODULES;
  let pool = [];
  (mods||[]).forEach(id => { const m = modList.find(x=>x.id===id); if(m && m.build){ try{ pool.push(...m.build()); }catch(e){} } });
  pool = shuffle(pool).slice(0, 10);
  if(withStages && sid==='stoch' && (parcialNum===1 || parcialNum===2)){
    pool = [qReconoceModelo(parcialNum), qReconoceModelo(parcialNum)].concat(pool);
    if(parcialNum===2) pool = pool.concat(casoFinalP2());
  }
  return pool;
}
function startRepasoExamen(){
  const sid = S.activeSubject, subj = subjectById(sid);
  const groups = subjectGroups(sid);
  if(!groups || !groups.length || !(MODULES_BY_SUBJECT[sid]||[]).some(m=>m.build)){
    toast('🚧 El Repaso Examen aún no está disponible en esta materia.'); sfx('bad'); return;
  }
  const modList = MODULES_BY_SUBJECT[sid] || [];
  const cards = groups.map((g, gi) => {
    const nMods = (g.mods||[]).filter(id => { const m = modList.find(x=>x.id===id); return m && m.build; }).length;
    const real = realExamFor(sid, gi);
    return '<button class="btn repaso-card" data-gi="'+gi+'" style="flex-direction:column;align-items:flex-start;gap:4px;text-align:left">'
      + '<b>'+esc(g.name)+'</b>'
      + '<small style="font-weight:600;color:var(--muted)">'+nMods+' módulo'+(nMods===1?'':'s')+' con práctica</small>'
      + (real ? '<small style="font-weight:700;color:var(--good-text)">📄 Examen real disponible</small>'
              : '<small style="font-weight:600;color:var(--muted)">📝 Examen de práctica generado</small>')
      + '</button>';
  }).join('');
  const o = openModal('<h2 style="margin-top:0">🎓 Repaso Examen · '+esc(subj.name)+'</h2>'
    + '<p style="color:var(--ink2);font-size:.9rem">Elige el parcial que quieres preparar:</p>'
    + '<div class="repaso-grid">'+cards+'</div>'
    + '<p class="q-help" style="margin-top:8px">📄 <b>Examen real</b>: el examen tal cual del profesor. 📝 <b>Repaso de módulos</b>: preguntas generadas con los temas del parcial.</p>');
  o.querySelectorAll('[data-gi]').forEach(b => b.addEventListener('click', () => repasoGroupMenu(sid, +b.dataset.gi)));
}
function repasoGroupMenu(sid, gi){
  const groups = subjectGroups(sid), g = groups[gi], subj = subjectById(sid);
  const real = realExamFor(sid, gi), parcialNum = gi+1;
  let cards = '';
  if(real){
    cards += '<button class="btn repaso-card" data-act="real" style="flex-direction:column;align-items:flex-start;gap:4px;text-align:left">'
      + '<b>📄 Examen real</b><small style="font-weight:600;color:var(--good-text)">'+esc(real.note)+' Se califica al final, como el examen del profesor.</small></button>';
  }
  cards += '<button class="btn repaso-card'+(real?' ghost':'')+'" data-act="estudio" style="flex-direction:column;align-items:flex-start;gap:4px;text-align:left">'
      + '<b>📖 Repaso de módulos · Estudio</b><small style="font-weight:600;color:var(--muted)">Preguntas generadas con retroalimentación, fórmula y procedimiento tras cada respuesta.</small></button>'
    + '<button class="btn repaso-card ghost" data-act="simulacion" style="flex-direction:column;align-items:flex-start;gap:4px;text-align:left">'
      + '<b>📝 Examen de práctica · Simulación</b><small style="font-weight:600;color:var(--muted)">Preguntas generadas mezcladas; las respuestas se revelan al final.</small></button>';
  const o = openModal('<h2 style="margin-top:0">'+esc(subj.short)+' · '+esc(g.name)+'</h2>'
    + (real ? '<p class="q-help" style="margin:0 0 6px">Este parcial tiene el <b>examen real</b> del profesor y también un repaso generado.</p>'
            : '<p class="q-help" style="margin:0 0 6px">Aún no hay examen real de este parcial; practica con un examen generado de sus temas.</p>')
    + '<div class="repaso-grid">'+cards+'</div>'
    + '<div class="q-actions" style="justify-content:center;margin-top:6px"><button class="btn ghost small" id="repBack">← Volver</button></div>');
  o.querySelector('#repBack').addEventListener('click', () => { closeModal(); startRepasoExamen(); });
  o.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.act; closeModal();
    if(act==='real'){
      const qs = real.build();
      if(!qs || !qs.length){ toast('🚧 Examen real no disponible.'); sfx('bad'); return; }
      startMode({ id:'examreal_'+sid+'_'+gi, title:'📄 Examen real · '+g.name, icon:'📄', qs,
        hideAnswers:true, introToast:'📄 Examen real del profesor. Se califica al final; luego revisa cada respuesta con su procedimiento.' });
      return;
    }
    const qs = repasoPool(sid, g.mods, parcialNum, true);
    if(!qs.length){ toast('🚧 Aún no hay preguntas para este parcial.'); sfx('bad'); return; }
    const titulo = 'Repaso · '+g.name+' · '+(act==='estudio'?'Estudio':'Simulación');
    startMode({ id:'repaso_'+sid+'_'+gi+'_'+act, title:titulo, icon:'🎓', qs,
      hideAnswers: act==='simulacion',
      introToast: act==='estudio' ? '📖 Modo estudio: revisa la solución en cada pregunta.' : '📝 Simulación: las respuestas se revelan al final.' });
  }));
}

const GAME_MODES = [
  {id:'quiz',    cat:'Quiz',        ico:'📝', name:'Quiz clásico',            desc:'Juega cualquier módulo del curso.',            run:openModulePicker, needs:'content'},
  {id:'daily',   cat:'Exámenes',    ico:'📅', name:'Examen diario',           desc:'Un examen calificado, uno por día.',           run:startExam,        needs:'content'},
  {id:'repasoex', cat:'Exámenes',    ico:'🎓', name:'Repaso Examen',            desc:'Prepárate por parcial: examen real del profesor o repaso generado (estudio/simulación).', run:startRepasoExamen, needs:'repaso'},
  {id:'nplab',    cat:'Juegos',      ico:'🧪', name:'Laboratorio No Paramétrico',desc:'Elige la prueba correcta para cada escenario.', run:startNPLab, needs:'nplab'},
  {id:'cfo',      cat:'Juegos',      ico:'🏢', name:'Director Financiero',      desc:'Toma decisiones y valúa la empresa con las fórmulas del curso.', run:startDirectorFinanciero, needs:'cfo'},
  {id:'blitz',   cat:'Rapidez',     ico:'⚡', name:'Examen contrarreloj',     desc:'+5 s por acierto; cada falla resta más tiempo.', run:()=>{touchStreak();startBlitz();}, needs:'content'},
  {id:'vf',      cat:'Rapidez',     ico:'⚖️', name:'Verdadero / Falso rápido',desc:'12 afirmaciones a toda velocidad.',            run:startVF,          needs:'content'},
  {id:'carrera', cat:'Rapidez',     ico:'🏁', name:'Carrera de XP',           desc:'Llega a 100 XP lo antes posible.',             run:startCarrera,     needs:'content'},
  {id:'survival',cat:'Rapidez',     ico:'💀', name:'Supervivencia',           desc:'Un error y se acaba.',                         run:()=>{touchStreak();startSudden();}, needs:'content'},
  {id:'errors',  cat:'Repaso',      ico:'🔁', name:'Repaso de errores',       desc:'Preguntas de tus temas más fallados.',         run:startErrorReview, needs:'content'},
  {id:'wrong',   cat:'Repaso',      ico:'❌', name:'Solo incorrectas',        desc:'Vuelve a lo que fallaste en tu examen.',       run:startWrongOnly,   needs:'content'},
  {id:'review',  cat:'Repaso',      ico:'🎯', name:'Repaso mixto',            desc:'10 preguntas variadas, sin presión.',          run:startReview,      needs:'content'},
  {id:'flash',   cat:'Repaso',      ico:'🃏', name:'Flashcards',              desc:'Repetición espaciada.',                        run:()=>{touchStreak();startFlash();}, needs:'content'},
  {id:'formula', cat:'Repaso',      ico:'🧮', name:'Completar fórmula',       desc:'Escribe las fórmulas clave.',                  run:startFormulaMode, needs:'content'},
  {id:'order',   cat:'Repaso',      ico:'🔢', name:'Ordenar procedimiento',   desc:'Pon los pasos en el orden correcto.',          run:startOrderMode,   needs:'content'},
  {id:'infinite',cat:'Práctica',    ico:'♾️', name:'Práctica infinita',       desc:'Preguntas sin fin; termina cuando quieras.',   run:startInfinite,    needs:'content'},
  {id:'ruleta',  cat:'Juegos',      ico:'🎡', name:'Ruleta de preguntas',     desc:'Gira y responde el tema que salga.',           run:startRuleta,      needs:'content'},
  {id:'jeopardy',cat:'Juegos',      ico:'🎯', name:'Jeopardy',                desc:'Tablero de categorías y puntos.',              run:startJeopardy,    needs:'content'},
  {id:'memo',    cat:'Juegos',      ico:'🧠', name:'Memorama',                desc:'Parejas concepto ↔ definición.',               run:startMemo,        needs:'ca3'},
  {id:'escape',  cat:'Juegos',      ico:'🔐', name:'Escape room',             desc:'Resuelve acertijos y abre la caja fuerte.',    run:startEscape,      needs:'ca3'},
  {id:'codigo',  cat:'Juegos',      ico:'🔑', name:'Código secreto',          desc:'Descifra el código con 3 cálculos.',           run:startCodigo,      needs:'content'},
  {id:'bingo',   cat:'Juegos',      ico:'🎱', name:'Bingo de conceptos',      desc:'Marca los conceptos que se describan.',        run:startBingo,       needs:'ca3'},
  {id:'reto',    cat:'Multijugador',ico:'🤺', name:'Reto entre compañeros',   desc:'Mismas preguntas para dos; se comparte por código.', run:openRetoHub, needs:'content'},
  {id:'hotseat', cat:'Multijugador',ico:'👥', name:'Todos contra todos',      desc:'Por turnos en el mismo dispositivo.',          run:startHotseat,     needs:'content'}
];
function modeAvailable(m){
  if(m.needs==='ca3') return S.activeSubject==='ca3';
  if(m.needs==='repaso') return !!subjectGroups(S.activeSubject) && (MODULES_BY_SUBJECT[S.activeSubject]||[]).some(x=>x.build);
  if(m.needs==='nplab') return S.activeSubject==='estadistica-no-parametrica';
  if(m.needs==='cfo') return S.activeSubject==='administracion-financiera';
  if(m.needs==='content') return MODULES.length>0;
  return true;
}
function renderModes(){
  const hasContent = MODULES.length>0;
  const cats = [...new Set(GAME_MODES.map(m=>m.cat))];
  let html = '<div class="panel"><h3>🎮 Elige un modo de juego</h3>'
    + '<p class="q-help">Cada modo suma XP, registra tus errores y actualiza tus estadísticas de '+esc(subjectById(S.activeSubject).short)+'.'
    + (hasContent?'':' Esta materia aún no tiene contenido de práctica; prueba con Cálculo Actuarial III.')+'</p></div>';
  cats.forEach(cat => {
    const list = GAME_MODES.filter(m=>m.cat===cat);
    html += '<div class="section-h" style="margin:18px 0 10px"><h2 style="font-size:1.05rem">'+cat+'</h2><span class="line"></span></div>'
      + '<div class="modes-grid">' + list.map(m => {
        const ok = modeAvailable(m);
        const colors = {Quiz:'var(--c1)',Exámenes:'var(--c5)',Rapidez:'var(--c8)',Repaso:'var(--c2)','Práctica':'var(--c3)',Juegos:'var(--c6)',Multijugador:'var(--c7)'};
        return '<button class="mode-card'+(ok?'':' locked')+'" style="--mc:'+(colors[cat]||'var(--accent)')+'" data-mode="'+m.id+'"'+(ok?'':' disabled')+'>'
          + '<span class="mo-cat">'+cat+'</span><span class="mo-ico">'+m.ico+'</span><h4>'+esc(m.name)+'</h4><p>'+esc(m.desc)+'</p>'
          + (ok?'':'<span class="mo-cat" style="color:var(--muted)">🔒 '+(m.needs==='ca3'?'Solo en Cálculo III':m.needs==='repaso'?'Requiere módulos del curso':'Requiere contenido')+'</span>')
          + '</button>';
      }).join('') + '</div>';
  });
  $('#modesBody').innerHTML = html;
  $$('#modesBody .mode-card:not(.locked)').forEach(b => b.addEventListener('click', ()=>{
    const m = GAME_MODES.find(x=>x.id===b.dataset.mode); if(m){ sfx('click'); m.run(); }
  }));
}

/* ==================== Leaderboard ==================== */
/* La tabla vive en localStorage a nivel del dispositivo (compartida entre perfiles).
   El perfil activo sincroniza su fila con su progreso real; el resto de filas se
   alimenta con el panel de administrador o importando un JSON del profesor. */
const LBKEY = 'actuariq_leaderboard_v1';
let lbFilterQ = '', lbSort = 'xp', lbAdminOn = false, lbEditId = null;
function selfAvg(){
  let all = [];
  SUBJECTS.forEach(s => { const d = subjSnapshot(s.id); (d.history||[]).forEach(h => all.push(h.score)); });
  return all.length ? Math.round(all.reduce((a,b)=>a+b,0)/all.length) : 0;
}
function lbLoad(){
  const b = Store.getJSON(LBKEY, null);
  return (b && Array.isArray(b.students)) ? b : {students:[]};
}
function lbSave(b){ b.updated = Date.now(); Store.setJSON(LBKEY, b); }
function lbSyncSelf(){
  const b = lbLoad();
  const p = activeProfile();
  let ent = b.students.find(s => s.pid === PROFILES.active);
  if(!ent){ ent = {pid:PROFILES.active}; b.students.push(ent); }
  ent.name = p.name; ent.avatar = p.avatar; ent.photo = p.photo || null;
  ent.avatarMode = avatarMode(p); ent.custom = p.custom || null;
  ent.xp = S.xp; ent.lvl = levelInfo().lvl;
  ent.mods = SUBJECTS.reduce((a,x) => a + subjStats(x.id).done, 0); // módulos completados en todas las materias
  ent.streak = S.streak; ent.avg = selfAvg();
  ensureEquip(); ent.frame = S.equip.frame || null; ent.title = currentTitle();
  ent.badge = S.equip.badge || null; ent.acc = S.equip.acc || []; ent.bg = S.equip.bg || null; ent.updated = Date.now();
  lbDedupeByName(b);   // colapsa duplicados por nombre (p. ej. un "Oliver" viejo con otro pid) antes de mostrar
  lbSave(b);
  return b;
}
/* 🏆 Auto-subida silenciosa de MI fila al servidor (debounce 20 s). El servidor
   guarda una fila por cuenta, así que la anti-suplantación es real. */
let lbPushT = null;
function scheduleLbPush(){
  if(lbPushT) clearTimeout(lbPushT);
  lbPushT = setTimeout(async () => {
    lbPushT = null;
    try{
      const b = lbSyncSelf();
      const me = b.students.find(s => s.pid === PROFILES.active); if(!me) return;
      const row = { name:me.name, xp:me.xp, lvl:me.lvl, mods:me.mods, streak:me.streak, avg:me.avg,
        avatar:me.avatar, avatarMode:(me.avatarMode==='custom'?'custom':'emoji'), custom:me.custom||null,
        frame:me.frame||null, title:me.title||'', badge:me.badge||null, acc:me.acc||[], bg:me.bg||null, updated:Date.now() };
      await window.AQ.api('POST', '/api/leaderboard', row);
    }catch(e){ /* sin conexión: se reintenta con el siguiente XP */ }
  }, 20000);
}
/* Elige la fila ganadora entre dos con el mismo nombre: mi fila real siempre
   gana (refleja mi progreso verdadero); si no, la de más XP (empate → la más
   reciente). */
function lbBetterRow(a, c){
  if(a.pid === PROFILES.active) return a;
  if(c.pid === PROFILES.active) return c;
  const ax = +a.xp||0, cx = +c.xp||0;
  if(cx !== ax) return cx > ax ? c : a;
  return (c.updated||0) > (a.updated||0) ? c : a;
}
/* Colapsa filas con el mismo nombre (sin distinguir mayúsculas/espacios).
   Elimina duplicados heredados de un leaderboard.json antiguo, donde el mismo
   nombre quedó guardado con otro pid además de tu fila actual. */
function lbDedupeByName(b){
  const byName = new Map();
  const keep = [];
  b.students.forEach(s => {
    const key = (s.name||'').trim().toLowerCase();
    if(!key){ keep.push(s); return; }          // sin nombre: no se agrupa
    const prev = byName.get(key);
    if(!prev){ byName.set(key, s); keep.push(s); return; }
    if(lbBetterRow(prev, s) === s){            // la nueva gana: reemplaza a la anterior
      const i = keep.indexOf(prev); if(i>=0) keep[i] = s;
      byName.set(key, s);
    }                                          // la perdedora no se conserva
  });
  const removed = b.students.length - keep.length;
  if(removed) b.students = keep;
  return removed;
}
const LB_SORTKEY = {xp:'xp', lvl:'lvl', streak:'streak', avg:'avg'};
function lbSorted(b, key){ const k = LB_SORTKEY[key] || 'xp'; return [...b.students].sort((a,x)=>(x[k]||0)-(a[k]||0)); }
function lbRanked(b){ return lbSorted(b, 'xp'); }
function lbIsAdmin(){ return activeProfile().name.trim().toLowerCase() === 'oliver'; }
/* Contraseña de administrador guardada como hash (SHA-256, con respaldo djb2
   para contextos sin crypto.subtle). Nota: al ser una app 100% de navegador,
   esto protege la interfaz, no cifra los datos locales. */
const LB_ADMIN_SHA256 = '02bdeefb808dfe802825d3efc09f034a7035836f3b41d7dbd9f8df8c6fd0c245';
const LB_ADMIN_DJB2 = 'ef9e20e0';
function djb2hex(s){ let h=5381; for(let i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))>>>0; } return h.toString(16); }
async function lbCheckPass(pass){
  try{
    if(window.crypto && crypto.subtle){
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass));
      const hex = [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');
      return hex === LB_ADMIN_SHA256;
    }
  }catch(e){}
  return djb2hex(pass) === LB_ADMIN_DJB2;
}
/* — Tabla compartida: leaderboard.json publicado junto a la página —
   Al abrir el leaderboard se descarga el archivo y se fusiona con la tabla
   local (gana la fila con fecha de actualización más reciente; tu propia fila
   nunca se pisa porque sale de tu progreso real). El admin publica subiendo
   el JSON exportado al repositorio. */
let lbFetchedAt = 0;
/* URL de sincronización en vivo (opcional). Se toma del campo "syncUrl" de
   leaderboard.json, así el admin la configura una sola vez y llega a todos.
   Si está definida, el leaderboard se lee y actualiza en vivo: cada alumno
   sube su fila con “⬆️ Subir mis stats” y el servidor la fusiona por nombre
   (el admin ya no tiene que actualizar el JSON a mano). */
let LB_SYNC_URL = null;
function lbMergeStudents(inc, newerWins){
  const b = lbLoad();
  let changed = 0;
  inc.forEach(x => {
    if(!x || !x.name) return;
    let ent = b.students.find(s => (x.pid && s.pid===x.pid) || (s.name||'').toLowerCase()===String(x.name).toLowerCase());
    if(ent){
      if(ent.pid === PROFILES.active) return;                       // mi fila viene de mi progreso
      if(newerWins && (ent.updated||0) >= (x.updated||0)) return;   // conservar ediciones locales más nuevas
      Object.assign(ent, x, {pid:ent.pid}); changed++;
    } else {
      b.students.push({pid: x.pid || ('m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),
        name:String(x.name).slice(0,24), avatar:x.avatar||'🎓', photo:x.photo||null, frame:x.frame||null, title:x.title||'',
        // el avatar completo (modo 3D/foto, accesorios, stickers, fondo e insignia) viaja para que la fila se vea igual que en el perfil de cada quien
        avatarMode:x.avatarMode||null, custom:x.custom||null, acc:Array.isArray(x.acc)?x.acc:(x.acc?[x.acc]:[]), bg:x.bg||null, badge:x.badge||null,
        xp:+x.xp||0, lvl:levelOf(+x.xp||0), mods:+x.mods||0, streak:+x.streak||0, avg:+x.avg||0, updated:x.updated||Date.now()});
      changed++;
    }
  });
  const deduped = lbDedupeByName(b);   // tras fusionar, colapsa cualquier duplicado por nombre
  if(changed || deduped) lbSave(b);
  return changed;
}
async function lbFetchRemote(){
  let changed = 0, ok = false;
  // 1) archivo publicado leaderboard.json (semilla + configuración syncUrl)
  try{
    const res = await fetch('leaderboard.json?t='+Date.now(), {cache:'no-store'});
    if(res.ok){
      ok = true;
      const payload = await res.json();
      if(payload && typeof payload.syncUrl === 'string' && /^https?:\/\//.test(payload.syncUrl)) LB_SYNC_URL = payload.syncUrl;
      const inc = (payload && Array.isArray(payload.students)) ? payload.students : (Array.isArray(payload) ? payload : []);
      if(inc.length) changed += lbMergeStudents(inc, true);
    }
  }catch(e){}
  // 2) tabla en vivo del servidor de sincronización (si está configurado)
  if(LB_SYNC_URL){
    try{
      const r2 = await fetch(LB_SYNC_URL + (LB_SYNC_URL.includes('?')?'&':'?') + 't='+Date.now(), {cache:'no-store'});
      if(r2.ok){
        ok = true;
        const live = await r2.json();
        const arr = Array.isArray(live) ? live : (live && Array.isArray(live.students) ? live.students : []);
        if(arr.length) changed += lbMergeStudents(arr, true);
      }
    }catch(e){}
  }
  return ok ? changed : -1;
}
/* Sube la fila propia al servidor de sincronización (todos los alumnos).
   No incluye la foto (base64) para mantener el JSON compartido pequeño; el
   avatar emoji, marco, título e insignia sí viajan. Anti-suplantación: si ya
   existe ese nombre con MÁS XP, el servidor rechaza (y la app también avisa
   antes de enviar) para que nadie pise las stats de otro con un nombre ajeno. */
async function lbUploadSelf(){
  if(!LB_SYNC_URL){ toast('🔧 La sincronización en vivo aún no está configurada.'); sfx('bad'); return; }
  const b = lbSyncSelf();
  const me = b.students.find(s => s.pid === PROFILES.active); if(!me) return;
  // pre-chequeo local: ¿ya hay otra fila con mi mismo nombre y más XP?
  const rival = b.students.find(s => s.pid !== PROFILES.active
    && (s.name||'').trim().toLowerCase() === (me.name||'').trim().toLowerCase()
    && (s.xp||0) > (me.xp||0));
  if(rival){ toast('🚫 Alguien más ya tiene mejores stats con ese nombre.'); sfx('bad'); return; }
  const row = { name:me.name, xp:me.xp, lvl:me.lvl, mods:me.mods, streak:me.streak, avg:me.avg,
    avatar:me.avatar, avatarMode:(me.avatarMode==='custom'?'custom':'emoji'), custom:me.custom||null,
    frame:me.frame||null, title:me.title||'', badge:me.badge||null, acc:me.acc||[], bg:me.bg||null, updated:Date.now() };
  try{
    toast('⬆️ Subiendo tus stats…');
    const res = await fetch(LB_SYNC_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(row) });
    if(!res.ok) throw new Error('http '+res.status);
    let data = null; try{ data = await res.json(); }catch(e){}
    if(data && data.error === 'lower'){
      toast('🚫 '+(data.message || 'Alguien más ya tiene mejores stats con ese nombre.')); sfx('bad');
      lbFetchedAt = 0; lbMaybeFetch(true);           // refresca para mostrar las stats reales
      return;
    }
    toast('✅ ¡Stats subidas! El grupo ya te ve.'); sfx('unlock');
    lbFetchedAt = 0; lbMaybeFetch(true);
  }catch(e){ toast('❌ No se pudo subir. Revisa tu conexión o la URL de sincronización.'); sfx('bad'); }
}
function lbMaybeFetch(force){
  if(!force && Date.now() - lbFetchedAt < 60000) return;
  lbFetchedAt = Date.now();
  lbFetchRemote().then(n => {
    if(n > 0){ renderBoard(); toast('🌐 Leaderboard sincronizado: '+n+' fila'+(n===1?'':'s')+' actualizada'+(n===1?'':'s')); }
    else if(force) toast(n === -1 ? '🌐 No se pudo descargar la tabla compartida' : '🌐 Ya estás al día');
  });
}
function lbMotivation(pos, total){
  if(!pos) return '🎯 Aparece en la tabla completando actividades para ganar XP.';
  if(pos===1) return '👑 ¡Eres el número 1! Defiende tu corona con la racha diaria.';
  if(pos<=3) return '🥈 ¡Estás en el podio! El primer lugar está a unos cuantos XP.';
  if(pos <= Math.ceil(total/2)) return '💪 Vas en la parte alta de la tabla. ¡Sigue sumando XP!';
  return '🚀 Cada actividad suma XP. ¡Tú puedes escalar posiciones!';
}
/* — Leaderboard: fila de un estudiante (la propia usa el equipo real) — */
function lbRowHTML(s, i){
  const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
  const isMe = s.pid===PROFILES.active;
  const eqOv = isMe ? ensureEquip() : {frame:s.frame||null, acc:s.acc||[], bg:s.bg||null, effect:null};
  const title = isMe ? currentTitle() : (s.title||'');
  const tIco = isMe ? titleIco() : titleIcoByName(title);
  const badgeId = isMe ? S.equip.badge : s.badge;
  const bd = badgeId ? BADGES.find(b=>b.id===badgeId) : null;
  // El leaderboard siempre dibuja el avatar 3D (nunca el emoji suelto): si la
  // fila trae foto se respeta; en cualquier otro caso se usa el muñeco 3D (con
  // la personalización del alumno si viajó, o el 3D por defecto para filas
  // antiguas que aún no re-suben su avatar completo).
  const lbMode = (s.avatarMode === 'photo' && s.photo) ? 'photo' : 'custom';
  const avp = {avatar:s.avatar, photo:s.photo, avatarMode:lbMode, custom:s.custom};
  return '<tr class="'+(i===0?'first ':'')+(isMe?'me':'')+'">'
    + '<td>'+(i+1)+' <span class="lb-medal">'+medal+'</span></td>'
    + '<td><button class="lb-view" data-lbview="'+esc(s.pid)+'" title="Ver stats de '+esc(s.name||'')+'">'+avatarStack(avp, 32, eqOv)+'</button></td>'
    + '<td><button class="lb-view lb-name" data-lbview="'+esc(s.pid)+'"><b>'+esc(s.name||'—')+'</b>'+(bd?' <span title="'+esc(bd.name)+'">'+bd.ico+'</span>':'')
      + (title?'<br><small style="color:var(--accent)">'+tIco+' '+esc(title)+'</small>':'')+'</button></td>'
    + '<td class="num"><b>'+(s.xp||0).toLocaleString()+'</b></td>'
    + '<td class="num">'+(s.lvl||1)+'</td>'
    + '<td class="num">'+(s.avg!=null?s.avg+'%':'—')+'</td>'
    + '<td class="num">'+(s.streak||0)+' 🔥</td>'
    + (lbAdminOn ? '<td><button class="btn ghost small" data-lbedit="'+esc(s.pid)+'">✏️</button> <button class="btn ghost small" data-lbdel="'+esc(s.pid)+'">🗑️</button></td>' : '')
    + '</tr>';
}
/* — Leaderboard: modal con las stats de un estudiante (al tocar su avatar o nombre).
   Muestra lo que NO cabe en la tabla: avatar completo, módulos completados,
   progreso al siguiente nivel y última actualización. — */
function lbShowStudent(pid){
  const board = lbLoad();
  const s = board.students.find(x => x.pid === pid);
  if(!s) return;
  const isMe = s.pid === PROFILES.active;
  const ranked = lbRanked(board);
  const pos = ranked.findIndex(x => x.pid === pid) + 1;
  const lvl = s.lvl || levelOf(s.xp||0);
  const lo = xpForLvl(lvl), hi = xpForLvl(lvl+1);
  const frac = hi>lo ? Math.max(0, Math.min(1, ((s.xp||0)-lo)/(hi-lo))) : 0;
  const toNext = Math.max(0, hi - (s.xp||0));
  const totalMods = SUBJECTS.reduce((a,x)=> a + (MODULES_BY_SUBJECT[x.id]||[]).length, 0);
  const eqOv = isMe ? ensureEquip() : {frame:s.frame||null, acc:s.acc||[], bg:s.bg||null, effect:null};
  const lbMode = (s.avatarMode==='photo' && s.photo) ? 'photo' : 'custom';
  const avp = {avatar:s.avatar, photo:s.photo, avatarMode:lbMode, custom:s.custom};
  const title = isMe ? currentTitle() : (s.title||'');
  const tIco = isMe ? titleIco() : titleIcoByName(title);
  const badgeId = isMe ? (S.equip&&S.equip.badge) : s.badge;
  const bd = badgeId ? BADGES.find(b=>b.id===badgeId) : null;
  const medal = pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':'';
  const tile = (label, value, sub) => '<div class="tile"><div class="t-label">'+label+'</div><div class="t-value">'+value+'</div>'+(sub?'<div class="t-sub">'+sub+'</div>':'')+'</div>';
  openModal(
    '<div class="lbs-head">'
      + '<div>'+avatarStack(avp, 84, eqOv)+'</div>'
      + '<div><h2 style="margin:0">'+esc(s.name||'—')+(bd?' <span title="'+esc(bd.name)+'">'+bd.ico+'</span>':'')+'</h2>'
        + (title?'<div style="color:var(--accent);font-weight:700">'+tIco+' '+esc(title)+'</div>':'')
        + '<div style="color:var(--ink2);font-size:.9rem;margin-top:2px">'+(medal?medal+' ':'')+'Puesto #'+pos+' de '+ranked.length+(isMe?' · <b>eres tú</b>':'')+'</div></div>'
    + '</div>'
    + '<div class="lbs-tiles">'
      + tile('⚡ Nivel', lvl, 'Faltan '+toNext.toLocaleString()+' XP para el '+(lvl+1))
      + tile('✨ XP total', (s.xp||0).toLocaleString())
      + tile('✅ Módulos', (s.mods||0)+(totalMods?' <span class="unit">/ '+totalMods+'</span>':''), 'completados en todas las materias')
      + tile('📈 Promedio', s.avg!=null? s.avg+'%' : '—', 'de sus exámenes')
      + tile('🔥 Racha', (s.streak||0), (s.streak===1?'día':'días')+' seguidos')
    + '</div>'
    + '<div class="lbs-bar"><span style="width:'+Math.round(frac*100)+'%"></span></div>'
    + '<p class="q-help" style="margin-top:10px">🕒 Última actualización: '+(s.updated?fmtDate(s.updated):'—')+'</p>'
    + '<div class="q-actions" style="justify-content:flex-end;margin-top:14px;flex-wrap:wrap">'
      + (!isMe && board.students.some(x=>x.pid===PROFILES.active) ? '<button class="btn ghost" id="lbsCompare" data-pid="'+esc(s.pid)+'">⚖️ Comparar con el mío</button>' : '')
      + '<button class="btn" id="lbsClose">Cerrar</button></div>'
  );
  const c = document.getElementById('lbsClose'); if(c) c.addEventListener('click', ()=>{ sfx('click'); closeModal(); });
  const cmp = document.getElementById('lbsCompare'); if(cmp) cmp.addEventListener('click', ()=>{ sfx('click'); lbCompare(cmp.dataset.pid); });
}
/* — Leaderboard: comparación lado a lado (tú vs. otro alumno) — */
function lbCompare(pid){
  const board = lbLoad();
  const me = board.students.find(s => s.pid === PROFILES.active);
  const other = board.students.find(s => s.pid === pid);
  if(!me || !other){ toast('No se pudo comparar'); sfx('bad'); return; }
  const ranked = lbRanked(board);
  const posOf = p => ranked.findIndex(s=>s.pid===p)+1;
  const avOf = (s, isMe) => {
    const eqOv = isMe ? ensureEquip() : {frame:s.frame||null, acc:s.acc||[], bg:s.bg||null, effect:null};
    const mode = (s.avatarMode==='photo' && s.photo) ? 'photo' : 'custom';
    return avatarStack({avatar:s.avatar, photo:s.photo, avatarMode:mode, custom:s.custom}, 64, eqOv);
  };
  const rows = [
    ['✨ XP', me.xp||0, other.xp||0, 'high'],
    ['⚡ Nivel', me.lvl||levelOf(me.xp||0), other.lvl||levelOf(other.xp||0), 'high'],
    ['✅ Módulos', me.mods||0, other.mods||0, 'high'],
    ['📈 Promedio', me.avg!=null?me.avg:0, other.avg!=null?other.avg:0, 'high'],
    ['🔥 Racha', me.streak||0, other.streak||0, 'high'],
    ['🏆 Puesto', posOf(PROFILES.active), posOf(pid), 'low']
  ];
  const fmtV = (label,v) => label==='📈 Promedio' ? v+'%' : label==='🏆 Puesto' ? '#'+v : (+v).toLocaleString();
  let myWins=0, otherWins=0;
  const body = rows.map(([label,a,b,dir])=>{
    const aWin = dir==='high'? a>b : a<b, bWin = dir==='high'? b>a : b<a;
    if(aWin) myWins++; if(bWin) otherWins++;
    return '<tr><td class="'+(aWin?'cmp-win':'')+'">'+fmtV(label,a)+'</td><th>'+label+'</th><td class="'+(bWin?'cmp-win':'')+'">'+fmtV(label,b)+'</td></tr>';
  }).join('');
  const verdict = myWins>otherWins ? '🎉 Vas arriba, '+esc((me.name||'tú').split(' ')[0])+'.'
    : otherWins>myWins ? '💪 '+esc((other.name||'').split(' ')[0])+' va arriba. ¡A darle!'
    : '🤝 Empate técnico.';
  openModal(
    '<h2 style="margin-top:0">⚖️ Comparación</h2>'
    + '<table class="cmp-table"><tr>'
      + '<th style="text-align:center">'+avOf(me,true)+'<br><b>'+esc(me.name||'Tú')+'</b></th><th></th>'
      + '<th style="text-align:center">'+avOf(other,false)+'<br><b>'+esc(other.name||'—')+'</b></th></tr>'
    + body + '</table>'
    + '<p class="lb-motiv" style="text-align:center">'+verdict+' ('+myWins+' – '+otherWins+')</p>'
    + '<div class="q-actions" style="justify-content:flex-end;margin-top:6px"><button class="btn ghost" id="cmpBack">← Volver</button><button class="btn" id="cmpClose">Cerrar</button></div>'
  );
  const bk = document.getElementById('cmpBack'); if(bk) bk.addEventListener('click', ()=>{ sfx('click'); lbShowStudent(pid); });
  const cl = document.getElementById('cmpClose'); if(cl) cl.addEventListener('click', ()=>{ sfx('click'); closeModal(); });
}
/* — Leaderboard: panel principal (búsqueda, orden, tabla y acciones) — */
function lbBoardPanelHTML(visible, myPos, total){
  const sortLabels = {xp:'XP', lvl:'Nivel', streak:'Racha', avg:'Promedio'};
  return '<div class="panel">'
    + '<div class="lb-controls">'
    + '<input class="ainput" id="lbSearch" placeholder="🔎 Buscar por nombre…" value="'+esc(lbFilterQ)+'">'
    + '<select class="ainput" id="lbSortSel" style="max-width:200px">'
    + Object.entries(sortLabels).map(([k,v])=>'<option value="'+k+'"'+(lbSort===k?' selected':'')+'>Ordenar por '+v+'</option>').join('')
    + '</select></div>'
    + '<table class="hist-table lb-table"><tr><th>#</th><th></th><th>Estudiante</th><th class="num">XP</th><th class="num">Nivel</th><th class="num">Prom.</th><th class="num">Racha</th>'+(lbAdminOn?'<th></th>':'')+'</tr>'
    + (visible.length ? visible.map(lbRowHTML).join('') : '<tr><td colspan="8" style="color:var(--muted)">Sin estudiantes que coincidan con la búsqueda.</td></tr>')
    + '</table>'
    + '<p class="lb-motiv">'+lbMotivation(myPos, total)+'</p>'
    + '<div class="q-actions" style="justify-content:flex-start;flex-wrap:wrap;margin-top:12px">'
    + (LB_SYNC_URL ? '<button class="btn small" id="lbUpload">⬆️ Subir mis stats al grupo</button>' : '')
    + '<button class="btn ghost small" id="lbRefresh">🔄 Actualizar</button>'
    + '</div>'
    + (LB_SYNC_URL
        ? '<p class="q-help"><b>Sincronización en vivo activada.</b> Toca “Subir mis stats” para aparecer en la tabla de todos; se actualiza por nombre.</p>'
        : '<p class="q-help">La tabla se sincroniza con el servidor cada vez que abres esta pantalla (o al tocar Actualizar).</p>')
    + '</div>';
}
/* — Leaderboard: panel de administrador (solo perfil "Oliver") — */
function lbAdminPanelHTML(b){
  const editing = lbEditId ? b.students.find(s=>s.pid===lbEditId) : null;
  return '<div class="panel" style="margin-top:16px"><h3>🛠️ Panel de administrador</h3>'
      + '<div class="q-actions" style="justify-content:flex-start;flex-wrap:wrap">'
      + '<button class="btn small'+(lbAdminOn?'':' ghost')+'" id="lbAdminToggle">'+(lbAdminOn?'🟢 Modo administrador: ON':'⚪ Modo administrador: OFF')+'</button>'
      + (lbAdminOn ? '' : '<input class="ainput" id="lbAdminPass" type="password" placeholder="Contraseña de administrador" style="max-width:220px">')
      + '</div>'
      + (lbAdminOn ?
        '<hr style="border:none;border-top:1px solid var(--line);margin:14px 0">'
        + '<h4 style="margin:0 0 8px">'+(editing?'✏️ Editar a '+esc(editing.name):'➕ Agregar estudiante')+'</h4>'
        + '<div class="lb-controls">'
        + '<input class="ainput" id="lbfName" placeholder="Nombre" maxlength="24" value="'+esc(editing?editing.name:'')+'">'
        + '<input class="ainput" id="lbfXP" type="number" min="0" placeholder="XP" style="max-width:110px" value="'+(editing?(editing.xp||0):'')+'">'
        + '<input class="ainput" id="lbfStreak" type="number" min="0" placeholder="Racha" style="max-width:100px" value="'+(editing?(editing.streak||0):'')+'">'
        + '<input class="ainput" id="lbfMods" type="number" min="0" max="12" placeholder="Módulos" style="max-width:110px" value="'+(editing?(editing.mods||0):'')+'">'
        + '</div>'
        + '<div class="q-actions" style="justify-content:flex-start;flex-wrap:wrap">'
        + '<button class="btn small" id="lbfSave">'+(editing?'💾 Guardar cambios':'➕ Agregar')+'</button>'
        + (editing?'<button class="btn ghost small" id="lbfCancel">Cancelar</button>':'')
        + '<button class="btn ghost small" id="lbSort">↕️ Ordenar por XP</button>'
        + '<button class="btn danger small" id="lbReset">🗑️ Resetear leaderboard</button>'
        + '</div>'
        + '<p class="q-help">El nivel se calcula solo a partir del XP. Usa ✏️ y 🗑️ en cada fila para editar o eliminar.</p>'
        : '<p class="q-help">Escribe la contraseña y toca el botón para activar el modo administrador.</p>')
      + '</div>';
}
function renderBoard(){
  const board = lbSyncSelf();
  const rankedXP = lbRanked(board);
  const myPos = rankedXP.findIndex(s => s.pid === PROFILES.active) + 1;   // la posición oficial es por XP
  // aviso de "subiste de rango" comparando con la última posición conocida
  if(myPos && S.lbRank && myPos < S.lbRank){ toast('📈 ¡Subiste de rango! Ahora eres #'+myPos); confetti(45); sfx('unlock'); }
  if(myPos && myPos !== S.lbRank){ S.lbRank = myPos; save(); }
  const shown = lbSorted(board, lbSort);     // orden mostrado (elegido por el usuario)
  const visible = shown.filter(s => !lbFilterQ || (s.name||'').toLowerCase().includes(lbFilterQ.toLowerCase()));
  $('#boardBody').innerHTML = lbBoardPanelHTML(visible, myPos, rankedXP.length)
    + (lbIsAdmin() ? lbAdminPanelHTML(board) : '');
  bindBoardEvents();
}
/* — Leaderboard: eventos (el cuerpo se re-renderiza, se re-enlazan aquí) — */
function bindBoardEvents(){
  $('#lbSearch').addEventListener('input', e => { lbFilterQ = e.target.value; renderBoard(); const el=$('#lbSearch'); el.focus(); el.setSelectionRange(el.value.length,el.value.length); });
  $('#lbSortSel').addEventListener('change', e => { lbSort = e.target.value; renderBoard(); });
  const lbUp = $('#lbUpload'); if(lbUp) lbUp.addEventListener('click', () => { sfx('click'); lbUploadSelf(); });
  $('#lbRefresh').addEventListener('click', () => { sfx('click'); lbMaybeFetch(true); });
  $$('#boardBody [data-lbview]').forEach(btn => btn.addEventListener('click', () => { sfx('click'); lbShowStudent(btn.dataset.lbview); }));
  $$('#boardBody [data-lbedit]').forEach(btn => btn.addEventListener('click', () => { lbEditId = btn.dataset.lbedit; renderBoard(); }));
  $$('#boardBody [data-lbdel]').forEach(btn => btn.addEventListener('click', () => {
    const bd = lbLoad();
    const s = bd.students.find(x=>x.pid===btn.dataset.lbdel);
    if(!s) return;
    if(s.pid === PROFILES.active){ toast('No puedes eliminar tu propia fila: se sincroniza con tu progreso.'); return; }
    if(!confirm('¿Eliminar a "'+s.name+'" del leaderboard?')) return;
    bd.students = bd.students.filter(x=>x.pid!==s.pid);
    lbSave(bd); if(lbEditId===s.pid) lbEditId=null;
    renderBoard(); toast('🗑️ Estudiante eliminado'); sfx('click');
  }));
  const at = $('#lbAdminToggle');
  if(at) at.addEventListener('click', async () => {
    if(lbAdminOn){ lbAdminOn = false; lbEditId = null; sfx('click'); renderBoard(); return; }
    // siempre exige la contraseña al activar el modo administrador
    const pass = ($('#lbAdminPass') && $('#lbAdminPass').value) || '';
    if(!pass){ toast('🔑 Escribe la contraseña de administrador'); sfx('bad'); return; }
    const good = await lbCheckPass(pass);
    if(!good){ toast('❌ Contraseña incorrecta'); sfx('bad'); return; }
    lbAdminOn = true; sfx('unlock'); toast('🛠️ Modo administrador activado'); renderBoard();
  });
  const fs = $('#lbfSave');
  if(fs) fs.addEventListener('click', () => {
    const name = $('#lbfName').value.trim();
    if(!name){ toast('Escribe el nombre del estudiante'); return; }
    const xp = Math.max(0, +$('#lbfXP').value||0);
    const bd = lbLoad();
    if(lbEditId){
      const ent = bd.students.find(x=>x.pid===lbEditId);
      if(ent){
        if(ent.pid === PROFILES.active){ toast('Tu propia fila se sincroniza con tu progreso real; no se edita a mano.'); lbEditId=null; renderBoard(); return; }
        Object.assign(ent, {name:name.slice(0,24), xp, lvl:levelOf(xp), streak:Math.max(0,+$('#lbfStreak').value||0), mods:clamp(+$('#lbfMods').value||0,0,MODULES.length), updated:Date.now()});
        toast('💾 Estudiante actualizado');
      }
      lbEditId = null;
    } else {
      bd.students.push({pid:'m'+Date.now().toString(36), name:name.slice(0,24), avatar:'🎓', xp, lvl:levelOf(xp), streak:Math.max(0,+$('#lbfStreak').value||0), mods:clamp(+$('#lbfMods').value||0,0,MODULES.length), updated:Date.now()});
      toast('➕ Estudiante agregado');
    }
    lbSave(bd); sfx('ok'); renderBoard();
  });
  const fc = $('#lbfCancel');
  if(fc) fc.addEventListener('click', () => { lbEditId = null; renderBoard(); });
  const so = $('#lbSort');
  if(so) so.addEventListener('click', () => { const bd = lbLoad(); bd.students = lbRanked(bd); lbSave(bd); renderBoard(); toast('↕️ Ordenado por XP'); sfx('click'); });
  const rs = $('#lbReset');
  if(rs) rs.addEventListener('click', () => {
    if(!confirm('¿Borrar TODO el leaderboard? Tu fila se volverá a crear con tu progreso actual.')) return;
    lbSave({students:[]}); lbEditId=null; renderBoard(); toast('🗑️ Leaderboard reiniciado'); sfx('bad');
  });
}
$('#btnBoard').addEventListener('click', () => { sfx('click'); renderBoard(); showView('board'); lbMaybeFetch(); });

/* ==================== Tareas y calendario de exámenes ====================
   SEED_TASKS / SEED_CALENDAR: el administrador puede editarlos directamente
   aquí en el HTML (y publicar) o desde su panel dentro de la vista 📋.
   Formato de tarea:
   {id, title, subject:'ca3'|'modelos-regresion'|'estadistica-no-parametrica'|'stoch'|'administracion-financiera'|'all', partial:1|2|3|'final',
    due:'YYYY-MM-DD', priority:'alta'|'media'|'baja', desc, steps:[], materials:[],
    notes, published:'YYYY-MM-DD'} */
const SEED_TASKS = [];   // sin tareas fijas: las publica el admin vía tasks.json
/* Fechas de exámenes por materia (p1/p2/p3/final en 'YYYY-MM-DD'; vacío = sin fecha aún).
   El archivo tasks.json publicado puede sobrescribir estas fechas. */
const SEED_CALENDAR = {
  ca3:   {p1:'2026-06-10', p2:'2026-07-08', p3:'2026-08-12', final:'2026-08-12'},
  'modelos-regresion': {p1:'2026-06-08', p2:'2026-07-06', p3:'2026-08-10', final:'2026-08-10'},
  'estadistica-no-parametrica': {p1:'2026-06-09', p2:'2026-07-07', p3:'2026-08-11', final:'2026-08-11'},
  stoch: {p1:'2026-06-11', p2:'2026-07-10', p3:'2026-08-13', final:'2026-08-13'},
  'administracion-financiera': {p1:'2026-06-12', p2:'2026-07-10', p3:'2026-08-14', final:'2026-08-14'}
};
/* Store compartido a nivel dispositivo (todas las cuentas del navegador lo ven) */
const SHKEY = 'actuariq_shared_v1';
function shLoad(){
  return Object.assign({tasks:{}, deletedTasks:[], archivedTasks:[], calendar:{}}, Store.getJSON(SHKEY, null) || {});
}
function shSave(sh){ sh.updated = Date.now(); Store.setJSON(SHKEY, sh); }
/* Tareas efectivas = semillas del HTML + altas/ediciones del admin − eliminadas */
function allTasks(){
  const sh = shLoad();
  const map = {};
  SEED_TASKS.forEach(t => { map[t.id] = Object.assign({}, t); });
  Object.entries(sh.tasks||{}).forEach(([id, t]) => { map[id] = Object.assign({}, map[id]||{}, t, {id}); });
  (sh.deletedTasks||[]).forEach(id => delete map[id]);
  return Object.values(map);
}
function pendingTasksCount(){
  const arch = shLoad().archivedTasks || [];
  return allTasks().filter(t => !arch.includes(t.id) && !S.taskDone[t.id]).length;
}
function updateTaskBadge(){
  const b = $('#taskBadge'); if(!b) return;
  const n = pendingTasksCount();
  b.textContent = n > 9 ? '9+' : n;
  b.classList.toggle('hidden', !n);
}
function calMerged(){
  const sh = shLoad(); const out = {};
  SUBJECTS.forEach(s => { out[s.id] = Object.assign({p1:'',p2:'',p3:'',final:''}, SEED_CALENDAR[s.id]||{}, (sh.calendar||{})[s.id]||{}); });
  return out;
}
const PERIOD_NAMES = {p1:'1.er parcial', p2:'2.º parcial', p3:'3.er parcial', final:'Examen final'};
function daysUntil(d){ if(!d) return null; return Math.round((new Date(d+'T00:00') - new Date(todayKey()+'T00:00'))/86400000); }
function fmtDay(d){ return d ? new Date(d+'T00:00').toLocaleDateString('es-MX',{weekday:'short', day:'2-digit', month:'short'}) : '—'; }
function partialLabel(t){ return t.partial==='final' ? '🏁 Final' : '📖 Parcial '+t.partial; }
function dueChipHTML(t){
  if(!t.due) return '<span class="due-chip">📅 Sin fecha límite</span>';
  const dd = daysUntil(t.due);
  const f = fmtDay(t.due);
  if(S.taskDone[t.id]) return '<span class="due-chip">📅 '+f+'</span>';
  if(dd < 0)  return '<span class="due-chip late">⌛ Venció el '+f+'</span>';
  if(dd === 0) return '<span class="due-chip soon">🚨 ¡Vence HOY!</span>';
  if(dd <= 3) return '<span class="due-chip soon">⏰ Vence en '+dd+' día'+(dd===1?'':'s')+' · '+f+'</span>';
  return '<span class="due-chip">📅 '+f+' · faltan '+dd+' días</span>';
}
let taskTab = 'activas', taskAdminOn = false, taskEditId = null;
const tFilters = { subj:'', part:'', state:'', q:'' };
function taskCardHTML(t, archived){
  const done = !!S.taskDone[t.id];
  const dd = daysUntil(t.due);
  const late = !done && t.due && dd < 0;
  const soon = !done && !late && t.due != null && dd != null && dd <= 3;
  const subj = t.subject==='all' ? {icon:'📚', short:'Todas las materias'} : subjectById(t.subject);
  const prio = t.priority || 'media';
  const prioIco = prio==='alta' ? '🔴' : prio==='baja' ? '🟢' : '🟡';
  return '<div class="task-card'+(done?' done':late?' late':soon?' soon':'')+'">'
    + '<div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">'
    + '<div style="flex:1;min-width:220px"><b style="font-size:1.02rem">'+(done?'✅ ':'')+esc(t.title)+'</b>'
    + '<div class="tag-list" style="margin-top:7px">'
    + '<span class="tag neutral">'+subjSVG(subj.id)+' '+esc(subj.short)+'</span>'
    + '<span class="tag neutral">'+partialLabel(t)+'</span>'
    + '<span class="tag prio-'+prio+'">'+prioIco+' '+prio.charAt(0).toUpperCase()+prio.slice(1)+'</span>'
    + dueChipHTML(t)
    + '</div></div>'
    + '<label style="display:flex;align-items:center;gap:7px;font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap">'
    + '<input type="checkbox" data-tdone="'+esc(t.id)+'"'+(done?' checked':'')+' style="width:19px;height:19px;accent-color:var(--good)"> Ya la realicé</label>'
    + '</div>'
    + (t.desc ? '<p style="font-size:.9rem;color:var(--ink2);margin:8px 0 0">'+esc(t.desc)+'</p>' : '')
    + (t.steps && t.steps.length ? '<details><summary>📋 Pasos sugeridos ('+t.steps.length+')</summary><ol style="margin:6px 0;padding-left:20px">'+t.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></details>' : '')
    + (t.materials && t.materials.length ? '<details><summary>📎 Materiales</summary><ul style="margin:6px 0;padding-left:20px">'+t.materials.map(m=>'<li>'+esc(m)+'</li>').join('')+'</ul></details>' : '')
    + (t.notes ? '<p class="q-help" style="margin-top:6px">📝 '+esc(t.notes)+'</p>' : '')
    + '<p class="q-help" style="margin-top:6px">Publicada: '+(t.published||'—')+(done?' · realizada el '+new Date(S.taskDone[t.id]).toLocaleDateString('es-MX'):'')+'</p>'
    + (taskAdminOn ? '<div class="q-actions" style="justify-content:flex-start;flex-wrap:wrap;margin-top:8px">'
        + '<button class="btn ghost small" data-tedit="'+esc(t.id)+'">✏️ Editar</button>'
        + '<button class="btn ghost small" data-tarch="'+esc(t.id)+'">'+(archived?'📤 Desarchivar':'🗂️ Archivar')+'</button>'
        + '<button class="btn danger small" data-tdel="'+esc(t.id)+'">🗑️ Eliminar</button></div>' : '')
    + '</div>';
}
function taskFiltersHTML(){
  return '<div class="lb-controls" style="margin-bottom:12px">'
    + '<input class="ainput" id="tfQ" placeholder="🔎 Buscar tarea…" value="'+esc(tFilters.q)+'">'
    + '<select class="ainput" id="tfSubj"><option value="">Todas las materias</option>'
    + SUBJECTS.map(s=>'<option value="'+s.id+'"'+(tFilters.subj===s.id?' selected':'')+'>'+s.icon+' '+esc(s.short)+'</option>').join('')
    + '<option value="all"'+(tFilters.subj==='all'?' selected':'')+'>📚 Generales</option></select>'
    + '<select class="ainput" id="tfPart"><option value="">Todos los parciales</option>'
    + ['1','2','3','final'].map(p=>'<option value="'+p+'"'+(tFilters.part===p?' selected':'')+'>'+(p==='final'?'🏁 Final':'📖 Parcial '+p)+'</option>').join('')+'</select>'
    + '<select class="ainput" id="tfState"><option value="">Todos los estados</option>'
    + '<option value="pend"'+(tFilters.state==='pend'?' selected':'')+'>⏳ Pendientes</option>'
    + '<option value="done"'+(tFilters.state==='done'?' selected':'')+'>✅ Realizadas</option></select>'
    + '</div>';
}
function taskMatchesFilters(t){
  if(tFilters.subj && t.subject !== tFilters.subj) return false;
  if(tFilters.part && String(t.partial) !== tFilters.part) return false;
  if(tFilters.state === 'pend' && S.taskDone[t.id]) return false;
  if(tFilters.state === 'done' && !S.taskDone[t.id]) return false;
  if(tFilters.q){
    const q = tFilters.q.toLowerCase();
    const blob = (t.title+' '+(t.desc||'')+' '+(t.notes||'')).toLowerCase();
    if(!blob.includes(q)) return false;
  }
  return true;
}
function renderCalendarHTML(){
  const cal = calMerged();
  const today = todayKey();
  // — Próximos exámenes de todas las materias —
  const upcoming = [];
  SUBJECTS.forEach(s => Object.entries(cal[s.id]).forEach(([per, d]) => {
    if(d && d >= today) upcoming.push({subj:s, per, d});
  }));
  upcoming.sort((a,b) => a.d.localeCompare(b.d));
  let html = '<div class="panel" style="margin-bottom:14px"><h3>⏳ Próximos exámenes</h3>'
    + (upcoming.length ? upcoming.slice(0,6).map(u => {
        const dd = daysUntil(u.d);
        return '<div class="cal-exam'+(dd<=7?' soon':'')+'"><span class="ce-date">'+fmtDay(u.d)+'</span>'
          + '<span style="flex:1">'+u.subj.icon+' <b>'+esc(u.subj.short)+'</b> · '+PERIOD_NAMES[u.per]+'</span>'
          + '<span class="due-chip'+(dd<=3?' soon':'')+'">'+(dd===0?'¡HOY!':dd===1?'mañana':'en '+dd+' días')+'</span></div>';
      }).join('')
      : '<p style="color:var(--muted);font-size:.87rem">Aún no hay fechas de exámenes capturadas.'+(lbIsAdmin()?' Actívate como admin abajo para capturarlas.':'')+'</p>')
    + '</div>';
  // — Tareas que vencen pronto —
  const arch = shLoad().archivedTasks || [];
  const soonTasks = allTasks().filter(t => !arch.includes(t.id) && !S.taskDone[t.id] && t.due && daysUntil(t.due) >= 0 && daysUntil(t.due) <= 7)
    .sort((a,b) => a.due.localeCompare(b.due));
  html += '<div class="panel" style="margin-bottom:14px"><h3>📌 Tareas que vencen esta semana</h3>'
    + (soonTasks.length ? soonTasks.map(t => {
        const subj = t.subject==='all' ? {icon:'📚', short:'Todas'} : subjectById(t.subject);
        return '<div class="cal-exam"><span class="ce-date">'+fmtDay(t.due)+'</span>'
          + '<span style="flex:1">'+subj.icon+' '+esc(t.title)+'</span>'+dueChipHTML(t)+'</div>';
      }).join('')
      : '<p style="color:var(--good-text);font-size:.87rem;font-weight:700">🎉 Nada vence en los próximos 7 días.</p>')
    + '</div>';
  // — Fechas y preparación por materia —
  html += '<div class="dash-grid">' + SUBJECTS.map(s => {
    const c = cal[s.id];
    const st = subjStats(s.id);
    const rows = Object.entries(c).map(([per, d]) => {
      const dd = daysUntil(d);
      return '<div class="cal-exam"><span class="ce-date">'+fmtDay(d)+'</span>'
        + '<span style="flex:1">'+PERIOD_NAMES[per]+'</span>'
        + (taskAdminOn ? '<input type="date" class="ainput" style="max-width:150px;padding:6px 8px" data-cal="'+s.id+':'+per+'" value="'+esc(d||'')+'">'
           : (d ? (dd>=0 ? '<span class="due-chip'+(dd<=7?' soon':'')+'">'+(dd===0?'¡HOY!':'en '+dd+' días')+'</span>' : '<span class="due-chip">ya pasó</span>') : '<span class="due-chip">sin fecha</span>'))
        + '</div>';
    }).join('');
    return '<div class="panel"><h3>'+s.icon+' '+esc(s.short)+'</h3>'+rows
      + '<h4 style="margin:12px 0 6px;font-size:.82rem;color:var(--ink2)">🎯 Tu preparación</h4>'
      + '<div class="hbar-row"><span class="hb-label">Módulos</span><span class="hbar-track"><i style="width:'+(st.total?Math.round(st.done/st.total*100):0)+'%"></i></span><span class="hb-val">'+st.done+'/'+(st.total||'—')+'</span></div>'
      + '<div class="hbar-row"><span class="hb-label">Promedio</span><span class="hbar-track"><i style="width:'+st.avg+'%"></i></span><span class="hb-val">'+(st.attempts?st.avg+'%':'—')+'</span></div>'
      + '<p class="q-help">'+(st.total ? (st.done===st.total ? '🏆 Materia dominada en la app' : st.attempts ? 'Sigue practicando para llegar al examen preparado' : 'Aún no practicas esta materia en la app') : 'Contenido de práctica en preparación')+'</p>'
      + '</div>';
  }).join('') + '</div>';
  return html;
}
function taskAdminHTML(){
  if(!lbIsAdmin()) return '';
  const editing = taskEditId ? allTasks().find(t => t.id === taskEditId) : null;
  let html = '<div class="panel" style="margin-top:16px"><h3>🛠️ Panel de administrador · Tareas</h3>'
    + '<div class="q-actions" style="justify-content:flex-start;flex-wrap:wrap">'
    + '<button class="btn small'+(taskAdminOn?'':' ghost')+'" id="tAdminToggle">'+(taskAdminOn?'🟢 Modo administrador: ON':'⚪ Modo administrador: OFF')+'</button>'
    + (taskAdminOn ? '' : '<input class="ainput" id="tAdminPass" type="password" placeholder="Contraseña de administrador" style="max-width:220px">')
    + '</div>';
  if(taskAdminOn){
    html += '<hr style="border:none;border-top:1px solid var(--line);margin:14px 0">'
      + '<h4 style="margin:0 0 8px">'+(editing ? '✏️ Editar: '+esc(editing.title) : '➕ Nueva tarea')+'</h4>'
      + '<div class="lb-controls">'
      + '<input class="ainput" id="tfTitle" placeholder="Título de la tarea" maxlength="90" value="'+esc(editing?editing.title:'')+'">'
      + '</div><div class="lb-controls">'
      + '<select class="ainput" id="tfSubject">'
      + SUBJECTS.map(s=>'<option value="'+s.id+'"'+(editing&&editing.subject===s.id?' selected':'')+'>'+s.icon+' '+esc(s.short)+'</option>').join('')
      + '<option value="all"'+(editing&&editing.subject==='all'?' selected':'')+'>📚 Todas las materias</option></select>'
      + '<select class="ainput" id="tfPartial">'
      + ['1','2','3','final'].map(p=>'<option value="'+p+'"'+(editing&&String(editing.partial)===p?' selected':'')+'>'+(p==='final'?'🏁 Final':'📖 Parcial '+p)+'</option>').join('')+'</select>'
      + '<input class="ainput" type="date" id="tfDue" value="'+esc(editing&&editing.due?editing.due:'')+'" style="max-width:170px">'
      + '<select class="ainput" id="tfPrio" style="max-width:150px">'
      + ['alta','media','baja'].map(p=>'<option value="'+p+'"'+((editing?editing.priority:'media')===p?' selected':'')+'>Prioridad '+p+'</option>').join('')+'</select>'
      + '</div>'
      + '<textarea class="ainput" id="tfDesc" rows="2" placeholder="Descripción" style="width:100%;margin:8px 0;resize:vertical">'+esc(editing?(editing.desc||''):'')+'</textarea>'
      + '<textarea class="ainput" id="tfSteps" rows="3" placeholder="Pasos sugeridos (uno por línea)" style="width:100%;margin:0 0 8px;resize:vertical">'+esc(editing?(editing.steps||[]).join('\n'):'')+'</textarea>'
      + '<textarea class="ainput" id="tfMaterials" rows="2" placeholder="Materiales (uno por línea)" style="width:100%;margin:0 0 8px;resize:vertical">'+esc(editing?(editing.materials||[]).join('\n'):'')+'</textarea>'
      + '<input class="ainput" id="tfNotes" placeholder="Notas (opcional)" style="width:100%;margin:0 0 8px" value="'+esc(editing?(editing.notes||''):'')+'">'
      + '<div class="q-actions" style="justify-content:flex-start;flex-wrap:wrap">'
      + '<button class="btn small" id="tfSave">'+(editing?'💾 Guardar cambios':'➕ Publicar tarea')+'</button>'
      + (editing ? '<button class="btn ghost small" id="tfCancel">Cancelar</button>' : '')
      + '<button class="btn ghost small" id="tExport">⬇️ Exportar tasks.json</button>'
      + '<button class="btn ghost small" id="tImport">⬆️ Importar</button>'
      + '<input type="file" id="tImportFile" accept=".json,application/json" class="hidden">'
      + '</div>'
      + '<p class="q-help">🌐 <b>Para publicar a todo el grupo:</b> toca “⬇️ Exportar tasks.json” y sube ese archivo al repositorio reemplazando <code>tasks.json</code> (Add file → Upload files). Al desplegarse, todos verán las tareas y fechas al abrir 📋 Tareas.</p>'
      + '<p class="q-help">En la pestaña 📅 Calendario capturas las fechas de exámenes con el modo admin activado. Usa ✏️ / 🗂️ / 🗑️ en cada tarjeta para editar, archivar o eliminar.</p>';
  } else {
    html += '<p class="q-help">Escribe la contraseña y toca el botón para administrar tareas y fechas de exámenes.</p>';
  }
  return html + '</div>';
}
function renderTasks(){
  const sh = shLoad();
  const arch = sh.archivedTasks || [];
  const today = todayKey();
  const all = allTasks();
  const pend = pendingTasksCount();
  // pestañas activas
  $$('#taskTabs [data-ttab]').forEach(b => {
    const on = b.dataset.ttab === taskTab;
    b.classList.toggle('ghost', !on);
  });
  let html = '';
  if(taskTab === 'calendario'){
    html = renderCalendarHTML();
  } else {
    let list;
    if(taskTab === 'archivo') list = all.filter(t => arch.includes(t.id));
    else if(taskTab === 'vencidas') list = all.filter(t => !arch.includes(t.id) && t.due && t.due < today && !S.taskDone[t.id]);
    else list = all.filter(t => !arch.includes(t.id) && !(t.due && t.due < today && !S.taskDone[t.id]));
    list = list.filter(taskMatchesFilters);
    // ordenar: por fecha de entrega (las sin fecha al final)
    list.sort((a,b) => (a.due||'9999').localeCompare(b.due||'9999'));
    html = '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px">'
      + '<p style="font-weight:700;font-size:.9rem;margin:0;flex:1;min-width:180px">'
      + (pend ? '⏳ Tienes <b>'+pend+'</b> tarea'+(pend===1?'':'s')+' pendiente'+(pend===1?'':'s')+' en total.' : '🎉 ¡Todo al día! No tienes tareas pendientes.')
      + '</p><button class="btn ghost small" id="tRefreshTop">🔄 Actualizar</button></div>'
      + taskFiltersHTML()
      + (list.length ? list.map(t => taskCardHTML(t, arch.includes(t.id))).join('')
         : '<div class="panel" style="text-align:center;color:var(--muted)">'
           + (taskTab==='vencidas' ? '🎉 No tienes tareas vencidas.' : taskTab==='archivo' ? 'El archivo está vacío.' : 'No hay tareas que coincidan con el filtro.')+'</div>');
  }
  html += taskAdminHTML();
  $('#tasksBody').innerHTML = html;
  bindTaskEvents();
}
function bindTaskEvents(){
  const rt = $('#tRefreshTop');
  if(rt) rt.addEventListener('click', () => { sfx('click'); tasksMaybeFetch(true); });
  // filtros
  const fq = $('#tfQ');
  if(fq){
    fq.addEventListener('input', e => { tFilters.q = e.target.value; renderTasks(); const el=$('#tfQ'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); });
    $('#tfSubj').addEventListener('change', e => { tFilters.subj = e.target.value; renderTasks(); });
    $('#tfPart').addEventListener('change', e => { tFilters.part = e.target.value; renderTasks(); });
    $('#tfState').addEventListener('change', e => { tFilters.state = e.target.value; renderTasks(); });
  }
  // marcar realizada
  $$('#tasksBody [data-tdone]').forEach(ch => ch.addEventListener('change', e => {
    const id = ch.dataset.tdone;
    if(e.target.checked){ S.taskDone[id] = Date.now(); toast('✅ Tarea marcada como realizada'); sfx('ok'); }
    else { delete S.taskDone[id]; sfx('click'); }
    save(); updateTaskBadge(); renderTasks();
  }));
  // fechas del calendario (admin)
  $$('#tasksBody [data-cal]').forEach(inp => inp.addEventListener('change', e => {
    const [sid, per] = inp.dataset.cal.split(':');
    const sh = shLoad();
    sh.calendar[sid] = sh.calendar[sid] || {};
    sh.calendar[sid][per] = e.target.value || '';
    shSave(sh); toast('📅 Fecha guardada: '+subjectById(sid).short+' · '+PERIOD_NAMES[per]); sfx('ok'); renderTasks();
  }));
  // admin: activar/desactivar
  const at = $('#tAdminToggle');
  if(at) at.addEventListener('click', async () => {
    if(taskAdminOn){ taskAdminOn = false; taskEditId = null; sfx('click'); renderTasks(); return; }
    // siempre exige la contraseña al activar el modo administrador
    const pass = ($('#tAdminPass') && $('#tAdminPass').value) || '';
    if(!pass){ toast('🔑 Escribe la contraseña de administrador'); sfx('bad'); return; }
    const good = await lbCheckPass(pass);
    if(!good){ toast('❌ Contraseña incorrecta'); sfx('bad'); return; }
    taskAdminOn = true; sfx('unlock'); toast('🛠️ Modo administrador de tareas activado'); renderTasks();
  });
  // admin: guardar/editar tarea
  const ts = $('#tfSave');
  if(ts) ts.addEventListener('click', () => {
    const title = $('#tfTitle').value.trim();
    if(!title){ toast('Escribe el título de la tarea'); sfx('bad'); return; }
    const sh = shLoad();
    const id = taskEditId || ('t-'+Date.now().toString(36));
    const base = taskEditId ? (allTasks().find(t=>t.id===taskEditId) || {}) : {};
    sh.tasks[id] = Object.assign({}, base, {
      id, title,
      subject: $('#tfSubject').value,
      partial: $('#tfPartial').value === 'final' ? 'final' : +$('#tfPartial').value,
      due: $('#tfDue').value || '',
      priority: $('#tfPrio').value,
      desc: $('#tfDesc').value.trim(),
      steps: $('#tfSteps').value.split('\n').map(x=>x.trim()).filter(Boolean),
      materials: $('#tfMaterials').value.split('\n').map(x=>x.trim()).filter(Boolean),
      notes: $('#tfNotes').value.trim(),
      published: base.published || todayKey()
    });
    sh.deletedTasks = (sh.deletedTasks||[]).filter(x => x !== id);
    shSave(sh);
    toast(taskEditId ? '💾 Tarea actualizada' : '➕ Tarea publicada'); sfx('ok');
    taskEditId = null; updateTaskBadge(); renderTasks();
  });
  const tc = $('#tfCancel');
  if(tc) tc.addEventListener('click', () => { taskEditId = null; renderTasks(); });
  // admin: por tarjeta
  $$('#tasksBody [data-tedit]').forEach(b => b.addEventListener('click', () => { taskEditId = b.dataset.tedit; renderTasks();
    const pn = $('#tfTitle'); if(pn) pn.scrollIntoView({behavior:'smooth', block:'center'}); }));
  $$('#tasksBody [data-tarch]').forEach(b => b.addEventListener('click', () => {
    const sh = shLoad(); const id = b.dataset.tarch;
    if(sh.archivedTasks.includes(id)) sh.archivedTasks = sh.archivedTasks.filter(x=>x!==id);
    else sh.archivedTasks.push(id);
    shSave(sh); sfx('click'); updateTaskBadge(); renderTasks();
  }));
  $$('#tasksBody [data-tdel]').forEach(b => b.addEventListener('click', () => {
    const t = allTasks().find(x=>x.id===b.dataset.tdel);
    if(!t || !confirm('¿Eliminar la tarea "'+t.title+'" para todos?')) return;
    const sh = shLoad();
    delete sh.tasks[t.id];
    if(!sh.deletedTasks.includes(t.id)) sh.deletedTasks.push(t.id);
    shSave(sh); if(taskEditId===t.id) taskEditId=null;
    toast('🗑️ Tarea eliminada'); sfx('bad'); updateTaskBadge(); renderTasks();
  }));
  // admin: exportar / importar tareas + calendario
  const te = $('#tExport');
  if(te) te.addEventListener('click', async () => {
    const sh = shLoad();
    const payload = {app:'actuariq-tasks', version:1, exported:new Date().toISOString(),
      tasks: allTasks(), archivedTasks: sh.archivedTasks||[], deletedTasks: sh.deletedTasks||[], calendar: calMerged()};
    // publica directo al servidor (requiere cuenta admin); si falla, descarga el JSON como antes
    try{
      await window.AQ.api('PUT', '/api/tasks', payload);
      toast('🌐 ¡Tareas publicadas! Todo el grupo las verá al abrir la app.'); sfx('win');
    }catch(e){
      if(e.status === 403){ toast('🚫 Tu cuenta no es administradora en el servidor.'); sfx('bad'); }
      else { downloadJSON('tasks.json', payload); toast('⚠️ Sin conexión con el servidor: se descargó tasks.json como respaldo.'); }
    }
  });
  const trf = $('#tRefresh');
  if(trf) trf.addEventListener('click', () => { sfx('click'); tasksMaybeFetch(true); });
  const ti = $('#tImport');
  if(ti) ti.addEventListener('click', () => $('#tImportFile').click());
  const tif = $('#tImportFile');
  if(tif) tif.addEventListener('change', e => {
    const file = e.target.files[0]; e.target.value = '';
    if(!file) return;
    readJSONFile(file, '❌ El archivo no es un JSON de tareas válido', payload => {
      if(!payload || payload.app !== 'actuariq-tasks' || !Array.isArray(payload.tasks)) throw new Error('formato');
      const sh = shLoad();
      payload.tasks.forEach(t => { if(t && t.id && t.title) sh.tasks[t.id] = t; });
      if(Array.isArray(payload.archivedTasks)) sh.archivedTasks = payload.archivedTasks;
      if(Array.isArray(payload.deletedTasks)) sh.deletedTasks = payload.deletedTasks;
      if(payload.calendar) SUBJECTS.forEach(s => { if(payload.calendar[s.id]) { sh.calendar[s.id] = Object.assign({}, sh.calendar[s.id]||{}, payload.calendar[s.id]); } });
      shSave(sh);
      toast('⬆️ Tareas y calendario importados'); sfx('unlock'); updateTaskBadge(); renderTasks();
    });
  });
}
/* — Tareas y calendario compartidos: tasks.json publicado junto a la página —
   El admin edita las tareas, exporta tasks.json y lo sube al repositorio; al
   desplegarse, todos los alumnos reciben la versión nueva al abrir 📋 Tareas.
   Se aplica solo si el archivo trae una fecha (updated) más reciente que la
   última importada, para no pisar tus cambios locales si eres el admin. */
let tasksFetchedAt = 0;
function tasksApplyRemote(payload){
  if(!payload) return 0;
  const remoteUpdated = Date.parse(payload.exported || payload.updated || 0) || 0;
  const sh = shLoad();
  if(remoteUpdated && (sh.remoteAppliedAt||0) >= remoteUpdated) return 0;   // ya aplicado
  let changed = 0;
  if(Array.isArray(payload.tasks)){
    payload.tasks.forEach(t => { if(t && t.id && t.title){ sh.tasks[t.id] = t; changed++; } });
  }
  if(Array.isArray(payload.archivedTasks)) sh.archivedTasks = payload.archivedTasks;
  if(Array.isArray(payload.deletedTasks)) sh.deletedTasks = payload.deletedTasks;
  if(payload.calendar) SUBJECTS.forEach(s => { if(payload.calendar[s.id]) sh.calendar[s.id] = Object.assign({}, sh.calendar[s.id]||{}, payload.calendar[s.id]); });
  sh.remoteAppliedAt = remoteUpdated || Date.now();
  shSave(sh);
  return changed || 1;
}
async function tasksFetchRemote(){
  try{
    const res = await fetch('tasks.json?t='+Date.now(), {cache:'no-store'});
    if(!res.ok) return -1;
    const payload = await res.json();
    return tasksApplyRemote(payload);
  }catch(e){ return -1; }
}
function tasksMaybeFetch(force){
  if(!force && Date.now() - tasksFetchedAt < 60000){ updateTaskBadge(); return; }
  tasksFetchedAt = Date.now();
  tasksFetchRemote().then(n => {
    if(n > 0){ updateTaskBadge(); const tv = document.querySelector('#view-tasks:not(.hidden)'); if(tv) renderTasks();
      toast('🌐 Tareas actualizadas desde el grupo'); }
    else if(force) toast(n === -1 ? '🌐 No se pudo descargar tasks.json' : '🌐 Ya tienes las tareas más recientes');
  });
}
$('#btnTasks').addEventListener('click', () => { sfx('click'); renderTasks(); showView('tasks'); tasksMaybeFetch(); });
$$('#taskTabs [data-ttab]').forEach(b => b.addEventListener('click', () => { sfx('click'); taskTab = b.dataset.ttab; renderTasks(); }));

/* ==================== Insignias ==================== */
const BADGES = [
  {id:'first',   ico:'🎓', name:'Primer paso',        desc:'Completa tu primer módulo',        test:()=>Object.values(S.modules).some(m=>m.done)},
  {id:'perfect', ico:'💯', name:'Perfeccionista',     desc:'Obtén 100% en un módulo',          test:()=>Object.values(S.modules).some(m=>m.best>=100)},
  {id:'streak3', ico:'🔥', name:'Constancia',         desc:'Racha de 3 días seguidos',         test:()=>S.streak>=3},
  {id:'streak7', ico:'🌋', name:'Imparable',          desc:'Racha de 7 días seguidos',         test:()=>S.streak>=7},
  {id:'half',    ico:'🧭', name:'Medio camino',       desc:'Completa 6 módulos',               test:()=>Object.values(S.modules).filter(m=>m.done).length>=6},
  {id:'all',     ico:'🏆', name:'Actuario en formación', desc:'Completa los 12 módulos',       test:()=>Object.values(S.modules).filter(m=>m.done).length>=12},
  {id:'memo',    ico:'🧠', name:'Memoria de elefante', desc:'≥ 90% en el memorama',            test:()=>modState(8).best>=90},
  {id:'escape',  ico:'🔓', name:'Escapista',          desc:'Abre la caja fuerte',              test:()=>modState(10).done},
  {id:'blitz10', ico:'⚡', name:'Velocista',          desc:'10+ aciertos en el contrarreloj',  test:()=>S.bestBlitz>=10},
  {id:'blitzcombo8', ico:'🔥', name:'Racha de rayo', desc:'Racha de 8 aciertos seguidos en el contrarreloj', test:()=>(S.bestBlitzCombo||0)>=8},
  {id:'sudden15', ico:'💀', name:'Nervios de acero', desc:'Racha de 15 en Muerte súbita',      test:()=>(S.bestSudden||0)>=15},
  {id:'xp1000',  ico:'🌟', name:'Estrella en ascenso', desc:'Acumula 1,000 XP',                test:()=>S.xp>=1000},
  {id:'scholar', ico:'📚', name:'Estudioso',          desc:'60 minutos de estudio',            test:()=>S.totalTime>=3600},
  {id:'tryhard', ico:'💪', name:'Persistente',        desc:'20 actividades realizadas',        test:()=>S.history.length>=20},
  {id:'exam1',   ico:'📝', name:'Primer examen',      desc:'Completa un examen diario',        test:()=>(S.examHistory||[]).length>=1},
  {id:'exam90',  ico:'🏅', name:'Sobresaliente',      desc:'≥ 90% en un examen diario',        test:()=>(S.examHistory||[]).some(e=>e.score>=90)},
  {id:'streak15', ico:'🔥', name:'Racha de fuego',    desc:'Racha de 15 días seguidos',        test:()=>S.streak>=15},
  {id:'streak30', ico:'👑', name:'Racha legendaria',  desc:'Racha de 30 días seguidos',        test:()=>S.streak>=30},
  {id:'ans10',   ico:'✍️', name:'Primeras respuestas', desc:'Responde 10 preguntas',           test:()=>(S.totalAnswered||0)>=10},
  {id:'ans25',   ico:'📝', name:'Practicante',        desc:'Responde 25 preguntas',            test:()=>(S.totalAnswered||0)>=25},
  {id:'ans50',   ico:'🧾', name:'Curtido',            desc:'Responde 50 preguntas',            test:()=>(S.totalAnswered||0)>=50},
  {id:'ans100',  ico:'🗂️', name:'Veterano',           desc:'Responde 100 preguntas',           test:()=>(S.totalAnswered||0)>=100},
  {id:'ans250',  ico:'📚', name:'Incansable',         desc:'Responde 250 preguntas',           test:()=>(S.totalAnswered||0)>=250},
  {id:'xp5000',  ico:'✨', name:'Cinco mil',          desc:'Acumula 5,000 XP',                 test:()=>S.xp>=5000},
  {id:'exam5',   ico:'🗓️', name:'Rutina de examen',   desc:'Presenta 5 exámenes diarios',      test:()=>(S.examHistory||[]).length>=5},
  // — Multi-materia y parciales (progreso en todas las materias) —
  {id:'parcial1', ico:'📗', name:'Parcial superado',  desc:'Termina un parcial de una materia (≥ 90%)', test:()=>Object.keys(S.parcialFreezeAwarded||{}).length>=1},
  {id:'subjDone', ico:'🎯', name:'Materia dominada',  desc:'Completa TODOS los módulos de una materia', test:()=>SUBJECTS.some(sx=>{ const snap=subjSnapshot(sx.id); const mods=MODULES_BY_SUBJECT[sx.id]||[]; return mods.length>0 && mods.every(m=>snap.modules&&snap.modules[m.id]&&snap.modules[m.id].done); })},
  {id:'multi3',   ico:'🧩', name:'Todoterreno',       desc:'Ten actividad en 3 materias',       test:()=>SUBJECTS.filter(sx=>(subjSnapshot(sx.id).history||[]).length>0).length>=3},
  {id:'multi5',   ico:'🌐', name:'Multidisciplinario',desc:'Ten actividad en las 5 materias',   test:()=>SUBJECTS.filter(sx=>(subjSnapshot(sx.id).history||[]).length>0).length>=5},
  // — Congeladores de racha —
  {id:'freeze1',  ico:'🧊', name:'Racha a salvo',     desc:'Un congelador salvó tu racha',     test:()=>!!S.everUsedFreeze},
  {id:'freeze3',  ico:'❄️', name:'Bien preparado',    desc:'Ten 3 congeladores a la vez',      test:()=>(S.streakFreezes||0)>=3},
  // — Logros secretos: no revelan qué hacer hasta desbloquearlos —
  {id:'sec-owl',    ico:'🦉', secret:true, name:'Búho nocturno',   desc:'Estudiaste de madrugada (12 am – 5 am, CDMX).', test:()=>!!S.lateNight},
  {id:'sec-early',  ico:'🐦', secret:true, name:'Madrugador',      desc:'Estudiaste muy temprano (5 – 8 am, CDMX).',     test:()=>!!S.earlyBird},
  {id:'sec-perfect',ico:'💎', secret:true, name:'Examen impecable',desc:'Sacaste 100% en un examen diario.',            test:()=>(S.examHistory||[]).some(e=>e.score>=100)},
  {id:'sec-combo20',ico:'⚡', secret:true, name:'Dedos de rayo',   desc:'20 aciertos seguidos en el contrarreloj.',     test:()=>(S.bestBlitzCombo||0)>=20},
  {id:'sec-boom',   ico:'💥', secret:true, name:'Explotó el examen',desc:'Sacaste menos de 40% en un examen. Pasa.',    test:()=>(S.examHistory||[]).some(e=>e.score<40)},
  {id:'sec-rich',   ico:'💰', secret:true, name:'Millonario de XP',desc:'Acumulaste 10,000 XP.',                        test:()=>S.xp>=10000},
  {id:'sec-marathon',ico:'⏳', secret:true, name:'Maratonista',    desc:'3 horas de estudio acumuladas.',               test:()=>S.totalTime>=10800},
  {id:'sec-collector',ico:'🧑‍🎨', secret:true, name:'Coleccionista',desc:'Desbloqueaste 20 recompensas de la tienda.',  test:()=>(S.unlockedRewards||[]).length>=20}
];
function checkBadges(){
  BADGES.forEach(b => {
    if(!S.badges.includes(b.id) && b.test()){
      S.badges.push(b.id); save();
      toast(b.ico+(b.secret?' 🕵️ ¡Logro secreto: <b>':' ¡Nueva insignia: <b>')+b.name+'</b>!'); sfx('unlock');
    }
  });
}

/* ==================== Panel de estadísticas ==================== */
/* — Estadísticas: tira de tarjetas resumen — */
function statsTilesHTML(o, exams, exAvg){
  return '<div class="stats-strip">'
    + tile('✅','Módulos completados', o.done, '', 'de '+o.total)
    + tile('','Promedio general', Math.round(o.avg), '%', S.history.length+' actividades')
    + tile('','Precisión', Math.round(o.acc*100), '%', o.answered+' respuestas')
    + tile('','Tiempo estudiado', fmtDur(S.totalTime), '', 'acumulado')
    + tile('','XP', S.xp, '', 'Nivel '+levelInfo().lvl)
    + tile('','Racha', S.streak, S.streak===1?' día':' días', 'mejor blitz: '+S.bestBlitz+' aciertos · mejor racha: '+(S.bestBlitzCombo||0))
    + tile('📝','Exámenes diarios', exams.length, '', exams.length ? 'promedio '+exAvg+'%' : 'aún sin exámenes')
    + '</div>';
}
/* — Estadísticas generales de todas las materias — */
function statsGlobalPanelHTML(myPos, lbTotal){
  const perSubj = SUBJECTS.map(s => Object.assign({s}, subjStats(s.id)));
  const withHist = perSubj.filter(x => x.attempts > 0);
  const globalAvg = withHist.length ? Math.round(withHist.reduce((a,x)=>a+x.avg,0)/withHist.length) : 0;
  const withMods = perSubj.filter(x => x.total > 0);
  const globalProg = withMods.length ? Math.round(withMods.reduce((a,x)=>a+x.progress,0)/withMods.length*100) : 0;
  const topSubj = [...perSubj].sort((a,b)=>b.xp-a.xp)[0];
  const upcomingG = [];
  { const cal = calMerged(), today = todayKey();
    SUBJECTS.forEach(s => Object.entries(cal[s.id]).forEach(([per,d]) => { if(d && d >= today) upcomingG.push({s, per, d}); }));
    upcomingG.sort((a,b)=>a.d.localeCompare(b.d)); }
  return '<div class="panel"><h3>🌍 Generales · todas las materias</h3>'
    + '<div class="tag-list" style="margin-bottom:10px">'
    + '<span class="tag neutral">⚡ '+S.xp.toLocaleString()+' XP · nivel '+levelInfo().lvl+'</span>'
    + '<span class="tag neutral">📈 Promedio general: '+(withHist.length?globalAvg+'%':'—')+'</span>'
    + '<span class="tag neutral">🔥 Racha: '+S.streak+(S.streak===1?' día':' días')+'</span>'
    + '<span class="tag neutral">📚 Materias con actividad: '+withHist.length+'/'+SUBJECTS.length+'</span>'
    + '<span class="tag neutral">🏆 Progreso total: '+globalProg+'%</span>'
    + '<span class="tag neutral">📋 Tareas pendientes: '+pendingTasksCount()+'</span>'
    + (topSubj && topSubj.xp>0 ? '<span class="tag dom">⭐ Más estudiada: '+topSubj.s.icon+' '+esc(topSubj.s.short)+' ('+topSubj.xp+' XP)</span>' : '')
    + (myPos ? '<span class="tag neutral">🥇 Leaderboard: #'+myPos+' de '+lbTotal+'</span>' : '')
    + '</div>'
    + (upcomingG.length ? '<p style="font-size:.85rem;font-weight:700;margin:6px 0 4px">⏳ Próximos exámenes:</p>'
        + upcomingG.slice(0,2).map(u => '<div class="cal-exam"><span class="ce-date">'+fmtDay(u.d)+'</span>'
          + '<span style="flex:1">'+u.s.icon+' '+esc(u.s.short)+' · '+PERIOD_NAMES[u.per]+'</span>'
          + '<span class="due-chip'+(daysUntil(u.d)<=7?' soon':'')+'">'+(daysUntil(u.d)===0?'¡HOY!':'en '+daysUntil(u.d)+' días')+'</span></div>').join('')
      : '<p class="q-help">Sin fechas de exámenes capturadas todavía (pestaña 📋 → 📅 Calendario).</p>')
    + '<table class="hist-table" style="margin-top:10px"><tr><th>Materia</th><th class="num">XP</th><th class="num">Módulos</th><th class="num">Avance</th><th class="num">Promedio</th><th class="num">Intentos</th></tr>'
    + perSubj.map(x => '<tr'+(x.s.id===S.activeSubject?' style="font-weight:700"':'')+'><td>'+x.s.icon+' '+esc(x.s.short)+(x.s.id===S.activeSubject?' ✔':'')+'</td>'
        + '<td class="num">'+x.xp.toLocaleString()+'</td>'
        + '<td class="num">'+(x.total ? x.done+'/'+x.total : '—')+'</td>'
        + '<td class="num">'+(x.total ? Math.round(x.progress*100)+'%' : '—')+'</td>'
        + '<td class="num">'+(x.attempts ? x.avg+'%' : '—')+'</td>'
        + '<td class="num">'+x.attempts+'</td></tr>').join('')
    + '</table></div>';
}
/* — Tarjeta del jugador (nivel, racha, próxima recompensa) — */
function statsPlayerCardHTML(o, myPos){
  const p = activeProfile();
  const li = levelInfo();
  const nr = nextReward();
  return '<div class="panel"><h3>👤 Mi tarjeta</h3>'
    + '<div style="text-align:center">'+avatarStack(p, 84)
    + '<div style="font-weight:800;margin-top:6px">'+esc(p.name)+'</div>'
    + '<div style="font-size:.82rem;color:var(--ink2)">'+titleIco()+' '+esc(currentTitle())+'</div></div>'
    + '<div class="qprog" style="margin:12px 0 4px"><i style="width:'+Math.round(li.frac*100)+'%"></i></div>'
    + '<p class="q-help" style="margin:0 0 10px">Nivel '+li.lvl+' · '+S.xp+' XP · faltan '+li.toNext+' para subir</p>'
    + '<div class="tag-list">'
    + '<span class="tag neutral">🔥 Racha: '+S.streak+(S.streak===1?' día':' días')+'</span>'
    + (myPos ? '<span class="tag neutral">🏆 #'+myPos+' del leaderboard</span>' : '')
    + '<span class="tag neutral">🎖️ '+S.badges.length+'/'+BADGES.length+' insignias</span>'
    + '<span class="tag neutral">✅ '+o.done+'/'+o.total+' módulos</span>'
    + '</div>'
    + (nr ? '<p style="font-size:.85rem;font-weight:700;margin:12px 0 4px">⏭️ Próxima recompensa: '+nr.ico+' '+esc(nr.name)+'</p>'
        + '<div class="pbar"><i style="width:'+Math.min(100,Math.round(S.xp/nr.xp*100))+'%"></i></div>'
        + '<p class="q-help">'+S.xp+' / '+nr.xp+' XP · equípala desde tu perfil 🎁</p>'
      : '<p style="font-size:.85rem;font-weight:700;color:var(--good-text);margin-top:12px">🏆 Desbloqueaste toda la tienda de recompensas</p>')
    + '</div>';
}
/* — Último examen diario + temas fallados con acceso directo al módulo — */
function statsLastExamPanelHTML(exams, subj){
  const lastEx = exams[0];
  const lastTopics = (lastEx && lastEx.failedTopics) ? lastEx.failedTopics : [];
  return '<div class="panel"><h3>📝 Último examen · '+esc(subj.short)+'</h3>'
    + (lastEx
      ? '<p style="font-size:1.5rem;font-weight:800;margin:4px 0">'+lastEx.score+'%</p>'
        + '<p class="q-help" style="margin:0 0 10px">'+fmtDate(lastEx.t)+' · '+fmtDur(lastEx.sec)+(lastEx.n?' · '+lastEx.n+' preguntas':'')+(lastEx.xp!=null?' · +'+lastEx.xp+' XP':'')+'</p>'
        + '<h3 style="margin-top:14px">📚 Temas por repasar</h3>'
        + (lastTopics.length
          ? '<div class="tag-list">'+lastTopics.map(t => {
              const mod = TOPIC_MODULE[t];
              return mod!=null ? '<button class="tag ref" style="cursor:pointer;border:none;font:inherit" data-goto-mod="'+mod+'">⚠ '+(TOPIC_NAMES[t]||t)+' →</button>'
                : '<span class="tag ref">⚠ '+(TOPIC_NAMES[t]||t)+'</span>'; }).join('')+'</div>'
            + '<p class="q-help">Toca un tema para ir directo al módulo donde se practica.</p>'
          : '<p style="color:var(--good-text);font-size:.85rem;font-weight:700">🎉 Sin errores en tu último examen.</p>')
      : '<p style="color:var(--muted);font-size:.85rem">Aún no presentas el examen diario. ¡Inténtalo desde la pantalla de inicio!</p>')
    + '</div>';
}
/* — Recompensas desbloqueadas recientemente — */
function statsRecentRewardsHTML(){
  const rlog = (S.rewardLog||[]).slice(0,8);
  return '<div class="panel"><h3>🕘 Logros recientes</h3>'
    + (rlog.length ? rlog.map(e => {
        const r = REWARDS.find(x=>x.id===e.id);
        return r ? '<div class="profile-row"><span class="pr-av">'+r.ico+'</span><span class="pr-name">'+esc(r.name)+'</span><small style="color:var(--muted)">'+fmtDate(e.t)+'</small></div>' : '';
      }).join('') : '<p style="color:var(--muted);font-size:.85rem">Tus recompensas desbloqueadas aparecerán aquí. La próxima te espera en la tienda 🎁.</p>')
    + '</div>';
}
/* — Progreso por módulo de la materia activa — */
function statsModulesPanelHTML(subj){
  return '<div class="panel"><h3>📚 Progreso por módulo · '+esc(subj.short)+'</h3>'
    + MODULES.map((m,i) => { const st = modState(m.id);
      return '<div class="hbar-row"><span class="hb-label" title="'+esc(m.name)+'">'+m.icon+' '+esc(m.name)+'</span>'
        + '<span class="hbar-track"><i style="width:'+st.best+'%"></i></span>'
        + '<span class="hb-val">'+(st.attempts? st.best+'%' : '—')+'</span></div>'; }).join('')
    + '</div>';
}
/* — Precisión por tema (los 12 con más respuestas) — */
function statsTopicsPanelHTML(subj){
  const topics = Object.entries(S.concepts).map(([k,c]) => ({k, n:c.ok+c.bad, acc:c.ok/(c.ok+c.bad)}))
    .filter(t => t.n>0).sort((a,b)=>b.n-a.n).slice(0,12);
  return '<div class="panel"><h3>🧩 Progreso por tema · '+esc(subj.short)+'</h3>'
    + (topics.length ? topics.map(t =>
        '<div class="hbar-row"><span class="hb-label">'+(TOPIC_NAMES[t.k]||t.k)+'</span>'
        + '<span class="hbar-track"><i style="width:'+Math.round(t.acc*100)+'%"></i></span>'
        + '<span class="hb-val">'+Math.round(t.acc*100)+'%</span></div>').join('')
      : '<p style="color:var(--muted);font-size:.85rem">Responde algunas actividades para ver tu avance por tema.</p>')
    + '</div>';
}
/* — Conceptos dominados / por reforzar / en progreso — */
function statsConceptsPanelHTML(subj){
  const dom = [], ref = [], prog = [];
  Object.entries(S.concepts).forEach(([k,c]) => {
    const n = c.ok+c.bad, acc = n ? c.ok/n : 0;
    const name = TOPIC_NAMES[k]||k;
    if(n>=3 && acc>=0.8) dom.push(name);
    else if(n>=2 && acc<0.6) ref.push(name);
    else if(n>0) prog.push(name);
  });
  return '<div class="panel"><h3>🏅 Conceptos dominados · '+esc(subj.short)+'</h3><div class="tag-list">'
    + (dom.length ? dom.map(d=>'<span class="tag dom">✔ '+d+'</span>').join('') : '<span class="tag neutral">Aún ninguno: sigue practicando</span>')
    + '</div><h3 style="margin-top:16px">🔁 Por reforzar</h3><div class="tag-list">'
    + (ref.length ? ref.map(d=>'<span class="tag ref">⚠ '+d+'</span>').join('') : '<span class="tag neutral">Nada pendiente por ahora 🎉</span>')
    + '</div>'
    + (prog.length ? '<h3 style="margin-top:16px">⏳ En progreso</h3><div class="tag-list">'+prog.map(d=>'<span class="tag neutral">'+d+'</span>').join('')+'</div>' : '')
    + '</div>';
}
/* — Rejilla de insignias (las secretas se ocultan hasta ganarlas) — */
function statsBadgesPanelHTML(){
  const secretTotal = BADGES.filter(b=>b.secret).length;
  const secretGot = BADGES.filter(b=>b.secret && S.badges.includes(b.id)).length;
  return '<div class="panel"><h3>🎖️ Insignias ('+S.badges.length+'/'+BADGES.length+')</h3><div class="badge-grid">'
    + BADGES.map(b => {
        const got = S.badges.includes(b.id);
        const hidden = b.secret && !got;               // secreto no revelado
        const name = hidden ? '🕵️ Secreto' : b.name;
        const desc = hidden ? 'Logro secreto: descúbrelo jugando.' : b.desc;
        const ico  = hidden ? '❔' : b.ico;
        return '<div class="badge '+(got?'earned':'locked-b')+(hidden?' secret':'')+'" title="'+esc(desc)+'">'
          + '<div class="b-ico">'+ico+'</div><div class="b-name">'+esc(name)+'</div><div class="b-desc">'+esc(desc)+'</div></div>';
      }).join('')
    + '</div><p class="q-help">🕵️ Logros secretos: '+secretGot+'/'+secretTotal+' descubiertos.</p></div>';
}
/* — Adelanto de logros en Estadísticas (viven ahora en el hub del icono 🔥) — */
function statsAchievementsTeaserHTML(){
  const recent = BADGES.filter(b=>S.badges.includes(b.id)).slice(-6).reverse();
  const secretGot = BADGES.filter(b=>b.secret && S.badges.includes(b.id)).length;
  return '<div class="panel"><h3>🎖️ Logros ('+S.badges.length+'/'+BADGES.length+')</h3>'
    + (recent.length
        ? '<div class="tag-list" style="margin-bottom:8px">'+recent.map(b=>'<span class="tag dom">'+b.ico+' '+esc(b.name)+'</span>').join('')+'</div>'
        : '<p class="q-help">Aún no tienes logros: ¡juega para desbloquearlos!</p>')
    + '<p class="q-help">🕵️ Secretos descubiertos: '+secretGot+'/'+BADGES.filter(b=>b.secret).length+'. Los retos diarios/semanales y todos los logros ahora viven en el icono 🔥 del encabezado.</p>'
    + '<div class="q-actions" style="justify-content:flex-start"><button class="btn small" id="statsGoLogros">🔥 Ver retos y logros</button></div></div>';
}
/* ==================== Hub del icono de racha 🔥 ====================
   Reúne en un solo lugar: estado de la racha, retos diarios, retos semanales y
   logros (insignias). Se abre desde el chip 🔥 del encabezado. */
function missionRowHTML(def, scope, m){
  const raw = missionCur(def), goal = def.goal;
  const cur = Math.min(raw, goal);
  const pctv = Math.round(cur/goal*100);
  const claimed = (scope==='w'?m.wclaimed:m.dclaimed)[def.id];
  const done = raw >= goal;
  const unit = def.unit ? ' '+def.unit : '';
  const act = claimed ? '<span class="m-check" title="Reclamado">✅</span>'
    : done ? '<button class="btn small" data-claim="'+scope+':'+def.id+'">🎁 Reclamar</button>'
    : '<span class="m-lock">'+pctv+'%</span>';
  return '<div class="mission '+(claimed?'m-claimed':done?'m-ready':'')+'">'
    + '<div class="m-ico">'+def.ico+'</div>'
    + '<div class="m-body"><div class="m-top"><b>'+esc(def.name)+'</b><span class="m-xp">+'+def.xp+' XP</span></div>'
    + '<div class="pbar"><i style="width:'+pctv+'%"></i></div>'
    + '<div class="m-sub">'+cur+' / '+goal+unit+' · '+esc(def.desc)+'</div></div>'
    + '<div class="m-act">'+act+'</div></div>';
}
function streakHubHTML(tab){
  const m = missionState();
  const dList = DAILY_MISSIONS.filter(missionActive);
  const dReady = dList.filter(d=>!m.dclaimed[d.id] && missionCur(d)>=d.goal).length;
  const wReady = WEEKLY_MISSIONS.filter(d=>!m.wclaimed[d.id] && missionCur(d)>=d.goal).length;
  const badge = n => n ? ' <span class="streak-dot" style="position:static;box-shadow:none;display:inline-grid;vertical-align:middle">'+n+'</span>' : '';
  let body = '';
  if(tab==='daily'){
    body = '<p class="q-help" style="margin:0 0 6px">Se renuevan cada día (medianoche, hora CDMX). Completa y reclama tu XP. 🎁</p>'
      + dList.map(d=>missionRowHTML(d,'d',m)).join('');
  } else if(tab==='weekly'){
    body = '<p class="q-help" style="margin:0 0 6px">Se renuevan cada semana. Suma progreso en cualquier materia.</p>'
      + WEEKLY_MISSIONS.map(d=>missionRowHTML(d,'w',m)).join('');
  } else {
    body = statsBadgesPanelHTML();
  }
  return '<h2 style="margin-top:0">🔥 Racha, retos y logros</h2>'
    + '<div class="tag-list" style="margin-bottom:4px">'
    + '<span class="tag neutral">🔥 Racha: '+S.streak+(S.streak===1?' día':' días')+'</span>'
    + '<span class="tag neutral">🧊 Congeladores: '+(S.streakFreezes||0)+'</span>'
    + '<span class="tag neutral">📆 Días esta semana: '+studyDaysThisWeek()+'</span>'
    + '<span class="tag neutral">🎖️ Logros: '+S.badges.length+'/'+BADGES.length+'</span>'
    + '</div>'
    + '<div class="hub-tabs">'
    + '<button data-tab="daily"'+(tab==='daily'?' class="on"':'')+'>📅 Diarios'+badge(dReady)+'</button>'
    + '<button data-tab="weekly"'+(tab==='weekly'?' class="on"':'')+'>🗓️ Semanales'+badge(wReady)+'</button>'
    + '<button data-tab="logros"'+(tab==='logros'?' class="on"':'')+'>🎖️ Logros</button>'
    + '</div>'
    + '<div id="hubBody">'+body+'</div>'
    + '<div class="q-actions" style="justify-content:center;margin-top:6px"><button class="btn ghost" id="hubClose">Cerrar</button></div>';
}
function openStreakHub(tab){
  tab = tab || 'daily';
  const o = openModal(streakHubHTML(tab));
  o.querySelectorAll('.hub-tabs [data-tab]').forEach(b => b.addEventListener('click', ()=>{ sfx('click'); openStreakHub(b.dataset.tab); }));
  o.querySelectorAll('[data-claim]').forEach(b => b.addEventListener('click', ()=>{ const [sc,id]=b.dataset.claim.split(':'); claimMission(sc,id); }));
  const cl = o.querySelector('#hubClose'); if(cl) cl.addEventListener('click', ()=>{ sfx('click'); closeModal(); });
}
/* — Mejores resultados de la materia activa — */
function statsBestPanelHTML(subj){
  const best = [...S.history].sort((a,b)=>b.score-a.score).slice(0,5);
  return '<div class="panel"><h3>🥇 Mejores resultados · '+esc(subj.short)+'</h3>'
    + (best.length ? '<table class="hist-table"><tr><th>Módulo</th><th>Calif.</th><th>XP</th></tr>'
        + best.map(h => '<tr><td>'+MODULES[h.mod].icon+' '+esc(MODULES[h.mod].name)+'</td><td class="num"><b>'+h.score+'%</b></td><td class="num">+'+h.xp+'</td></tr>').join('')
        + '</table>'
      : '<p style="color:var(--muted);font-size:.85rem">Completa una actividad para ver tus marcas.</p>')
    + '</div>';
}
/* — Historial reciente de actividades — */
function statsRecentActivityPanelHTML(subj){
  return '<div class="panel"><h3>🕓 Últimas actividades · '+esc(subj.short)+'</h3>'
    + (S.history.length ? '<table class="hist-table"><tr><th>Fecha</th><th>Módulo</th><th>Calif.</th><th>Tiempo</th></tr>'
        + S.history.slice(0,8).map(h => '<tr><td>'+fmtDate(h.t)+'</td><td>'+MODULES[h.mod].icon+' '+esc(MODULES[h.mod].name).slice(0,26)+'</td>'
          + '<td class="num">'+h.score+'%</td><td class="num">'+fmtDur(h.sec)+'</td></tr>').join('')
        + '</table>'
      : '<p style="color:var(--muted);font-size:.85rem">Tu historial aparecerá aquí.</p>')
    + '</div>';
}
/* — Historial de exámenes diarios — */
function statsDailyExamsPanelHTML(exams, exAvg, subj){
  return '<div class="panel"><h3>📝 Exámenes diarios · '+esc(subj.short)+'</h3>'
    + (exams.length ? '<table class="hist-table"><tr><th>Fecha</th><th>Calificación</th><th>Tiempo</th></tr>'
        + exams.slice(0,10).map(e => '<tr><td>'+fmtDate(e.t)+'</td><td class="num"><b>'+e.score+'%</b></td><td class="num">'+fmtDur(e.sec)+'</td></tr>').join('')
        + '</table><p class="q-help">Promedio: <b>'+exAvg+'%</b> · Un examen por día.</p>'
      : '<p style="color:var(--muted);font-size:.85rem">Aún no presentas ningún examen diario. ¡Inténtalo desde la pantalla de inicio!</p>')
    + '</div>';
}
function renderStats(){
  const o = overallStats();
  const exams = S.examHistory || [];
  const exAvg = exams.length ? Math.round(exams.reduce((a,b)=>a+b.score,0)/exams.length) : 0;
  const ranked = lbRanked(lbLoad());
  const myPos = ranked.findIndex(s=>s.pid===PROFILES.active)+1;
  const subj = subjectById(S.activeSubject);
  $('#statsBody').innerHTML = statsTilesHTML(o, exams, exAvg)
    + '<div class="dash-grid">'
    + statsGlobalPanelHTML(myPos, ranked.length)
    + statsPlayerCardHTML(o, myPos)
    + statsLastExamPanelHTML(exams, subj)
    + statsRecentRewardsHTML()
    + statsModulesPanelHTML(subj)
    + statsTopicsPanelHTML(subj)
    + statsConceptsPanelHTML(subj)
    + statsAchievementsTeaserHTML()
    + statsBestPanelHTML(subj)
    + statsRecentActivityPanelHTML(subj)
    + statsDailyExamsPanelHTML(exams, exAvg, subj)
    + '</div>';
  $$('#statsBody [data-goto-mod]').forEach(b => b.addEventListener('click', () => { sfx('click'); openModule(+b.dataset.gotoMod); }));
  const gl = $('#statsGoLogros'); if(gl) gl.addEventListener('click', ()=>{ sfx('click'); openStreakHub('logros'); });
}

/* ==================== Guía de estudio (pantalla + PDF) ==================== */
function guideHTML(){
  const exFreq = qFreq(), exSev = qSev(), exPrima = qPrimaRiesgo(), exCoas = qCoasIns(), exCop = qCopagoIns(), exDep = qDepLineal();
  const worked = [exFreq, exSev, exPrima, exCop, exCoas, exDep];
  const strip = h => String(h).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const prog = S.guideProgressive !== false;
  // Cada sección se desbloquea cuando el módulo `req` está desbloqueado (el
  // "tema siguiente que aún no ves" siempre está disponible para estudiarlo).
  const secs = [
  {req:0, html:'<div class="lesson-card"><h3>📖 Guía de estudio · Cálculo Actuarial (Unidad 1)</h3><p>Resumen de conceptos, fórmulas, procedimientos y ejercicios resueltos. Usa el botón <b>Imprimir / Guardar PDF</b> para llevarla contigo.</p>'
    + (prog ? '<p style="font-size:.82rem;color:var(--muted)">🔓 La guía se desbloquea tema por tema conforme avanzas en los módulos. Si prefieres verla completa, desactiva “Guía de estudio progresiva” en tu perfil ⚙️.</p>' : '') + '</div>'},
  {req:0, html:'<div class="lesson-card"><h3>1 · Glosario de conceptos</h3><table><tr><th>Concepto</th><th>Definición</th></tr>'
    + GLOSSARY.map(g => '<tr><td><b>'+g.t+'</b></td><td>'+g.d+'</td></tr>').join('') + '</table></div>'},
  {req:1, html:'<div class="lesson-card"><h3>2 · Fórmulas clave</h3>'
    + '<div class="formula">Frecuencia = Número de siniestros ÷ Exposición</div>'
    + '<div class="formula">Severidad = Monto total de pérdidas ÷ Número de siniestros</div>'
    + '<div class="formula">Prima de riesgo (prima pura) = Frecuencia × Severidad</div>'
    + '<div class="formula">Costo esperado total = Exposición × Frecuencia × Severidad</div>'
    + '<div class="formula">Siniestralidad = Siniestros pagados ÷ Primas cobradas</div>'
    + '<div class="formula">Prima de tarifa = Prima pura + Gastos + Utilidad</div>'
    + '<div class="formula">Depreciación anual (línea recta) = (Costo − Valor residual) ÷ Vida útil</div></div>'},
  {req:3, html:'<div class="lesson-card"><h3>3 · Procedimiento: deducible + coaseguro</h3><ol>'
    + '<li>Si el siniestro ≤ deducible → la aseguradora paga $0.</li>'
    + '<li>Base = Monto del siniestro − Deducible.</li>'
    + '<li>Coaseguro del asegurado = % coaseguro × Base.</li>'
    + '<li>Aseguradora paga = Base − Coaseguro (sin exceder el límite de cobertura).</li>'
    + '<li>Asegurado paga = Deducible + Coaseguro + cualquier excedente del límite.</li></ol></div>'},
  {req:5, html:'<div class="lesson-card"><h3>4 · Inflación, devaluación y depreciación</h3><table>'
    + '<tr><th>Fenómeno</th><th>¿Qué pierde valor?</th><th>Efecto en seguros</th></tr>'
    + '<tr><td><b>Inflación</b></td><td>El dinero frente a los bienes (suben los precios)</td><td>Sumas aseguradas insuficientes; primas e indemnizaciones suben; se usan pólizas indexadas (UDIS)</td></tr>'
    + '<tr><td><b>Devaluación</b></td><td>La moneda frente a otras divisas</td><td>Refacciones y servicios importados más caros → mayor severidad</td></tr>'
    + '<tr><td><b>Depreciación</b></td><td>Un activo (auto, maquinaria) por uso/tiempo</td><td>La indemnización de autos se basa en el valor comercial depreciado</td></tr></table></div>'},
  {req:7, html:'<div class="lesson-card"><h3>5 · Ejercicios resueltos (se regeneran al recargar)</h3>'
    + worked.map((q,i) => '<p><b>Ejercicio '+(i+1)+'.</b> '+strip(q.prompt)+'<br><i>Datos: '+strip(q.dataHtml||'')+'</i></p><ol>'
      + q.steps.map(s => '<li>'+strip(s)+'</li>').join('') + '</ol>').join('') + '</div>'},
  {req:7, html:'<div class="lesson-card"><h3>6 · Banco de repaso: ¿verdadero o falso?</h3><table><tr><th>Afirmación</th><th>Respuesta</th></tr>'
    + TF_M1.concat(TF_INF, TF_DEV, TF_DEP).map(t => '<tr><td>'+t.s+'</td><td><b>'+(t.a?'V':'F')+'</b> — '+t.e+'</td></tr>').join('')
    + '</table></div>'},
  {req:6, html:'<div class="lesson-card"><h3>7 · Identifica el fenómeno</h3><table><tr><th>Situación</th><th>Fenómeno</th></tr>'
    + PHENO.map(p => '<tr><td>'+p.s+'</td><td><b>'+p.a+'</b></td></tr>').join('') + '</table></div>'},
  {req:0, html:'<div class="lesson-card"><h3>8 · Tips actuariales</h3><ul>' + TIPS.map(t => '<li>'+t+'</li>').join('') + '</ul></div>'}
  ];
  return secs.map(s => {
    if(!prog || isUnlocked(s.req)) return s.html;
    const m = MODULES[s.req];
    return '<div class="lesson-card guide-locked">🔒 <b>Sección bloqueada</b><br>'
      + '<span>Se desbloquea al llegar al Módulo '+(s.req+1)+' · '+m.icon+' '+esc(m.name)
      + '. Aprueba los módulos anteriores con ≥ 80% para estudiarla.</span></div>';
  }).join('');
}
/* ===== Guía de estudio POR MATERIA (data-driven) =====
   Cálculo III conserva su guía escrita a mano (guideHTML). Las demás materias
   arman su guía con sus módulos reales (agrupados por parcial) más un bloque
   curado de fórmulas clave; así cada materia tiene SU propia guía, no la de CA3. */
const SUBJECT_PARCIALES = {
  ca3:   { proposed:true, note:'El contenido actual de la app corresponde al 2.º parcial; el 1.er parcial aún no está cargado.',
           groups:[ {name:'Segundo parcial (contenido actual)', mods:[0,1,2,3,4,5,6,7,9,11]}, {name:'Práctica y juegos', mods:[8,10]} ] },
  stoch: { proposed:false, groups:[ {name:'Primer parcial', mods:[0,1,2,3,4,5,6]}, {name:'Segundo parcial', mods:[7,8,9,10,11]} ] },
  'modelos-regresion':          { proposed:true, groups:[ {name:'Primer parcial', mods:[0,1,2,3,4]}, {name:'Segundo parcial', mods:[5,6,7,8]} ] },
  'estadistica-no-parametrica': { proposed:true, note:'El examen enviado es del 2.º parcial (cuantiles, signos, McNemar, Cox-Stuart).',
           groups:[ {name:'Primer parcial', mods:[0,1,2,3,4]}, {name:'Segundo parcial', mods:[5,6,7,8]} ] },
  'administracion-financiera':  { proposed:true, groups:[ {name:'Primer parcial', mods:[0,1,2,3]}, {name:'Segundo parcial', mods:[4,5,6,7]} ] }
};
/* Fórmulas clave por materia (notación HTML sub/sup, sin KaTeX). Tomadas del
   contenido ya verificado de cada materia (mismos casos de control). */
const GUIDE_FORMULAS = {
  stoch: [
    ['Proceso estocástico','{X<sub>t</sub> : t∈T}: familia de variables aleatorias indexadas por el tiempo (Ω×T→S).'],
    ['Caminata aleatoria','X<sub>n</sub>=Σε<sub>k</sub> con ε=±1. E[X<sub>n</sub>]=n(2p−1), Var(X<sub>n</sub>)=4np(1−p).'],
    ['Regreso al origen','Solo en pasos pares; p<sub>2n</sub>=C(2n,n)p<sup>n</sup>q<sup>n</sup>. Primer regreso f<sub>n</sub> ≠ estar en 0 (p<sub>n</sub>).'],
    ['Cadena de Markov','P(X<sub>n+1</sub>=j | X<sub>n</sub>=i)=p<sub>ij</sub>. Filas de P suman 1; v<sub>n</sub>=v<sub>0</sub>P<sup>n</sup>; límite π con πP=π.'],
    ['Proceso de Poisson','N(t)~Poisson(λt): P(N=k)=e<sup>−λt</sup>(λt)<sup>k</sup>/k!. E[N]=Var(N)=λt.'],
    ['Exponencial','P(X&gt;t)=e<sup>−λt</sup>. E[X]=1/λ, Var(X)=1/λ². Tiempo entre eventos de Poisson.'],
    ['Pérdida de memoria','P(X&gt;t+s | X&gt;s)=P(X&gt;t): lo ya esperado no cuenta.'],
    ['Erlang / Gamma','S<sub>n</sub>=T<sub>1</sub>+…+T<sub>n</sub> (n-ésimo evento). E[S<sub>n</sub>]=n/λ, Var=n/λ².'],
    ['Propiedades de Poisson','Adelgazamiento λp; superposición λ<sub>1</sub>+λ<sub>2</sub>; condicional N(s)|N(t)=n ~ Bin(n, s/t); compuesto E[S]=E[N]·E[X].']
  ],
  'modelos-regresion': [
    ['Modelo lineal simple','Y<sub>i</sub>=β<sub>0</sub>+β<sub>1</sub>X<sub>i</sub>+ε<sub>i</sub>, con ε<sub>i</sub>~N(0,σ²) independientes.'],
    ['Sumas de cuadrados','S<sub>xx</sub>=Σx<sub>i</sub>²−(Σx<sub>i</sub>)²/n ; S<sub>xy</sub>=Σx<sub>i</sub>y<sub>i</sub>−(Σx<sub>i</sub>)(Σy<sub>i</sub>)/n.'],
    ['Estimadores MCO','β̂<sub>1</sub>=S<sub>xy</sub>/S<sub>xx</sub> ; β̂<sub>0</sub>=ȳ−β̂<sub>1</sub>x̄.'],
    ['Ajuste y residuos','Ŷ=β̂<sub>0</sub>+β̂<sub>1</sub>x ; e<sub>i</sub>=y<sub>i</sub>−ŷ<sub>i</sub> ; Σe<sub>i</sub>=0.'],
    ['Varianza del error','σ̂²=SCE/(n−2), con SCE=S<sub>yy</sub>−β̂<sub>1</sub>S<sub>xy</sub>.'],
    ['ANOVA y R²','SCT=SCR+SCE ; R²=SCR/SCT=1−SCE/SCT.'],
    ['Inferencia sobre β<sub>1</sub>','ee(β̂<sub>1</sub>)=√(σ̂²/S<sub>xx</sub>) ; t=β̂<sub>1</sub>/ee ; IC β̂<sub>1</sub>±t<sub>α/2,n−2</sub>·ee.'],
    ['Predicción','IC de la respuesta media E(Y|x<sub>0</sub>) &lt; intervalo de predicción individual (este suma +1 dentro de la raíz).']
  ],
  'estadistica-no-parametrica': [
    ['Función empírica','F<sub>n</sub>(x)=(1/n)Σ I(X<sub>i</sub>≤x). Glivenko-Cantelli: sup|F<sub>n</sub>−F|→0.'],
    ['Kolmogórov-Smirnov','D=máx|F<sub>n</sub>(x)−F<sub>0</sub>(x)|. Si estimas parámetros de los datos → Lilliefors.'],
    ['Bondad de ajuste χ²','χ²=Σ(O<sub>i</sub>−E<sub>i</sub>)²/E<sub>i</sub> ; gl=k−1−(#parámetros estimados).'],
    ['Proporción / binomial','z=(p̂−p<sub>0</sub>)/√(p<sub>0</sub>(1−p<sub>0</sub>)/n) ; exacta con X~Bin(n,p<sub>0</sub>).'],
    ['Prueba de los signos','X~Bin(n,0.5); los empates con la mediana se descartan (n efectivo).'],
    ['McNemar (pareada 2×2)','Solo discordantes B y C: χ²=(|B−C|−1)²/(B+C) ; exacta con Bin(B+C,0.5).'],
    ['Cox-Stuart (tendencia)','Parear x<sub>i</sub> con x<sub>i+c</sub>, tomar signos; T~Bin(#no empates,0.5).'],
    ['Spearman','ρ<sub>s</sub>=1−6Σd<sub>i</sub>²/[n(n²−1)].'],
    ['Mann-Whitney','U=n<sub>1</sub>n<sub>2</sub>+n<sub>1</sub>(n<sub>1</sub>+1)/2−R<sub>1</sub>.']
  ],
  'administracion-financiera': [
    ['Rentabilidad','ROA=UN/Activos ; ROE=UN/Capital. Apalancamiento: ROE=ROA+(D/C)(ROA−i(1−t)).'],
    ['Estructura óptima','Con i(x)=a+bx²: (D/C)*=√[(r−a)/(3b)].'],
    ['Sartoris-Hill','VP de la política = flujos descontados al costo de capital diario, menos incobrables y descuentos.'],
    ['Gallinger / insolvencia','λ=(L<sub>0</sub>+μT)/(σ√T) ; P(insolvencia)=1−Φ(λ).'],
    ['Lote económico (EOQ)','Q*=√(2D·C<sub>o</sub>/C<sub>m</sub>), C<sub>m</sub>=rP ; costo=D·C<sub>o</sub>/Q+C<sub>m</sub>·Q/2+DP ; reorden=d·L.'],
    ['CAPM / WACC','k<sub>e</sub>=r<sub>f</sub>+β(r<sub>m</sub>−r<sub>f</sub>) ; WACC=(E/V)k<sub>e</sub>+(D/V)k<sub>d</sub>(1−t).'],
    ['DuPont y crecimiento','ROE=margen×rotación×apalancamiento ; g=b·ROE (b = tasa de retención).'],
    ['Valuación (Gordon)','V=D<sub>1</sub>/(k−g) ; dos etapas: flujos explícitos + valor terminal descontado.']
  ]
};
function guideGeneric(sid){
  const mods = MODULES_BY_SUBJECT[sid] || [];
  const subj = subjectById(sid);
  const par = SUBJECT_PARCIALES[sid];
  const formulas = GUIDE_FORMULAS[sid] || [];
  const prog = S.guideProgressive !== false;
  const modCard = m => {
    if(prog && !isUnlocked(m.id))
      return '<div class="lesson-card guide-locked">🔒 <b>'+m.icon+' '+esc(m.name)+'</b><br>'
        + '<span>Se desbloquea al llegar a este módulo. Aprueba los anteriores con ≥ 80% para estudiarlo.</span></div>';
    return '<div class="lesson-card"><h3>'+m.icon+' Módulo '+(m.id+1)+' · '+esc(m.name)+'</h3>'
      + '<p>'+esc(m.desc)+'</p>'
      + '<p style="font-size:.82rem;color:var(--muted)">Práctica: '+esc(m.kind)+'</p></div>';
  };
  let html = '<div class="lesson-card"><h3>📖 Guía de estudio · '+esc(subj.name)+'</h3>'
    + '<p>Resumen de los módulos del curso, agrupados por parcial, con las fórmulas clave. Usa <b>Imprimir / Guardar PDF</b> para llevarla contigo.</p>'
    + (prog ? '<p style="font-size:.82rem;color:var(--muted)">🔓 La guía se desbloquea conforme avanzas. Desactiva “Guía de estudio progresiva” en tu perfil ⚙️ para verla completa.</p>' : '')
    + '</div>';
  if(formulas.length){
    html += '<div class="lesson-card"><h3>🧮 Fórmulas clave</h3><table><tr><th>Tema</th><th>Fórmula / idea</th></tr>'
      + formulas.map(f => '<tr><td><b>'+f[0]+'</b></td><td>'+f[1]+'</td></tr>').join('') + '</table></div>';
  }
  if(par){
    if(par.proposed) html += '<div class="lesson-card" style="border-left:4px solid var(--accent)"><p style="margin:0;font-size:.86rem">🗂️ <b>División por parciales sugerida.</b> Ajústala con tu profesor si cambia.'+(par.note?'<br>📌 '+esc(par.note):'')+'</p></div>';
    par.groups.forEach(g => {
      html += '<div class="section-h" style="margin:16px 0 8px"><h2 style="font-size:1.05rem">📚 '+esc(g.name)+'</h2><span class="line"></span></div>';
      g.mods.forEach(id => { const m = mods.find(x=>x.id===id); if(m) html += modCard(m); });
    });
  } else {
    mods.forEach(m => html += modCard(m));
  }
  return html;
}
function renderGuide(){
  const sid = S.activeSubject;
  $('#guideBody').innerHTML = (sid === 'ca3') ? guideHTML() : guideGeneric(sid);
}
$('#btnPrint').addEventListener('click', () => {
  sfx('click');
  $('#printGuide').innerHTML = '<h1>📖 AprendeUteca · Guía de estudio · '+esc(subjectById(S.activeSubject).name)+'</h1>'
    + $('#guideBody').innerHTML
        .replaceAll('class="lesson-card"','')
        .replaceAll('<h3>','<h2>').replaceAll('</h3>','</h2>')
        .replaceAll('class="formula"','class="pf"');
  window.print();
});

/* ==================== Examen diario ==================== */
/* Los exámenes son POR MATERIA: cada materia registra su generador aquí.
   Los temas no se mezclan entre materias. */
const EXAM_BUILDERS_BY_SUBJECT = { ca3: buildExam, stoch: buildExamStoch, 'modelos-regresion': buildExamReg, 'estadistica-no-parametrica': buildExamNP, 'administracion-financiera': buildExamAF };
function buildExam(){
  const usedTF = new Set(), usedF = new Set(), usedP = new Set();
  return shuffle([
    qConceptMC(), qConceptMCrev(), qTF_M1(usedTF), qFill_M1(usedF),
    qFreq(), qSev(), qPrimaRiesgo(),
    qCopagoIns(), qCoasIns(), qDedFull(pick(['cliente','aseg'])),
    qPheno(usedP),
    pick([qInfPrima, qDepAuto, qDevImport])()
  ]);
}
function startExam(){
  const builder = EXAM_BUILDERS_BY_SUBJECT[S.activeSubject];
  if(!builder){ toast('📝 El examen de '+subjectById(S.activeSubject).name+' estará disponible cuando la materia tenga contenido.'); return; }
  if(S.examDay === todayKey()){
    const last = S.examHistory.length ? S.examHistory[0].score+'%' : '—';
    toast('📝 Ya presentaste el examen de hoy ('+last+'). Hay 1 por día: se reinicia a medianoche (hora CDMX) 😉');
    return;
  }
  touchStreak();
  SES = { id:'exam', exam:true, qs:builder(), i:0, pts:0, xp:0, t0:Date.now(), recap:[] };
  showView('session'); renderQ();
  toast('📝 Examen diario · '+subjectById(S.activeSubject).name+': '+SES.qs.length+' preguntas. Las respuestas se revelan al final. ¡Suerte!');
}
function finishExam(){
  const n = SES.qs.length;
  const score = Math.round(100*SES.pts/n);
  const sec = (Date.now()-SES.t0)/1000;
  const recap = SES.recap;
  SES = null;
  S.examDay = todayKey();
  const failedTopics = [...new Set(recap.filter(r=>!r.ok).map(r=>r.topic).filter(Boolean))];
  const xp = Math.round(score/2) + (score>=80 ? 25 : 0);
  S.examHistory.unshift({t:Date.now(), score, sec:Math.round(sec), n, xp, failedTopics});
  if(S.examHistory.length > 60) S.examHistory.length = 60;
  S.totalTime += sec;
  const rwBefore = (S.unlockedRewards||[]).length;
  addXP(xp);
  save(); checkBadges(); checkRewards(); renderHeader();
  const newRewards = (S.unlockedRewards||[]).slice(rwBefore).map(id => REWARDS.find(r=>r.id===id)).filter(Boolean);
  renderExamResult(score, xp, sec, recap, newRewards);
  if(score>=80){ sfx('win'); confetti(90); } else sfx('bad');
}
/* Tema → módulo donde se estudia (para el botón "Repasar este tema") */
const TOPIC_MODULE = {
  riesgo:0, exposicion:0, siniestro:0, poliza:0, prima:0, sumaasegurada:0, indemnizacion:0,
  cobertura:0, exclusiones:0, personas:0,
  copago:2, coaseguro:3, deducible:4,
  frecuencia:1, severidad:1, primariesgo:1, costoesperado:1, siniestralidad:1,
  inflacion:5, devaluacion:6, depreciacion:7, formulas:9, casos:11, escape:10
};
/* — Revisión de respuestas enriquecida (examen, módulos y repaso mixto) — */
function reviewItemHTML(r, i){
  const mod = TOPIC_MODULE[r.topic];
  return '<div class="rv-item '+(r.ok?'ok':'bad')+'" data-ok="'+(r.ok?1:0)+'" data-topic="'+esc(r.topic||'')+'" data-diff="'+(r.diff||'')+'">'
    + '<div class="rv-head"><span class="rv-tag '+(r.ok?'ok':'bad')+'">'+(r.ok?'✔ Correcta':'✘ Incorrecta')+'</span>'
    + '<span class="rv-meta">Pregunta '+(i+1)+' · '+(TOPIC_NAMES[r.topic]||'Concepto')+' · '+(r.diff||'')+'</span></div>'
    + '<div class="rv-q">'+esc(r.prompt)+'</div>'
    + (r.chosen ? '<div class="rv-line">🖊️ <b>Tu respuesta:</b> '+esc(r.chosen)+'</div>' : '')
    + (r.correct ? '<div class="rv-line">✔️ <b>Respuesta correcta:</b> '+r.correct+'</div>' : '')
    + (r.explain ? '<div class="rv-line">📌 '+r.explain+'</div>' : '')
    + (r.steps ? '<details class="rv-steps"'+(r.ok?'':' open')+'><summary>🧮 Fórmula y procedimiento paso a paso</summary><ol class="steps">'+r.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol></details>' : '')
    + (!r.ok && mod!=null ? '<div style="margin-top:8px"><button class="btn ghost small" data-goto-mod="'+mod+'">📚 Repasar este tema → '+MODULES[mod].icon+' '+esc(MODULES[mod].name)+'</button></div>' : '')
    + '</div>';
}
function reviewSectionHTML(recap, title){
  const topics = [...new Set(recap.map(r=>r.topic).filter(Boolean))];
  return '<div class="recap" id="rvWrap"><div class="section-h"><h2 style="font-size:1rem">'+(title||'📋 Revisión de respuestas')+'</h2><span class="line"></span></div>'
    + '<div class="lb-controls">'
    + '<select class="ainput" id="rvState"><option value="">Ver todas</option><option value="bad">Solo incorrectas</option><option value="ok">Solo correctas</option></select>'
    + '<select class="ainput" id="rvTopic"><option value="">Todos los temas</option>'+topics.map(t=>'<option value="'+esc(t)+'">'+(TOPIC_NAMES[t]||t)+'</option>').join('')+'</select>'
    + '<select class="ainput" id="rvDiff"><option value="">Toda dificultad</option><option>Fácil</option><option>Media</option><option>Difícil</option></select>'
    + '</div>'
    + recap.map(reviewItemHTML).join('')
    + '<p class="q-help hidden" id="rvEmpty">No hay preguntas que coincidan con el filtro.</p></div>';
}
function bindReview(){
  const applyF = () => {
    const st = $('#rvState').value, tp = $('#rvTopic').value, df = $('#rvDiff').value;
    let shown = 0;
    $$('#rvWrap .rv-item').forEach(el => {
      const show = (!st || (st==='ok') === (el.dataset.ok==='1')) && (!tp || el.dataset.topic===tp) && (!df || el.dataset.diff===df);
      el.classList.toggle('hidden', !show); if(show) shown++;
    });
    $('#rvEmpty').classList.toggle('hidden', shown>0);
  };
  ['rvState','rvTopic','rvDiff'].forEach(id => { const el = $('#'+id); if(el) el.addEventListener('change', () => { sfx('click'); applyF(); }); });
  $$('#rvWrap [data-goto-mod]').forEach(b => b.addEventListener('click', () => { sfx('click'); openModule(+b.dataset.gotoMod); }));
}
function renderExamResult(score, xp, sec, recap, newRewards){
  const R = 56, C = 2*Math.PI*R;
  const passed = score >= 80;
  const okCount = recap.filter(r=>r.ok).length;
  const failedTopics = [...new Set(recap.filter(r=>!r.ok).map(r=>r.topic).filter(Boolean))];
  const title = score>=90 ? '¡Sobresaliente! 🏅' : passed ? '¡Muy buen examen!' : score>=60 ? 'Buen intento' : 'A repasar y volver mañana';
  let html = '<div class="result-card">'
    + '<div style="display:flex;justify-content:center;margin-bottom:6px">'+avatarStack(activeProfile(), 60)+'</div>'
    + '<div class="big-ico" style="font-size:34px">'+(score>=90?'🏅':passed?'🎉':'📚')+'</div>'
    + '<h2>'+title+'</h2>'
    + '<div class="r-sub">📝 Examen diario · '+esc(subjectById(S.activeSubject).name)+' · '+new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long'})+' · '+esc(activeProfile().name)+'</div>'
    + '<div class="r-score-ring"><svg width="130" height="130">'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="var(--surface3)" stroke-width="12"/>'
    + '<circle cx="65" cy="65" r="'+R+'" fill="none" stroke="'+(passed?'var(--good)':'var(--bad)')+'" stroke-width="12" stroke-linecap="round" '
    + 'stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-score/100))+'" style="transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)"/>'
    + '</svg><span class="val">'+score+'%</span></div>'
    + '<p style="font-weight:700">Tu calificación de hoy: '+score+'/100</p>'
    + '<div class="r-meta"><span><b>'+okCount+'/'+recap.length+'</b>aciertos</span><span><b>'+(recap.length-okCount)+'</b>errores</span>'
    + '<span><b>+'+xp+'</b>XP</span><span><b>'+fmtDur(sec)+'</b>tiempo</span></div>'
    + (newRewards && newRewards.length ? '<p style="font-weight:700;color:var(--good-text)">🎁 Recompensas desbloqueadas: '+newRewards.map(r=>r.ico+' '+esc(r.name)).join(' · ')+'</p>' : '')
    + (failedTopics.length ? '<p style="font-size:.86rem;color:var(--ink2)">📚 Temas relacionados por repasar: <b>'+failedTopics.map(t=>TOPIC_NAMES[t]||t).join(', ')+'</b></p>' : '')
    + '<p style="font-size:.85rem;color:var(--ink2)">Solo se permite un examen por día: el próximo estará disponible mañana. Abajo puedes revisar cada pregunta.</p>'
    + '<div class="q-actions" style="justify-content:center">'
    + '<button class="btn ghost" id="rHome">🏠 Inicio</button>'
    + '<button class="btn" id="rStats">📊 Mis estadísticas</button>'
    + '</div></div>';
  html += reviewSectionHTML(recap, '📋 Revisión del examen');
  $('#view-result').innerHTML = html;
  showView('result');
  bindReview();
  $('#rHome').onclick = ()=>{ sfx('click'); goHome(); };
  $('#rStats').onclick = ()=>{ sfx('click'); renderStats(); showView('stats'); };
}
$('#btnExam').addEventListener('click', ()=>{ sfx('click'); startExam(); });

/* ==================== Niveles, títulos y recompensas ==================== */
const AVATARS = ['🎓','🧑‍🎓','👩‍🎓','🦉','🦊','🐼','🚀','🌟','🛡️','📐','🧮','🐯'];
const LEVEL_REWARDS = [
  {lvl:1,  title:'Aprendiz de actuario', avatars:['🎓','🧑‍🎓','👩‍🎓','🦉']},
  {lvl:2,  avatars:['🦊']},
  {lvl:3,  title:'Estudiante de riesgo', avatars:['🐼'], custom:'Lentes para tu avatar'},
  {lvl:4,  avatars:['🚀']},
  {lvl:5,  title:'Analista Jr.', avatars:['🌟'], custom:'Gorra para tu avatar'},
  {lvl:6,  avatars:['🛡️']},
  {lvl:7,  title:'Analista de siniestros', avatars:['📐'], custom:'Moño para tu avatar'},
  {lvl:8,  avatars:['🧮']},
  {lvl:10, title:'Suscriptor', avatars:['🐯'], custom:'Birrete para tu avatar'},
  {lvl:12, title:'Tarificador'},
  {lvl:15, title:'Actuario en formación'},
  {lvl:20, title:'Actuario Senior'}
];
function currentTitle(){
  if(S.equip && S.equip.title){
    const chosen = REWARDS.find(r => r.id===S.equip.title && r.type==='title');
    if(chosen) return chosen.name;
  }
  let t = 'Aprendiz de actuario';
  const lvl = levelInfo().lvl;
  LEVEL_REWARDS.forEach(r => { if(r.title && lvl >= r.lvl) t = r.title; });
  return t;
}
/* Emoji del título activo del perfil (los títulos de la tienda traen su propio
   icono; los rangos de nivel usan el 🏷️ genérico). */
function titleIco(){
  if(S.equip && S.equip.title){
    const chosen = REWARDS.find(r => r.id===S.equip.title && r.type==='title');
    if(chosen) return chosen.ico || '🏷️';
  }
  return '🏷️';
}
/* Emoji de un título por su nombre (para filas de otros en el leaderboard). */
function titleIcoByName(name){
  const r = REWARDS.find(x => x.type==='title' && x.name===name);
  return (r && r.ico) || '🏷️';
}

/* ==================== Tienda de recompensas ==================== */
const REWARD_TYPE_LABEL = {frame:'🖼️ Marcos', bg:'🌆 Fondos', acc:'🎭 Accesorios', title:'🏷️ Títulos', effect:'✨ Efectos del marco', hitfx:'🎉 Efectos al acertar', theme:'🎨 Temas'};
/* Rareza de las recompensas: cambia el color del borde y la etiqueta. */
const RARITY = {
  common:    {name:'Común',      color:'#9aa0a8'},
  rare:      {name:'Rara',       color:'#2a86e0'},
  epic:      {name:'Épica',      color:'#a24dff'},
  legendary: {name:'Legendaria', color:'#f0a500'}
};
const rarityOf = r => RARITY[r && r.rarity] || RARITY.common;
const REWARD_TYPES = ['frame','bg','acc','title','effect','hitfx','theme'];
/* ---- Fondos aplicables al avatar ---- */
/* Cada fondo dibuja una escena minimalista (SVG, viewBox 0 0 100 100) sobre el
   gradiente, para que se vea la temática y no solo un color plano. */
const BACKGROUNDS = [
  {id:'bg-aula', type:'bg', rarity:'common', name:'Aula universitaria', ico:'🏫', xp:250, grad:'linear-gradient(135deg,#6d7cff,#3a4bd0)', desc:'Un salón de clases de fondo.',
    scene:'<rect x="15" y="12" width="70" height="30" rx="2" fill="#1f4a37"/><rect x="15" y="12" width="70" height="30" rx="2" fill="none" stroke="#caa26a" stroke-width="2.5"/><path d="M23 22h28M23 28h18M23 34h23" stroke="#eafff2" stroke-width="1.8" opacity=".7" fill="none"/><g fill="#fff" opacity=".14"><rect x="16" y="80" width="20" height="14" rx="1.5"/><rect x="64" y="80" width="20" height="14" rx="1.5"/></g>'},
  {id:'bg-oficina', type:'bg', rarity:'common', name:'Oficina actuarial', ico:'🏢', xp:600, grad:'linear-gradient(135deg,#3a8fd6,#1c5cab)', desc:'Tu futura oficina.',
    scene:'<g fill="#fff" opacity=".16"><rect x="6" y="42" width="16" height="54"/><rect x="26" y="26" width="18" height="70"/><rect x="48" y="48" width="15" height="48"/><rect x="67" y="34" width="18" height="62"/></g><g fill="#ffe9a8" opacity=".55"><rect x="10" y="48" width="3" height="4"/><rect x="16" y="48" width="3" height="4"/><rect x="31" y="32" width="3" height="4"/><rect x="37" y="32" width="3" height="4"/><rect x="71" y="40" width="3" height="4"/><rect x="77" y="40" width="3" height="4"/></g>'},
  {id:'bg-noche', type:'bg', rarity:'rare', name:'Escritorio nocturno', ico:'🌃', xp:900, grad:'linear-gradient(135deg,#20264a,#3b2b63)', desc:'Estudiando de madrugada.',
    scene:'<circle cx="76" cy="22" r="12" fill="#f2e9c0" opacity=".9"/><circle cx="81" cy="19" r="10" fill="#2a2557"/><g fill="#fff" opacity=".85"><circle cx="20" cy="20" r="1.5"/><circle cx="34" cy="13" r="1.1"/><circle cx="14" cy="36" r="1.2"/><circle cx="46" cy="26" r="1.3"/><circle cx="60" cy="16" r="1"/></g>'},
  {id:'bg-cafe', type:'bg', rarity:'rare', name:'Cafetería de estudiantes', ico:'☕', xp:1300, grad:'linear-gradient(135deg,#b07a48,#7a4e28)', desc:'Con café y apuntes.',
    scene:'<path d="M34 52h24v13a9 9 0 0 1-9 9h-6a9 9 0 0 1-9-9z" fill="#efe3d2" opacity=".92"/><path d="M58 56h4a5 5 0 0 1 0 10h-4" fill="none" stroke="#efe3d2" stroke-width="3" opacity=".92"/><path d="M40 44q4-5 0-10M48 44q4-5 0-10" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>'},
  {id:'bg-aseguradora', type:'bg', rarity:'rare', name:'Aseguradora', ico:'🏬', xp:1800, grad:'linear-gradient(135deg,#1baf7a,#0c6b46)', desc:'La central de la aseguradora.',
    scene:'<path d="M50 14 L74 22 V44 Q74 64 50 76 Q26 64 26 44 V22 Z" fill="#fff" opacity=".16"/><path d="M50 14 L74 22 V44 Q74 64 50 76 Q26 64 26 44 V22 Z" fill="none" stroke="#eafff5" stroke-width="2" opacity=".55"/><path d="M40 44l7 7 14-16" stroke="#eafff5" stroke-width="3.2" fill="none" opacity=".75"/>'},
  {id:'bg-bolsa', type:'bg', rarity:'epic', name:'Bolsa de valores', ico:'📈', xp:2600, grad:'linear-gradient(135deg,#eda100,#c98500)', desc:'El piso de remates.',
    scene:'<g fill="#fff" opacity=".16"><rect x="14" y="70" width="7" height="18"/><rect x="32" y="56" width="7" height="32"/><rect x="48" y="64" width="7" height="24"/><rect x="66" y="38" width="7" height="50"/></g><polyline points="17,68 35,54 51,62 69,36 86,22" fill="none" stroke="#fff7e0" stroke-width="3" opacity=".85"/><path d="M86 22l-9 0M86 22l0 9" stroke="#fff7e0" stroke-width="3" fill="none" opacity=".85"/>'},
  {id:'bg-pizarron', type:'bg', rarity:'epic', name:'Pizarrón con fórmulas', ico:'🧮', xp:3400, grad:'linear-gradient(135deg,#14432f,#0a2c1f)', desc:'Lleno de fórmulas.',
    scene:'<g fill="#dfeee6" opacity=".5" font-family="Georgia,serif"><text x="12" y="30" font-size="15">∑</text><text x="70" y="26" font-size="14">π</text><text x="16" y="60" font-size="12">√x</text><text x="64" y="64" font-size="13">x²</text><text x="38" y="40" font-size="11">f(x)</text><text x="74" y="82" font-size="12">λ</text></g>'},
  {id:'bg-desvelo', type:'bg', rarity:'legendary', secret:true, name:'Modo desvelo', ico:'🌙', test:()=>!!S.lateNight, cond:'???', hint:'Estudia de madrugada', grad:'linear-gradient(135deg,#2b2140,#120b24)', desc:'Para los trasnochadores.',
    scene:'<circle cx="72" cy="24" r="11" fill="#e9def5" opacity=".9"/><circle cx="77" cy="21" r="9" fill="#241a3a"/><g fill="#cdbdf0" opacity=".8" font-family="Georgia,serif" font-weight="700"><text x="16" y="34" font-size="10">z</text><text x="24" y="26" font-size="13">z</text><text x="33" y="18" font-size="16">Z</text></g><g fill="#fff" opacity=".7"><circle cx="18" cy="60" r="1.1"/><circle cx="52" cy="20" r="1"/></g>'},
  {id:'bg-playa', type:'bg', rarity:'legendary', name:'Playa de vacaciones', ico:'🏖️', test:()=>subjStats('ca3').done>=12, cond:'Completa los 12 módulos de Cálculo III', grad:'linear-gradient(135deg,#37c7e0,#f6d97a)', desc:'Después del examen final.',
    scene:'<circle cx="74" cy="24" r="12" fill="#ffe08a" opacity=".95"/><g stroke="#ffe08a" stroke-width="2.5" opacity=".7"><path d="M74 6v-4M74 46v4M92 24h4M52 24h-4M87 11l3-3M61 11l-3-3"/></g><path d="M0 72 q12 -6 25 0 t25 0 t25 0 t25 0 V100 H0Z" fill="#1f8fb5" opacity=".5"/>'},
  {id:'bg-universo', type:'bg', rarity:'legendary', name:'Universo matemático', ico:'🌌', xp:7000, grad:'radial-gradient(circle at 32% 26%,#3a2b6e,#0a0a1e 78%)', desc:'Entre estrellas y ecuaciones.',
    scene:'<ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="#9a8bf5" stroke-width="1.6" opacity=".5" transform="rotate(-22 50 50)"/><circle cx="20" cy="41" r="4" fill="#c9b8ff" opacity=".7"/><g fill="#fff" opacity=".85"><circle cx="16" cy="20" r="1.3"/><circle cx="82" cy="28" r="1.5"/><circle cx="30" cy="78" r="1.1"/><circle cx="74" cy="72" r="1.3"/><circle cx="60" cy="14" r="1"/></g>'}
];
/* ---- Marcos ---- */
const FRAMES = [
  {id:'frame-bronze',  type:'frame', rarity:'common', name:'Marco bronce',  ico:'🥉', xp:100,  color:'#cd7f32', desc:'Un marco de bronce.'},
  {id:'frame-silver',  type:'frame', rarity:'rare', name:'Marco plata',   ico:'🥈', xp:1000, color:'#b7b7b7', desc:'Un marco plateado.'},
  {id:'frame-neon',    type:'frame', rarity:'epic', name:'Marco neón',    ico:'💠', xp:2000, color:'#2af5c8', glow:true, desc:'Un marco que brilla en la oscuridad.'},
  {id:'frame-gold',    type:'frame', rarity:'epic', name:'Marco oro',     ico:'🥇', xp:3000, color:'#eda100', desc:'Un marco dorado.'},
  {id:'frame-diamond', type:'frame', rarity:'legendary', name:'Marco diamante',ico:'💎', test:()=>Object.values(S.modules).filter(m=>m.done).length>=12, cond:'Completa los 12 módulos de una materia', grad:'conic-gradient(from 0deg,#7ad7f0,#b7e9ff,#7ad7f0,#e6f7ff,#7ad7f0)', desc:'El marco más exclusivo, solo para quien domina una materia.'},
  {id:'frame-rainbow', type:'frame', rarity:'legendary', name:'Marco arcoíris',ico:'🌈', test:()=>S.streak>=7, cond:'Racha de 7 días', grad:'conic-gradient(from 0deg,#e34948,#eda100,#1baf7a,#2a78d6,#4a3aa7,#e34948)', desc:'Solo para constantes: racha de 7 días.'}
];
/* ---- Accesorios (SVG/emoji superpuestos sobre el avatar) ----
   Modelo de posición: x,y = centro (%) del accesorio dentro del avatar;
   scale = tamaño del emoji como fracción del avatar; w = ancho del SVG. */
function svgGlasses(s, w){ w = Math.round(s*(w||0.5)); return '<svg width="'+w+'" viewBox="0 0 100 42" style="display:block">'
  + '<rect x="6" y="8" width="34" height="26" rx="5" fill="rgba(150,190,255,.35)" stroke="#15181f" stroke-width="3.2"/>'
  + '<rect x="60" y="8" width="34" height="26" rx="5" fill="rgba(150,190,255,.35)" stroke="#15181f" stroke-width="3.2"/>'
  + '<path d="M40 18 Q50 13 60 18" fill="none" stroke="#15181f" stroke-width="3.2"/>'
  + '<path d="M6 15 L1 11 M94 15 L99 11" stroke="#15181f" stroke-width="3.2"/>'
  + '<rect x="6" y="6" width="34" height="4" rx="2" fill="#eda100"/><rect x="60" y="6" width="34" height="4" rx="2" fill="#eda100"/></svg>'; }
function svgMustache(s, w){ w = Math.round(s*(w||0.4)); return '<svg width="'+w+'" viewBox="0 0 100 34" style="display:block">'
  + '<path d="M50 6 C44 6 42 16 28 17 C16 18 12 9 6 12 C11 25 26 27 36 21 C42 18 47 19 50 19 C53 19 58 18 64 21 C74 27 89 25 94 12 C88 9 84 18 72 17 C58 16 56 6 50 6Z" fill="#3a2a1a"/></svg>'; }
function svgCowboy(s, w){ w = Math.round(s*(w||0.72)); return '<svg width="'+w+'" viewBox="0 0 100 46" style="display:block">'
  + '<path d="M6 38 Q50 52 94 38 Q72 42 70 33 L66 16 Q50 6 34 16 L30 33 Q28 42 6 38Z" fill="#8a5a2b"/>'
  + '<path d="M30 30 Q50 37 70 30 L70 34 Q50 41 30 34Z" fill="#5e3c17"/></svg>'; }
function svgMonocle(s, w){ w = Math.round(s*(w||0.46)); return '<svg width="'+w+'" viewBox="0 0 100 66" style="display:block">'
  + '<circle cx="60" cy="24" r="17" fill="rgba(200,225,255,.28)" stroke="#1c1c1c" stroke-width="4"/>'
  + '<path d="M60 41 q-3 14 -16 20" stroke="#1c1c1c" stroke-width="3" fill="none"/></svg>'; }
function svgEyepatch(s, w){ w = Math.round(s*(w||0.62)); return '<svg width="'+w+'" viewBox="0 0 100 46" style="display:block">'
  + '<path d="M2 10 L98 22" stroke="#0e0e0e" stroke-width="4.5"/>'
  + '<ellipse cx="34" cy="22" rx="17" ry="14" fill="#131313"/><ellipse cx="34" cy="22" rx="17" ry="14" fill="none" stroke="#000" stroke-width="1"/></svg>'; }
function svgTophat(s, w){ w = Math.round(s*(w||0.6)); return '<svg width="'+w+'" viewBox="0 0 100 70" style="display:block">'
  + '<rect x="26" y="4" width="48" height="46" rx="4" fill="#1a1a1a"/><rect x="26" y="38" width="48" height="8" fill="#7a1f2b"/>'
  + '<ellipse cx="50" cy="54" rx="46" ry="10" fill="#1a1a1a"/></svg>'; }
/* Cada accesorio ocupa una "ranura" (slot); solo uno por slot. Mano y sticker
   son excluyentes entre sí (se interponen). */
const ACC_SLOT_NAMES = {head:'🎩 Cabeza', eyes:'👓 Ojos', mouth:'👄 Boca', neck:'🧣 Cuello', hand:'✋ Mano', sticker:'🏷️ Sticker'};
const ACC_SLOT_CONFLICT = {hand:'sticker', sticker:'hand'};
/* Calibración individual: cada accesorio tiene su propia posición (x,y = centro
   en % del avatar), escala/ancho y rotación, ajustadas a mano según su forma y
   zona de anclaje. Mapa del rostro (viewBox 0–100): cabello/tope y≈8–20 ·
   ojos y≈48 (x 42 y 58) · nariz y≈53 · boca y≈60 (x 50) · mentón y≈72 ·
   cuello y≈73 · cuello/pecho y≈80 · hombros y≈90 · mano (a un costado) x≈74 y≈80. */
const ACCESSORIES = [
  // — Ojos (centrados en la línea de los ojos, y≈48) —
  {id:'acc-glasses', type:'acc', slot:'eyes', rarity:'common', name:'Lentes Cartier', ico:'🕶️', xp:400,  svg:svgGlasses, w:0.46, x:50, y:48, desc:'Lentes cuadrados elegantes, estilo Cartier.'},
  {id:'acc-shades',  type:'acc', slot:'eyes', rarity:'common', name:'Lentes de sol', ico:'😎', xp:300, emoji:'🕶️', scale:0.44, x:50, y:48, desc:'Modo galán activado.'},
  {id:'acc-headphones', type:'acc', slot:'eyes', rarity:'rare', name:'Audífonos', ico:'🎧', xp:900, emoji:'🎧', scale:0.62, x:50, y:41, desc:'Música para concentrarte.'},
  {id:'acc-vr',      type:'acc', slot:'eyes', rarity:'rare', name:'Visor VR', ico:'🥽', xp:1500, emoji:'🥽', scale:0.48, x:50, y:47, desc:'Estudiar en el metaverso.'},
  {id:'acc-monocle', type:'acc', slot:'eyes', rarity:'epic', name:'Monóculo', ico:'🧐', xp:2600, svg:svgMonocle, w:0.5, x:55, y:49, desc:'Elegancia de otra época.'},
  {id:'acc-eyepatch', type:'acc', slot:'eyes', rarity:'legendary', secret:true, name:'Parche pirata', ico:'🏴‍☠️', test:()=>(S.bestSudden||0)>=20, cond:'???', hint:'Sobrevive mucho en Muerte súbita', svg:svgEyepatch, w:0.58, x:50, y:47, desc:'Arrr, actuario de los siete mares.'},
  // — Cabeza (descansan sobre el pelo; cada sombrero con su altura) —
  {id:'acc-cap',     type:'acc', slot:'head', rarity:'common', name:'Gorra de desvelado', ico:'🧢', xp:700, emoji:'🧢', scale:0.56, x:49, y:19, desc:'Para las desveladas.'},
  {id:'acc-sunhat',  type:'acc', slot:'head', rarity:'common', name:'Sombrero de sol', ico:'👒', xp:600, emoji:'👒', scale:0.6, x:50, y:14, desc:'Listo para vacaciones.'},
  {id:'acc-helmet',  type:'acc', slot:'head', rarity:'rare', name:'Casco', ico:'🪖', xp:1200, emoji:'🪖', scale:0.56, x:50, y:16, desc:'A la guerra contra los parciales.'},
  {id:'acc-cowboy',  type:'acc', slot:'head', rarity:'rare', name:'Sombrero vaquero', ico:'🤠', xp:1600, svg:svgCowboy, w:0.78, x:50, y:15, desc:'Yeehaw, actuario.'},
  {id:'acc-tophat',  type:'acc', slot:'head', rarity:'epic', name:'Sombrero de copa', ico:'🎩', xp:2200, svg:svgTophat, w:0.6, x:50, y:8, desc:'De alta sociedad.'},
  {id:'acc-crown',   type:'acc', slot:'head', rarity:'epic', name:'Corona', ico:'👑', xp:2000, emoji:'👑', scale:0.44, x:50, y:11, desc:'De la realeza actuarial.'},
  {id:'acc-cap-grad', type:'acc', slot:'head', rarity:'epic', name:'Birrete', ico:'🎓', xp:2500, emoji:'🎓', scale:0.56, x:50, y:12, desc:'Listo para graduarte.'},
  {id:'acc-brain',   type:'acc', slot:'head', rarity:'legendary', secret:true, name:'Cerebro expuesto', ico:'🧠', test:()=>(S.totalAnswered||0)>=200, cond:'???', hint:'Responde muchísimas preguntas', emoji:'🧠', scale:0.5, x:50, y:12, desc:'Demasiada sabiduría acumulada.'},
  // — Boca / bajo la nariz —
  {id:'acc-mustache', type:'acc', slot:'mouth', rarity:'rare', name:'Bigote falso', ico:'👨', xp:1100, svg:svgMustache, w:0.42, x:50, y:56, desc:'Un disfraz muy serio.'},
  {id:'acc-cig',     type:'acc', slot:'mouth', rarity:'rare', name:'Cigarro', ico:'🚬', xp:1300, emoji:'🚬', scale:0.27, x:55, y:27, rot:8, desc:'El estrés del cuatrimestre.'},
  {id:'acc-lollipop', type:'acc', slot:'mouth', rarity:'common', name:'Paleta', ico:'🍭', xp:700, emoji:'🍭', scale:0.36, x:63, y:63, rot:18, desc:'Dulce recompensa.'},
  {id:'acc-rose',    type:'acc', slot:'mouth', rarity:'epic', name:'Rosa en la boca', ico:'🌹', xp:2600, emoji:'🌹', scale:0.36, x:56, y:61, rot:72, desc:'Puro romance… con las integrales.'},
  {id:'acc-tear',    type:'acc', slot:'mouth', rarity:'common', name:'Lágrima de parcial', ico:'💧', xp:500,  emoji:'💧', scale:0.2, x:59, y:55, desc:'El parcial estuvo difícil.'},
  // — Cuello / pecho —
  {id:'acc-tie',     type:'acc', slot:'neck', rarity:'common', name:'Corbata', ico:'👔', xp:800, emoji:'👔', scale:0.46, x:50, y:83, desc:'Modo entrevista de trabajo.'},
  {id:'acc-bow',     type:'acc', slot:'neck', rarity:'common', name:'Moño', ico:'🎀', xp:600, emoji:'🎀', scale:0.34, x:50, y:79, desc:'Un toque coqueto.'},
  {id:'acc-scarf',   type:'acc', slot:'neck', rarity:'rare', name:'Bufanda', ico:'🧣', xp:1400, emoji:'🧣', scale:0.5, x:50, y:80, desc:'Para las mañanas frías de examen.'},
  {id:'acc-medal',   type:'acc', slot:'neck', rarity:'epic', name:'Medalla', ico:'🎖️', test:()=>(S.examHistory||[]).some(e=>e.score>=90), cond:'Saca ≥90% en un examen diario', emoji:'🏅', scale:0.42, x:50, y:82, desc:'Al mérito actuarial.'},
  // — Mano / a un costado (cada objeto con su punto propio, no una alineación común) —
  {id:'acc-calc',    type:'acc', slot:'hand', rarity:'common', name:'Calculadora flotante', ico:'🧮', xp:1000, emoji:'🧮', scale:0.36, x:78, y:84, desc:'Siempre a la mano.'},
  {id:'acc-phone',   type:'acc', slot:'hand', rarity:'common', name:'Celular', ico:'📱', xp:500, emoji:'📱', scale:0.3, x:75, y:80, rot:-12, desc:'Distracción portátil.'},
  {id:'acc-book',    type:'acc', slot:'hand', rarity:'common', name:'Libro de texto', ico:'📕', xp:600, emoji:'📕', scale:0.34, x:76, y:84, rot:-8, desc:'La biblia del actuario.'},
  {id:'acc-coffee',  type:'acc', slot:'hand', rarity:'rare', name:'Café gigante', ico:'☕', xp:1400, emoji:'☕', scale:0.34, x:78, y:82, desc:'Combustible de estudiante.'},
  {id:'acc-magnifier', type:'acc', slot:'hand', rarity:'rare', name:'Lupa de auditor', ico:'🔍', xp:1300, emoji:'🔍', scale:0.4, x:77, y:79, desc:'Nada se te escapa.'},
  {id:'acc-portafolio', type:'acc', slot:'hand', rarity:'rare', name:'Portafolio ejecutivo', ico:'💼', xp:1600, emoji:'💼', scale:0.38, x:77, y:86, desc:'Modo consultor de riesgos.'},
  {id:'acc-mic',     type:'acc', slot:'hand', rarity:'rare', name:'Micrófono', ico:'🎤', xp:1500, emoji:'🎤', scale:0.32, x:64, y:64, rot:-22, desc:'Para exponer sin miedo.'},
  {id:'acc-controller', type:'acc', slot:'hand', rarity:'rare', name:'Control de videojuego', ico:'🎮', xp:1700, emoji:'🎮', scale:0.36, x:75, y:83, desc:'Estudiar es un juego.'},
  {id:'acc-beer',    type:'acc', slot:'hand', rarity:'rare', name:'Cerveza', ico:'🍺', xp:1800, emoji:'🍺', scale:0.4, x:78, y:80, desc:'Ya pasó el examen… ¿o no?'},
  {id:'acc-guitar',  type:'acc', slot:'hand', rarity:'epic', name:'Guitarra', ico:'🎸', xp:2800, emoji:'🎸', scale:0.5, x:70, y:78, rot:-8, desc:'Rockstar de la estadística.'},
  {id:'acc-money',   type:'acc', slot:'hand', rarity:'epic', name:'Bolsa de dinero', ico:'💰', xp:3200, emoji:'💰', scale:0.38, x:77, y:84, desc:'El sueldo de actuario.'},
  {id:'acc-gun',     type:'acc', slot:'hand', rarity:'epic', secret:true, name:'Pistola', ico:'🔫', test:()=>(S.bestBlitzCombo||0)>=15, cond:'???', hint:'Encadena muchos aciertos en el contrarreloj', emoji:'🔫', scale:0.44, x:74, y:74, desc:'Modo pistolero de fórmulas.'},
  {id:'acc-sword',   type:'acc', slot:'hand', rarity:'legendary', secret:true, name:'Espada', ico:'🗡️', test:()=>subjStats('ca3').done>=12, cond:'???', hint:'Domina toda una materia', emoji:'🗡️', scale:0.5, x:78, y:66, rot:-42, desc:'Cortas exámenes como mantequilla.'},
  {id:'acc-bomb',    type:'acc', slot:'hand', rarity:'legendary', secret:true, name:'Bomba', ico:'💣', test:()=>{const h=S.examHistory||[]; return h.some(e=>e.score<40);}, cond:'???', hint:'A veces un examen sale realmente mal…', emoji:'💣', scale:0.4, x:78, y:83, desc:'Ese examen explotó.'},
  // — Stickers (etiqueta en una esquina; solo uno a la vez) —
  {id:'acc-aprobe',  type:'acc', slot:'sticker', rarity:'rare', name:'Sticker “Aprobé”', ico:'✅', test:()=>(S.examHistory||[]).some(e=>e.score>=80), cond:'Aprueba un examen diario (≥80%)', sticker:'✅ Aprobé', stickerBg:'#0ca30c', rot:-8, x:50, y:68, desc:'La prueba de que sí se pudo.'},
  {id:'acc-noc',     type:'acc', slot:'sticker', rarity:'common', name:'Sticker “No era la C”', ico:'🅲', xp:1500, sticker:'No era la C', stickerBg:'#e34948', rot:-8, x:50, y:68, desc:'Todos hemos estado ahí.'},
  {id:'acc-100',     type:'acc', slot:'sticker', rarity:'epic', name:'Sticker “100”', ico:'💯', test:()=>Object.values(S.modules).some(m=>m.best>=100), cond:'Saca 100% en un módulo', sticker:'💯 Perfecto', stickerBg:'#eda100', rot:-8, x:50, y:68, desc:'Puntuación perfecta.'},
  {id:'acc-flag',    type:'acc', slot:'sticker', rarity:'rare', name:'Bandera “Sobreviví”', ico:'🏁', test:()=>(S.examHistory||[]).length>=3, cond:'Presenta 3 exámenes diarios', sticker:'🏁 Sobreviví', stickerBg:'#4a3aa7', rot:-8, x:50, y:68, desc:'Un cuatrimestre más.'}
];
const accSlot = id => { const a = ACCESSORIES.find(x=>x.id===id); return a ? a.slot : null; };
/* ---- Efectos del MARCO: solo decoran el anillo/borde de la foto (sin emojis
   en el centro). Equipar uno reemplaza al marco (son excluyentes). ---- */
const EFFECTS = [
  {id:'fx-sparkle', type:'effect', rarity:'rare', name:'Anillo de destellos', ico:'✨', xp:1200, cls:'sparkle', desc:'Un anillo dorado que gira alrededor de tu foto.'},
  {id:'fx-glow',    type:'effect', rarity:'epic', name:'Aura brillante',      ico:'🌟', xp:2000, cls:'glow',    desc:'Tu marco late con un halo del color principal.'},
  {id:'fx-neon',    type:'effect', rarity:'epic', name:'Anillo neón',         ico:'💠', xp:2800, cls:'neon',    desc:'Un aro neón que brilla en la oscuridad.'},
  {id:'fx-flame',   type:'effect', rarity:'legendary', name:'Anillo de fuego',     ico:'🔥', xp:3600, cls:'flame',   desc:'Un aro de llamas girando en tu marco.'},
  {id:'fx-rainbow', type:'effect', rarity:'legendary', name:'Anillo arcoíris',     ico:'🌈', test:()=>subjStats('ca3').done>=12, cond:'Completa los 12 módulos de Cálculo III', cls:'rainbow', desc:'Un aro multicolor girando en tu marco.'}
];
/* ---- Efectos AL ACERTAR: partículas que brotan cuando respondes bien ---- */
const HITFX = [
  {id:'fx-confetti', type:'hitfx', rarity:'rare', name:'Lluvia de confeti', ico:'🎊', xp:1500, kind:'confetti', desc:'Suelta confeti cada vez que respondes bien.'},
  {id:'hit-stars',   type:'hitfx', rarity:'epic', name:'Estrellas al acertar', ico:'⭐', xp:2600, kind:'stars', desc:'Brotan estrellas cuando respondes bien.'},
  {id:'hit-hearts',  type:'hitfx', rarity:'epic', name:'Corazones al acertar', ico:'💗', xp:3400, kind:'hearts', desc:'Brotan corazones cuando respondes bien.'},
  {id:'hit-fire',    type:'hitfx', rarity:'legendary', secret:true, name:'Chispas de fuego', ico:'🔥', test:()=>(S.bestBlitzCombo||0)>=12, cond:'???', hint:'Encadena aciertos en el contrarreloj', kind:'fire', desc:'Chispas de fuego al acertar.'}
];
/* ---- Temas de interfaz (color principal preestablecido) ---- */
const THEMES = [
  {id:'th-ocean',  type:'theme', rarity:'rare', name:'Océano', ico:'🌊', xp:1500, accent:'#0e9bd6', desc:'Un azul profundo.'},
  {id:'th-forest', type:'theme', rarity:'epic', name:'Bosque', ico:'🌲', xp:2800, accent:'#1e9e5a', desc:'Verde relajante.'},
  {id:'th-sunset', type:'theme', rarity:'legendary', name:'Atardecer', ico:'🌇', xp:4500, accent:'#e5714a', desc:'Cálido y motivador.'},
  {id:'th-galaxy', type:'theme', rarity:'legendary', name:'Galaxia', ico:'🌌', test:()=>S.xp>=8000, cond:'Alcanza 8,000 XP', accent:'#7a5cff', desc:'Para los más avanzados.'}
];
/* ---- Títulos ---- */
const TITLES = [
  {id:'title-analista',   type:'title', rarity:'common', name:'Analista Junior',       ico:'🏷️', xp:500,  desc:'Título alterno que sustituye tu rango de nivel.'},
  {id:'title-construccion', type:'title', rarity:'common', name:'Actuario en Construcción', ico:'🚧', xp:300,  desc:'Para quien apenas empieza, pero con casco.'},
  {id:'title-cafe',        type:'title', rarity:'common', name:'Rey del Café',            ico:'☕', xp:800,  desc:'Ninguna madrugada de estudio te detiene.'},
  {id:'title-frecuencia', type:'title', rarity:'rare', name:'Maestro de Frecuencia', ico:'🏷️', xp:1200, desc:'Título alterno que sustituye tu rango de nivel.'},
  {id:'title-excel',       type:'title', rarity:'rare', name:'Excel Warrior',           ico:'📗', xp:1600, desc:'Domador de celdas y tablas dinámicas.'},
  {id:'title-severidad',  type:'title', rarity:'epic', name:'Experto en Severidad',  ico:'🏷️', xp:2000, desc:'Título alterno que sustituye tu rango de nivel.'},
  {id:'title-humana',      type:'title', rarity:'epic', name:'Calculadora Humana',      ico:'🧮', xp:2500, desc:'¿Quién necesita calculadora?'},
  {id:'title-prima',      type:'title', rarity:'legendary', name:'Rey de la Prima',       ico:'🏷️', xp:4000, desc:'Título alterno que sustituye tu rango de nivel.'},
  {id:'title-riesgo',      type:'title', rarity:'legendary', name:'Maestro del Riesgo',      ico:'🎲', xp:6000, desc:'El riesgo te respeta a ti.'},
  {id:'title-sobrev',      type:'title', rarity:'rare', name:'Sobreviviente del Parcial', ico:'🏳️', desc:'Presentaste tu primer examen diario y viviste para contarlo.',
    test:()=>(S.examHistory||[]).length>=1, cond:'Presenta tu primer examen diario'},
  {id:'title-estudio',     type:'title', rarity:'rare', name:'El que sí estudió',       ico:'🤓', desc:'Cinco días seguidos: tu profesor estaría orgulloso.',
    test:()=>S.streak>=5, cond:'Logra una racha de 5 días'},
  {id:'title-cazador',     type:'title', rarity:'epic', name:'Cazador de Fórmulas',     ico:'🏹', desc:'100% en el módulo de fórmulas: puntería perfecta.',
    test:()=>{ const st = (subjSnapshot('ca3').modules||{})[9]; return !!(st && st.best>=100); }, cond:'Saca 100% en el módulo Completar fórmulas'},
  {id:'title-noc',         type:'title', rarity:'common', name:'No era opción C',         ico:'🅲', desc:'La sabiduría llega después de muchas preguntas.',
    test:()=>(S.totalAnswered||0)>=40, cond:'Responde 40 preguntas'},
  {id:'title-siniestros',  type:'title', rarity:'legendary', name:'Señor de los Siniestros', ico:'🌩️', desc:'Los 12 módulos de Cálculo Actuarial III doblegados.',
    test:()=>subjStats('ca3').done>=12, cond:'Completa los 12 módulos de Cálculo III'},
  {id:'title-desvelado',   type:'title', rarity:'epic', secret:true, name:'Desvelado Profesional',   ico:'🌙', desc:'Estudiar después de medianoche también cuenta. O más.',
    test:()=>!!S.lateNight, cond:'???', hint:'Estudia de madrugada'},
  {id:'title-madrugador',  type:'title', rarity:'epic', secret:true, name:'Madrugador',   ico:'🐦', desc:'Al que madruga… le desbloquean títulos.',
    test:()=>!!S.earlyBird, cond:'???', hint:'Estudia muy temprano'},
  {id:'title-domador',     type:'title', rarity:'legendary', name:'Domador de Exámenes',     ico:'🎪', desc:'Tres exámenes con ≥90: los exámenes te temen.',
    test:()=>(S.examHistory||[]).filter(e=>e.score>=90).length>=3, cond:'Logra ≥90% en 3 exámenes diarios'},
  {id:'title-leyenda',     type:'title', rarity:'legendary', secret:true, name:'Leyenda de AprendeUteca',     ico:'🏆', desc:'Acumulaste una fortuna en XP.',
    test:()=>S.xp>=10000, cond:'???', hint:'Acumula una enormidad de XP'}
];
/* Catálogo completo de la tienda */
const REWARDS = [].concat(FRAMES, BACKGROUNDS, ACCESSORIES, TITLES, EFFECTS, HITFX, THEMES);
const rewardById = id => REWARDS.find(r => r.id === id);
function ensureEquip(){
  if(!S.equip) S.equip = {};
  const e = S.equip;
  ['frame','bg','title','effect','hitfx','theme','badge'].forEach(k => { if(e[k]===undefined) e[k]=null; });
  if(!Array.isArray(e.acc)) e.acc = e.acc ? [e.acc] : [];   // migración: accesorio único → lista
  // migración de efectos: confeti/estrellas del viejo slot 'effect' → 'hitfx'
  if(e.effect==='fx-confetti'){ e.hitfx = e.hitfx || 'fx-confetti'; e.effect = null; }
  if(e.effect==='fx-stars'){ e.effect = 'fx-sparkle'; }      // fx-stars ya no es efecto de marco
  if(e.frame && e.effect) e.effect = null;                   // marco y efecto de marco son excluyentes
  return e;
}
function isUnlockedReward(id){ return (S.unlockedRewards||[]).includes(id); }
function rewardEarned(r){ return r.test ? !!r.test() : (r.xp != null && S.xp >= r.xp); }
function nextReward(){
  // solo recompensas por XP: las de logro (test) muestran su propia condición
  return REWARDS.filter(r => r.xp != null && !isUnlockedReward(r.id)).sort((a,b)=>a.xp-b.xp)[0] || null;
}
function checkRewards(){
  const newly = [];
  REWARDS.forEach(r => {
    if(!isUnlockedReward(r.id) && rewardEarned(r)){
      S.unlockedRewards.push(r.id);
      S.rewardLog.unshift({id:r.id, t:Date.now()});
      newly.push(r);
    }
  });
  if(!newly.length) return;
  if(S.rewardLog.length > 40) S.rewardLog.length = 40;
  save();
  sfx('unlock'); confetti(Math.min(140, 60 + newly.length*14));
  showRewardModal(newly);
}
/* Muestra TODAS las recompensas recién desbloqueadas en un solo modal.
   Con una sola: botón "Equipar ahora". Con varias: lista + "Ir a la tienda";
   si son más de 5, botón "Aceptar todas" que cierra sin recorrer una por una. */
function showRewardModal(list){
  const many = list.length > 1;
  let html = '<div style="text-align:center">';
  if(!many){
    const r = list[0];
    html += '<div style="font-size:52px">'+(r.ico||'🏷️')+'</div>'
      + '<h2>¡Recompensa desbloqueada!</h2><div class="r-sub">'+esc(r.name)+' · '+(REWARD_TYPE_LABEL[r.type]||'')+'</div>'
      + '<p style="color:var(--ink2);font-size:.9rem">'+esc(r.desc||'')+'</p>'
      + '<div class="q-actions" style="justify-content:center"><button class="btn" id="rwEquip">✅ Equipar ahora</button><button class="btn ghost" id="rwOk">Después</button></div>';
  } else {
    html += '<div style="font-size:48px">🎁</div>'
      + '<h2>¡Desbloqueaste '+list.length+' recompensas!</h2>'
      + '<div class="reward-unlock-list">'
      + list.map(r => '<div class="ru-row"><span class="ru-ico">'+(r.ico||'🏷️')+'</span>'
          + '<span class="ru-txt"><b>'+esc(r.name)+'</b><small>'+(REWARD_TYPE_LABEL[r.type]||'')+'</small></span></div>').join('')
      + '</div>'
      + '<p class="q-help">Equípalas cuando quieras desde la 🛒 Tienda → Mi colección.</p>'
      + '<div class="q-actions" style="justify-content:center">'
      + (list.length > 5 ? '<button class="btn" id="rwAll">✅ Aceptar todas</button>' : '<button class="btn" id="rwAll">¡Genial!</button>')
      + '<button class="btn ghost" id="rwShop">🛒 Ver en la tienda</button></div>';
  }
  html += '</div>';
  const o = openModal(html);
  const ok = o.querySelector('#rwOk'); if(ok) ok.addEventListener('click', ()=>{ closeModal(); sfx('click'); });
  const eq = o.querySelector('#rwEquip'); if(eq) eq.addEventListener('click', ()=>{ equipReward(list[0]); closeModal(); sfx('unlock'); });
  const all = o.querySelector('#rwAll'); if(all) all.addEventListener('click', ()=>{ closeModal(); sfx('click'); });
  const shop = o.querySelector('#rwShop'); if(shop) shop.addEventListener('click', ()=>{ closeModal(); shopTab='coleccion'; renderShop(); showView('shop'); sfx('click'); });
}
/* ================= Renderizado del avatar (foto/emoji + fondo + marco + accesorios + efecto) ================= */
function bgStyle(b){ return 'background:'+b.grad; }
function frameStyle(f, size){
  const ring = Math.max(3, Math.round(size*0.05));
  if(f.grad) return 'background:'+f.grad+';-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - '+ring+'px),#000 calc(100% - '+(ring-1)+'px));mask:radial-gradient(farthest-side,transparent calc(100% - '+ring+'px),#000 calc(100% - '+(ring-1)+'px))';
  return 'border:'+ring+'px solid '+f.color+(f.glow?';box-shadow:0 0 '+Math.round(size*0.12)+'px '+f.color:'');
}
/* ---- Avatar 3D editable (SVG) ----
   Cara personalizable (piel, cabello, color, ojos). Sin fondo propio: el fondo
   lo pone la capa av-bg (fondo equipable), así los fondos sí se ven. Los
   accesorios equipados se dibujan encima (capa av-acc). */
const AV_SKIN  = ['#f6c9a0','#eab389','#c98d5f','#8d5a3a','#5a3a24'];
const AV_HAIRC = ['#2b2b2b','#5b3a1e','#a56d28','#e0b04c','#8a8a8a','#b03a3a','#3a6ea5'];
const AV_HAIRN = ['Rapado','Corto','Fleco','Largo','Chongo'];
const AV_EYEN  = ['Clásicos','Felices','Guiño'];
const AV_KEYS  = ['skin','hair','hairColor','eyes'];
const AV_SIZES = {skin:AV_SKIN.length, hair:AV_HAIRN.length, hairColor:AV_HAIRC.length, eyes:AV_EYEN.length};
function defaultCustom(){ return {skin:0, hair:1, hairColor:0, eyes:0}; }
function avatarSVG(c, size){
  c = Object.assign(defaultCustom(), c||{});
  const skin = AV_SKIN[(c.skin%AV_SKIN.length+AV_SKIN.length)%AV_SKIN.length];
  const hc = AV_HAIRC[(c.hairColor%AV_HAIRC.length+AV_HAIRC.length)%AV_HAIRC.length];
  const uid = 'avg' + (avatarSVG._n = (avatarSVG._n||0) + 1);
  const hair = ((c.hair%AV_HAIRN.length)+AV_HAIRN.length)%AV_HAIRN.length, eyes = ((c.eyes%AV_EYEN.length)+AV_EYEN.length)%AV_EYEN.length;
  let h = '';
  if(hair===1) h = '<path d="M27 44 Q27 21 50 21 Q73 21 73 44 Q66 30 50 30 Q34 30 27 44Z" fill="'+hc+'"/>';
  if(hair===2) h = '<path d="M27 46 Q27 20 50 20 Q73 20 73 46 L69 38 L64 43 L58 37 L50 42 L42 37 L36 43 L31 38 Z" fill="'+hc+'"/>';
  if(hair===3) h = '<path d="M26 44 Q26 20 50 20 Q74 20 74 44 L74 66 Q74 72 68 70 L68 46 Q62 32 50 32 Q38 32 32 46 L32 70 Q26 72 26 66 Z" fill="'+hc+'"/>';
  if(hair===4) h = '<circle cx="50" cy="17" r="8" fill="'+hc+'"/><path d="M27 44 Q27 22 50 22 Q73 22 73 44 Q66 31 50 31 Q34 31 27 44Z" fill="'+hc+'"/>';
  let e = '';
  if(eyes===0) e = '<circle cx="42" cy="48" r="2.6" fill="#26221f"/><circle cx="58" cy="48" r="2.6" fill="#26221f"/>';
  if(eyes===1) e = '<path d="M38.5 49 Q42 45 45.5 49" stroke="#26221f" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M54.5 49 Q58 45 61.5 49" stroke="#26221f" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  if(eyes===2) e = '<circle cx="42" cy="48" r="2.6" fill="#26221f"/><path d="M54.5 48.5 Q58 46 61.5 48.5" stroke="#26221f" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 100 100" role="img" aria-label="Avatar personalizado" style="display:block">'
    + '<defs><radialGradient id="'+uid+'" cx="42%" cy="34%" r="80%">'
    + '<stop offset="0%" stop-color="#ffffff" stop-opacity=".45"/><stop offset="55%" stop-color="'+skin+'"/><stop offset="100%" stop-color="'+skin+'"/>'
    + '</radialGradient></defs>'
    + '<ellipse cx="50" cy="92" rx="27" ry="17" fill="#6b7280"/>'            /* hombros/camisa (color fijo, no depende del tema) */
    + '<ellipse cx="50" cy="73" rx="9" ry="6" fill="'+skin+'"/>'             /* cuello */
    + '<ellipse cx="50" cy="49" rx="23" ry="25" fill="url(#'+uid+')"/>'      /* cara */
    + h + e
    + '<path d="M43 59 Q50 65 57 59" stroke="#a4562f" stroke-width="2.6" fill="none" stroke-linecap="round"/>'  /* boca */
    + '</svg>';
}
function builderLabel(key, c){
  c = Object.assign(defaultCustom(), c||{});
  switch(key){
    case 'skin': return 'Tono '+((c.skin%AV_SKIN.length)+1)+'/'+AV_SKIN.length;
    case 'hair': return AV_HAIRN[c.hair%AV_HAIRN.length];
    case 'hairColor': return 'Color '+((c.hairColor%AV_HAIRC.length)+1)+'/'+AV_HAIRC.length;
    case 'eyes': return AV_EYEN[c.eyes%AV_EYEN.length];
  }
  return '';
}
const BUILDER_LABELS = {skin:'🖐️ Piel', hair:'💇 Peinado', hairColor:'🎨 Color', eyes:'👀 Ojos'};
/* Modo de avatar: 'emoji' | 'photo' | 'custom' */
function avatarMode(p){ return p && p.avatarMode ? p.avatarMode : (p && p.photo ? 'photo' : 'emoji'); }
function avatarBase(p, size){
  // photo y avatar pueden venir del leaderboard publicado (datos externos): se escapan
  const mode = avatarMode(p);
  if(mode === 'photo' && p && p.photo) return '<img src="'+esc(p.photo)+'" alt="avatar">';
  if(mode === 'custom') return avatarSVG((p&&p.custom)||defaultCustom(), size);
  return '<span class="av-emoji" style="font-size:'+Math.round(size*0.58)+'px">'+esc((p&&p.avatar)||'🎓')+'</span>';
}
function accHTML(a, size){
  let content;
  if(a.svg) content = a.svg(size, a.w);
  else if(a.sticker){
    const fs = Math.max(6, Math.round(size*0.105));                // el texto escala con el avatar
    const pv = Math.max(1, Math.round(size*0.016)), ph = Math.max(2, Math.round(size*0.045)); // el relleno también, así el sticker no crece de más
    content = '<span class="av-sticker" style="background:'+(a.stickerBg||'#333')+';font-size:'+fs+'px;padding:'+pv+'px '+ph+'px">'+esc(a.sticker)+'</span>';
  }
  else content = '<span style="font-size:'+Math.round(size*(a.scale||0.4))+'px">'+a.emoji+'</span>';
  const rot = a.rot ? ' rotate('+a.rot+'deg)' : '';
  return '<span class="av-acc" style="left:'+a.x+'%;top:'+a.y+'%;transform:translate(-50%,-50%)'+rot+'">'+content+'</span>';
}
/* p: perfil {avatar, photo}; equipOv: equip a usar (por defecto el del jugador activo) */
/* Efectos de marco que dibujan un anillo giratorio (los demás usan box-shadow) */
const RING_FX = {sparkle:1, flame:1, rainbow:1, neon:1};
function avatarStack(p, size, equipOv){
  const eq = equipOv || ensureEquip();
  // el marco y el efecto de marco son excluyentes: si hay marco, se ignora el efecto
  const frame = eq.frame ? FRAMES.find(f=>f.id===eq.frame) : null;
  const effect = (!frame && eq.effect) ? EFFECTS.find(f=>f.id===eq.effect) : null;
  const bg = eq.bg ? BACKGROUNDS.find(b=>b.id===eq.bg) : null;
  const accIds = Array.isArray(eq.acc) ? eq.acc : (eq.acc?[eq.acc]:[]);
  const cls = ['av-stack']; if(effect && effect.cls) cls.push('fx-'+effect.cls);
  let inner = '<span class="av-bg" style="'+(bg?bgStyle(bg):'background:var(--surface2)')+'">'
    + (bg && bg.scene ? '<svg class="av-scene" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">'+bg.scene+'</svg>' : '')
    + '</span>'
    + '<span class="av-base">'+avatarBase(p, size)+'</span>';
  if(effect && RING_FX[effect.cls]) inner += '<span class="av-ring"></span>';
  if(frame) inner += '<span class="av-frame" style="'+frameStyle(frame, size)+'"></span>';
  accIds.forEach(id => { const a = ACCESSORIES.find(x=>x.id===id); if(a) inner += accHTML(a, size); });
  return '<span class="'+cls.join(' ')+'" style="width:'+size+'px;height:'+size+'px;font-size:'+size+'px">'+inner+'</span>';
}
/* Equipar / desequipar respetando las reglas (un marco/fondo/título/efecto/tema; varios accesorios) */
function equipReward(r){
  if(!isUnlockedReward(r.id)){ toast('🔒 Primero desbloquéala en la tienda'); sfx('bad'); return; }
  const eq = ensureEquip();
  if(r.type === 'acc'){
    const i = eq.acc.indexOf(r.id);
    if(i>=0){ eq.acc.splice(i,1); }
    else {
      // uno por ranura; y mano/sticker son excluyentes (se interponen)
      const conflict = ACC_SLOT_CONFLICT[r.slot];
      eq.acc = eq.acc.filter(id => { const s = accSlot(id); return s !== r.slot && s !== conflict; });
      eq.acc.push(r.id);
    }
  } else {
    eq[r.type] = (eq[r.type] === r.id) ? null : r.id;
    // el efecto del marco y el marco son excluyentes: al poner uno se quita el otro
    if(r.type === 'effect' && eq.effect) eq.frame = null;
    if(r.type === 'frame'  && eq.frame)  eq.effect = null;
  }
  save(); applyTheme(); renderHeader();
  const cur = document.querySelector('#view-profile:not(.hidden)');
  if(cur) renderProfile();
  const cs = document.querySelector('#view-shop:not(.hidden)');
  if(cs) renderShop();
  sfx('click');
}
function isEquipped(r){
  const eq = ensureEquip();
  return r.type==='acc' ? eq.acc.includes(r.id) : eq[r.type]===r.id;
}
/* Tarjeta de la tienda */
function rewardCardHTML(r){
  const unlocked = isUnlockedReward(r.id);
  const equipped = isEquipped(r);
  const pctv = r.xp != null ? Math.min(100, Math.round(S.xp/r.xp*100)) : 0;
  const rar = rarityOf(r);
  const secretLocked = r.secret && !unlocked;              // secreto no revelado
  const tag = equipped ? '<span class="rw-tag eq">✔ Equipado</span>' : unlocked ? '<span class="rw-tag owned">Tienes</span>' : '<span class="rw-tag lock">🔒</span>';
  const name = secretLocked ? '❓ Logro secreto' : esc(r.name);
  const ico  = secretLocked ? '❔' : r.ico;
  return '<div class="reward-card'+(unlocked?' unlocked':'')+(equipped?' equipped':'')+'" style="--rar:'+rar.color+'">'+tag
    + '<span class="rw-rar" style="color:'+rar.color+'">'+rar.name+'</span>'
    + '<div class="rw-ico">'+ico+'</div>'
    + '<div class="rw-name">'+name+'</div>'
    + (unlocked
        ? '<button class="btn small'+(equipped?'':' ghost')+'" data-eq="'+r.id+'">'+(equipped?(r.type==='acc'?'✔ Quitar':'✔ Equipado'):'Equipar')+'</button>'
        : (r.test
            ? '<div class="rw-lock"><small>'+(r.secret ? '🕵️ '+esc(r.hint||'Descúbrelo jugando') : '🎯 '+esc(r.cond||'Logro especial'))+'</small></div>'
            : '<div class="rw-lock"><span class="pbar"><i style="width:'+pctv+'%"></i></span><small>'+S.xp.toLocaleString()+' / '+r.xp.toLocaleString()+' XP</small></div>'))
    + '</div>';
}
function avatarReqLevel(a){
  const r = LEVEL_REWARDS.find(x => x.avatars && x.avatars.includes(a));
  return r ? r.lvl : 1;
}
function avatarUnlocked(a){ return levelInfo().lvl >= avatarReqLevel(a); }
function renderLevels(){
  const li = levelInfo();
  let html = '<div class="result-card" style="margin-top:0;max-width:640px">'
    + '<div class="big-ico">⬆️</div><h2>Nivel '+li.lvl+'</h2>'
    + '<div class="r-sub">'+titleIco()+' '+esc(currentTitle())+'</div>'
    + '<div class="qprog" style="max-width:340px;margin:16px auto 8px"><i style="width:'+Math.round(li.frac*100)+'%"></i></div>'
    + '<p style="font-size:.9rem;color:var(--ink2)"><b>'+S.xp+' XP</b> acumulados · faltan <b>'+li.toNext+' XP</b> para el nivel '+(li.lvl+1)+'</p>'
    + '<p class="q-help">Gana XP con los módulos, el examen diario, el memorama, el escape room y los retos contrarreloj.</p></div>';
  html += '<div class="panel" style="max-width:640px;margin:16px auto"><h3>🗺️ Ruta de recompensas</h3>'
    + LEVEL_REWARDS.map(r => {
        const un = li.lvl >= r.lvl;
        const parts = [];
        if(r.title) parts.push('🏷️ Título: <b>'+r.title+'</b>');
        if(r.avatars) parts.push('😀 Avatares: '+r.avatars.join(' '));
        if(r.custom) parts.push('🧑‍🎨 '+r.custom+' <i style="color:var(--muted)">(beta)</i>');
        return '<div class="lvl-row'+(un?' done':'')+((li.lvl+1)===r.lvl?' next':'')+'">'
          + '<span class="lvl-badge">'+r.lvl+'</span>'
          + '<span class="lvl-info">'+parts.join('<br>')+'<small>Se alcanza con '+xpForLvl(r.lvl).toLocaleString()+' XP</small></span>'
          + '<span class="lvl-state">'+(un?'✔':'🔒')+'</span></div>';
      }).join('')
    + '</div>';
  $('#levelsBody').innerHTML = html;
}

/* ==================== Perfil y configuración ==================== */
/* Rejilla para equipar recompensas ya desbloqueadas de un tipo (+ opción "Ninguno").
   Los accesorios se agrupan por ranura (una pieza por ranura). */
function equipItemHTML(r){
  const on = isEquipped(r);
  return '<div class="equip-item'+(on?' on':'')+'" data-eqid="'+r.id+'"><span class="ei-ico">'+r.ico+'</span><span class="ei-name">'+esc(r.name)+'</span>'
    + (on?'<span class="ei-on">✓</span>':'')+'</div>';
}
function equipGridHTML(type){
  const owned = REWARDS.filter(r => r.type===type && isUnlockedReward(r.id));
  const eq = ensureEquip();
  if(!owned.length) return '<p class="q-help">Aún no tienes '+REWARD_TYPE_LABEL[type].toLowerCase()+'. Consíguelos en la 🛒 Tienda.</p>';
  if(type === 'acc'){
    // agrupado por ranura, con "Quitar" por ranura
    const slots = [...new Set(owned.map(r=>r.slot))];
    return slots.map(slot => {
      const list = owned.filter(r=>r.slot===slot);
      const none = !eq.acc.some(id=>accSlot(id)===slot);
      return '<div style="margin-bottom:6px"><div class="eq-slot-label">'+(ACC_SLOT_NAMES[slot]||slot)+'</div>'
        + '<div class="equip-grid"><div class="equip-item'+(none?' on':'')+'" data-eqnoneslot="'+slot+'"><span class="ei-ico">🚫</span><span class="ei-name">Ninguno</span></div>'
        + list.map(equipItemHTML).join('')+'</div></div>';
    }).join('');
  }
  const none = !eq[type];
  return '<div class="equip-grid"><div class="equip-item'+(none?' on':'')+'" data-eqnone="'+type+'"><span class="ei-ico">🚫</span><span class="ei-name">Ninguno</span></div>'
    + owned.map(equipItemHTML).join('')+'</div>';
}
/* Editor de avatar en formato "vestidor": dos columnas responsive.
   Izquierda (sticky): vista previa en vivo del avatar + identidad + modo
   (emoji/foto/3D) + controles del modo. Derecha (scroll): secciones para
   equipar marco / fondo / accesorios / efectos. Así los cambios se ven al
   instante sin bajar y subir. Todo el vestidor es colapsable/minimizable. */
function avatarEditorBody(p){
  const mode = avatarMode(p);
  if(mode === 'emoji'){
    return '<div class="avatar-pick">'+AVATARS.map(a => {
        const un = avatarUnlocked(a);
        return '<button class="av'+(a===p.avatar?' on':'')+(un?'':' locked')+'" data-av="'+a+'"'
          + (un ? '' : ' title="Se desbloquea en el nivel '+avatarReqLevel(a)+'"')+'>'+(un?a:'🔒')+'</button>';
      }).join('')+'</div>';
  } else if(mode === 'photo'){
    return '<div class="q-actions" style="justify-content:center;flex-wrap:wrap;align-items:center">'
      + '<button class="btn ghost small" id="btnPhotoUp">📤 '+(p.photo?'Cambiar foto':'Subir foto')+'</button>'
      + (p.photo ? '<button class="btn ghost small" id="btnPhotoDel">🗑️ Quitar foto</button>' : '')
      + '<input type="file" id="photoFile" accept="image/*" class="hidden"></div>'
      + (p.photo ? '' : '<p class="q-help">Elige una imagen; se recorta en círculo. El marco y los accesorios se le aplican encima.</p>');
  }
  const c = Object.assign(defaultCustom(), p.custom||{});
  return '<div class="builder">'
    + AV_KEYS.map(k => '<div class="builder-row"><span class="b-name">'+BUILDER_LABELS[k]+'</span>'
        + '<button class="bnav" data-bk="'+k+'" data-bd="-1">‹</button>'
        + '<span class="b-val" id="bv-'+k+'">'+builderLabel(k,c)+'</span>'
        + '<button class="bnav" data-bk="'+k+'" data-bd="1">›</button></div>').join('')
    + '</div><p class="q-help">Personaliza tu avatar 3D. Pronto habrá más piezas (cuerpo completo).</p>';
}
function avatarEditorHTML(p, fb){
  const mode = avatarMode(p);
  const seg = (m,label) => '<button class="av-mode'+(mode===m?' on':'')+'" data-avmode="'+m+'">'+label+'</button>';
  // — Columna izquierda: vista previa sticky —
  const preview = '<div class="dresser-preview">'
    + '<div class="dp-av">'+avatarStack(p, 132)+'</div>'
    + '<div class="dp-id"><b>'+esc(p.name)+'</b>'+(fb ? ' <span title="'+esc(fb.name)+'">'+fb.ico+'</span>' : '')
      + '<br><small>'+titleIco()+' '+esc(currentTitle())+'</small></div>'
    + '<div class="tag-list dp-tags">'
      + '<span class="tag neutral">'+subjectById(S.activeSubject).icon+' '+esc(subjectById(S.activeSubject).short)+'</span>'
      + '<span class="tag neutral">🔥 '+S.streak+'</span>'
      + '<span class="tag neutral">⚡ Nv '+levelInfo().lvl+'</span></div>'
    + '<div class="av-modes">'+seg('emoji','😀 Emoji')+seg('photo','📷 Foto')+seg('custom','🧑 3D')+'</div>'
    + '<div id="avEditorBody">'+avatarEditorBody(p)+'</div>'
    + '</div>';
  // — Columna derecha: secciones para equipar (colapsables) —
  const dsec = (title, type, open, note) => '<details class="dsec'+(open?' ':'')+'"'+(open?' open':'')+'><summary>'+title
    + (note?' <small>'+note+'</small>':'')+'</summary><div class="dsec-body">'+equipGridHTML(type)+'</div></details>';
  const dress = '<div class="dresser-dress">'
    + '<p class="q-help" style="margin:0 0 10px">Equipa lo que desbloqueaste en la 🛒 Tienda y velo al instante en tu avatar de la izquierda. Un accesorio por ranura.</p>'
    + dsec('🖼️ Marco','frame',true)
    + dsec('🌆 Fondo','bg',true)
    + dsec('🎭 Accesorios','acc',true)
    + dsec('🏷️ Título','title',false,'(aparece bajo tu nombre)')
    + dsec('✨ Efecto del marco','effect',false,'(reemplaza al marco)')
    + dsec('🎉 Efecto al acertar','hitfx',false)
    + '</div>';
  return '<details class="dresser-wrap" open><summary>🎨 Personalizar mi avatar<span class="dw-hint">— clic para minimizar</span></summary>'
    + '<div class="dresser">'+preview+dress+'</div></details>';
}
function bindAvatarEditor(p){
  $$('#profileBody [data-avmode]').forEach(b => b.addEventListener('click', () => {
    const m = b.dataset.avmode;
    p.avatarMode = m;
    if(m==='custom' && !p.custom) p.custom = defaultCustom();
    saveProfiles(); renderHeader(); renderProfile(); sfx('flip');
  }));
  $$('#profileBody .avatar-pick .av').forEach(b => b.addEventListener('click', () => {
    if(b.classList.contains('locked')){ toast('🔒 Ese avatar se desbloquea en el nivel '+avatarReqLevel(b.dataset.av)); sfx('bad'); return; }
    p.avatar = b.dataset.av; p.avatarMode = 'emoji'; saveProfiles(); renderHeader(); renderProfile(); sfx('flip');
  }));
  const pu = $('#btnPhotoUp'); if(pu) pu.addEventListener('click', () => $('#photoFile').click());
  const pf = $('#photoFile'); if(pf) pf.addEventListener('change', e => { if(e.target.files[0]) setPhotoFromFile(e.target.files[0]); e.target.value=''; });
  const pd = $('#btnPhotoDel'); if(pd) pd.addEventListener('click', () => { p.photo = null; if(p.avatarMode==='photo') p.avatarMode='emoji'; saveProfiles(); renderHeader(); renderProfile(); toast('🗑️ Foto quitada'); sfx('click'); });
  $$('#profileBody .bnav').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.bk, d = +b.dataset.bd;
    const c = p.custom = Object.assign(defaultCustom(), p.custom||{});
    c[k] = ((c[k]||0) + d + AV_SIZES[k]) % AV_SIZES[k];
    p.avatarMode = 'custom';
    saveProfiles(); renderHeader(); renderProfile(); sfx('flip');
  }));
}
/* Delegación: equipar desde el vestidor del perfil con un solo listener
   (el contenido de #profileBody se re-renderiza; el contenedor persiste). */
$('#profileBody').addEventListener('click', e => {
  const eqEl = e.target.closest('[data-eqid]');
  if(eqEl){ const r = rewardById(eqEl.dataset.eqid); if(r) equipReward(r); return; }
  const noneEl = e.target.closest('[data-eqnone]');
  if(noneEl){
    const t = noneEl.dataset.eqnone; const eq = ensureEquip();
    if(t==='acc') eq.acc = []; else eq[t] = null;
    save(); applyTheme(); renderHeader(); renderProfile(); sfx('click');
    return;
  }
  const slotEl = e.target.closest('[data-eqnoneslot]');
  if(slotEl){
    const eq = ensureEquip();
    eq.acc = eq.acc.filter(id => accSlot(id) !== slotEl.dataset.eqnoneslot);
    save(); renderHeader(); renderProfile(); sfx('click');
  }
});
function renderProfile(){
  const p = activeProfile();
  const toggleRow = (id, label, on) =>
    '<label class="fld row"><span>'+label+'</span><input type="checkbox" id="'+id+'"'+(on?' checked':'')+'></label>';
  ensureEquip();
  let html = '<div class="dash-grid">';
  // — Tarjeta de perfil / vestidor (avatar + equipar en dos columnas) —
  const fb = S.equip.badge ? BADGES.find(b=>b.id===S.equip.badge) : null;
  html += '<div class="panel panel-dresser"><h3>👤 Mi perfil</h3>'
    + avatarEditorHTML(p, fb)
    + '<label class="fld" style="margin-top:14px">Nombre completo<input class="ainput" id="pfName" maxlength="40" value="'+esc(p.name)+'"></label>'
    + '<button class="btn small" id="pfSave" style="margin-top:8px">💾 Guardar datos</button>'
    + '<p class="q-help">Perfil creado el '+new Date(p.created).toLocaleDateString('es-MX')+' · '+S.xp+' XP · '+S.badges.length+'/'+BADGES.length+' insignias</p></div>';
  // — Apariencia y estudio —
  html += '<div class="panel"><h3>🎨 Apariencia</h3>'
    + '<label class="fld">🌗 Tema<select class="ainput" id="prefTheme">'
    + '<option value="">🖥️ Según el sistema</option><option value="light">☀️ Claro</option><option value="dark">🌙 Oscuro</option>'
    + '</select></label>'
    + '<label class="fld">🎨 Color principal<select class="ainput" id="prefAccent">'
    + '<option value="">🔵 Azul (predeterminado)</option><option value="#1baf7a">🟢 Verde</option><option value="#4a3aa7">🟣 Morado</option>'
    + '<option value="#e34948">🔴 Rojo</option><option value="#eb6834">🟠 Naranja</option><option value="#d55181">🌸 Rosa</option>'
    + '</select></label>'
    + '<label class="fld">📚 Materia activa<select class="ainput" id="prefSubject">'
    + SUBJECTS.map(s=>'<option value="'+s.id+'"'+(s.id===S.activeSubject?' selected':'')+'>'+esc(s.name)+'</option>').join('')
    + '</select></label>'
    + '<label class="fld">📅 Objetivo diario de XP<select class="ainput" id="prefGoal">'
    + [25,50,75,100,150].map(g=>'<option value="'+g+'">'+g+' XP al día</option>').join('')
    + '</select></label>'
    + toggleRow('prefConfetti','🎉 Confeti al aprobar', S.confetti !== false)
    + toggleRow('prefSteps','🧮 Mostrar el procedimiento también al acertar', !!S.stepsOnOk)
    + toggleRow('prefGuide','📖 Guía de estudio progresiva', S.guideProgressive !== false)
    + '</div>';
  // — Perfiles del dispositivo —
  html += '<div class="panel"><h3>👥 Perfiles en este dispositivo</h3>'
    + PROFILES.list.map(pr =>
      '<div class="profile-row'+(pr.id===PROFILES.active?' active':'')+'">'
      + '<span class="pr-av">'+(pr.photo?'<img src="'+pr.photo+'" style="width:26px;height:26px;border-radius:50%;object-fit:cover">':pr.avatar)+'</span><span class="pr-name">'+esc(pr.name)+'</span>'
      + (pr.id===PROFILES.active ? '<span class="tag dom">✔ Activo</span>'
        : '<button class="btn ghost small" data-use="'+pr.id+'">Usar</button>')
      + (PROFILES.list.length>1 ? '<button class="iconbtn" style="width:32px;height:32px;font-size:14px" title="Eliminar este perfil" aria-label="Eliminar este perfil" data-del="'+pr.id+'">🗑️</button>' : '')
      + '</div>').join('')
    + '<div class="answer-row"><input class="ainput" id="newProfName" placeholder="Nombre del nuevo perfil…" maxlength="24">'
    + '<button class="btn small" id="pfNew">＋ Crear</button></div>'
    + '<p class="q-help">Cada perfil guarda su propio progreso en tu cuenta del servidor: entra con tu usuario desde cualquier dispositivo y ahí estará.</p></div>';
  // — Congeladores de racha —
  html += '<div class="panel"><h3>🧊 Congeladores de racha</h3>'
    + '<p style="font-size:.9rem;color:var(--ink2)">Un congelador salva tu racha 🔥 si te saltas un día (se usa solo cuando hace falta). Tienes <b>'+(S.streakFreezes||0)+'</b>.</p>'
    + '<div class="q-actions" style="justify-content:flex-start;flex-wrap:wrap">'
    + (S.freezeMonth===cdmxMonth()
        ? '<button class="btn ghost" disabled>🧊 Congelador mensual ya reclamado</button>'
        : '<button class="btn" id="btnClaimFreeze">🧊 Reclamar congelador mensual</button>')
    + '</div>'
    + '<p class="q-help">Ganas +1 al reclamar el mensual y +1 cada vez que terminas un parcial de una materia (≥ 90% de sus módulos).</p></div>';
  // — Datos —
  html += '<div class="panel"><h3>Mis datos</h3>'
    + '<p style="font-size:.85rem;color:var(--ink2)">Tu progreso se guarda autom\u00e1ticamente en tu cuenta del servidor de AprendeUteca. No necesitas respaldos manuales: entra con tu usuario desde cualquier dispositivo y todo estar\u00e1 ah\u00ed.</p>'
    + '<hr style="border:none;border-top:1px solid var(--line);margin:16px 0">'
    + '<button class="btn danger small" id="btnReset">Reiniciar el progreso de este perfil</button></div>';
  html += '</div>';
  $('#profileBody').innerHTML = html;
  $('#prefTheme').value = S.theme || '';
  $('#prefAccent').value = S.accentColor || '';
  $('#prefGoal').value = String(S.xpGoal || 50);
  // — Eventos: editor de avatar (modo emoji/foto/3D) —
  bindAvatarEditor(p);
  // — Datos del perfil —
  $('#pfSave').addEventListener('click', () => {
    const nm = $('#pfName').value.trim();
    if(nm) p.name = nm;
    saveProfiles(); renderHeader(); renderProfile(); toast('💾 Perfil actualizado'); sfx('ok');
  });
  $$('#profileBody [data-use]').forEach(b => b.addEventListener('click', () => switchProfile(b.dataset.use)));
  $$('#profileBody [data-del]').forEach(b => b.addEventListener('click', () => deleteProfile(b.dataset.del)));
  $('#pfNew').addEventListener('click', () => {
    const nm = $('#newProfName').value.trim();
    if(!nm){ toast('Escribe un nombre para el nuevo perfil'); return; }
    createProfile(nm);
  });
  // — Apariencia / estudio —
  $('#prefTheme').addEventListener('change', e => { S.theme = e.target.value || null; save(); applyTheme(); sfx('click'); });
  $('#prefGoal').addEventListener('change', e => { S.xpGoal = +e.target.value || 50; if(S.dayXP) S.dayXP.goalHit = S.dayXP.xp >= S.xpGoal; save(); toast('📅 Objetivo diario: '+S.xpGoal+' XP'); sfx('click'); });
  $('#prefAccent').addEventListener('change', e => { S.accentColor = e.target.value || null; save(); applyTheme(); sfx('click'); });
  $('#prefSubject').addEventListener('change', e => { const id = e.target.value; if(id!==S.activeSubject) switchSubject(id); });
  $('#prefConfetti').addEventListener('change', e => { S.confetti = e.target.checked; save(); if(S.confetti) confetti(25); });
  $('#prefSteps').addEventListener('change', e => { S.stepsOnOk = e.target.checked; save(); sfx('click'); });
  $('#prefGuide').addEventListener('change', e => { S.guideProgressive = e.target.checked; save(); sfx('click');
    toast(S.guideProgressive ? '📖 La guía se desbloqueará conforme avances' : '📖 Guía completa visible'); });
  const cf = $('#btnClaimFreeze');
  if(cf) cf.addEventListener('click', () => {
    if(claimMonthlyFreeze()){ toast('🧊 +1 congelador mensual. Ahora tienes '+S.streakFreezes+'.'); sfx('unlock'); renderProfile(); renderHeader(); }
    else { toast('🧊 Ya reclamaste el congelador de este mes.'); sfx('bad'); }
  });
  $('#btnReset').addEventListener('click', () => {
    if(!confirm('Esto borrará TODO el progreso del perfil "'+p.name+'" (XP, módulos, exámenes, insignias). ¿Continuar?')) return;
    if(!confirm('Última confirmación: el borrado no se puede deshacer. ¿Reiniciar?')) return;
    S = DEFAULT_STATE(); MODULES = MODULES_BY_SUBJECT[S.activeSubject] || [];
    save(); applyTheme(); renderHeader(); renderProfile(); toast('🗑️ Progreso reiniciado'); sfx('bad');
  });
}
function switchProfile(id){
  PROFILES.active = id; saveProfiles();
  reloadActiveState();
  applyTheme(); renderHeader(); renderProfile();
  toast('👤 Perfil activo: '+esc(activeProfile().name)); sfx('unlock');
}
function createProfile(name){
  const id = 'p' + Date.now().toString(36) + ri(10,99);
  PROFILES.list.push({id, name, avatar: pick(AVATARS), created: Date.now()});
  PROFILES.active = id; saveProfiles();
  reloadActiveState();
  save(); applyTheme(); renderHeader(); renderProfile();
  toast('👤 Perfil "'+esc(name)+'" creado y activo'); sfx('unlock');
}
function deleteProfile(id){
  const pr = PROFILES.list.find(x => x.id === id);
  if(!pr || PROFILES.list.length < 2) return;
  if(!confirm('¿Eliminar el perfil "'+pr.name+'" y todo su progreso? No se puede deshacer.')) return;
  Store.remove('actuariq_u_'+id);
  PROFILES.list = PROFILES.list.filter(x => x.id !== id);
  if(PROFILES.active === id){ PROFILES.active = PROFILES.list[0].id; reloadActiveState(); applyTheme(); }
  saveProfiles(); renderHeader(); renderProfile(); toast('🗑️ Perfil eliminado'); sfx('bad');
}
/* Respaldo TOTAL: todos los perfiles y su progreso + leaderboard + tareas + logo. */
function exportData(){
  save();   // asegura que el estado del perfil activo esté persistido
  const states = {};
  (PROFILES.list||[]).forEach(pr => { states[pr.id] = Store.getJSON('actuariq_u_'+pr.id, {}); });
  states[PROFILES.active] = S;   // copia fresca del perfil activo
  downloadJSON('actuariq-respaldo-total-'+todayKey()+'.json', {
    app:'actuariq-backup', version:1, exported:new Date().toISOString(),
    profiles: PROFILES, states,
    leaderboard: Store.getJSON(LBKEY, null),
    shared: Store.getJSON(SHKEY, null),
    logo: Store.get(LOGOKEY) || null
  });
  toast('⬇️ Respaldo total exportado ('+(PROFILES.list||[]).length+' perfil'+((PROFILES.list||[]).length===1?'':'es')+')'); sfx('ok');
}
function importData(file){
  readJSONFile(file, '❌ El archivo no es un respaldo válido de AprendeUteca', payload => {
    // — Respaldo TOTAL (formato nuevo) —
    if(payload && payload.app==='actuariq-backup' && payload.profiles && payload.states){
      if(!(payload.profiles.list && payload.profiles.list.length)) throw new Error('formato');
      if(!confirm('Esto REEMPLAZARÁ todos los perfiles y su progreso en este dispositivo (más el leaderboard y las tareas) con los del respaldo. ¿Continuar?')) return;
      (PROFILES.list||[]).forEach(pr => { if(!payload.states[pr.id]) Store.remove('actuariq_u_'+pr.id); });  // limpia perfiles huérfanos
      Object.keys(payload.states).forEach(pid => Store.setJSON('actuariq_u_'+pid, payload.states[pid]));
      Store.setJSON(PKEY, payload.profiles); PROFILES = payload.profiles;
      if(!PROFILES.list.some(pr => pr.id===PROFILES.active)) PROFILES.active = PROFILES.list[0].id;
      if(payload.leaderboard) Store.setJSON(LBKEY, payload.leaderboard);
      if(payload.shared) Store.setJSON(SHKEY, payload.shared);
      if(payload.logo) Store.set(LOGOKEY, payload.logo);
      saveProfiles(); reloadActiveState(); applyTheme(); applyLogo(); renderHeader(); renderProfile();
      toast('⬆️ Respaldo total restaurado ('+Object.keys(payload.states).length+' perfiles)'); sfx('unlock');
      return;
    }
    // — Compatibilidad: respaldo por-perfil antiguo (app:'actuariq') —
    const data = (payload && payload.app === 'actuariq' && payload.data) ? payload.data
      : (payload && typeof payload.xp === 'number' ? payload : null);
    if(!data) throw new Error('formato');
    if(!confirm('Esto reemplazará el progreso del perfil actual ("'+activeProfile().name+'") con el del archivo. ¿Continuar?')) return;
    S = Object.assign(DEFAULT_STATE(), data);
    if(!S.subjectData) S.subjectData = {};
    if(!SUBJECTS.some(x => x.id === S.activeSubject)) S.activeSubject = 'ca3';
    if(S.subjXP === undefined || S.subjXP === null) S.subjXP = S.xp;
    if(!S.taskDone) S.taskDone = {};
    MODULES = MODULES_BY_SUBJECT[S.activeSubject] || [];
    if(payload.profile){
      const p = activeProfile();
      if(payload.profile.name) p.name = payload.profile.name;
      if(payload.profile.avatar) p.avatar = payload.profile.avatar;
      ['photo','avatarMode','custom'].forEach(k => { if(payload.profile[k] !== undefined) p[k] = payload.profile[k]; });
      saveProfiles();
    }
    save(); applyTheme(); renderHeader(); renderProfile();
    toast('⬆️ Datos importados correctamente'); sfx('unlock');
  });
}
$('#btnProfile').addEventListener('click', ()=>{ sfx('click'); renderProfile(); showView('profile'); });

/* ==================== Tienda y colección ==================== */
let shopTab = 'tienda';
function renderShop(){
  $$('#shopTabs [data-shtab]').forEach(b => b.classList.toggle('ghost', b.dataset.shtab !== shopTab));
  const nr = nextReward();
  let html = '';
  if(shopTab === 'tienda'){
    html += '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'
      + '<h3 style="margin:0">🛒 Tienda</h3><span class="tag neutral">⚡ '+S.xp.toLocaleString()+' XP acumulados</span></div>'
      + '<p class="q-help">Las recompensas se desbloquean al alcanzar su XP (tu XP no se gasta). Las de logro tienen su propio reto. Toca “Equipar” para lucirlas; en 🎒 Mi colección las tienes ordenadas por tipo.</p>'
      + (nr ? '<p style="font-size:.85rem;font-weight:700;color:var(--ink2)">⏭️ Próxima: '+nr.ico+' '+esc(nr.name)+' · '+S.xp.toLocaleString()+' / '+nr.xp.toLocaleString()+' XP</p>' : '<p style="font-size:.85rem;font-weight:700;color:var(--good-text)">🏆 ¡Desbloqueaste toda la tienda!</p>')
      + '</div>';
    html += REWARD_TYPES.map(type => {
      const items = REWARDS.filter(r => r.type===type);
      return '<div class="panel"><h3>'+REWARD_TYPE_LABEL[type]+'</h3><div class="reward-grid">'
        + items.map(rewardCardHTML).join('') + '</div></div>';
    }).join('');
  } else {
    const owned = REWARDS.filter(r => isUnlockedReward(r.id));
    const locked = REWARDS.filter(r => !isUnlockedReward(r.id));
    const equipped = REWARDS.filter(isEquipped);
    html += '<div class="panel"><h3>🎒 Mi colección</h3>'
      + '<div class="tag-list" style="margin-bottom:8px">'
      + '<span class="tag dom">✅ '+owned.length+' desbloqueadas</span>'
      + '<span class="tag neutral">🎯 '+equipped.length+' equipadas</span>'
      + '<span class="tag ref">🔒 '+locked.length+' por conseguir</span></div>'
      + '<p class="q-help">Vista general de todo lo tuyo. Toca “Equipar” para lucirlo.</p></div>';
    // secciones desplegables por tipo, para que la lista no se haga enorme
    const secHTML = (title, list, empty, open) => '<details class="panel coll-sec"'+(open?' open':'')+'><summary><b>'+title+' ('+list.length+')</b></summary>'
      + (list.length ? '<div class="reward-grid" style="margin-top:10px">'+list.map(rewardCardHTML).join('')+'</div>' : '<p class="q-help">'+empty+'</p>')+'</details>';
    html += secHTML('🎯 Equipadas', equipped, 'Aún no equipas nada.', true);
    REWARD_TYPES.forEach(type => {
      const own = owned.filter(r=>r.type===type);
      if(own.length) html += secHTML(REWARD_TYPE_LABEL[type]+' desbloqueados', own, '', false);
    });
    // insignia destacada (se muestra junto a tu nombre en perfil, header y leaderboard)
    const myBadges = BADGES.filter(b=>S.badges.includes(b.id));
    html += '<details class="panel coll-sec"><summary><b>🎖️ Insignia destacada'+(S.equip.badge?' · '+(BADGES.find(b=>b.id===S.equip.badge)||{}).ico:'')+'</b></summary>'
      + '<p class="q-help" style="margin-top:8px">La insignia destacada aparece junto a tu nombre en el perfil, el encabezado y el leaderboard.</p>'
      + '<div class="equip-grid"><div class="equip-item'+(!S.equip.badge?' on':'')+'" data-badge=""><span class="ei-ico">🚫</span><span class="ei-name">Ninguna</span></div>'
      + (myBadges.length ? myBadges.map(b=>'<div class="equip-item'+(S.equip.badge===b.id?' on':'')+'" data-badge="'+b.id+'"><span class="ei-ico">'+b.ico+'</span><span class="ei-name">'+esc(b.name)+'</span>'+(S.equip.badge===b.id?'<span class="ei-on">✓</span>':'')+'</div>').join('') : '')
      + '</div>'
      + (myBadges.length ? '' : '<p class="q-help">Gana insignias para poder destacarlas.</p>')
      + '</details>';
    html += secHTML('🔒 Bloqueadas', locked, '¡Ya tienes todo! 🏆', false);
  }
  $('#shopBody').innerHTML = html;
}
/* Delegación: un solo listener para todas las tarjetas/las insignias de la tienda
   (el contenido de #shopBody se re-renderiza; el contenedor persiste). */
$('#shopBody').addEventListener('click', e => {
  const eqBtn = e.target.closest('[data-eq]');
  if(eqBtn){ const r = rewardById(eqBtn.dataset.eq); if(r) equipReward(r); return; }
  const badgeEl = e.target.closest('[data-badge]');
  if(badgeEl){ S.equip.badge = badgeEl.dataset.badge || null; save(); renderHeader(); renderShop(); sfx('click'); }
});
$('#btnShop').addEventListener('click', () => { sfx('click'); shopTab='tienda'; renderShop(); showView('shop'); });
$$('#shopTabs [data-shtab]').forEach(b => b.addEventListener('click', () => { sfx('click'); shopTab = b.dataset.shtab; renderShop(); }));
$('#btnModes').addEventListener('click', () => { sfx('click'); renderModes(); showView('modes'); });

/* ==================== Logo personalizable (nivel dispositivo) ==================== */
const LOGOKEY = 'actuariq_logo_v1';
function getLogo(){ return Store.get(LOGOKEY); }
function applyLogo(){
  const d = getLogo();
  const mark = $('.logo .mark');
  if(!mark) return;
  if(d) mark.innerHTML = '<img src="'+d+'" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:10px">';
  else mark.innerHTML = '<img src="assets/uteca-icon-270.png" alt="UTECA" style="width:100%;height:100%;object-fit:contain">';
}
/* Lee un archivo de imagen, lo recorta al cuadrado central, lo reescala a
   size×size y entrega el dataURL a onReady. Errores → toast + sonido. */
function imageFileToDataURL(file, size, mime, quality, onReady){
  if(!file || !file.type.startsWith('image/')){ toast('❌ Elige un archivo de imagen'); sfx('bad'); return; }
  const rd = new FileReader();
  rd.onload = () => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas'); cv.width = cv.height = size;
      const side = Math.min(img.width, img.height);
      cv.getContext('2d').drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 0, 0, size, size);
      let data;
      try{ data = cv.toDataURL(mime, quality); }
      catch(e){ toast('❌ No se pudo procesar la imagen'); sfx('bad'); return; }
      onReady(data);
    };
    img.onerror = () => { toast('❌ No se pudo leer la imagen'); sfx('bad'); };
    img.src = rd.result;
  };
  rd.readAsDataURL(file);
}
function setLogoFromFile(file){
  // 128×128 para que quepa cómodo en localStorage
  imageFileToDataURL(file, 128, 'image/png', undefined, data => {
    if(!Store.set(LOGOKEY, data)){ toast('❌ No se pudo guardar el logo (imagen demasiado grande)'); sfx('bad'); return; }
    applyLogo(); renderProfile(); toast('🖼️ Logo actualizado en este dispositivo'); sfx('ok');
  });
}
/* Foto de perfil del usuario (por perfil, no por dispositivo) */
function setPhotoFromFile(file){
  imageFileToDataURL(file, 160, 'image/jpeg', 0.82, data => {
    const p = activeProfile(); p.photo = data; p.avatarMode = 'photo'; saveProfiles();
    renderHeader(); renderProfile(); toast('📷 Foto de perfil actualizada'); sfx('ok');
  });
}

/* ==================== Bienvenida (primer uso) ==================== */
function showOnboarding(){
  let chosen = activeProfile().avatar;
  let chosenColor = S.accentColor || '';
  const COLORS = [
    {v:'',        c:'#ff026f', n:'Rosa UTECA'}, {v:'#1baf7a', c:'#1baf7a', n:'Verde'},
    {v:'#4a3aa7', c:'#4a3aa7', n:'Morado'}, {v:'#e34948', c:'#e34948', n:'Rojo'},
    {v:'#eb6834', c:'#eb6834', n:'Naranja'},{v:'#d55181', c:'#d55181', n:'Rosa'}
  ];
  const o = openModal('<div style="text-align:center"><div id="obPreview" style="display:flex;justify-content:center;margin-bottom:4px">'+avatarStack(activeProfile(), 68, {})+'</div>'
    + '<h2 style="margin:.2em 0 .1em">¡Bienvenido a AprendeUteca!</h2>'
    + '<p style="color:var(--ink2);font-size:.88rem;margin-top:0">Tu plataforma de estudio del cuatrimestre. Personalízala en 20 segundos:</p></div>'
    + '<label class="fld">🙋 Tu nombre completo<input class="ainput" id="obName" placeholder="Nombre y apellido…" maxlength="30"></label>'
    + '<div class="fld">😀 Tu avatar (desbloquearás más al subir de nivel)'
    + '<div class="avatar-pick" id="obAv" style="justify-content:flex-start">'
    + AVATARS.slice(0,4).map(a=>'<button class="av'+(a===chosen?' on':'')+'" data-av="'+a+'">'+a+'</button>').join('')+'</div></div>'
    + '<label class="fld">📚 ¿Qué materia quieres estudiar primero?<select class="ainput" id="obSubj">'
    + SUBJECTS.map(s=>'<option value="'+s.id+'"'+(s.id===S.activeSubject?' selected':'')+'>'+esc(s.name)+(s.soon?' · en preparación':'')+'</option>').join('')
    + '</select></label>'
    + '<label class="fld">🎯 Tu meta diaria de XP<select class="ainput" id="obGoal">'
    + [25,50,75,100].map(g=>'<option value="'+g+'"'+(g===50?' selected':'')+'>'+g+' XP al día'+(g===50?' (recomendado)':'')+'</option>').join('')
    + '</select></label>'
    + '<div class="fld">🎨 Tu color favorito<div class="color-swatches" id="obColors">'
    + COLORS.map(c=>'<button class="sw'+(c.v===chosenColor?' on':'')+'" data-c="'+esc(c.v)+'" title="'+c.n+'" aria-label="'+c.n+'" style="background:'+c.c+'"></button>').join('')
    + '</div></div>'
    + '<p class="q-help">Tu progreso, XP, insignias y recompensas se guardan en tu cuenta: entra con tu usuario desde cualquier dispositivo.</p>'
    + '<div class="q-actions" style="justify-content:center"><button class="btn" id="obGo" style="font-size:1.02rem;padding:12px 34px">🚀 ¡Comenzar!</button></div>');
  o.querySelectorAll('#obAv .av').forEach(b => b.addEventListener('click', () => {
    chosen = b.dataset.av;
    o.querySelectorAll('#obAv .av').forEach(x => x.classList.toggle('on', x === b));
    o.querySelector('#obPreview').innerHTML = avatarStack({avatar:chosen}, 68, {});
    sfx('flip');
  }));
  o.querySelectorAll('#obColors .sw').forEach(b => b.addEventListener('click', () => {
    chosenColor = b.dataset.c;
    o.querySelectorAll('#obColors .sw').forEach(x => x.classList.toggle('on', x === b));
    S.accentColor = chosenColor || null; applyTheme();   // vista previa inmediata
    sfx('flip');
  }));
  const go = () => {
    const p = activeProfile();
    const nm = o.querySelector('#obName').value.trim();
    if(nm) p.name = nm;
    p.avatar = chosen;
    S.xpGoal = +o.querySelector('#obGoal').value || 50;
    S.accentColor = chosenColor || null;
    PROFILES.onboarded = true; saveProfiles();
    save(); applyTheme();
    const subjSel = o.querySelector('#obSubj').value;
    closeModal(); renderHeader();
    if(subjSel !== S.activeSubject) switchSubject(subjSel); else renderHome();
    toast('👤 ¡Perfil listo, '+esc(p.name)+'! Mucho éxito 🍀'); sfx('unlock');
  };
  o.querySelector('#obGo').addEventListener('click', go);
  o.querySelector('#obName').addEventListener('keydown', e => { if(e.key==='Enter') go(); });
}

/* ==================== Arranque ==================== */
applyTheme();
applyLogo();
renderHeader();
renderHome();
showView('home');
if(!PROFILES.onboarded) showOnboarding();
// sincroniza tareas y leaderboard publicados al arrancar (badge y datos frescos)
tasksMaybeFetch();
lbMaybeFetch();

/* PWA: la app queda instalable y funciona offline (requiere https o localhost) */
if('serviceWorker' in navigator){
  addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(()=>{}); });
}

