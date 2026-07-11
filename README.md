# 🛡️ ActuarIQ · Plataforma interactiva de Cálculo Actuarial

Aplicación web tipo **videojuego educativo / escape room académico** para aprender,
recordar y practicar Cálculo Actuarial. Todo vive en **un solo archivo**
(`index.html`): sin dependencias, sin servidor, funciona offline.

## 🚀 Cómo usarla

1. Descarga o clona el repositorio.
2. Abre `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
3. ¡Listo! Tu progreso se guarda automáticamente en el navegador (localStorage).

> 💡 También puede publicarse gratis con GitHub Pages: *Settings → Pages →
> Deploy from branch* y quedará disponible como página web.

## 📚 Materias del cuatrimestre

La app es **multi-materia**: cada materia guarda su propio avance, exámenes y
estadísticas, mientras que XP, nivel, racha, insignias y recompensas son
globales. Cambia de materia desde el chip del encabezado.

| Materia | Estado |
|---------|--------|
| 🛡️ Cálculo Actuarial III | 12 módulos con contenido completo |
| 🎲 Procesos Estocásticos | 12 módulos (Parcial 1 y 2) + modo Repaso Examen |
| 📉 Modelos de Regresión | 9 módulos (regresión lineal simple) |
| 📊 Estadística No Paramétrica | 9 módulos + Laboratorio No Paramétrico |
| 💼 Administración Financiera | 8 módulos + juego Director Financiero |

### 💼 Administración Financiera

Clave interna `administracion-financiera`. Misma infraestructura que las demás
materias (progreso/estrellas/XP global, estadísticas por materia, examen
diario, blitz, flashcards, revisión, localStorage). 8 módulos fieles al
cuaderno:

1. Rentabilidad y apalancamiento (ROA, ROE=[r+(r−i)(D/C)](1−t), U_N).
2. Estructura óptima de capital (i(x)=a+bx², (D/C)*=√[(r−a)/(3b)]).
3. Políticas de crédito · Sartoris-Hill (VP con costo diario, incobrables).
4. Gallinger y riesgo de insolvencia (pₙ; λ=(L₀+μT)/(σ√T), P=1−Φ(λ)).
5. Inventarios y lote económico (Q*=√(2DC_o/C_m), PR=ΔT_e·C_d+I_s).
6. Descuentos por volumen (C_m=rP, comparación de costo total CTI).
7. FLE, CAPM, WACC, DuPont y crecimiento sostenible g=ROE·TR.
8. Valuación de empresas (Gordon en una etapa y modelo de dos etapas).

Incluye el juego **🏢 Director Financiero**: 5 decisiones encadenadas
(apalancamiento → liquidez → inventario → WACC → valuación) usando únicamente
las fórmulas de los módulos. Temas no desarrollados (VPN, TIR, bonos, opciones,
derivados, portafolios, Black-Scholes, valuación de más de dos etapas, etc.)
**no** se implementan. Su Repaso Examen ofrece el examen de práctica generado
por parcial (aún sin examen real del profesor). La Φ de la insolvencia reutiliza
el helper `npPhi` (sin duplicar).

**Casos de control verificados** (todos exactos, sin errores del pizarrón):
ROE=0.2485, U_N=497, x*=0.785281, i*=0.151667, ROE*=0.260296; VP=1756.48 y
1561.35; λ=1.9215, P=0.0273; Q*=95.11897 y 948.6833, C_T=474.3416, PR=546.9589.

### 📊 Estadística No Paramétrica

Clave interna `estadistica-no-parametrica`. Misma infraestructura que las demás
materias (progreso/estrellas/XP global, estadísticas por materia, examen
diario, blitz, flashcards, revisión, localStorage). 9 módulos fieles al
cuaderno:

1. Fundamentos (paramétrico vs. no paramétrico, tipos de dato, H₀/H₁, errores I/II).
2. Función empírica Fₙ(x)=(1/n)ΣI(Xᵢ≤x) y Glivenko-Cantelli.
3. Kolmogórov-Smirnov y Lilliefors (D=máx|Fₙ−F|, parámetros conocidos/estimados).
4. Bondad de ajuste χ²=Σ(Oᵢ−Eᵢ)²/Eᵢ, gl=k−p−1, ajuste exponencial.
5. Proporciones (z con p₀) y prueba binomial exacta.
6. Cuantiles y prueba de los signos (mediana, empates, X~Bin(n,0.5)).
7. McNemar (tabla 2×2 pareada, Yates o binomial exacta según B+C).
8. Cox-Stuart (tendencia temporal, T~Bin(C,0.5)).
9. Rangos: Spearman ρs=1−6Σdᵢ²/[n(n²−1)] y Mann-Whitney U=mín(U₁,U₂).

Incluye el modo **🧪 Laboratorio No Paramétrico**: dado un escenario, eliges
la prueba correcta entre las 11 vistas. No se agregan pruebas no desarrolladas
(Wilcoxon, Kruskal-Wallis, Friedman, Kendall, rachas, etc.). Su Repaso Examen
incluye el **📄 Examen real** del 2.º parcial (transcrito del examen del
profesor) además del examen de práctica generado por parcial.

**Casos de control verificados** (con dos correcciones documentadas por
truncamiento de tabla z en el cuaderno): KS D≈0.1338 / 0.175 / 0.1359;
χ²≈1.6667 (O=[8,4,5,7], λ̂≈0.02353, gl=2); z de proporción≈0.6667; binomial
P(X≥15)≈0.0207 (bilateral 0.0414); McNemar Yates≈12.9706; Cox-Stuart
(0.5)⁶=0.015625; Spearman ρs=−1 y −0.1879; Mann-Whitney U=0.

### 📉 Modelos de Regresión

Clave interna `modelos-regresion`. Misma infraestructura que las demás
materias (progreso/estrellas/XP global, estadísticas por materia, examen
diario, blitz, flashcards, revisión de respuestas, localStorage). 9 módulos
centrados en **regresión lineal simple**, fieles al cuaderno:

1. Introducción (descriptiva/inferencial/predictiva, X e Y, tipos de regresión).
2. Construcción del modelo (calidad de datos, dispersión, ajuste, sobreajuste).
3. Modelo lineal simple (Yᵢ=β₀+β₁Xᵢ+εᵢ, interpretación, supuestos).
4. Mínimos cuadrados (tabla auxiliar, Sxx, Sxy, β̂₁=Sxy/Sxx, β̂₀=Ȳ−β̂₁X̄).
5. Ajuste, predicción y residuos (Ŷ, eᵢ, Σeᵢ=0, interpolación/extrapolación).
6. Propiedades y distribución de estimadores (insesgado/eficiente/…, β̂₁~N(β₁,σ²/Sxx)).
7. σ² e inferencia (σ̂²=SCE/(n−2), IC y prueba t sobre la pendiente).
8. Respuesta media vs. predicción individual (el «+1» que ensancha el intervalo).
9. Variabilidad, ANOVA y R² (SCT=SCR+SCE, R²=SCR/SCT, IC para σ²).

Los ejercicios se generan con `regCompute(X,Y)` (una sola implementación
reutilizada) que devuelve todas las cantidades (medias, sumas, Sxx, β̂,
residuos, SCE/SCR/SCT, σ̂², R²) con solución paso a paso. Regresión múltiple,
logística, polinomial, Ridge/Lasso y diagnóstico avanzado **solo se
mencionan** (no generan ejercicios). Su **Repaso Examen** ofrece el examen de
práctica generado por parcial; cuando llegue el examen real del profesor, se
transcribe en `REAL_EXAMS_BY_SUBJECT` para que aparezca su **📄 Examen real**.

**Caso de control verificado** (X=25,21,15,22,15,16,28,30,23,15 · Y=126,110,
87,97,80,84,129,126,115,91): Sxx=284, β̂₁≈3.1690, β̂₀≈37.9507, Ŷ(25)≈117.176,
SCE≈378.387, SCT=3230.5, SCR≈2852.113, σ̂²≈47.298, R²≈0.8829, Σeᵢ=ΣeᵢXᵢ≈0.

### 🎲 Procesos Estocásticos

Materia con la misma infraestructura que Cálculo III (progreso, estrellas,
XP global, estadísticas por materia, examen diario, blitz, flashcards…). Sus
12 módulos siguen los apuntes del profesor:

- **Parcial 1:** fundamentos (Ω×T→S, trayectorias), tipos de proceso
  (i.i.d./Markov/incrementos), caminata aleatoria (E[Xₙ]=n(p−q),
  Var=4npq, posición), regreso al origen (pₙ vs. fₙ), cadenas de Markov,
  diagramas y matrices de transición (P², vₙ=v₀Pⁿ).
- **Parcial 2:** proceso de Poisson (P(N(t)=k)=e^(−λt)(λt)^k/k!),
  exponencial (P(X>t)=e^(−λt), despejes, E=1/λ), pérdida de memoria,
  Erlang/Gamma (Sₙ, n/λ, n/λ²) y propiedades integradoras
  (adelgazamiento λp, superposición, Binomial(n,s/t) condicional, compuesto).

Incluye el modo **🎓 Repaso Examen** (ver la sección dedicada abajo). En
Procesos, además del **📄 Examen real** del 2.º parcial, el repaso de módulos
añade la etapa «reconoce el modelo» y un caso final de varios incisos; los
ejercicios generados usan valores aleatorios válidos, distractores por errores
comunes y solución paso a paso.

## 🎓 Repaso Examen (todas las materias)

El **Repaso Examen** está disponible en **todas las materias con módulos**. Al
abrirlo eliges primero el **parcial** y luego la modalidad. Hay una diferencia
real entre dos tipos de examen:

- **📄 Examen real** — el examen **tal cual del profesor**, transcrito pregunta
  por pregunta (respuestas fijas, no aleatorias). Solo existe donde el alumno
  envió su examen: **Procesos Estocásticos · 2.º parcial** (Poisson,
  exponencial, Erlang/Gamma y propiedades) y **Estadística No Paramétrica ·
  2.º parcial** (signos, McNemar, Cox-Stuart, Spearman y Mann-Whitney). Se
  califica al final, como en el examen de verdad, con revisión y procedimiento.
- **📖 Repaso de módulos · Estudio** / **📝 Examen de práctica · Simulación** —
  preguntas **generadas** con los temas del parcial. Estudio da
  retroalimentación tras cada respuesta; Simulación revela todo al final. Están
  disponibles en **cualquier** materia; en las que aún no tienen examen real,
  este examen de práctica cubre el repaso con sus temas.

Los exámenes reales se registran en `REAL_EXAMS_BY_SUBJECT` (enganchados al
parcial por su índice en `SUBJECT_PARCIALES`); agregar uno nuevo es solo añadir
su lista de preguntas. Cuando llegue el examen del profesor de otra materia,
basta con transcribirlo ahí para que aparezca su **📄 Examen real**.

## 📋 Tareas y calendario de exámenes

- **Tareas** por materia y parcial, con prioridad, fecha límite, pasos,
  materiales y notas. Cada alumno marca las que ya realizó; el encabezado
  muestra un **badge con las pendientes**.
- **Calendario** de exámenes (P1/P2/P3/Final por materia) con cuenta
  regresiva, próximos exámenes ordenados y tu preparación por materia.
- **Panel de administrador** (perfil "Oliver" + contraseña) para crear,
  editar, archivar y eliminar tareas, capturar fechas de examen y
  exportar/importar todo en JSON.

## 📚 Los 12 módulos de Cálculo Actuarial III

| # | Módulo | Tipo |
|---|--------|------|
| 1 | Conceptos básicos de seguros | Quiz mixto (opción múltiple, V/F, relacionar, arrastrar, completar) |
| 2 | Cálculos básicos (frecuencia, severidad, prima de riesgo, costo esperado, siniestralidad) | Ejercicios generados al azar, ilimitados |
| 3 | Copago | Escenarios médicos aleatorios |
| 4 | Coaseguro | Siniestro + deducible + coaseguro + límite de cobertura |
| 5 | Deducible | Problemas completos (pago del cliente y de la aseguradora) |
| 6 | Inflación | Mini lección + V/F, relacionar, casos y cálculos |
| 7 | Devaluación | Mini lección + identificación de fenómenos y tipo de cambio |
| 8 | Depreciación | Mini lección + línea recta, valor en libros y autos |
| 9 | Memorama de conceptos | Juego de memoria (16 cartas) |
| 10 | Completar fórmulas | Entrada libre con validación flexible (acepta sinónimos y formatos) |
| 11 | Escape Room actuarial | Historia, 4 acertijos, 4 llaves, 4 códigos y caja fuerte |
| 12 | Casos reales | Caso integrador (flotilla de autos o gastos médicos) con interpretación |

Cada módulo se **desbloquea al obtener ≥ 80 %** en el anterior. Los datos de los
ejercicios numéricos **cambian en cada intento**.

## 🎮 Mecánicas de juego

- **XP y niveles** con barra de experiencia en el encabezado.
- **Estrellas por módulo**: ★ 80 %, ★★ 90 %, ★★★ 100 %.
- **23 insignias** (Perfeccionista, Escapista, rachas de 3/7/15/30 días,
  preguntas respondidas, racha de rayo…).
- **Icono de racha 🔥 = hub de retos y logros**: el chip 🔥 del encabezado abre
  un panel con tres pestañas y un punto rojo cuando tienes recompensas listas:
  - **📅 Retos diarios**: estudia hoy, responde 15 preguntas, gana 80 XP,
    presenta el examen diario. Se renuevan a medianoche (CDMX).
  - **🗓️ Retos semanales**: estudia 5 días, responde 120 preguntas, gana 500 XP,
    acumula 60 min. Se renuevan cada semana ISO.
  - **🎖️ Logros**: todas las insignias (antes vivían en Estadísticas) más el
    conteo de logros secretos.
  Cada reto completado se **reclama** por su XP una sola vez. El progreso se
  mide por deltas contra una línea base diaria/semanal, así que no depende de
  enganchar cada pregunta.
- **Racha diaria** 🔥 de días de estudio, con congeladores y recordatorio visual.
- **Examen diario** 📝: 12 preguntas mixtas de los **módulos** de la materia, un
  solo intento por día, con calificación, revisión e historial. (Es un repaso de
  módulos; el examen del profesor vive aparte, en 🎓 Repaso Examen → 📄 Examen
  real.)
- **Reto contrarreloj** ⚡: inicia con 60 s y cada acierto suma **+5 s**
  (máx. 90 s); cada falla resta cada vez más tiempo (−5, −10, −15…), con
  contador de racha y bonus de XP. Banco de preguntas amplio y sin repetición.
- **Muerte súbita** 💀: preguntas sin límite de tiempo, un error y se acaba.
- **Repaso mixto** 🎯: 10 preguntas variadas de los módulos desbloqueados,
  sin presión de tiempo (no afecta estrellas).
- **Flashcards con repetición espaciada** 🃏: califica cada tarjeta
  (Otra vez / Difícil / Fácil); las falladas vuelven pronto y las fáciles
  descansan más días. El mazo prioriza los temas con más errores.
- Los modos de juego se pueden **activar/desactivar** desde el perfil.
- **Retroalimentación inmediata**: si fallas, verás la respuesta correcta, la
  fórmula y la **solución paso a paso**; si aciertas, un tip actuarial.
- **Muchos modos de juego** 🎮 (vista dedicada): quiz clásico, reto diario,
  modo parcial y examen final, contrarreloj, V/F rápido, carrera de XP,
  supervivencia, repaso de errores, solo incorrectas, repaso mixto,
  flashcards, completar fórmula, ordenar procedimiento, práctica infinita,
  ruleta, Jeopardy, memorama, escape room, código secreto, bingo de
  conceptos y "todos contra todos" local. Cada modo da XP, registra errores
  y actualiza tus estadísticas.
- **Tienda 🛒 y "Mi colección"** (vista separada de la configuración):
  marcos, fondos, accesorios, títulos, efectos y temas; unos por XP y otros
  por logros. Reglas de equipamiento: un marco/fondo/título/efecto/tema a la
  vez y varios accesorios combinables.
- **Leaderboard compartido** 🏆 con medallas para el top 3, búsqueda por
  nombre, ordenar por XP/nivel/racha/promedio, y avatar con el marco, la
  insignia destacada y el título equipados. Se sincroniza con
  `leaderboard.json`; el administrador (perfil "Oliver" + contraseña
  `OliverPapi`) lo edita y publica.
- **Tareas compartidas** 📋 vía `tasks.json`: el admin exporta el archivo y lo
  sube al repositorio; todos los alumnos reciben tareas y fechas al abrir la
  vista o tocar “Actualizar”. Todas las fechas y horas usan **CDMX (UTC-6)**.
- **PWA instalable** 📱: agrégala a la pantalla de inicio del celular;
  funciona offline después de la primera visita (service worker + manifest).
- **Sonidos** (WebAudio con fallback `<audio>`) que se activan/desactivan con
  el botón del encabezado; el volumen depende del dispositivo.
- **Color principal personalizable** (azul, verde, morado, rojo, naranja, rosa).

## 📊 Panel de progreso

Estadísticas completas: módulos completados, promedio, precisión, tiempo
estudiado, progreso por módulo y por tema, conceptos dominados / por reforzar,
insignias, mejores resultados, últimas actividades e historial de exámenes
diarios.

## 👤 Perfiles y datos

- **Perfiles personales**: cada estudiante crea su perfil (nombre + avatar);
  un mismo navegador puede alojar varios perfiles con progreso independiente.
- **Foto de perfil** propia (o avatar emoji por defecto), con **marco**
  equipado visible en el dashboard, la configuración, el leaderboard, la
  revisión de examen y la bienvenida.
- **Configuración simplificada**: datos del perfil, foto/avatar, equipar
  título/marco/fondo/accesorio/efecto/tema, materia activa, logo de la
  página, tema claro/oscuro, color principal, objetivo diario de XP,
  exportar/importar y reiniciar progreso.
- **Exportar / Importar JSON**: respaldo completo del progreso (incluye la
  foto) para moverlo entre dispositivos o guardarlo.
- **Reiniciar progreso** del perfil con doble confirmación.

## ⬆️ Niveles y recompensas

La barra de XP del encabezado abre la **ruta de niveles**: cada nivel
desbloquea avatares, títulos (Aprendiz → Actuario Senior) y accesorios para
el avatar personalizable.

## 🧑‍🎨 Avatar personalizable

Tres modos elegibles desde el perfil: **emoji**, **foto** (subes una imagen que
se recorta en círculo) o **avatar 3D** (SVG editable: piel, peinado, color de
cabello y ojos). Sobre cualquiera de los tres se aplican el **marco**, el
**fondo**, los **accesorios** (varios a la vez), el **título** y el **efecto**
equipados desde la tienda, con vista previa en vivo. Los efectos incluyen
destellos, aura, estrellas, llamas y lluvia de confeti (que se dispara al
responder bien).

El **vestidor** es de **dos columnas**: el avatar queda fijo (*sticky*) a un
lado mientras equipas del otro, así los cambios se ven al instante sin bajar y
subir. Es **colapsable** (para no ocupar espacio) y **responsive** (en móvil se
apila y el avatar se mantiene visible arriba). Cada accesorio tiene su propia
calibración (posición, escala y rotación) según su forma: la corona, la gorra
y el sombrero de copa no comparten posición; el cigarro va en la boca, la
espada apunta hacia arriba y los lentes quedan centrados en los ojos.

## 📖 Guía de estudio progresiva

La guía se desbloquea **tema por tema** conforme avanzas en los módulos (la
sección del siguiente tema siempre está disponible para estudiar antes de
jugarlo). Se puede desactivar en Preferencias para ver la guía completa.

## 📘 Unidades del curso

El contenido actual es la **Unidad 1 · Fundamentos del Cálculo Actuarial**.
La arquitectura está lista para agregar una **Unidad 2** con nuevos temas:
cada unidad tendrá sus propios módulos y su propio examen diario (los temas
no se mezclan entre unidades, salvo los compartidos). El registro
`EXAM_BUILDERS` en `index.html` documenta dónde se conecta el examen de cada
unidad.

## 🖨️ Guía de estudio (PDF)

El botón 🖨️ abre una **guía de estudio imprimible**: glosario completo, fórmulas,
procedimientos, tabla comparativa inflación/devaluación/depreciación, ejercicios
resueltos y banco de repaso con respuestas. Con *Imprimir → Guardar como PDF*
obtienes el documento para estudiar sin conexión.

## 🎨 Detalles técnicos

- HTML + CSS + JavaScript vanilla en un único archivo (~2,400 líneas).
- Tema claro y **modo oscuro** (manual o automático según el sistema).
- Diseño completamente **responsive** (escritorio, tablet y móvil).
- Paleta de datos validada para daltonismo; los estados correcto/incorrecto
  siempre llevan icono + texto, nunca solo color.
- Progreso persistente vía `localStorage` (clave `actuariq_v1`).
