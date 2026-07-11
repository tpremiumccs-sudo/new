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

**1. [Verdadero/Falso]** La regresión lineal múltiple usa dos o más variables explicativas.

   - **Respuesta:** Verdadero
   - _Explicación:_ Simple: una X. Múltiple: varias X. (En este curso solo se desarrolla la simple.)

**2. [Opción múltiple]** En un estudio de «gastos de publicidad vs. ventas», ¿cuál es la variable respuesta (Y)?

   - **Las ventas ✅**
   - Los gastos de publicidad
   - El número de vendedores
   - El mes

   - **Respuesta:** Las ventas
   - _Explicación:_ La respuesta Y es la que se quiere explicar/predecir: las ventas.

**3. [Relacionar]** Relaciona cada rama con su objetivo:

   - **Respuesta:** Descriptiva ↔ Resumir y describir los datos · Inferencial ↔ Generalizar a la población · Predictiva ↔ Anticipar valores futuros

**4. [Opción múltiple]** ¿Cuál de estos datos es cualitativo?

   - **Tipo de póliza (auto, vida, gastos médicos) ✅**
   - Monto del siniestro
   - Edad del asegurado
   - Número de reclamaciones

   - **Respuesta:** Tipo de póliza (auto, vida, gastos médicos)
   - _Explicación:_ Cualitativo = categorías (tipo de póliza). Los demás son cuantitativos.

**5. [Opción múltiple]** Un modelo de regresión sirve para:

   - **Explicar o predecir una variable respuesta a partir de otra(s) ✅**
   - Ordenar datos alfabéticamente
   - Calcular solo la moda
   - Contar categorías

   - **Respuesta:** Explicar o predecir una variable respuesta a partir de otra(s)
   - _Explicación:_ La regresión modela la relación para explicar/predecir Y con X.

**6. [Opción múltiple]** «Resumir los datos con medias y gráficas, sin generalizar» corresponde a estadística:

   - **Descriptiva ✅**
   - Inferencial
   - Predictiva
   - Bayesiana

   - **Respuesta:** Descriptiva
   - _Explicación:_ La estadística descriptiva resume; la inferencial generaliza a la población; la predictiva anticipa valores.

---

## 🧭 Módulo 2 · Construcción de un modelo

- **Parcial:** Primer parcial
- **Contenido:** Recolección, calidad de datos, dispersión, ajuste, diagnóstico y sobreajuste.
- **Tipo de práctica:** Ordenar y decidir

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Opción múltiple]** Antes de ajustar la recta conviene ver el diagrama de dispersión para:

   - **Comprobar si la relación parece lineal ✅**
   - Ordenar los datos
   - Calcular la moda
   - Eliminar la variable Y

   - **Respuesta:** Comprobar si la relación parece lineal
   - _Explicación:_ El diagrama de dispersión muestra la forma de la relación (si es lineal, etc.).

**2. [Verdadero/Falso]** Un valor atípico es una observación que se aleja notablemente del resto.

   - **Respuesta:** Verdadero
   - _Explicación:_ Los atípicos pueden distorsionar el ajuste y deben revisarse.

**3. [Opción múltiple]** Detectas una edad de «999 años» en la base. Es un valor:

   - **Erróneo ✅**
   - Perdido
   - Correcto
   - Predicho

   - **Respuesta:** Erróneo
   - _Explicación:_ Es un valor erróneo (imposible). Un perdido sería un dato ausente.

**4. [Opción múltiple]** Un modelo que se ajusta muy bien a los datos usados pero falla con datos nuevos está:

   - **Sobreajustado ✅**
   - Insesgado
   - Bien validado
   - Subajustado por falta de datos

   - **Respuesta:** Sobreajustado
   - _Explicación:_ Sobreajuste: ajusta el ruido de la muestra y no generaliza.

**5. [Ordenar pasos]** Ordena las etapas de construcción de un modelo (según el cuaderno):

   - **Respuesta:** 1) Recolección de datos  2) Exploración de datos  3) Revisión de calidad (perdidos, erróneos, atípicos)  4) Diagrama de dispersión  5) Ajuste del modelo  6) Revisión de supuestos y diagnóstico  7) Predicción

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

**2. [Opción múltiple]** El residuo se define como:

   - **eᵢ = Yᵢ − Ŷᵢ ✅**
   - eᵢ = Ŷᵢ − Xᵢ
   - eᵢ = β₀ + β₁
   - eᵢ = Yᵢ + Ŷᵢ

   - **Respuesta:** eᵢ = Yᵢ − Ŷᵢ
   - _Explicación:_ Residuo = observado − estimado.

**3. [Completar]** El supuesto de varianza constante de los errores se llama ______.

   - **Respuesta:** homocedasticidad

**4. [Opción múltiple]** Si β̂₁ = 3, ¿cómo se interpreta?

   - **Al aumentar X en 1 unidad, Y aumenta en promedio 3 unidades ✅**
   - Y siempre vale 3
   - X vale 3 cuando Y=0
   - No hay relación lineal

   - **Respuesta:** Al aumentar X en 1 unidad, Y aumenta en promedio 3 unidades
   - _Explicación:_ β₁ es el cambio promedio en Y por cada unidad de aumento en X.

**5. [Verdadero/Falso]** Para la inferencia se supone εᵢ ~ N(0, σ²) (errores normales, media 0 y varianza constante).

   - **Respuesta:** Verdadero
   - _Explicación:_ Normalidad de los errores con E(εᵢ)=0 y Var(εᵢ)=σ².

**6. [Verdadero/Falso]** β₁ = 0 indica ausencia de relación lineal entre X y Y en el modelo.

   - **Respuesta:** Verdadero
   - _Explicación:_ Pendiente cero ⇒ X no aporta información lineal sobre Y.

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

### 📝 Preguntas y respuestas (46 plantillas)

**1. [Completar]** El método de mínimos cuadrados minimiza la suma de los ______ al cuadrado.

   - **Respuesta:** residuos

**2. [Ordenar pasos]** Ordena la derivación de mínimos cuadrados:

   - **Respuesta:** 1) Escribir S(β₀,β₁)=Σ[Yᵢ−(β₀+β₁Xᵢ)]²  2) Derivar respecto de β₀ e igualar a 0  3) Derivar respecto de β₁ e igualar a 0  4) Obtener las ecuaciones normales  5) Despejar β̂₁ = Sxy/Sxx  6) Despejar β̂₀ = Ȳ − β̂₁X̄

**3. [Cálculo numérico]** Se sabe que ΣX²=2206, ΣX=124 y n=8. Calcula Sxx = Σ(Xᵢ−X̄)² = ΣX² − (ΣX)²/n.

   - **Respuesta:** 284
   - _Procedimiento:_ (ΣX)²/n = 124²/8 = 1922 → Sxx = 2206 − 1922 = 284
   - _Explicación:_ Sxx = ΣX² − (ΣX)²/n.

**4. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 7 · 8 · 9 · 10 · 14 · 15 · 16 · 19 · Y · 29 · 33 · 31 · 33 · 44 · 51 · 50 · 58 ·

   - **Respuesta:** 12.25
   - _Procedimiento:_ n = 8 → ΣX = 98 → X̄ = 98 / 8 = 12.25
   - _Explicación:_ X̄ = (ΣX) / n.

**5. [Cálculo numérico]** Con β̂₁ = -1.2407, X̄ = 17.286 y Ȳ = -20.714, calcula el intercepto β̂₀.

   - **Respuesta:** 0.7313
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = -20.714 − -1.2407·17.286 → = -20.714 − -21.446 = 0.7313
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**6. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 7 · 11 · 15 · 17 · 19 · 21 · 23 · Y · 1 · -9 · -18 · -19 · -22 · -28 · -30 ·

   - **Respuesta:** 16.1429
   - _Procedimiento:_ n = 7 → ΣX = 113 → X̄ = 113 / 7 = 16.1429
   - _Explicación:_ X̄ = (ΣX) / n.

**7. [Cálculo numérico]** Con Sxy = -141.571 y Sxx = 69.714, calcula la pendiente β̂₁.

   - **Respuesta:** -2.0307
   - _Procedimiento:_ β̂₁ = Sxy / Sxx = -141.571 / 69.714 = -2.0307
   - _Explicación:_ β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx.

**8. [Cálculo numérico]** Con Sxy = 342 y Sxx = 186, calcula la pendiente β̂₁.

   - **Respuesta:** 1.8387
   - _Procedimiento:_ β̂₁ = Sxy / Sxx = 342 / 186 = 1.8387
   - _Explicación:_ β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx.

**9. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 6 · 10 · 12 · 15 · 17 · 21 · 24 · Y · 24 · 14 · 11 · 9 · 7 · -2 · -4 ·

   - **Respuesta:** 1811
   - _Procedimiento:_ 6² + 10² + 12² + 15² + 17² + 21² + 24² → = 1811
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**10. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media Ȳ:X · 11 · 14 · 15 · 16 · 19 · 22 · Y · 30 · 36 · 38 · 36 · 45 · 48 ·

   - **Respuesta:** 38.8333
   - _Procedimiento:_ n = 6 → ΣY = 233 → Ȳ = 233 / 6 = 38.8333
   - _Explicación:_ Ȳ = (ΣY) / n.

**11. [Cálculo numérico]** Con β̂₁ = 1.3932, X̄ = 13.625 y Ȳ = 31, calcula el intercepto β̂₀.

   - **Respuesta:** 12.0176
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = 31 − 1.3932·13.625 → = 31 − 18.982 = 12.0176
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**12. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media X̄:X · 7 · 10 · 12 · 15 · 19 · 23 · 24 · 28 · Y · 22 · 26 · 29 · 32 · 40 · 42 · 43 · 53 ·

   - **Respuesta:** 17.25
   - _Procedimiento:_ n = 8 → ΣX = 138 → X̄ = 138 / 8 = 17.25
   - _Explicación:_ X̄ = (ΣX) / n.

**13. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 4 · 6 · 10 · 13 · 16 · 20 · 24 · 28 · Y · 14 · 6 · -1 · -9 · -15 · -18 · -26 · -36 ·

   - **Respuesta:** -2267
   - _Procedimiento:_ 4·14 + 6·6 + 10·-1 + 13·-9 + 16·-15 + 20·-18 + 24·-26 + 28·-36 → = -2267
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**14. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 12 · 13 · 16 · 17 · 19 · 20 · 23 · 24 · Y · 36 · 43 · 44 · 52 · 55 · 57 · 61 · 66 ·

   - **Respuesta:** 7751
   - _Procedimiento:_ 12·36 + 13·43 + 16·44 + 17·52 + 19·55 + 20·57 + 23·61 + 24·66 → = 7751
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**15. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 9 · 13 · 16 · 17 · 21 · 25 · Y · -8 · -16 · -18 · -20 · -29 · -35 ·

   - **Respuesta:** 16.8333
   - _Procedimiento:_ n = 6 → ΣX = 101 → X̄ = 101 / 6 = 16.8333
   - _Explicación:_ X̄ = (ΣX) / n.

**16. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 9 · 12 · 13 · 14 · 17 · 21 · 22 · Y · 14 · 11 · 14 · 9 · 8 · -1 · -3 ·

   - **Respuesta:** 7.4286
   - _Procedimiento:_ n = 7 → ΣY = 52 → Ȳ = 52 / 7 = 7.4286
   - _Explicación:_ Ȳ = (ΣY) / n.

**17. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 6 · 8 · 12 · 14 · 15 · 18 · 20 · Y · 1 · -3 · -10 · -8 · -15 · -18 · -18 ·

   - **Respuesta:** 13.2857
   - _Procedimiento:_ n = 7 → ΣX = 93 → X̄ = 93 / 7 = 13.2857
   - _Explicación:_ X̄ = (ΣX) / n.

**18. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 7 · 10 · 11 · 14 · 18 · 19 · 22 · Y · 26 · 28 · 32 · 36 · 48 · 49 · 53 ·

   - **Respuesta:** 14.4286
   - _Procedimiento:_ n = 7 → ΣX = 101 → X̄ = 101 / 7 = 14.4286
   - _Explicación:_ X̄ = (ΣX) / n.

**19. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 5 · 9 · 10 · 13 · 16 · 20 · Y · 15 · 22 · 22 · 31 · 39 · 48 ·

   - **Respuesta:** 1031
   - _Procedimiento:_ 5² + 9² + 10² + 13² + 16² + 20² → = 1031
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**20. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media X̄:X · 15 · 16 · 17 · 20 · 24 · 28 · Y · 55 · 52 · 56 · 62 · 78 · 88 ·

   - **Respuesta:** 20
   - _Procedimiento:_ n = 6 → ΣX = 120 → X̄ = 120 / 6 = 20
   - _Explicación:_ X̄ = (ΣX) / n.

**21. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 8 · 9 · 12 · 14 · 18 · 20 · 24 · 26 · Y · -4 · -11 · -16 · -19 · -24 · -32 · -36 · -43 ·

   - **Respuesta:** -3643
   - _Procedimiento:_ 8·-4 + 9·-11 + 12·-16 + 14·-19 + 18·-24 + 20·-32 + 24·-36 + 26·-43 → = -3643
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**22. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media Ȳ:X · 10 · 13 · 17 · 19 · 23 · 27 · Y · 0 · -5 · -12 · -16 · -21 · -28 ·

   - **Respuesta:** -13.6667
   - _Procedimiento:_ n = 6 → ΣY = -82 → Ȳ = -82 / 6 = -13.6667
   - _Explicación:_ Ȳ = (ΣY) / n.

**23. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 13 · 16 · 19 · 21 · 25 · 28 · 31 · Y · 32 · 33 · 36 · 40 · 46 · 53 · 54 ·

   - **Respuesta:** 42
   - _Procedimiento:_ n = 7 → ΣY = 294 → Ȳ = 294 / 7 = 42
   - _Explicación:_ Ȳ = (ΣY) / n.

**24. [Cálculo numérico]** Con β̂₁ = -1.5085, X̄ = 12.75 y Ȳ = 10.125, calcula el intercepto β̂₀.

   - **Respuesta:** 29.3579
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = 10.125 − -1.5085·12.75 → = 10.125 − -19.233 = 29.3579
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**25. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media Ȳ:X · 14 · 17 · 18 · 21 · 22 · 23 · 24 · 25 · Y · 41 · 44 · 44 · 49 · 50 · 58 · 55 · 58 ·

   - **Respuesta:** 49.875
   - _Procedimiento:_ n = 8 → ΣY = 399 → Ȳ = 399 / 8 = 49.875
   - _Explicación:_ Ȳ = (ΣY) / n.

**26. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media Ȳ:X · 9 · 10 · 13 · 16 · 20 · 22 · Y · 47 · 52 · 60 · 67 · 79 · 84 ·

   - **Respuesta:** 64.8333
   - _Procedimiento:_ n = 6 → ΣY = 389 → Ȳ = 389 / 6 = 64.8333
   - _Explicación:_ Ȳ = (ΣY) / n.

**27. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 11 · 14 · 16 · 20 · 22 · 24 · 27 · Y · 41 · 49 · 52 · 64 · 67 · 72 · 80 ·

   - **Respuesta:** 2762
   - _Procedimiento:_ 11² + 14² + 16² + 20² + 22² + 24² + 27² → = 2762
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**28. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media Ȳ:X · 5 · 6 · 7 · 10 · 13 · 15 · 19 · 23 · Y · 12 · 11 · 10 · 3 · 2 · 1 · -8 · -13 ·

   - **Respuesta:** 2.25
   - _Procedimiento:_ n = 8 → ΣY = 18 → Ȳ = 18 / 8 = 2.25
   - _Explicación:_ Ȳ = (ΣY) / n.

**29. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media Ȳ:X · 8 · 10 · 13 · 15 · 18 · 22 · Y · -14 · -18 · -19 · -26 · -34 · -40 ·

   - **Respuesta:** -25.1667
   - _Procedimiento:_ n = 6 → ΣY = -151 → Ȳ = -151 / 6 = -25.1667
   - _Explicación:_ Ȳ = (ΣY) / n.

**30. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 8 · 11 · 14 · 16 · 19 · 20 · 22 · Y · 39 · 51 · 60 · 64 · 71 · 73 · 80 ·

   - **Respuesta:** 62.5714
   - _Procedimiento:_ n = 7 → ΣY = 438 → Ȳ = 438 / 7 = 62.5714
   - _Explicación:_ Ȳ = (ΣY) / n.

**31. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 14 · 16 · 19 · 20 · 24 · 26 · Y · 42 · 46 · 47 · 51 · 57 · 56 ·

   - **Respuesta:** 6061
   - _Procedimiento:_ 14·42 + 16·46 + 19·47 + 20·51 + 24·57 + 26·56 → = 6061
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**32. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media X̄:X · 7 · 10 · 12 · 13 · 17 · 20 · 21 · 23 · Y · 29 · 41 · 43 · 50 · 59 · 72 · 71 · 79 ·

   - **Respuesta:** 15.375
   - _Procedimiento:_ n = 8 → ΣX = 123 → X̄ = 123 / 8 = 15.375
   - _Explicación:_ X̄ = (ΣX) / n.

**33. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 13 · 15 · 19 · 22 · 25 · 28 · 31 · Y · 40 · 46 · 46 · 52 · 60 · 65 · 64 ·

   - **Respuesta:** 21.8571
   - _Procedimiento:_ n = 7 → ΣX = 153 → X̄ = 153 / 7 = 21.8571
   - _Explicación:_ X̄ = (ΣX) / n.

**34. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 11 · 13 · 17 · 18 · 22 · 23 · 25 · Y · -2 · -9 · -16 · -18 · -27 · -23 · -28 ·

   - **Respuesta:** 18.4286
   - _Procedimiento:_ n = 7 → ΣX = 129 → X̄ = 129 / 7 = 18.4286
   - _Explicación:_ X̄ = (ΣX) / n.

**35. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 8 · 11 · 12 · 13 · 16 · 17 · 20 · Y · 1 · -7 · -8 · -7 · -16 · -18 · -17 ·

   - **Respuesta:** -1158
   - _Procedimiento:_ 8·1 + 11·-7 + 12·-8 + 13·-7 + 16·-16 + 17·-18 + 20·-17 → = -1158
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**36. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 12 · 16 · 18 · 19 · 20 · 23 · Y · 27 · 32 · 34 · 42 · 40 · 42 ·

   - **Respuesta:** 18
   - _Procedimiento:_ n = 6 → ΣX = 108 → X̄ = 108 / 6 = 18
   - _Explicación:_ X̄ = (ΣX) / n.

**37. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media X̄:X · 6 · 7 · 9 · 11 · 12 · 13 · Y · 6 · 3 · 4 · -3 · 0 · -6 ·

   - **Respuesta:** 9.6667
   - _Procedimiento:_ n = 6 → ΣX = 58 → X̄ = 58 / 6 = 9.6667
   - _Explicación:_ X̄ = (ΣX) / n.

**38. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 11 · 12 · 14 · 17 · 19 · 21 · 23 · Y · 30 · 26 · 33 · 34 · 37 · 45 · 42 ·

   - **Respuesta:** 16.7143
   - _Procedimiento:_ n = 7 → ΣX = 117 → X̄ = 117 / 7 = 16.7143
   - _Explicación:_ X̄ = (ΣX) / n.

**39. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 15 · 16 · 18 · 22 · 26 · 28 · 30 · 31 · Y · 41 · 40 · 43 · 57 · 62 · 64 · 73 · 75 ·

   - **Respuesta:** 4610
   - _Procedimiento:_ 15² + 16² + 18² + 22² + 26² + 28² + 30² + 31² → = 4610
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**40. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 12 · 16 · 20 · 21 · 22 · 24 · 28 · Y · 51 · 51 · 63 · 65 · 60 · 67 · 75 ·

   - **Respuesta:** 9081
   - _Procedimiento:_ 12·51 + 16·51 + 20·63 + 21·65 + 22·60 + 24·67 + 28·75 → = 9081
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**41. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media Ȳ:X · 6 · 10 · 13 · 15 · 17 · 21 · Y · 29 · 38 · 42 · 43 · 46 · 58 ·

   - **Respuesta:** 42.6667
   - _Procedimiento:_ n = 6 → ΣY = 256 → Ȳ = 256 / 6 = 42.6667
   - _Explicación:_ Ȳ = (ΣY) / n.

**42. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media Ȳ:X · 7 · 9 · 12 · 14 · 15 · 18 · 21 · Y · 17 · 20 · 27 · 31 · 33 · 44 · 50 ·

   - **Respuesta:** 31.7143
   - _Procedimiento:_ n = 7 → ΣY = 222 → Ȳ = 222 / 7 = 31.7143
   - _Explicación:_ Ȳ = (ΣY) / n.

**43. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media X̄:X · 5 · 7 · 9 · 11 · 13 · 15 · Y · 0 · -1 · -4 · -8 · -7 · -14 ·

   - **Respuesta:** 10
   - _Procedimiento:_ n = 6 → ΣX = 60 → X̄ = 60 / 6 = 10
   - _Explicación:_ X̄ = (ΣX) / n.

**44. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 9 · 10 · 13 · 17 · 20 · 24 · 26 · 30 · Y · 58 · 60 · 68 · 84 · 91 · 103 · 111 · 118 ·

   - **Respuesta:** 18.625
   - _Procedimiento:_ n = 8 → ΣX = 149 → X̄ = 149 / 8 = 18.625
   - _Explicación:_ X̄ = (ΣX) / n.

**45. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 8 · 9 · 10 · 14 · 15 · 18 · 22 · 26 · Y · -6 · -8 · -11 · -18 · -14 · -19 · -26 · -32 ·

   - **Respuesta:** 2150
   - _Procedimiento:_ 8² + 9² + 10² + 14² + 15² + 18² + 22² + 26² → = 2150
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**46. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 10 · 11 · 13 · 14 · 18 · 21 · Y · -7 · -9 · -6 · -12 · -18 · -22 ·

   - **Respuesta:** 14.5
   - _Procedimiento:_ n = 6 → ΣX = 87 → X̄ = 87 / 6 = 14.5
   - _Explicación:_ X̄ = (ΣX) / n.

---

## 📉 Módulo 5 · Ajuste, predicción y residuos

- **Parcial:** Primer parcial
- **Contenido:** Ŷ, eᵢ, propiedades (Σeᵢ=0), interpolación vs. extrapolación.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (10 plantillas)

**1. [Verdadero/Falso]** También se cumple ΣeᵢXᵢ = 0.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es una de las ecuaciones normales de mínimos cuadrados.

**2. [Cálculo numérico]** Para X = 15 el valor observado es Y = -17 y el estimado es Ŷ = -18.3324. Calcula el residuo eᵢ.

   - **Respuesta:** 1.3324
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = -17 − -18.3324 = 1.3324
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

**3. [Verdadero/Falso]** Una propiedad de mínimos cuadrados es que Σeᵢ = 0 (los residuos suman cero).

   - **Respuesta:** Verdadero
   - _Explicación:_ Σeᵢ=0 y ē=0; además ΣeᵢXᵢ=0 y la recta pasa por (X̄,Ȳ).

**4. [Opción múltiple]** Predecir Y para un X fuera del rango observado se llama:

   - **Extrapolación (riesgosa) ✅**
   - Interpolación
   - Residuo
   - Homocedasticidad

   - **Respuesta:** Extrapolación (riesgosa)
   - _Explicación:_ Extrapolar fuera del rango es riesgoso; interpolar es dentro del rango.

**5. [Cálculo numérico]** La recta ajustada es Ŷ = 11.9517 + -1.6081·X. Predice Ŷ para X = 26 (interpolación).

   - **Respuesta:** -29.8601
   - _Procedimiento:_ Ŷ = 11.9517 + -1.6081·26 → = 11.9517 + -41.812 = -29.8601
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**6. [Cálculo numérico]** La recta ajustada es Ŷ = 31.0872 + 1.896·X. Predice Ŷ para X = 26 (interpolación).

   - **Respuesta:** 80.3826
   - _Procedimiento:_ Ŷ = 31.0872 + 1.896·26 → = 31.0872 + 49.295 = 80.3826
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**7. [Cálculo numérico]** Para X = 21 el valor observado es Y = 35 y el estimado es Ŷ = 37.9647. Calcula el residuo eᵢ.

   - **Respuesta:** -2.9647
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = 35 − 37.9647 = -2.9647
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

**8. [Completar]** La recta de mínimos cuadrados siempre pasa por el punto (X̄, ____).

   - **Respuesta:** Ȳ

**9. [Cálculo numérico]** La recta ajustada es Ŷ = -3.3455 + 3.4188·X. Predice Ŷ para X = 17 (interpolación).

   - **Respuesta:** 54.7749
   - _Procedimiento:_ Ŷ = -3.3455 + 3.4188·17 → = -3.3455 + 58.12 = 54.7749
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**10. [Cálculo numérico]** Para X = 16 el valor observado es Y = 0 y el estimado es Ŷ = -1.931. Calcula el residuo eᵢ.

   - **Respuesta:** 1.931
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = 0 − -1.931 = 1.931
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

---

## 🎯 Módulo 6 · Propiedades de los estimadores

- **Parcial:** Segundo parcial
- **Contenido:** Insesgado/eficiente/consistente/suficiente y distribución de β̂.
- **Tipo de práctica:** Quiz + cálculo

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Completar]** La varianza de la pendiente es Var(β̂₁) = σ²/____ .

   - **Respuesta:** Sxx

**2. [Cálculo numérico]** Con σ̂² = 3.206 y Sxx = 255.875, calcula Var(β̂₁) = σ²/Sxx.

   - **Respuesta:** 0.01253
   - _Procedimiento:_ Var(β̂₁) = σ²/Sxx = 3.206/255.875 = 0.01253
   - _Explicación:_ Var(β̂₁) = σ²/Sxx.

**3. [Verdadero/Falso]** Un estimador insesgado cumple E(β̂ⱼ) = βⱼ.

   - **Respuesta:** Verdadero
   - _Explicación:_ Insesgadez: su valor esperado es el parámetro verdadero.

**4. [Opción múltiple]** La distribución de la pendiente bajo errores normales es:

   - **β̂₁ ~ N(β₁, σ²/Sxx) ✅**
   - β̂₁ ~ N(0, 1)
   - β̂₁ ~ Poisson(σ²)
   - β̂₁ ~ Uniforme

   - **Respuesta:** β̂₁ ~ N(β₁, σ²/Sxx)
   - _Explicación:_ β̂₁ ~ N(β₁, σ²/Sxx), con Sxx=Σ(Xᵢ−X̄)².

**5. [Relacionar]** Relaciona cada propiedad de un estimador con su definición:

   - **Respuesta:** Insesgado ↔ E(β̂ⱼ) = βⱼ · Eficiente ↔ Menor varianza entre los insesgados · Consistente ↔ Se acerca al parámetro al crecer n · Suficiente ↔ Concentra la información de la muestra

---

## 🔬 Módulo 7 · σ² e inferencia

- **Parcial:** Segundo parcial
- **Contenido:** σ̂²=SCE/(n−2), error estándar, IC y prueba t sobre la pendiente.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Cálculo numérico]** IC al 95% para β₁: β̂₁ ± t·(s/√Sxx). Con β̂₁ = 1.4677, s = 2.074, Sxx = 388.875 y t₍0.025,6₎ = 2.447, calcula el límite superior del intervalo.

   - **Respuesta:** 1.7251
   - _Procedimiento:_ s/√Sxx = 0.1052 → t·EE = 2.447·0.1052 = 0.2574 → Límite superior = 1.4677 + 0.2574 = 1.7251
   - _Explicación:_ Límite superior = β̂₁ + t·(s/√Sxx).

**2. [Cálculo numérico]** IC al 95% para β₁: β̂₁ ± t·(s/√Sxx). Con β̂₁ = -2.1414, s = 2.281, Sxx = 339.5 y t₍0.025,6₎ = 2.447, calcula el límite superior del intervalo.

   - **Respuesta:** -1.8385
   - _Procedimiento:_ s/√Sxx = 0.1238 → t·EE = 2.447·0.1238 = 0.3029 → Límite superior = -2.1414 + 0.3029 = -1.8385
   - _Explicación:_ Límite superior = β̂₁ + t·(s/√Sxx).

**3. [Opción múltiple]** En la prueba H₀: β₁=0 vs H₁: β₁≠0, si se rechaza H₀:

   - **Hay evidencia estadística de relación lineal ✅**
   - Se demuestra causalidad
   - No hay relación
   - El R² es 0

   - **Respuesta:** Hay evidencia estadística de relación lineal
   - _Explicación:_ Rechazar H₀ indica relación lineal significativa, pero asociación ≠ causalidad.

**4. [Cálculo numérico]** Prueba H₀: β₁=0. Con β̂₁ = 1.6071, s = 2.735 y Sxx = 28, calcula el estadístico t = β̂₁ / (s/√Sxx).

   - **Respuesta:** 3.1097
   - _Procedimiento:_ Error estándar = s/√Sxx = 2.735/√28 = 0.5168 → t = β̂₁ / EE = 1.6071 / 0.5168 = 3.1097
   - _Explicación:_ t = (β̂₁ − 0) / (s/√Sxx), con n−2 grados de libertad.

**5. [Verdadero/Falso]** Encontrar una relación lineal significativa demuestra que X causa Y.

   - **Respuesta:** Falso
   - _Explicación:_ La asociación estadística no implica causalidad.

**6. [Completar]** Los grados de libertad para la inferencia sobre la pendiente son n − ____ .

   - **Respuesta:** 2

**7. [Cálculo numérico]** Con SCE = 43.123 y n = 8, estima la varianza del error σ̂² = SCE/(n−2).

   - **Respuesta:** 7.1872
   - _Procedimiento:_ n − 2 = 6 → σ̂² = SCE/(n−2) = 43.123/6 = 7.1872
   - _Explicación:_ σ̂² = SCE/(n−2) (la SCE se divide entre los grados de libertad n−2).

**8. [Cálculo numérico]** Prueba H₀: β₁=0. Con β̂₁ = -1.6794, s = 2.501 y Sxx = 139.333, calcula el estadístico t = β̂₁ / (s/√Sxx).

   - **Respuesta:** -7.9273
   - _Procedimiento:_ Error estándar = s/√Sxx = 2.501/√139.333 = 0.2119 → t = β̂₁ / EE = -1.6794 / 0.2119 = -7.9273
   - _Explicación:_ t = (β̂₁ − 0) / (s/√Sxx), con n−2 grados de libertad.

---

## 📏 Módulo 8 · Respuesta media y predicción

- **Parcial:** Segundo parcial
- **Contenido:** IC para E(Y|x₀) vs. intervalo de predicción individual.
- **Tipo de práctica:** Constructor de intervalos

### 📝 Preguntas y respuestas (7 plantillas)

**1. [Cálculo numérico]** IC 95% para la respuesta media E(Y|X=8): Ŷ₀ ± t·s·√(1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = 1.156, s = 1.8, n = 6, X̄ = 14.5, Sxx = 131.5 y t = 2.776, da el límite superior.

   - **Respuesta:** 4.6471
   - _Procedimiento:_ (x₀−X̄)² = (8−14.5)² = 42.25 → raíz = √(1/6 + 42.25/131.5) = 0.6985 → semi-amplitud = t·s·raíz = 3.4912 → Límite superior = Ŷ₀ + 3.4912 = 4.6471
   - _Explicación:_ La respuesta media usa √(1/n + (x₀−X̄)²/Sxx).

**2. [Cálculo numérico]** Intervalo de predicción 95% para una observación nueva en X=11: Ŷ₀ ± t·s·√(1 + 1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = 42.785, s = 2.592, n = 6, X̄ = 9.667, Sxx = 43.333 y t = 2.776, da el límite superior.

   - **Respuesta:** 50.6913
   - _Procedimiento:_ raíz = √(1 + 1/6 + (x₀−X̄)²/Sxx) = 1.099 → semi-amplitud = t·s·raíz = 7.9067 → Límite superior = Ŷ₀ + 7.9067 = 50.6913
   - _Explicación:_ El intervalo de predicción añade el término +1 dentro de la raíz (es más ancho que el de la media).

**3. [Opción múltiple]** La diferencia entre el intervalo de predicción y el de la media es:

   - **Un término adicional «+1» dentro de la raíz ✅**
   - Cambiar t por z
   - Usar n−1 en vez de n−2
   - No hay diferencia

   - **Respuesta:** Un término adicional «+1» dentro de la raíz
   - _Explicación:_ Predicción: √(1 + 1/n + (x₀−X̄)²/Sxx); media: √(1/n + (x₀−X̄)²/Sxx).

**4. [Verdadero/Falso]** La amplitud de los intervalos aumenta al alejarse x₀ de X̄.

   - **Respuesta:** Verdadero
   - _Explicación:_ El término (x₀−X̄)²/Sxx crece al alejarse de la media.

**5. [Opción múltiple]** ¿Cuál intervalo es normalmente más ancho?

   - **El de predicción de una nueva observación ✅**
   - El de la respuesta media
   - Siempre son iguales
   - Ninguno tiene amplitud

   - **Respuesta:** El de predicción de una nueva observación
   - _Explicación:_ El de predicción añade el término +1 dentro de la raíz ⇒ es más ancho.

**6. [Cálculo numérico]** Intervalo de predicción 95% para una observación nueva en X=27: Ŷ₀ ± t·s·√(1 + 1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = -25.477, s = 2.141, n = 6, X̄ = 20.5, Sxx = 125.5 y t = 2.776, da el límite superior.

   - **Respuesta:** -18.1892
   - _Procedimiento:_ raíz = √(1 + 1/6 + (x₀−X̄)²/Sxx) = 1.2261 → semi-amplitud = t·s·raíz = 7.2876 → Límite superior = Ŷ₀ + 7.2876 = -18.1892
   - _Explicación:_ El intervalo de predicción añade el término +1 dentro de la raíz (es más ancho que el de la media).

**7. [Cálculo numérico]** IC 95% para la respuesta media E(Y|X=19): Ŷ₀ ± t·s·√(1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = -33.107, s = 2.258, n = 7, X̄ = 18.714, Sxx = 211.429 y t = 2.571, da el límite superior.

   - **Respuesta:** -30.9101
   - _Procedimiento:_ (x₀−X̄)² = (19−18.714)² = 0.082 → raíz = √(1/7 + 0.082/211.429) = 0.3785 → semi-amplitud = t·s·raíz = 2.1967 → Límite superior = Ŷ₀ + 2.1967 = -30.9101
   - _Explicación:_ La respuesta media usa √(1/n + (x₀−X̄)²/Sxx).

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

**1. [Cálculo numérico]** IC 95% para σ²: [ (n−2)σ̂² / χ²₍0.975₎ , (n−2)σ̂² / χ²₍0.025₎ ]. Con (n−2) = 6, σ̂² = 6.509, χ²₍0.975,6₎ = 14.449 y χ²₍0.025,6₎ = 1.237, calcula el límite inferior.

   - **Respuesta:** 2.7029
   - _Procedimiento:_ (n−2)σ̂² = 6·6.509 = 39.054 → Límite inferior = 39.054 / 14.449 = 2.7029
   - _Explicación:_ El límite inferior divide (n−2)σ̂² entre el cuantil grande χ²₍0.975₎.

**2. [Verdadero/Falso]** Un R² alto por sí solo garantiza que el modelo es válido.

   - **Respuesta:** Falso
   - _Explicación:_ Un R² alto no garantiza validez ni causalidad; hay que revisar supuestos.

**3. [Cálculo numérico]** Con SCT = 689.5 y SCR = 653.12, calcula la suma de cuadrados del error SCE usando la identidad SCT = SCR + SCE.

   - **Respuesta:** 36.3796
   - _Procedimiento:_ SCE = SCT − SCR = 689.5 − 653.12 = 36.3796
   - _Explicación:_ SCE = SCT − SCR.

**4. [Cálculo numérico]** Con ΣY² = 566, ΣY = -26 y n = 6, calcula la suma de cuadrados total SCT = ΣY² − (ΣY)²/n.

   - **Respuesta:** 453.3333
   - _Procedimiento:_ (ΣY)²/n = -26²/6 = 112.667 → SCT = 566 − 112.667 = 453.3333
   - _Explicación:_ SCT = Σ(Yᵢ−Ȳ)² = ΣY² − (ΣY)²/n.

**5. [Completar]** La identidad de la variabilidad es SCT = SCR + ____ .

   - **Respuesta:** SCE

**6. [Cálculo numérico]** Con SCR = 716.8 y SCT = 719.333, calcula el coeficiente de determinación R².

   - **Respuesta:** 0.9965
   - _Procedimiento:_ R² = SCR / SCT = 716.8 / 719.333 = 0.9965
   - _Explicación:_ R² = SCR/SCT = 1 − SCE/SCT.

**7. [Cálculo numérico]** Con β̂₁ = 1.9472 y Sxy = 209, calcula la suma de cuadrados de la regresión SCR = β̂₁·Sxy.

   - **Respuesta:** 406.9658
   - _Procedimiento:_ SCR = β̂₁·Sxy = 1.9472·209 = 406.9658
   - _Explicación:_ SCR = β̂₁·Sxy = Sxy²/Sxx.

**8. [Opción múltiple]** Un R² = 0.88 se interpreta como:

   - **El modelo explica el 88% de la variabilidad de Y ✅**
   - El 88% de las observaciones son correctas
   - Existe causalidad del 88%
   - El error es del 88%

   - **Respuesta:** El modelo explica el 88% de la variabilidad de Y
   - _Explicación:_ R² = proporción de variabilidad de Y explicada por el modelo. No es % de aciertos ni causalidad.

**9. [Cálculo numérico]** Con ΣY² = 9783, ΣY = 255 y n = 7, calcula la suma de cuadrados total SCT = ΣY² − (ΣY)²/n.

   - **Respuesta:** 493.7143
   - _Procedimiento:_ (ΣY)²/n = 255²/7 = 9289.286 → SCT = 9783 − 9289.286 = 493.7143
   - _Explicación:_ SCT = Σ(Yᵢ−Ȳ)² = ΣY² − (ΣY)²/n.

**10. [Cálculo numérico]** Con β̂₁ = -1.9194 y Sxy = -321.5, calcula la suma de cuadrados de la regresión SCR = β̂₁·Sxy.

   - **Respuesta:** 617.0881
   - _Procedimiento:_ SCR = β̂₁·Sxy = -1.9194·-321.5 = 617.0881
   - _Explicación:_ SCR = β̂₁·Sxy = Sxy²/Sxx.

---

