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
- **12 insignias** (Perfeccionista, Escapista, Memoria de elefante, rachas…).
- **Racha diaria** 🔥 de días de estudio.
- **Reto contrarreloj** ⚡: 60 segundos de preguntas rápidas.
- **Flashcards** 🃏 con las 25 tarjetas del glosario.
- **Retroalimentación inmediata**: si fallas, verás la respuesta correcta, la
  fórmula y la **solución paso a paso**; si aciertas, un tip actuarial.
- **Sonidos opcionales** (WebAudio) y animaciones suaves.

## 📊 Panel de progreso

Estadísticas completas: módulos completados, promedio, precisión, tiempo
estudiado, progreso por módulo y por tema, conceptos dominados / por reforzar,
insignias, mejores resultados y últimas actividades.

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
