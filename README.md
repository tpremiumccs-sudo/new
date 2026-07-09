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
| 📉 Modelos de Regresión | En preparación (tareas y calendario disponibles) |
| 📊 Análisis Estadístico No Paramétrico | En preparación |
| 🎲 Procesos Estocásticos | En preparación |
| 💼 Administración Financiera | En preparación |

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
- **Racha diaria** 🔥 de días de estudio, con recordatorio visual en el inicio.
- **Examen diario** 📝: 12 preguntas mixtas, un solo intento por día, con
  calificación, revisión completa con filtros e historial de resultados.
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
**fondo**, los **accesorios** (varios a la vez) y el **efecto** equipados desde
la tienda, con vista previa en vivo. Los efectos incluyen destellos, aura,
estrellas, llamas y lluvia de confeti (que se dispara al responder bien).

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
