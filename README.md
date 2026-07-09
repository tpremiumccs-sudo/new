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

## 📚 Los 12 módulos

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
  (máx. 90 s), con contador de racha y bonus de XP.
- **Muerte súbita** 💀: preguntas sin límite de tiempo, un error y se acaba.
- **Repaso mixto** 🎯: 10 preguntas variadas de los módulos desbloqueados,
  sin presión de tiempo (no afecta estrellas).
- **Flashcards con repetición espaciada** 🃏: califica cada tarjeta
  (Otra vez / Difícil / Fácil); las falladas vuelven pronto y las fáciles
  descansan más días. El mazo prioriza los temas con más errores.
- Los modos de juego se pueden **activar/desactivar** desde el perfil.
- **Retroalimentación inmediata**: si fallas, verás la respuesta correcta, la
  fórmula y la **solución paso a paso**; si aciertas, un tip actuarial.
- **Tienda de recompensas** 🎁: marcos (bronce→diamante), fondos, accesorios
  y títulos desbloqueables por XP, con modal de recompensa y confetti.
- **Leaderboard compartido** 🏆 con medallas, filtro por grupo, búsqueda y
  aviso de "subiste de rango". Se sincroniza solo con el archivo
  `leaderboard.json` publicado junto a la página; el administrador (perfil
  "Oliver" + contraseña) lo edita y publica subiendo el JSON exportado al
  repositorio.
- **PWA instalable** 📱: agrégala a la pantalla de inicio del celular;
  funciona offline después de la primera visita (service worker + manifest).
- **Sonidos opcionales** (WebAudio con fallback `<audio>`), control de
  volumen, botones "Activar/Probar sonidos" y animaciones suaves.
- **Color principal personalizable** (azul, verde, morado, rojo, naranja, rosa).

## 📊 Panel de progreso

Estadísticas completas: módulos completados, promedio, precisión, tiempo
estudiado, progreso por módulo y por tema, conceptos dominados / por reforzar,
insignias, mejores resultados, últimas actividades e historial de exámenes
diarios.

## 👤 Perfiles y datos

- **Perfiles personales**: cada estudiante crea su perfil (nombre + avatar);
  un mismo navegador puede alojar varios perfiles con progreso independiente.
- **Configuración** en el perfil: tema (sistema/claro/oscuro), objetivo diario
  de XP, sonidos, confeti, "mostrar procedimiento también al acertar", guía
  progresiva, texto grande, reducir animaciones y avatar beta.
- **Exportar / Importar JSON**: respaldo completo del progreso para moverlo
  entre dispositivos o guardarlo.
- **Reiniciar progreso** del perfil con doble confirmación.

## ⬆️ Niveles y recompensas

La barra de XP del encabezado abre la **ruta de niveles**: cada nivel
desbloquea avatares, títulos (Aprendiz → Actuario Senior) y accesorios para
el avatar personalizable.

## 🧑‍🎨 Avatar personalizable (beta)

Constructor de avatar con aspecto 3D (SVG con degradados): tono de piel,
peinado, color de cabello, ojos, fondo y accesorios que se desbloquean por
nivel. Es una **función experimental activable/desactivable** desde
Preferencias; al desactivarla se usa el avatar emoji de siempre.

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
