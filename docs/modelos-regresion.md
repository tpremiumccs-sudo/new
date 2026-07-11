# 📉 Modelos de Regresión — Temario completo

> Documento generado automáticamente desde ActuarIQ con **todo el contenido de cada módulo** (preguntas, respuestas, procedimientos y explicaciones), organizado por parcial. Las preguntas numéricas usan valores de ejemplo; el método y la respuesta son los del generador del curso.

_Materia: `modelos-regresion` · 9 módulos · actualizado 2026-07-11_

## 🧮 Fórmulas clave

| Tema | Fórmula / idea |
|---|---|
| **Modelo lineal simple** | Y_i=β_0+β_1X_i+ε_i, con ε_i~N(0,σ²) independientes. |
| **Sumas de cuadrados** | S_xx=Σx_i²−(Σx_i)²/n ; S_xy=Σx_iy_i−(Σx_i)(Σy_i)/n. |
| **Estimadores MCO** | β̂_1=S_xy/S_xx ; β̂_0=ȳ−β̂_1x̄. |
| **Ajuste y residuos** | Ŷ=β̂_0+β̂_1x ; e_i=y_i−ŷ_i ; Σe_i=0. |
| **Varianza del error** | σ̂²=SCE/(n−2), con SCE=S_yy−β̂_1S_xy. |
| **ANOVA y R²** | SCT=SCR+SCE ; R²=SCR/SCT=1−SCE/SCT. |
| **Inferencia sobre β_1** | ee(β̂_1)=√(σ̂²/S_xx) ; t=β̂_1/ee ; IC β̂_1±t_α/2,n−2·ee. |
| **Predicción** | IC de la respuesta media E(Y\|x_0) < intervalo de predicción individual (este suma +1 dentro de la raíz). |

## 🗂️ Módulos por parcial _(división sugerida, ajústala con tu profesor)_

**Primer parcial:** 📊 Introducción a la regresión · 🧭 Construcción de un modelo · 📈 Regresión lineal simple · 📐 Mínimos cuadrados · 📉 Ajuste, predicción y residuos

**Segundo parcial:** 🎯 Propiedades de los estimadores · 🔬 σ² e inferencia · 📏 Respuesta media y predicción · 🧮 Variabilidad, ANOVA y R²

---

## 📊 Módulo 1 · Introducción a la regresión

- **Parcial:** Primer parcial
- **Contenido:** Descriptiva/inferencial/predictiva, variables X e Y y tipos de regresión.
- **Tipo de práctica:** Quiz mixto

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Relacionar]** Relaciona cada rama con su objetivo:

   - **Respuesta:** Descriptiva ↔ Resumir y describir los datos · Inferencial ↔ Generalizar a la población · Predictiva ↔ Anticipar valores futuros

**2. [Opción múltiple]** «Resumir los datos con medias y gráficas, sin generalizar» corresponde a estadística:

   - **Descriptiva ✅**
   - Inferencial
   - Predictiva
   - Bayesiana

   - **Respuesta:** Descriptiva
   - _Explicación:_ La estadística descriptiva resume; la inferencial generaliza a la población; la predictiva anticipa valores.

**3. [Opción múltiple]** Un modelo de regresión sirve para:

   - **Explicar o predecir una variable respuesta a partir de otra(s) ✅**
   - Ordenar datos alfabéticamente
   - Calcular solo la moda
   - Contar categorías

   - **Respuesta:** Explicar o predecir una variable respuesta a partir de otra(s)
   - _Explicación:_ La regresión modela la relación para explicar/predecir Y con X.

**4. [Opción múltiple]** ¿Cuál de estos datos es cualitativo?

   - **Tipo de póliza (auto, vida, gastos médicos) ✅**
   - Monto del siniestro
   - Edad del asegurado
   - Número de reclamaciones

   - **Respuesta:** Tipo de póliza (auto, vida, gastos médicos)
   - _Explicación:_ Cualitativo = categorías (tipo de póliza). Los demás son cuantitativos.

**5. [Opción múltiple]** En un estudio de «gastos de publicidad vs. ventas», ¿cuál es la variable respuesta (Y)?

   - **Las ventas ✅**
   - Los gastos de publicidad
   - El número de vendedores
   - El mes

   - **Respuesta:** Las ventas
   - _Explicación:_ La respuesta Y es la que se quiere explicar/predecir: las ventas.

**6. [Verdadero/Falso]** La regresión lineal múltiple usa dos o más variables explicativas.

   - **Respuesta:** Verdadero
   - _Explicación:_ Simple: una X. Múltiple: varias X. (En este curso solo se desarrolla la simple.)

---

## 🧭 Módulo 2 · Construcción de un modelo

- **Parcial:** Primer parcial
- **Contenido:** Recolección, calidad de datos, dispersión, ajuste, diagnóstico y sobreajuste.
- **Tipo de práctica:** Ordenar y decidir

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Ordenar pasos]** Ordena las etapas de construcción de un modelo (según el cuaderno):

   - **Respuesta:** 1) Recolección de datos  2) Exploración de datos  3) Revisión de calidad (perdidos, erróneos, atípicos)  4) Diagrama de dispersión  5) Ajuste del modelo  6) Revisión de supuestos y diagnóstico  7) Predicción

**2. [Opción múltiple]** Detectas una edad de «999 años» en la base. Es un valor:

   - **Erróneo ✅**
   - Perdido
   - Correcto
   - Predicho

   - **Respuesta:** Erróneo
   - _Explicación:_ Es un valor erróneo (imposible). Un perdido sería un dato ausente.

**3. [Opción múltiple]** Antes de ajustar la recta conviene ver el diagrama de dispersión para:

   - **Comprobar si la relación parece lineal ✅**
   - Ordenar los datos
   - Calcular la moda
   - Eliminar la variable Y

   - **Respuesta:** Comprobar si la relación parece lineal
   - _Explicación:_ El diagrama de dispersión muestra la forma de la relación (si es lineal, etc.).

**4. [Opción múltiple]** Un modelo que se ajusta muy bien a los datos usados pero falla con datos nuevos está:

   - **Sobreajustado ✅**
   - Insesgado
   - Bien validado
   - Subajustado por falta de datos

   - **Respuesta:** Sobreajustado
   - _Explicación:_ Sobreajuste: ajusta el ruido de la muestra y no generaliza.

**5. [Verdadero/Falso]** Un valor atípico es una observación que se aleja notablemente del resto.

   - **Respuesta:** Verdadero
   - _Explicación:_ Los atípicos pueden distorsionar el ajuste y deben revisarse.

---

## 📈 Módulo 3 · Regresión lineal simple

- **Parcial:** Primer parcial
- **Contenido:** Yᵢ=β₀+β₁Xᵢ+εᵢ, interpretación de pendiente/intercepto y supuestos.
- **Tipo de práctica:** Quiz mixto

### 📘 Lección

📊 Modelo de regresión lineal simple
Modelo poblacional: Yᵢ = β₀ + β₁Xᵢ + εᵢ. Recta estimada: Ŷᵢ = β̂₀ + β̂₁Xᵢ.
β₀: ordenada al origen (valor esperado de Y cuando X=0, si tiene sentido).
β₁: pendiente (cambio promedio de Y por unidad de X).
εᵢ: error aleatorio; eᵢ = Yᵢ − Ŷᵢ: residuo.
Supuestos: E(εᵢ)=0, Var(εᵢ)=σ² constante (homocedasticidad), Cov(εᵢ,εⱼ)=0 y, para inferencia, εᵢ ~ N(0,σ²).

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Relacionar]** Relaciona cada símbolo con su significado en Yᵢ = β₀ + β₁Xᵢ + εᵢ:

   - **Respuesta:** β₀ ↔ Ordenada al origen · β₁ ↔ Pendiente · εᵢ ↔ Error aleatorio · Ŷᵢ ↔ Valor estimado

**2. [Verdadero/Falso]** β₁ = 0 indica ausencia de relación lineal entre X y Y en el modelo.

   - **Respuesta:** Verdadero
   - _Explicación:_ Pendiente cero ⇒ X no aporta información lineal sobre Y.

**3. [Opción múltiple]** Si β̂₁ = 3, ¿cómo se interpreta?

   - **Al aumentar X en 1 unidad, Y aumenta en promedio 3 unidades ✅**
   - Y siempre vale 3
   - X vale 3 cuando Y=0
   - No hay relación lineal

   - **Respuesta:** Al aumentar X en 1 unidad, Y aumenta en promedio 3 unidades
   - _Explicación:_ β₁ es el cambio promedio en Y por cada unidad de aumento en X.

**4. [Completar]** El supuesto de varianza constante de los errores se llama ______.

   - **Respuesta:** homocedasticidad

**5. [Opción múltiple]** El residuo se define como:

   - **eᵢ = Yᵢ − Ŷᵢ ✅**
   - eᵢ = Ŷᵢ − Xᵢ
   - eᵢ = β₀ + β₁
   - eᵢ = Yᵢ + Ŷᵢ

   - **Respuesta:** eᵢ = Yᵢ − Ŷᵢ
   - _Explicación:_ Residuo = observado − estimado.

**6. [Verdadero/Falso]** Para la inferencia se supone εᵢ ~ N(0, σ²) (errores normales, media 0 y varianza constante).

   - **Respuesta:** Verdadero
   - _Explicación:_ Normalidad de los errores con E(εᵢ)=0 y Var(εᵢ)=σ².

---

## 📐 Módulo 4 · Mínimos cuadrados

- **Parcial:** Primer parcial
- **Contenido:** Tabla auxiliar, Sxx, Sxy y estimadores β̂₀, β̂₁.
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

📐 Mínimos cuadrados
Se minimiza S(β₀,β₁) = Σ[Yᵢ − (β₀+β₁Xᵢ)]². Derivando e igualando a cero se obtienen las ecuaciones normales y:
β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx
β̂₀ = Ȳ − β̂₁X̄
Forma equivalente: β̂₁ = [nΣXY − (ΣX)(ΣY)] / [nΣX² − (ΣX)²]. Conviene armar una tabla auxiliar con ΣX, ΣY, ΣX², ΣXY.

### 📝 Preguntas y respuestas (45 plantillas)

**1. [Cálculo numérico]** Se sabe que ΣX²=2789, ΣX=131 y n=7. Calcula Sxx = Σ(Xᵢ−X̄)² = ΣX² − (ΣX)²/n.

   - **Respuesta:** 337.4286
   - _Procedimiento:_ (ΣX)²/n = 131²/7 = 2451.571 → Sxx = 2789 − 2451.571 = 337.4286
   - _Explicación:_ Sxx = ΣX² − (ΣX)²/n.

**2. [Cálculo numérico]** Con Sxy = -214.429 y Sxx = 167.714, calcula la pendiente β̂₁.

   - **Respuesta:** -1.2785
   - _Procedimiento:_ β̂₁ = Sxy / Sxx = -214.429 / 167.714 = -1.2785
   - _Explicación:_ β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx.

**3. [Cálculo numérico]** Con β̂₁ = 1.5171, X̄ = 23.125 y Ȳ = 54.625, calcula el intercepto β̂₀.

   - **Respuesta:** 19.5415
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = 54.625 − 1.5171·23.125 → = 54.625 − 35.083 = 19.5415
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**4. [Ordenar pasos]** Ordena la derivación de mínimos cuadrados:

   - **Respuesta:** 1) Escribir S(β₀,β₁)=Σ[Yᵢ−(β₀+β₁Xᵢ)]²  2) Derivar respecto de β₀ e igualar a 0  3) Derivar respecto de β₁ e igualar a 0  4) Obtener las ecuaciones normales  5) Despejar β̂₁ = Sxy/Sxx  6) Despejar β̂₀ = Ȳ − β̂₁X̄

**5. [Cálculo numérico]** Con β̂₁ = -2, X̄ = 18.167 y Ȳ = -26.333, calcula el intercepto β̂₀.

   - **Respuesta:** 10
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = -26.333 − -2·18.167 → = -26.333 − -36.333 = 10
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**6. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 4 · 6 · 9 · 10 · 12 · 15 · 19 · 21 · Y · 45 · 49 · 56 · 63 · 63 · 77 · 87 · 91 ·

   - **Respuesta:** 7083
   - _Procedimiento:_ 4·45 + 6·49 + 9·56 + 10·63 + 12·63 + 15·77 + 19·87 + 21·91 → = 7083
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**7. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 9 · 10 · 14 · 15 · 18 · 21 · Y · 43 · 45 · 52 · 56 · 63 · 75 ·

   - **Respuesta:** 55.6667
   - _Procedimiento:_ n = 6 → ΣY = 334 → Ȳ = 334 / 6 = 55.6667
   - _Explicación:_ Ȳ = (ΣY) / n.

**8. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media X̄:X · 15 · 16 · 18 · 21 · 24 · 27 · 31 · 32 · Y · 37 · 40 · 49 · 55 · 55 · 64 · 75 · 74 ·

   - **Respuesta:** 23
   - _Procedimiento:_ n = 8 → ΣX = 184 → X̄ = 184 / 8 = 23
   - _Explicación:_ X̄ = (ΣX) / n.

**9. [Cálculo numérico]** Con Sxy = 232 y Sxx = 158, calcula la pendiente β̂₁.

   - **Respuesta:** 1.4684
   - _Procedimiento:_ β̂₁ = Sxy / Sxx = 232 / 158 = 1.4684
   - _Explicación:_ β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx.

**10. [Completar]** El método de mínimos cuadrados minimiza la suma de los ______ al cuadrado.

   - **Respuesta:** residuos

**11. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media Ȳ:X · 7 · 8 · 10 · 11 · 12 · 13 · 14 · 15 · Y · 47 · 49 · 49 · 49 · 55 · 55 · 60 · 63 ·

   - **Respuesta:** 53.375
   - _Procedimiento:_ n = 8 → ΣY = 427 → Ȳ = 427 / 8 = 53.375
   - _Explicación:_ Ȳ = (ΣY) / n.

**12. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 7 · 9 · 10 · 11 · 13 · 17 · 18 · 22 · Y · 30 · 38 · 42 · 43 · 45 · 58 · 62 · 71 ·

   - **Respuesta:** 48.625
   - _Procedimiento:_ n = 8 → ΣY = 389 → Ȳ = 389 / 8 = 48.625
   - _Explicación:_ Ȳ = (ΣY) / n.

**13. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 4 · 5 · 7 · 8 · 12 · 16 · 17 · 18 · Y · 40 · 45 · 51 · 56 · 69 · 80 · 78 · 82 ·

   - **Respuesta:** 1167
   - _Procedimiento:_ 4² + 5² + 7² + 8² + 12² + 16² + 17² + 18² → = 1167
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**14. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 6 · 8 · 11 · 12 · 15 · 18 · 20 · 24 · Y · 36 · 42 · 44 · 51 · 51 · 58 · 61 · 65 ·

   - **Respuesta:** 51
   - _Procedimiento:_ n = 8 → ΣY = 408 → Ȳ = 408 / 8 = 51
   - _Explicación:_ Ȳ = (ΣY) / n.

**15. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 11 · 12 · 14 · 15 · 16 · 19 · 23 · 24 · Y · -9 · -12 · -18 · -14 · -16 · -22 · -26 · -34 ·

   - **Respuesta:** 16.75
   - _Procedimiento:_ n = 8 → ΣX = 134 → X̄ = 134 / 8 = 16.75
   - _Explicación:_ X̄ = (ΣX) / n.

**16. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 12 · 15 · 17 · 18 · 19 · 23 · Y · -4 · -13 · -15 · -16 · -18 · -28 ·

   - **Respuesta:** 17.3333
   - _Procedimiento:_ n = 6 → ΣX = 104 → X̄ = 104 / 6 = 17.3333
   - _Explicación:_ X̄ = (ΣX) / n.

**17. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media X̄:X · 11 · 14 · 17 · 19 · 21 · 25 · Y · 60 · 66 · 70 · 75 · 85 · 90 ·

   - **Respuesta:** 17.8333
   - _Procedimiento:_ n = 6 → ΣX = 107 → X̄ = 107 / 6 = 17.8333
   - _Explicación:_ X̄ = (ΣX) / n.

**18. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 9 · 11 · 12 · 16 · 20 · 21 · Y · 30 · 37 · 42 · 53 · 62 · 67 ·

   - **Respuesta:** 1443
   - _Procedimiento:_ 9² + 11² + 12² + 16² + 20² + 21² → = 1443
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**19. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 6 · 9 · 11 · 15 · 16 · 19 · 20 · 21 · Y · 0 · -4 · -8 · -13 · -20 · -21 · -23 · -26 ·

   - **Respuesta:** -14.375
   - _Procedimiento:_ n = 8 → ΣY = -115 → Ȳ = -115 / 8 = -14.375
   - _Explicación:_ Ȳ = (ΣY) / n.

**20. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 12 · 14 · 16 · 20 · 21 · 23 · 25 · Y · -7 · -15 · -19 · -27 · -29 · -32 · -34 ·

   - **Respuesta:** -23.2857
   - _Procedimiento:_ n = 7 → ΣY = -163 → Ȳ = -163 / 7 = -23.2857
   - _Explicación:_ Ȳ = (ΣY) / n.

**21. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 8 · 12 · 13 · 14 · 15 · 16 · 20 · Y · 34 · 44 · 49 · 49 · 47 · 51 · 63 ·

   - **Respuesta:** 14
   - _Procedimiento:_ n = 7 → ΣX = 98 → X̄ = 98 / 7 = 14
   - _Explicación:_ X̄ = (ΣX) / n.

**22. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 10 · 14 · 15 · 17 · 20 · 24 · Y · -18 · -21 · -27 · -31 · -37 · -43 ·

   - **Respuesta:** 16.6667
   - _Procedimiento:_ n = 6 → ΣX = 100 → X̄ = 100 / 6 = 16.6667
   - _Explicación:_ X̄ = (ΣX) / n.

**23. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 5 · 6 · 7 · 9 · 10 · 11 · 12 · Y · 22 · 16 · 19 · 13 · 8 · 5 · 3 ·

   - **Respuesta:** 12.2857
   - _Procedimiento:_ n = 7 → ΣY = 86 → Ȳ = 86 / 7 = 12.2857
   - _Explicación:_ Ȳ = (ΣY) / n.

**24. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 6 · 10 · 14 · 16 · 18 · 19 · 21 · Y · 18 · 27 · 29 · 36 · 38 · 42 · 40 ·

   - **Respuesta:** 3682
   - _Procedimiento:_ 6·18 + 10·27 + 14·29 + 16·36 + 18·38 + 19·42 + 21·40 → = 3682
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**25. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 9 · 11 · 13 · 15 · 18 · 19 · Y · 40 · 51 · 53 · 63 · 72 · 70 ·

   - **Respuesta:** 58.1667
   - _Procedimiento:_ n = 6 → ΣY = 349 → Ȳ = 349 / 6 = 58.1667
   - _Explicación:_ Ȳ = (ΣY) / n.

**26. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 10 · 13 · 17 · 21 · 24 · 27 · 30 · Y · 37 · 49 · 51 · 63 · 66 · 72 · 79 ·

   - **Respuesta:** 3204
   - _Procedimiento:_ 10² + 13² + 17² + 21² + 24² + 27² + 30² → = 3204
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**27. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media Ȳ:X · 9 · 13 · 16 · 17 · 20 · 22 · Y · 51 · 60 · 68 · 70 · 81 · 87 ·

   - **Respuesta:** 69.5
   - _Procedimiento:_ n = 6 → ΣY = 417 → Ȳ = 417 / 6 = 69.5
   - _Explicación:_ Ȳ = (ΣY) / n.

**28. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media Ȳ:X · 5 · 9 · 12 · 15 · 19 · 22 · 26 · 27 · Y · -3 · -10 · -12 · -17 · -28 · -35 · -39 · -45 ·

   - **Respuesta:** -23.625
   - _Procedimiento:_ n = 8 → ΣY = -189 → Ȳ = -189 / 8 = -23.625
   - _Explicación:_ Ȳ = (ΣY) / n.

**29. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 11 · 13 · 15 · 17 · 18 · 21 · 22 · Y · 6 · 2 · -1 · -2 · -6 · -13 · -13 ·

   - **Respuesta:** 16.7143
   - _Procedimiento:_ n = 7 → ΣX = 117 → X̄ = 117 / 7 = 16.7143
   - _Explicación:_ X̄ = (ΣX) / n.

**30. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 11 · 12 · 14 · 18 · 22 · 25 · Y · 8 · 7 · 5 · -3 · -15 · -20 ·

   - **Respuesta:** 1894
   - _Procedimiento:_ 11² + 12² + 14² + 18² + 22² + 25² → = 1894
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**31. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media X̄:X · 13 · 16 · 17 · 21 · 24 · 25 · Y · 37 · 39 · 43 · 46 · 51 · 52 ·

   - **Respuesta:** 19.3333
   - _Procedimiento:_ n = 6 → ΣX = 116 → X̄ = 116 / 6 = 19.3333
   - _Explicación:_ X̄ = (ΣX) / n.

**32. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 13 · 14 · 18 · 20 · 24 · 25 · 29 · 32 · Y · -4 · -5 · -15 · -21 · -27 · -31 · -38 · -46 ·

   - **Respuesta:** -23.375
   - _Procedimiento:_ n = 8 → ΣY = -187 → Ȳ = -187 / 8 = -23.375
   - _Explicación:_ Ȳ = (ΣY) / n.

**33. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 7 · 8 · 11 · 14 · 17 · 20 · 21 · Y · 47 · 47 · 55 · 67 · 76 · 80 · 86 ·

   - **Respuesta:** 14
   - _Procedimiento:_ n = 7 → ΣX = 98 → X̄ = 98 / 7 = 14
   - _Explicación:_ X̄ = (ΣX) / n.

**34. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 8 · 10 · 14 · 17 · 21 · 25 · Y · 4 · -1 · -9 · -10 · -16 · -20 ·

   - **Respuesta:** 15.8333
   - _Procedimiento:_ n = 6 → ΣX = 95 → X̄ = 95 / 6 = 15.8333
   - _Explicación:_ X̄ = (ΣX) / n.

**35. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 8 · 10 · 14 · 17 · 20 · 22 · 25 · Y · 38 · 48 · 57 · 63 · 73 · 82 · 89 ·

   - **Respuesta:** 64.2857
   - _Procedimiento:_ n = 7 → ΣY = 450 → Ȳ = 450 / 7 = 64.2857
   - _Explicación:_ Ȳ = (ΣY) / n.

**36. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 5 · 9 · 12 · 13 · 17 · 18 · 19 · Y · -3 · -11 · -19 · -24 · -31 · -32 · -33 ·

   - **Respuesta:** 13.2857
   - _Procedimiento:_ n = 7 → ΣX = 93 → X̄ = 93 / 7 = 13.2857
   - _Explicación:_ X̄ = (ΣX) / n.

**37. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 12 · 14 · 18 · 19 · 22 · 25 · 27 · 28 · Y · -17 · -21 · -29 · -31 · -36 · -37 · -44 · -46 ·

   - **Respuesta:** 3647
   - _Procedimiento:_ 12² + 14² + 18² + 19² + 22² + 25² + 27² + 28² → = 3647
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**38. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 6 · 7 · 10 · 13 · 17 · 21 · 25 · Y · 0 · 2 · -5 · -12 · -15 · -22 · -26 ·

   - **Respuesta:** 14.1429
   - _Procedimiento:_ n = 7 → ΣX = 99 → X̄ = 99 / 7 = 14.1429
   - _Explicación:_ X̄ = (ΣX) / n.

**39. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media Ȳ:X · 13 · 16 · 19 · 23 · 24 · 26 · 30 · 31 · Y · -11 · -14 · -21 · -32 · -31 · -39 · -44 · -46 ·

   - **Respuesta:** -29.75
   - _Procedimiento:_ n = 8 → ΣY = -238 → Ȳ = -238 / 8 = -29.75
   - _Explicación:_ Ȳ = (ΣY) / n.

**40. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media Ȳ:X · 11 · 13 · 14 · 16 · 20 · 22 · Y · 39 · 40 · 45 · 50 · 53 · 57 ·

   - **Respuesta:** 47.3333
   - _Procedimiento:_ n = 6 → ΣY = 284 → Ȳ = 284 / 6 = 47.3333
   - _Explicación:_ Ȳ = (ΣY) / n.

**41. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media Ȳ:X · 6 · 9 · 10 · 11 · 12 · 14 · Y · 10 · 8 · 3 · 1 · 1 · -3 ·

   - **Respuesta:** 3.3333
   - _Procedimiento:_ n = 6 → ΣY = 20 → Ȳ = 20 / 6 = 3.3333
   - _Explicación:_ Ȳ = (ΣY) / n.

**42. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 10 · 11 · 15 · 16 · 17 · 18 · Y · 41 · 40 · 51 · 52 · 55 · 58 ·

   - **Respuesta:** 14.5
   - _Procedimiento:_ n = 6 → ΣX = 87 → X̄ = 87 / 6 = 14.5
   - _Explicación:_ X̄ = (ΣX) / n.

**43. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 8 · 12 · 15 · 16 · 19 · 20 · 23 · 26 · Y · 28 · 43 · 47 · 49 · 55 · 59 · 65 · 73 ·

   - **Respuesta:** 17.375
   - _Procedimiento:_ n = 8 → ΣX = 139 → X̄ = 139 / 8 = 17.375
   - _Explicación:_ X̄ = (ΣX) / n.

**44. [Cálculo numérico]** Con β̂₁ = -1.4714, X̄ = 10.333 y Ȳ = 15.167, calcula el intercepto β̂₀.

   - **Respuesta:** 30.3714
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = 15.167 − -1.4714·10.333 → = 15.167 − -15.205 = 30.3714
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**45. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 5 · 7 · 11 · 13 · 14 · 16 · Y · 11 · 5 · 1 · -3 · -8 · -11 ·

   - **Respuesta:** -0.8333
   - _Procedimiento:_ n = 6 → ΣY = -5 → Ȳ = -5 / 6 = -0.8333
   - _Explicación:_ Ȳ = (ΣY) / n.

---

## 📉 Módulo 5 · Ajuste, predicción y residuos

- **Parcial:** Primer parcial
- **Contenido:** Ŷ, eᵢ, propiedades (Σeᵢ=0), interpolación vs. extrapolación.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (9 plantillas)

**1. [Cálculo numérico]** Para X = 19 el valor observado es Y = -19 y el estimado es Ŷ = -17.2587. Calcula el residuo eᵢ.

   - **Respuesta:** -1.7413
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = -19 − -17.2587 = -1.7413
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

**2. [Completar]** La recta de mínimos cuadrados siempre pasa por el punto (X̄, ____).

   - **Respuesta:** Ȳ

**3. [Cálculo numérico]** Para X = 7 el valor observado es Y = 20 y el estimado es Ŷ = 22.3243. Calcula el residuo eᵢ.

   - **Respuesta:** -2.3243
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = 20 − 22.3243 = -2.3243
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

**4. [Verdadero/Falso]** Una propiedad de mínimos cuadrados es que Σeᵢ = 0 (los residuos suman cero).

   - **Respuesta:** Verdadero
   - _Explicación:_ Σeᵢ=0 y ē=0; además ΣeᵢXᵢ=0 y la recta pasa por (X̄,Ȳ).

**5. [Cálculo numérico]** La recta ajustada es Ŷ = 22.5839 + -0.9452·X. Predice Ŷ para X = 19 (interpolación).

   - **Respuesta:** 4.6258
   - _Procedimiento:_ Ŷ = 22.5839 + -0.9452·19 → = 22.5839 + -17.958 = 4.6258
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**6. [Verdadero/Falso]** También se cumple ΣeᵢXᵢ = 0.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es una de las ecuaciones normales de mínimos cuadrados.

**7. [Opción múltiple]** Predecir Y para un X fuera del rango observado se llama:

   - **Extrapolación (riesgosa) ✅**
   - Interpolación
   - Residuo
   - Homocedasticidad

   - **Respuesta:** Extrapolación (riesgosa)
   - _Explicación:_ Extrapolar fuera del rango es riesgoso; interpolar es dentro del rango.

**8. [Cálculo numérico]** La recta ajustada es Ŷ = 14.5324 + 1.3519·X. Predice Ŷ para X = 15 (interpolación).

   - **Respuesta:** 34.8102
   - _Procedimiento:_ Ŷ = 14.5324 + 1.3519·15 → = 14.5324 + 20.278 = 34.8102
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**9. [Cálculo numérico]** Para X = 6 el valor observado es Y = -2 y el estimado es Ŷ = 0.1927. Calcula el residuo eᵢ.

   - **Respuesta:** -2.1927
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = -2 − 0.1927 = -2.1927
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

---

## 🎯 Módulo 6 · Propiedades de los estimadores

- **Parcial:** Segundo parcial
- **Contenido:** Insesgado/eficiente/consistente/suficiente y distribución de β̂.
- **Tipo de práctica:** Quiz + cálculo

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Cálculo numérico]** Con σ̂² = 2.585 y Sxx = 93.5, calcula Var(β̂₁) = σ²/Sxx.

   - **Respuesta:** 0.02764
   - _Procedimiento:_ Var(β̂₁) = σ²/Sxx = 2.585/93.5 = 0.02764
   - _Explicación:_ Var(β̂₁) = σ²/Sxx.

**2. [Relacionar]** Relaciona cada propiedad de un estimador con su definición:

   - **Respuesta:** Insesgado ↔ E(β̂ⱼ) = βⱼ · Eficiente ↔ Menor varianza entre los insesgados · Consistente ↔ Se acerca al parámetro al crecer n · Suficiente ↔ Concentra la información de la muestra

**3. [Opción múltiple]** La distribución de la pendiente bajo errores normales es:

   - **β̂₁ ~ N(β₁, σ²/Sxx) ✅**
   - β̂₁ ~ N(0, 1)
   - β̂₁ ~ Poisson(σ²)
   - β̂₁ ~ Uniforme

   - **Respuesta:** β̂₁ ~ N(β₁, σ²/Sxx)
   - _Explicación:_ β̂₁ ~ N(β₁, σ²/Sxx), con Sxx=Σ(Xᵢ−X̄)².

**4. [Completar]** La varianza de la pendiente es Var(β̂₁) = σ²/____ .

   - **Respuesta:** Sxx

**5. [Verdadero/Falso]** Un estimador insesgado cumple E(β̂ⱼ) = βⱼ.

   - **Respuesta:** Verdadero
   - _Explicación:_ Insesgadez: su valor esperado es el parámetro verdadero.

---

## 🔬 Módulo 7 · σ² e inferencia

- **Parcial:** Segundo parcial
- **Contenido:** σ̂²=SCE/(n−2), error estándar, IC y prueba t sobre la pendiente.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Cálculo numérico]** Prueba H₀: β₁=0. Con β̂₁ = 2.5373, s = 2.057 y Sxx = 420.875, calcula el estadístico t = β̂₁ / (s/√Sxx).

   - **Respuesta:** 25.3069
   - _Procedimiento:_ Error estándar = s/√Sxx = 2.057/√420.875 = 0.1003 → t = β̂₁ / EE = 2.5373 / 0.1003 = 25.3069
   - _Explicación:_ t = (β̂₁ − 0) / (s/√Sxx), con n−2 grados de libertad.

**2. [Completar]** Los grados de libertad para la inferencia sobre la pendiente son n − ____ .

   - **Respuesta:** 2

**3. [Opción múltiple]** En la prueba H₀: β₁=0 vs H₁: β₁≠0, si se rechaza H₀:

   - **Hay evidencia estadística de relación lineal ✅**
   - Se demuestra causalidad
   - No hay relación
   - El R² es 0

   - **Respuesta:** Hay evidencia estadística de relación lineal
   - _Explicación:_ Rechazar H₀ indica relación lineal significativa, pero asociación ≠ causalidad.

**4. [Cálculo numérico]** Con SCE = 22.643 y n = 8, estima la varianza del error σ̂² = SCE/(n−2).

   - **Respuesta:** 3.7738
   - _Procedimiento:_ n − 2 = 6 → σ̂² = SCE/(n−2) = 22.643/6 = 3.7738
   - _Explicación:_ σ̂² = SCE/(n−2) (la SCE se divide entre los grados de libertad n−2).

**5. [Cálculo numérico]** IC al 95% para β₁: β̂₁ ± t·(s/√Sxx). Con β̂₁ = 1.7749, s = 1.666, Sxx = 95.5 y t₍0.025,6₎ = 2.447, calcula el límite superior del intervalo.

   - **Respuesta:** 2.1921
   - _Procedimiento:_ s/√Sxx = 0.1705 → t·EE = 2.447·0.1705 = 0.4172 → Límite superior = 1.7749 + 0.4172 = 2.1921
   - _Explicación:_ Límite superior = β̂₁ + t·(s/√Sxx).

**6. [Cálculo numérico]** IC al 95% para β₁: β̂₁ ± t·(s/√Sxx). Con β̂₁ = -2.029, s = 1.989, Sxx = 310 y t₍0.025,6₎ = 2.447, calcula el límite superior del intervalo.

   - **Respuesta:** -1.7526
   - _Procedimiento:_ s/√Sxx = 0.113 → t·EE = 2.447·0.113 = 0.2764 → Límite superior = -2.029 + 0.2764 = -1.7526
   - _Explicación:_ Límite superior = β̂₁ + t·(s/√Sxx).

**7. [Verdadero/Falso]** Encontrar una relación lineal significativa demuestra que X causa Y.

   - **Respuesta:** Falso
   - _Explicación:_ La asociación estadística no implica causalidad.

**8. [Cálculo numérico]** Prueba H₀: β₁=0. Con β̂₁ = -2.041, s = 1.869 y Sxx = 322.875, calcula el estadístico t = β̂₁ / (s/√Sxx).

   - **Respuesta:** -19.624
   - _Procedimiento:_ Error estándar = s/√Sxx = 1.869/√322.875 = 0.104 → t = β̂₁ / EE = -2.041 / 0.104 = -19.624
   - _Explicación:_ t = (β̂₁ − 0) / (s/√Sxx), con n−2 grados de libertad.

---

## 📏 Módulo 8 · Respuesta media y predicción

- **Parcial:** Segundo parcial
- **Contenido:** IC para E(Y|x₀) vs. intervalo de predicción individual.
- **Tipo de práctica:** Constructor de intervalos

### 📝 Preguntas y respuestas (7 plantillas)

**1. [Cálculo numérico]** IC 95% para la respuesta media E(Y|X=14): Ŷ₀ ± t·s·√(1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = 36.22, s = 0.584, n = 6, X̄ = 22, Sxx = 182 y t = 2.776, da el límite superior.

   - **Respuesta:** 37.3863
   - _Procedimiento:_ (x₀−X̄)² = (14−22)² = 64 → raíz = √(1/6 + 64/182) = 0.7199 → semi-amplitud = t·s·raíz = 1.1665 → Límite superior = Ŷ₀ + 1.1665 = 37.3863
   - _Explicación:_ La respuesta media usa √(1/n + (x₀−X̄)²/Sxx).

**2. [Cálculo numérico]** IC 95% para la respuesta media E(Y|X=16): Ŷ₀ ± t·s·√(1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = -2.346, s = 2.278, n = 8, X̄ = 15.5, Sxx = 212 y t = 2.447, da el límite superior.

   - **Respuesta:** -0.3654
   - _Procedimiento:_ (x₀−X̄)² = (16−15.5)² = 0.25 → raíz = √(1/8 + 0.25/212) = 0.3552 → semi-amplitud = t·s·raíz = 1.9801 → Límite superior = Ŷ₀ + 1.9801 = -0.3654
   - _Explicación:_ La respuesta media usa √(1/n + (x₀−X̄)²/Sxx).

**3. [Verdadero/Falso]** La amplitud de los intervalos aumenta al alejarse x₀ de X̄.

   - **Respuesta:** Verdadero
   - _Explicación:_ El término (x₀−X̄)²/Sxx crece al alejarse de la media.

**4. [Cálculo numérico]** Intervalo de predicción 95% para una observación nueva en X=25: Ŷ₀ ± t·s·√(1 + 1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = -46.618, s = 1.722, n = 8, X̄ = 16.625, Sxx = 235.875 y t = 2.447, da el límite superior.

   - **Respuesta:** -41.5928
   - _Procedimiento:_ raíz = √(1 + 1/8 + (x₀−X̄)²/Sxx) = 1.1926 → semi-amplitud = t·s·raíz = 5.0256 → Límite superior = Ŷ₀ + 5.0256 = -41.5928
   - _Explicación:_ El intervalo de predicción añade el término +1 dentro de la raíz (es más ancho que el de la media).

**5. [Opción múltiple]** La diferencia entre el intervalo de predicción y el de la media es:

   - **Un término adicional «+1» dentro de la raíz ✅**
   - Cambiar t por z
   - Usar n−1 en vez de n−2
   - No hay diferencia

   - **Respuesta:** Un término adicional «+1» dentro de la raíz
   - _Explicación:_ Predicción: √(1 + 1/n + (x₀−X̄)²/Sxx); media: √(1/n + (x₀−X̄)²/Sxx).

**6. [Opción múltiple]** ¿Cuál intervalo es normalmente más ancho?

   - **El de predicción de una nueva observación ✅**
   - El de la respuesta media
   - Siempre son iguales
   - Ninguno tiene amplitud

   - **Respuesta:** El de predicción de una nueva observación
   - _Explicación:_ El de predicción añade el término +1 dentro de la raíz ⇒ es más ancho.

**7. [Cálculo numérico]** Intervalo de predicción 95% para una observación nueva en X=6: Ŷ₀ ± t·s·√(1 + 1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = 43.391, s = 2.1, n = 7, X̄ = 13.429, Sxx = 233.714 y t = 2.571, da el límite superior.

   - **Respuesta:** 49.7299
   - _Procedimiento:_ raíz = √(1 + 1/7 + (x₀−X̄)²/Sxx) = 1.1743 → semi-amplitud = t·s·raíz = 6.3387 → Límite superior = Ŷ₀ + 6.3387 = 49.7299
   - _Explicación:_ El intervalo de predicción añade el término +1 dentro de la raíz (es más ancho que el de la media).

---

## 🧮 Módulo 9 · Variabilidad, ANOVA y R²

- **Parcial:** Segundo parcial
- **Contenido:** SCT=SCR+SCE, R² y IC para σ². Caso integrador.
- **Tipo de práctica:** Ejercicios + caso

### 📘 Lección

📈 Variabilidad, ANOVA y R²
Descomposición de la variabilidad:
Total: SCT = Σ(Yᵢ−Ȳ)²
Error: SCE = Σ(Yᵢ−Ŷᵢ)²
Regresión: SCR = Σ(Ŷᵢ−Ȳ)²
SCT = SCR + SCE · R² = SCR/SCT = 1 − SCE/SCT
R² es la proporción de variabilidad de Y explicada por el modelo. Un R² alto no prueba causalidad ni garantiza, por sí solo, un buen modelo.

### 📝 Preguntas y respuestas (10 plantillas)

**1. [Completar]** La identidad de la variabilidad es SCT = SCR + ____ .

   - **Respuesta:** SCE

**2. [Cálculo numérico]** Con SCT = 555.333 y SCR = 551.285, calcula la suma de cuadrados del error SCE usando la identidad SCT = SCR + SCE.

   - **Respuesta:** 4.0481
   - _Procedimiento:_ SCE = SCT − SCR = 555.333 − 551.285 = 4.0481
   - _Explicación:_ SCE = SCT − SCR.

**3. [Cálculo numérico]** Con β̂₁ = -1.5307 y Sxy = -137, calcula la suma de cuadrados de la regresión SCR = β̂₁·Sxy.

   - **Respuesta:** 209.7095
   - _Procedimiento:_ SCR = β̂₁·Sxy = -1.5307·-137 = 209.7095
   - _Explicación:_ SCR = β̂₁·Sxy = Sxy²/Sxx.

**4. [Opción múltiple]** Un R² = 0.88 se interpreta como:

   - **El modelo explica el 88% de la variabilidad de Y ✅**
   - El 88% de las observaciones son correctas
   - Existe causalidad del 88%
   - El error es del 88%

   - **Respuesta:** El modelo explica el 88% de la variabilidad de Y
   - _Explicación:_ R² = proporción de variabilidad de Y explicada por el modelo. No es % de aciertos ni causalidad.

**5. [Cálculo numérico]** Con ΣY² = 2140, ΣY = -94 y n = 6, calcula la suma de cuadrados total SCT = ΣY² − (ΣY)²/n.

   - **Respuesta:** 667.3333
   - _Procedimiento:_ (ΣY)²/n = -94²/6 = 1472.667 → SCT = 2140 − 1472.667 = 667.3333
   - _Explicación:_ SCT = Σ(Yᵢ−Ȳ)² = ΣY² − (ΣY)²/n.

**6. [Cálculo numérico]** Con SCR = 590.023 y SCT = 612.857, calcula el coeficiente de determinación R².

   - **Respuesta:** 0.9627
   - _Procedimiento:_ R² = SCR / SCT = 590.023 / 612.857 = 0.9627
   - _Explicación:_ R² = SCR/SCT = 1 − SCE/SCT.

**7. [Verdadero/Falso]** Un R² alto por sí solo garantiza que el modelo es válido.

   - **Respuesta:** Falso
   - _Explicación:_ Un R² alto no garantiza validez ni causalidad; hay que revisar supuestos.

**8. [Cálculo numérico]** IC 95% para σ²: [ (n−2)σ̂² / χ²₍0.975₎ , (n−2)σ̂² / χ²₍0.025₎ ]. Con (n−2) = 4, σ̂² = 9.75, χ²₍0.975,4₎ = 11.143 y χ²₍0.025,4₎ = 0.484, calcula el límite inferior.

   - **Respuesta:** 3.5001
   - _Procedimiento:_ (n−2)σ̂² = 4·9.75 = 39.002 → Límite inferior = 39.002 / 11.143 = 3.5001
   - _Explicación:_ El límite inferior divide (n−2)σ̂² entre el cuantil grande χ²₍0.975₎.

**9. [Cálculo numérico]** Con ΣY² = 12639, ΣY = 293 y n = 7, calcula la suma de cuadrados total SCT = ΣY² − (ΣY)²/n.

   - **Respuesta:** 374.8571
   - _Procedimiento:_ (ΣY)²/n = 293²/7 = 12264.143 → SCT = 12639 − 12264.143 = 374.8571
   - _Explicación:_ SCT = Σ(Yᵢ−Ȳ)² = ΣY² − (ΣY)²/n.

**10. [Cálculo numérico]** Con β̂₁ = 1.8052 y Sxy = 355.333, calcula la suma de cuadrados de la regresión SCR = β̂₁·Sxy.

   - **Respuesta:** 641.4654
   - _Procedimiento:_ SCR = β̂₁·Sxy = 1.8052·355.333 = 641.4654
   - _Explicación:_ SCR = β̂₁·Sxy = Sxy²/Sxx.

---

