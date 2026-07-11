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

**1. [Opción múltiple]** «Resumir los datos con medias y gráficas, sin generalizar» corresponde a estadística:

   - **Descriptiva ✅**
   - Inferencial
   - Predictiva
   - Bayesiana

   - **Respuesta:** Descriptiva
   - _Explicación:_ La estadística descriptiva resume; la inferencial generaliza a la población; la predictiva anticipa valores.

**2. [Opción múltiple]** ¿Cuál de estos datos es cualitativo?

   - **Tipo de póliza (auto, vida, gastos médicos) ✅**
   - Monto del siniestro
   - Edad del asegurado
   - Número de reclamaciones

   - **Respuesta:** Tipo de póliza (auto, vida, gastos médicos)
   - _Explicación:_ Cualitativo = categorías (tipo de póliza). Los demás son cuantitativos.

**3. [Opción múltiple]** En un estudio de «gastos de publicidad vs. ventas», ¿cuál es la variable respuesta (Y)?

   - **Las ventas ✅**
   - Los gastos de publicidad
   - El número de vendedores
   - El mes

   - **Respuesta:** Las ventas
   - _Explicación:_ La respuesta Y es la que se quiere explicar/predecir: las ventas.

**4. [Relacionar]** Relaciona cada rama con su objetivo:

   - **Respuesta:** Descriptiva ↔ Resumir y describir los datos · Inferencial ↔ Generalizar a la población · Predictiva ↔ Anticipar valores futuros

**5. [Verdadero/Falso]** La regresión lineal múltiple usa dos o más variables explicativas.

   - **Respuesta:** Verdadero
   - _Explicación:_ Simple: una X. Múltiple: varias X. (En este curso solo se desarrolla la simple.)

**6. [Opción múltiple]** Un modelo de regresión sirve para:

   - **Explicar o predecir una variable respuesta a partir de otra(s) ✅**
   - Ordenar datos alfabéticamente
   - Calcular solo la moda
   - Contar categorías

   - **Respuesta:** Explicar o predecir una variable respuesta a partir de otra(s)
   - _Explicación:_ La regresión modela la relación para explicar/predecir Y con X.

---

## 🧭 Módulo 2 · Construcción de un modelo

- **Parcial:** Primer parcial
- **Contenido:** Recolección, calidad de datos, dispersión, ajuste, diagnóstico y sobreajuste.
- **Tipo de práctica:** Ordenar y decidir

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Opción múltiple]** Un modelo que se ajusta muy bien a los datos usados pero falla con datos nuevos está:

   - **Sobreajustado ✅**
   - Insesgado
   - Bien validado
   - Subajustado por falta de datos

   - **Respuesta:** Sobreajustado
   - _Explicación:_ Sobreajuste: ajusta el ruido de la muestra y no generaliza.

**2. [Opción múltiple]** Detectas una edad de «999 años» en la base. Es un valor:

   - **Erróneo ✅**
   - Perdido
   - Correcto
   - Predicho

   - **Respuesta:** Erróneo
   - _Explicación:_ Es un valor erróneo (imposible). Un perdido sería un dato ausente.

**3. [Verdadero/Falso]** Un valor atípico es una observación que se aleja notablemente del resto.

   - **Respuesta:** Verdadero
   - _Explicación:_ Los atípicos pueden distorsionar el ajuste y deben revisarse.

**4. [Opción múltiple]** Antes de ajustar la recta conviene ver el diagrama de dispersión para:

   - **Comprobar si la relación parece lineal ✅**
   - Ordenar los datos
   - Calcular la moda
   - Eliminar la variable Y

   - **Respuesta:** Comprobar si la relación parece lineal
   - _Explicación:_ El diagrama de dispersión muestra la forma de la relación (si es lineal, etc.).

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

**1. [Opción múltiple]** El residuo se define como:

   - **eᵢ = Yᵢ − Ŷᵢ ✅**
   - eᵢ = Ŷᵢ − Xᵢ
   - eᵢ = β₀ + β₁
   - eᵢ = Yᵢ + Ŷᵢ

   - **Respuesta:** eᵢ = Yᵢ − Ŷᵢ
   - _Explicación:_ Residuo = observado − estimado.

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

**4. [Verdadero/Falso]** Para la inferencia se supone εᵢ ~ N(0, σ²) (errores normales, media 0 y varianza constante).

   - **Respuesta:** Verdadero
   - _Explicación:_ Normalidad de los errores con E(εᵢ)=0 y Var(εᵢ)=σ².

**5. [Completar]** El supuesto de varianza constante de los errores se llama ______.

   - **Respuesta:** homocedasticidad

**6. [Relacionar]** Relaciona cada símbolo con su significado en Yᵢ = β₀ + β₁Xᵢ + εᵢ:

   - **Respuesta:** β₀ ↔ Ordenada al origen · β₁ ↔ Pendiente · εᵢ ↔ Error aleatorio · Ŷᵢ ↔ Valor estimado

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

**1. [Cálculo numérico]** Con β̂₁ = 1.9525, X̄ = 15.25 y Ȳ = 46, calcula el intercepto β̂₀.

   - **Respuesta:** 16.225
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = 46 − 1.9525·15.25 → = 46 − 29.775 = 16.225
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**2. [Completar]** El método de mínimos cuadrados minimiza la suma de los ______ al cuadrado.

   - **Respuesta:** residuos

**3. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 12 · 14 · 15 · 19 · 20 · 22 · 23 · Y · 22 · 23 · 31 · 36 · 36 · 37 · 40 ·

   - **Respuesta:** 32.1429
   - _Procedimiento:_ n = 7 → ΣY = 225 → Ȳ = 225 / 7 = 32.1429
   - _Explicación:_ Ȳ = (ΣY) / n.

**4. [Ordenar pasos]** Ordena la derivación de mínimos cuadrados:

   - **Respuesta:** 1) Escribir S(β₀,β₁)=Σ[Yᵢ−(β₀+β₁Xᵢ)]²  2) Derivar respecto de β₀ e igualar a 0  3) Derivar respecto de β₁ e igualar a 0  4) Obtener las ecuaciones normales  5) Despejar β̂₁ = Sxy/Sxx  6) Despejar β̂₀ = Ȳ − β̂₁X̄

**5. [Cálculo numérico]** Se sabe que ΣX²=711, ΣX=67 y n=7. Calcula Sxx = Σ(Xᵢ−X̄)² = ΣX² − (ΣX)²/n.

   - **Respuesta:** 69.7143
   - _Procedimiento:_ (ΣX)²/n = 67²/7 = 641.286 → Sxx = 711 − 641.286 = 69.7143
   - _Explicación:_ Sxx = ΣX² − (ΣX)²/n.

**6. [Cálculo numérico]** Con Sxy = 201 y Sxx = 122.875, calcula la pendiente β̂₁.

   - **Respuesta:** 1.6358
   - _Procedimiento:_ β̂₁ = Sxy / Sxx = 201 / 122.875 = 1.6358
   - _Explicación:_ β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx.

**7. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media X̄:X · 12 · 13 · 15 · 19 · 20 · 24 · 26 · 27 · Y · 4 · 4 · -4 · -7 · -13 · -16 · -22 · -17 ·

   - **Respuesta:** 19.5
   - _Procedimiento:_ n = 8 → ΣX = 156 → X̄ = 156 / 8 = 19.5
   - _Explicación:_ X̄ = (ΣX) / n.

**8. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 11 · 14 · 18 · 20 · 23 · 25 · 26 · 28 · Y · 27 · 31 · 39 · 42 · 42 · 51 · 46 · 50 ·

   - **Respuesta:** 3655
   - _Procedimiento:_ 11² + 14² + 18² + 20² + 23² + 25² + 26² + 28² → = 3655
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**9. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 13 · 17 · 21 · 23 · 27 · 29 · Y · 54 · 63 · 76 · 83 · 99 · 100 ·

   - **Respuesta:** 21.6667
   - _Procedimiento:_ n = 6 → ΣX = 130 → X̄ = 130 / 6 = 21.6667
   - _Explicación:_ X̄ = (ΣX) / n.

**10. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 11 · 12 · 16 · 20 · 21 · 22 · Y · 6 · 8 · -5 · -9 · -12 · -16 ·

   - **Respuesta:** 1846
   - _Procedimiento:_ 11² + 12² + 16² + 20² + 21² + 22² → = 1846
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**11. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media X̄:X · 15 · 18 · 22 · 24 · 25 · 27 · Y · -19 · -23 · -32 · -39 · -42 · -45 ·

   - **Respuesta:** 21.8333
   - _Procedimiento:_ n = 6 → ΣX = 131 → X̄ = 131 / 6 = 21.8333
   - _Explicación:_ X̄ = (ΣX) / n.

**12. [Cálculo numérico]** Con β̂₁ = -1.3857, X̄ = 15.5 y Ȳ = 6, calcula el intercepto β̂₀.

   - **Respuesta:** 27.4786
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = 6 − -1.3857·15.5 → = 6 − -21.479 = 27.4786
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**13. [Cálculo numérico]** Con Sxy = -560.5 y Sxx = 253.875, calcula la pendiente β̂₁.

   - **Respuesta:** -2.2078
   - _Procedimiento:_ β̂₁ = Sxy / Sxx = -560.5 / 253.875 = -2.2078
   - _Explicación:_ β̂₁ = Σ(Xᵢ−X̄)(Yᵢ−Ȳ) / Σ(Xᵢ−X̄)² = Sxy / Sxx.

**14. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 9 · 12 · 15 · 16 · 18 · 20 · Y · 46 · 55 · 59 · 64 · 69 · 69 ·

   - **Respuesta:** 60.3333
   - _Procedimiento:_ n = 6 → ΣY = 362 → Ȳ = 362 / 6 = 60.3333
   - _Explicación:_ Ȳ = (ΣY) / n.

**15. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 12 · 13 · 14 · 17 · 20 · 24 · 26 · 30 · Y · -6 · -11 · -10 · -22 · -25 · -31 · -38 · -44 ·

   - **Respuesta:** 19.5
   - _Procedimiento:_ n = 8 → ΣX = 156 → X̄ = 156 / 8 = 19.5
   - _Explicación:_ X̄ = (ΣX) / n.

**16. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 14 · 18 · 19 · 22 · 24 · 26 · 29 · Y · -21 · -26 · -28 · -32 · -37 · -44 · -46 ·

   - **Respuesta:** 3458
   - _Procedimiento:_ 14² + 18² + 19² + 22² + 24² + 26² + 29² → = 3458
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**17. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 13 · 16 · 18 · 20 · 22 · 25 · 29 · Y · 38 · 48 · 48 · 54 · 61 · 62 · 75 ·

   - **Respuesta:** 55.1429
   - _Procedimiento:_ n = 7 → ΣY = 386 → Ȳ = 386 / 7 = 55.1429
   - _Explicación:_ Ȳ = (ΣY) / n.

**18. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media Ȳ:X · 7 · 9 · 13 · 15 · 19 · 22 · 24 · Y · 24 · 24 · 30 · 33 · 40 · 45 · 47 ·

   - **Respuesta:** 34.7143
   - _Procedimiento:_ n = 7 → ΣY = 243 → Ȳ = 243 / 7 = 34.7143
   - _Explicación:_ Ȳ = (ΣY) / n.

**19. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 7 · 11 · 14 · 18 · 20 · 22 · Y · 25 · 32 · 38 · 42 · 46 · 49 ·

   - **Respuesta:** 3813
   - _Procedimiento:_ 7·25 + 11·32 + 14·38 + 18·42 + 20·46 + 22·49 → = 3813
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**20. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media Ȳ:X · 14 · 17 · 18 · 21 · 24 · 25 · 29 · 32 · Y · 43 · 48 · 48 · 60 · 66 · 62 · 75 · 76 ·

   - **Respuesta:** 59.75
   - _Procedimiento:_ n = 8 → ΣY = 478 → Ȳ = 478 / 8 = 59.75
   - _Explicación:_ Ȳ = (ΣY) / n.

**21. [Cálculo numérico]** Con β̂₁ = -1.3948, X̄ = 22.857 y Ȳ = -19.571, calcula el intercepto β̂₀.

   - **Respuesta:** 12.3088
   - _Procedimiento:_ β̂₀ = Ȳ − β̂₁·X̄ = -19.571 − -1.3948·22.857 → = -19.571 − -31.88 = 12.3088
   - _Explicación:_ β̂₀ = Ȳ − β̂₁·X̄.

**22. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media X̄:X · 13 · 16 · 18 · 19 · 21 · 24 · Y · 48 · 53 · 55 · 61 · 63 · 65 ·

   - **Respuesta:** 18.5
   - _Procedimiento:_ n = 6 → ΣX = 111 → X̄ = 111 / 6 = 18.5
   - _Explicación:_ X̄ = (ΣX) / n.

**23. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 6 · 9 · 11 · 12 · 16 · 18 · 19 · Y · 4 · 0 · -1 · -2 · -12 · -10 · -12 ·

   - **Respuesta:** -4.7143
   - _Procedimiento:_ n = 7 → ΣY = -33 → Ȳ = -33 / 7 = -4.7143
   - _Explicación:_ Ȳ = (ΣY) / n.

**24. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 6 · 9 · 10 · 12 · 16 · 17 · 19 · Y · -2 · -10 · -7 · -14 · -24 · -25 · -30 ·

   - **Respuesta:** -1719
   - _Procedimiento:_ 6·-2 + 9·-10 + 10·-7 + 12·-14 + 16·-24 + 17·-25 + 19·-30 → = -1719
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**25. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media X̄:X · 7 · 11 · 12 · 16 · 17 · 21 · 23 · 27 · Y · 39 · 47 · 48 · 64 · 69 · 77 · 81 · 97 ·

   - **Respuesta:** 16.75
   - _Procedimiento:_ n = 8 → ΣX = 134 → X̄ = 134 / 8 = 16.75
   - _Explicación:_ X̄ = (ΣX) / n.

**26. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 11 · 15 · 17 · 19 · 20 · 24 · 28 · Y · 5 · 0 · -1 · -11 · -10 · -20 · -26 ·

   - **Respuesta:** 2756
   - _Procedimiento:_ 11² + 15² + 17² + 19² + 20² + 24² + 28² → = 2756
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**27. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 9 · 13 · 16 · 18 · 19 · 21 · 22 · 23 · Y · 34 · 37 · 43 · 47 · 52 · 54 · 50 · 54 ·

   - **Respuesta:** 46.375
   - _Procedimiento:_ n = 8 → ΣY = 371 → Ȳ = 371 / 8 = 46.375
   - _Explicación:_ Ȳ = (ΣY) / n.

**28. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 10 · 11 · 14 · 18 · 22 · 25 · 26 · Y · 31 · 29 · 35 · 46 · 56 · 60 · 64 ·

   - **Respuesta:** 18
   - _Procedimiento:_ n = 7 → ΣX = 126 → X̄ = 126 / 7 = 18
   - _Explicación:_ X̄ = (ΣX) / n.

**29. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media Ȳ:X · 13 · 14 · 18 · 19 · 21 · 22 · 26 · 29 · Y · -15 · -19 · -23 · -27 · -32 · -31 · -41 · -51 ·

   - **Respuesta:** -29.875
   - _Procedimiento:_ n = 8 → ΣY = -239 → Ȳ = -239 / 8 = -29.875
   - _Explicación:_ Ȳ = (ΣY) / n.

**30. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media X̄:X · 8 · 11 · 15 · 18 · 19 · 22 · Y · 24 · 31 · 35 · 43 · 41 · 47 ·

   - **Respuesta:** 15.5
   - _Procedimiento:_ n = 6 → ΣX = 93 → X̄ = 93 / 6 = 15.5
   - _Explicación:_ X̄ = (ΣX) / n.

**31. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media Ȳ:X · 12 · 16 · 17 · 19 · 20 · 21 · 22 · 24 · Y · -16 · -16 · -19 · -21 · -26 · -28 · -26 · -28 ·

   - **Respuesta:** -22.5
   - _Procedimiento:_ n = 8 → ΣY = -180 → Ȳ = -180 / 8 = -22.5
   - _Explicación:_ Ȳ = (ΣY) / n.

**32. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media Ȳ:X · 15 · 16 · 20 · 22 · 24 · 25 · 28 · Y · -10 · -15 · -20 · -26 · -28 · -24 · -30 ·

   - **Respuesta:** -21.8571
   - _Procedimiento:_ n = 7 → ΣY = -153 → Ȳ = -153 / 7 = -21.8571
   - _Explicación:_ Ȳ = (ΣY) / n.

**33. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 7 · 11 · 12 · 16 · 19 · 22 · 24 · Y · 47 · 53 · 53 · 60 · 66 · 76 · 75 ·

   - **Respuesta:** 7234
   - _Procedimiento:_ 7·47 + 11·53 + 12·53 + 16·60 + 19·66 + 22·76 + 24·75 → = 7234
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**34. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media X̄:X · 8 · 11 · 13 · 17 · 20 · 21 · 25 · 28 · Y · 48 · 61 · 63 · 74 · 82 · 83 · 92 · 103 ·

   - **Respuesta:** 17.875
   - _Procedimiento:_ n = 8 → ΣX = 143 → X̄ = 143 / 8 = 17.875
   - _Explicación:_ X̄ = (ΣX) / n.

**35. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 10 · 11 · 13 · 14 · 17 · 19 · Y · -9 · -8 · -15 · -13 · -21 · -22 ·

   - **Respuesta:** 1236
   - _Procedimiento:_ 10² + 11² + 13² + 14² + 17² + 19² → = 1236
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**36. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media X̄:X · 16 · 19 · 23 · 26 · 28 · 30 · 34 · Y · 33 · 40 · 42 · 51 · 51 · 57 · 61 ·

   - **Respuesta:** 25.1429
   - _Procedimiento:_ n = 7 → ΣX = 176 → X̄ = 176 / 7 = 25.1429
   - _Explicación:_ X̄ = (ΣX) / n.

**37. [Cálculo numérico]** Con los datos de publicidad (X) y siniestros (Y), calcula la media X̄:X · 8 · 9 · 10 · 12 · 15 · 18 · Y · 34 · 39 · 39 · 42 · 51 · 58 ·

   - **Respuesta:** 12
   - _Procedimiento:_ n = 6 → ΣX = 72 → X̄ = 72 / 6 = 12
   - _Explicación:_ X̄ = (ΣX) / n.

**38. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 15 · 16 · 19 · 23 · 24 · 27 · 29 · Y · 54 · 55 · 61 · 68 · 68 · 72 · 75 ·

   - **Respuesta:** 3517
   - _Procedimiento:_ 15² + 16² + 19² + 23² + 24² + 27² + 29² → = 3517
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**39. [Cálculo numérico]** Con los datos de porcentaje de incremento (X) y ventas (Y), calcula la media X̄:X · 14 · 16 · 18 · 19 · 23 · 26 · 29 · 33 · Y · -13 · -13 · -19 · -20 · -23 · -28 · -32 · -36 ·

   - **Respuesta:** 22.25
   - _Procedimiento:_ n = 8 → ΣX = 178 → X̄ = 178 / 8 = 22.25
   - _Explicación:_ X̄ = (ΣX) / n.

**40. [Cálculo numérico]** Con los datos de gastos de promoción (X) y ventas (Y), calcula la media Ȳ:X · 16 · 20 · 22 · 25 · 27 · 28 · 29 · Y · 55 · 68 · 79 · 86 · 93 · 93 · 100 ·

   - **Respuesta:** 82
   - _Procedimiento:_ n = 7 → ΣY = 574 → Ȳ = 574 / 7 = 82
   - _Explicación:_ Ȳ = (ΣY) / n.

**41. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣX²:X · 14 · 16 · 18 · 22 · 23 · 26 · Y · 52 · 52 · 60 · 60 · 62 · 68 ·

   - **Respuesta:** 2465
   - _Procedimiento:_ 14² + 16² + 18² + 22² + 23² + 26² → = 2465
   - _Explicación:_ ΣX² se obtiene sumando cada X².

**42. [Cálculo numérico]** Con los datos de antigüedad (X) y prima (Y), calcula la media X̄:X · 10 · 13 · 15 · 17 · 19 · 22 · 23 · 24 · Y · 21 · 22 · 30 · 31 · 32 · 39 · 41 · 39 ·

   - **Respuesta:** 17.875
   - _Procedimiento:_ n = 8 → ΣX = 143 → X̄ = 143 / 8 = 17.875
   - _Explicación:_ X̄ = (ΣX) / n.

**43. [Cálculo numérico]** Con los datos de horas de estudio (X) y calificación (Y), calcula la media X̄:X · 9 · 12 · 16 · 18 · 19 · 22 · Y · 15 · 4 · -5 · -7 · -8 · -16 ·

   - **Respuesta:** 16
   - _Procedimiento:_ n = 6 → ΣX = 96 → X̄ = 96 / 6 = 16
   - _Explicación:_ X̄ = (ΣX) / n.

**44. [Cálculo numérico]** Con la tabla auxiliar, calcula ΣXY:X · 12 · 16 · 19 · 20 · 23 · 25 · Y · 7 · -3 · -11 · -7 · -13 · -22 ·

   - **Respuesta:** -1162
   - _Procedimiento:_ 12·7 + 16·-3 + 19·-11 + 20·-7 + 23·-13 + 25·-22 → = -1162
   - _Explicación:_ ΣXY se obtiene sumando cada producto X·Y.

**45. [Cálculo numérico]** Con los datos de costos (X) y producción (Y), calcula la media Ȳ:X · 10 · 12 · 14 · 15 · 16 · 17 · 21 · 25 · Y · 32 · 42 · 50 · 52 · 50 · 56 · 71 · 82 ·

   - **Respuesta:** 54.375
   - _Procedimiento:_ n = 8 → ΣY = 435 → Ȳ = 435 / 8 = 54.375
   - _Explicación:_ Ȳ = (ΣY) / n.

---

## 📉 Módulo 5 · Ajuste, predicción y residuos

- **Parcial:** Primer parcial
- **Contenido:** Ŷ, eᵢ, propiedades (Σeᵢ=0), interpolación vs. extrapolación.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (11 plantillas)

**1. [Cálculo numérico]** La recta ajustada es Ŷ = 19.1838 + -1.9632·X. Predice Ŷ para X = 9 (interpolación).

   - **Respuesta:** 1.5147
   - _Procedimiento:_ Ŷ = 19.1838 + -1.9632·9 → = 19.1838 + -17.669 = 1.5147
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**2. [Cálculo numérico]** La recta ajustada es Ŷ = 29.6758 + 2.5359·X. Predice Ŷ para X = 8 (interpolación).

   - **Respuesta:** 49.9629
   - _Procedimiento:_ Ŷ = 29.6758 + 2.5359·8 → = 29.6758 + 20.287 = 49.9629
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**3. [Verdadero/Falso]** Una propiedad de mínimos cuadrados es que Σeᵢ = 0 (los residuos suman cero).

   - **Respuesta:** Verdadero
   - _Explicación:_ Σeᵢ=0 y ē=0; además ΣeᵢXᵢ=0 y la recta pasa por (X̄,Ȳ).

**4. [Cálculo numérico]** Para X = 13 el valor observado es Y = 41 y el estimado es Ŷ = 40.0448. Calcula el residuo eᵢ.

   - **Respuesta:** 0.9552
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = 41 − 40.0448 = 0.9552
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

**5. [Opción múltiple]** Predecir Y para un X fuera del rango observado se llama:

   - **Extrapolación (riesgosa) ✅**
   - Interpolación
   - Residuo
   - Homocedasticidad

   - **Respuesta:** Extrapolación (riesgosa)
   - _Explicación:_ Extrapolar fuera del rango es riesgoso; interpolar es dentro del rango.

**6. [Completar]** La recta de mínimos cuadrados siempre pasa por el punto (X̄, ____).

   - **Respuesta:** Ȳ

**7. [Verdadero/Falso]** También se cumple ΣeᵢXᵢ = 0.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es una de las ecuaciones normales de mínimos cuadrados.

**8. [Cálculo numérico]** Para X = 18 el valor observado es Y = -33 y el estimado es Ŷ = -32.2633. Calcula el residuo eᵢ.

   - **Respuesta:** -0.7367
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = -33 − -32.2633 = -0.7367
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

**9. [Cálculo numérico]** La recta ajustada es Ŷ = -2.2323 + 1.8319·X. Predice Ŷ para X = 24 (interpolación).

   - **Respuesta:** 41.7334
   - _Procedimiento:_ Ŷ = -2.2323 + 1.8319·24 → = -2.2323 + 43.966 = 41.7334
   - _Explicación:_ Se sustituye x₀ en la recta ajustada.

**10. [Cálculo numérico]** Para X = 15 el valor observado es Y = 1 y el estimado es Ŷ = -2.8087. Calcula el residuo eᵢ.

   - **Respuesta:** 3.8087
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = 1 − -2.8087 = 3.8087
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

**11. [Cálculo numérico]** Para X = 6 el valor observado es Y = -1 y el estimado es Ŷ = 0.1039. Calcula el residuo eᵢ.

   - **Respuesta:** -1.1039
   - _Procedimiento:_ eᵢ = Yᵢ − Ŷᵢ = -1 − 0.1039 = -1.1039
   - _Explicación:_ eᵢ = Yᵢ − Ŷᵢ.

---

## 🎯 Módulo 6 · Propiedades de los estimadores

- **Parcial:** Segundo parcial
- **Contenido:** Insesgado/eficiente/consistente/suficiente y distribución de β̂.
- **Tipo de práctica:** Quiz + cálculo

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Relacionar]** Relaciona cada propiedad de un estimador con su definición:

   - **Respuesta:** Insesgado ↔ E(β̂ⱼ) = βⱼ · Eficiente ↔ Menor varianza entre los insesgados · Consistente ↔ Se acerca al parámetro al crecer n · Suficiente ↔ Concentra la información de la muestra

**2. [Cálculo numérico]** Con σ̂² = 4.674 y Sxx = 82, calcula Var(β̂₁) = σ²/Sxx.

   - **Respuesta:** 0.05699
   - _Procedimiento:_ Var(β̂₁) = σ²/Sxx = 4.674/82 = 0.05699
   - _Explicación:_ Var(β̂₁) = σ²/Sxx.

**3. [Completar]** La varianza de la pendiente es Var(β̂₁) = σ²/____ .

   - **Respuesta:** Sxx

**4. [Opción múltiple]** La distribución de la pendiente bajo errores normales es:

   - **β̂₁ ~ N(β₁, σ²/Sxx) ✅**
   - β̂₁ ~ N(0, 1)
   - β̂₁ ~ Poisson(σ²)
   - β̂₁ ~ Uniforme

   - **Respuesta:** β̂₁ ~ N(β₁, σ²/Sxx)
   - _Explicación:_ β̂₁ ~ N(β₁, σ²/Sxx), con Sxx=Σ(Xᵢ−X̄)².

**5. [Verdadero/Falso]** Un estimador insesgado cumple E(β̂ⱼ) = βⱼ.

   - **Respuesta:** Verdadero
   - _Explicación:_ Insesgadez: su valor esperado es el parámetro verdadero.

---

## 🔬 Módulo 7 · σ² e inferencia

- **Parcial:** Segundo parcial
- **Contenido:** σ̂²=SCE/(n−2), error estándar, IC y prueba t sobre la pendiente.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Cálculo numérico]** Con SCE = 36.128 y n = 6, estima la varianza del error σ̂² = SCE/(n−2).

   - **Respuesta:** 9.032
   - _Procedimiento:_ n − 2 = 4 → σ̂² = SCE/(n−2) = 36.128/4 = 9.032
   - _Explicación:_ σ̂² = SCE/(n−2) (la SCE se divide entre los grados de libertad n−2).

**2. [Cálculo numérico]** IC al 95% para β₁: β̂₁ ± t·(s/√Sxx). Con β̂₁ = 3.2225, s = 1.552, Sxx = 145.333 y t₍0.025,4₎ = 2.776, calcula el límite superior del intervalo.

   - **Respuesta:** 3.58
   - _Procedimiento:_ s/√Sxx = 0.1288 → t·EE = 2.776·0.1288 = 0.3575 → Límite superior = 3.2225 + 0.3575 = 3.58
   - _Explicación:_ Límite superior = β̂₁ + t·(s/√Sxx).

**3. [Cálculo numérico]** IC al 95% para β₁: β̂₁ ± t·(s/√Sxx). Con β̂₁ = -2.0984, s = 1.82, Sxx = 310 y t₍0.025,6₎ = 2.447, calcula el límite superior del intervalo.

   - **Respuesta:** -1.8454
   - _Procedimiento:_ s/√Sxx = 0.1034 → t·EE = 2.447·0.1034 = 0.2529 → Límite superior = -2.0984 + 0.2529 = -1.8454
   - _Explicación:_ Límite superior = β̂₁ + t·(s/√Sxx).

**4. [Verdadero/Falso]** Encontrar una relación lineal significativa demuestra que X causa Y.

   - **Respuesta:** Falso
   - _Explicación:_ La asociación estadística no implica causalidad.

**5. [Cálculo numérico]** Prueba H₀: β₁=0. Con β̂₁ = 2.8838, s = 1.586 y Sxx = 211.429, calcula el estadístico t = β̂₁ / (s/√Sxx).

   - **Respuesta:** 26.443
   - _Procedimiento:_ Error estándar = s/√Sxx = 1.586/√211.429 = 0.1091 → t = β̂₁ / EE = 2.8838 / 0.1091 = 26.443
   - _Explicación:_ t = (β̂₁ − 0) / (s/√Sxx), con n−2 grados de libertad.

**6. [Opción múltiple]** En la prueba H₀: β₁=0 vs H₁: β₁≠0, si se rechaza H₀:

   - **Hay evidencia estadística de relación lineal ✅**
   - Se demuestra causalidad
   - No hay relación
   - El R² es 0

   - **Respuesta:** Hay evidencia estadística de relación lineal
   - _Explicación:_ Rechazar H₀ indica relación lineal significativa, pero asociación ≠ causalidad.

**7. [Completar]** Los grados de libertad para la inferencia sobre la pendiente son n − ____ .

   - **Respuesta:** 2

**8. [Cálculo numérico]** Prueba H₀: β₁=0. Con β̂₁ = -1.6087, s = 1.849 y Sxx = 270.875, calcula el estadístico t = β̂₁ / (s/√Sxx).

   - **Respuesta:** -14.3167
   - _Procedimiento:_ Error estándar = s/√Sxx = 1.849/√270.875 = 0.1124 → t = β̂₁ / EE = -1.6087 / 0.1124 = -14.3167
   - _Explicación:_ t = (β̂₁ − 0) / (s/√Sxx), con n−2 grados de libertad.

---

## 📏 Módulo 8 · Respuesta media y predicción

- **Parcial:** Segundo parcial
- **Contenido:** IC para E(Y|x₀) vs. intervalo de predicción individual.
- **Tipo de práctica:** Constructor de intervalos

### 📝 Preguntas y respuestas (7 plantillas)

**1. [Verdadero/Falso]** La amplitud de los intervalos aumenta al alejarse x₀ de X̄.

   - **Respuesta:** Verdadero
   - _Explicación:_ El término (x₀−X̄)²/Sxx crece al alejarse de la media.

**2. [Cálculo numérico]** Intervalo de predicción 95% para una observación nueva en X=14: Ŷ₀ ± t·s·√(1 + 1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = 55.945, s = 2.906, n = 6, X̄ = 10.833, Sxx = 106.833 y t = 2.776, da el límite superior.

   - **Respuesta:** 65.0041
   - _Procedimiento:_ raíz = √(1 + 1/6 + (x₀−X̄)²/Sxx) = 1.1227 → semi-amplitud = t·s·raíz = 9.0587 → Límite superior = Ŷ₀ + 9.0587 = 65.0041
   - _Explicación:_ El intervalo de predicción añade el término +1 dentro de la raíz (es más ancho que el de la media).

**3. [Opción múltiple]** ¿Cuál intervalo es normalmente más ancho?

   - **El de predicción de una nueva observación ✅**
   - El de la respuesta media
   - Siempre son iguales
   - Ninguno tiene amplitud

   - **Respuesta:** El de predicción de una nueva observación
   - _Explicación:_ El de predicción añade el término +1 dentro de la raíz ⇒ es más ancho.

**4. [Opción múltiple]** La diferencia entre el intervalo de predicción y el de la media es:

   - **Un término adicional «+1» dentro de la raíz ✅**
   - Cambiar t por z
   - Usar n−1 en vez de n−2
   - No hay diferencia

   - **Respuesta:** Un término adicional «+1» dentro de la raíz
   - _Explicación:_ Predicción: √(1 + 1/n + (x₀−X̄)²/Sxx); media: √(1/n + (x₀−X̄)²/Sxx).

**5. [Cálculo numérico]** IC 95% para la respuesta media E(Y|X=15): Ŷ₀ ± t·s·√(1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = 42.541, s = 2.405, n = 7, X̄ = 15.714, Sxx = 173.429 y t = 2.571, da el límite superior.

   - **Respuesta:** 44.9023
   - _Procedimiento:_ (x₀−X̄)² = (15−15.714)² = 0.51 → raíz = √(1/7 + 0.51/173.429) = 0.3818 → semi-amplitud = t·s·raíz = 2.3611 → Límite superior = Ŷ₀ + 2.3611 = 44.9023
   - _Explicación:_ La respuesta media usa √(1/n + (x₀−X̄)²/Sxx).

**6. [Cálculo numérico]** Intervalo de predicción 95% para una observación nueva en X=14: Ŷ₀ ± t·s·√(1 + 1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = -14.443, s = 2, n = 6, X̄ = 16.833, Sxx = 150.833 y t = 2.776, da el límite superior.

   - **Respuesta:** -8.3097
   - _Procedimiento:_ raíz = √(1 + 1/6 + (x₀−X̄)²/Sxx) = 1.1045 → semi-amplitud = t·s·raíz = 6.1334 → Límite superior = Ŷ₀ + 6.1334 = -8.3097
   - _Explicación:_ El intervalo de predicción añade el término +1 dentro de la raíz (es más ancho que el de la media).

**7. [Cálculo numérico]** IC 95% para la respuesta media E(Y|X=25): Ŷ₀ ± t·s·√(1/n + (x₀−X̄)²/Sxx). Con Ŷ₀ = -30.333, s = 1.958, n = 6, X̄ = 21, Sxx = 98 y t = 2.776, da el límite superior.

   - **Respuesta:** -27.2114
   - _Procedimiento:_ (x₀−X̄)² = (25−21)² = 16 → raíz = √(1/6 + 16/98) = 0.5744 → semi-amplitud = t·s·raíz = 3.1219 → Límite superior = Ŷ₀ + 3.1219 = -27.2114
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

**1. [Cálculo numérico]** Con β̂₁ = -1.1901 y Sxy = -120, calcula la suma de cuadrados de la regresión SCR = β̂₁·Sxy.

   - **Respuesta:** 142.8099
   - _Procedimiento:_ SCR = β̂₁·Sxy = -1.1901·-120 = 142.8099
   - _Explicación:_ SCR = β̂₁·Sxy = Sxy²/Sxx.

**2. [Cálculo numérico]** IC 95% para σ²: [ (n−2)σ̂² / χ²₍0.975₎ , (n−2)σ̂² / χ²₍0.025₎ ]. Con (n−2) = 4, σ̂² = 0.608, χ²₍0.975,4₎ = 11.143 y χ²₍0.025,4₎ = 0.484, calcula el límite inferior.

   - **Respuesta:** 0.2183
   - _Procedimiento:_ (n−2)σ̂² = 4·0.608 = 2.432 → Límite inferior = 2.432 / 11.143 = 0.2183
   - _Explicación:_ El límite inferior divide (n−2)σ̂² entre el cuantil grande χ²₍0.975₎.

**3. [Cálculo numérico]** Con SCR = 245.697 y SCT = 267.333, calcula el coeficiente de determinación R².

   - **Respuesta:** 0.9191
   - _Procedimiento:_ R² = SCR / SCT = 245.697 / 267.333 = 0.9191
   - _Explicación:_ R² = SCR/SCT = 1 − SCE/SCT.

**4. [Verdadero/Falso]** Un R² alto por sí solo garantiza que el modelo es válido.

   - **Respuesta:** Falso
   - _Explicación:_ Un R² alto no garantiza validez ni causalidad; hay que revisar supuestos.

**5. [Cálculo numérico]** Con SCT = 537.875 y SCR = 503.63, calcula la suma de cuadrados del error SCE usando la identidad SCT = SCR + SCE.

   - **Respuesta:** 34.2453
   - _Procedimiento:_ SCE = SCT − SCR = 537.875 − 503.63 = 34.2453
   - _Explicación:_ SCE = SCT − SCR.

**6. [Cálculo numérico]** Con ΣY² = 14421, ΣY = 311 y n = 7, calcula la suma de cuadrados total SCT = ΣY² − (ΣY)²/n.

   - **Respuesta:** 603.7143
   - _Procedimiento:_ (ΣY)²/n = 311²/7 = 13817.286 → SCT = 14421 − 13817.286 = 603.7143
   - _Explicación:_ SCT = Σ(Yᵢ−Ȳ)² = ΣY² − (ΣY)²/n.

**7. [Opción múltiple]** Un R² = 0.88 se interpreta como:

   - **El modelo explica el 88% de la variabilidad de Y ✅**
   - El 88% de las observaciones son correctas
   - Existe causalidad del 88%
   - El error es del 88%

   - **Respuesta:** El modelo explica el 88% de la variabilidad de Y
   - _Explicación:_ R² = proporción de variabilidad de Y explicada por el modelo. No es % de aciertos ni causalidad.

**8. [Completar]** La identidad de la variabilidad es SCT = SCR + ____ .

   - **Respuesta:** SCE

**9. [Cálculo numérico]** Con β̂₁ = 2.8453 y Sxy = 260.143, calcula la suma de cuadrados de la regresión SCR = β̂₁·Sxy.

   - **Respuesta:** 740.1877
   - _Procedimiento:_ SCR = β̂₁·Sxy = 2.8453·260.143 = 740.1877
   - _Explicación:_ SCR = β̂₁·Sxy = Sxy²/Sxx.

**10. [Cálculo numérico]** Con ΣY² = 2974, ΣY = -124 y n = 6, calcula la suma de cuadrados total SCT = ΣY² − (ΣY)²/n.

   - **Respuesta:** 411.3333
   - _Procedimiento:_ (ΣY)²/n = -124²/6 = 2562.667 → SCT = 2974 − 2562.667 = 411.3333
   - _Explicación:_ SCT = Σ(Yᵢ−Ȳ)² = ΣY² − (ΣY)²/n.

---

