# 📊 Estadística No Paramétrica — Temario completo

> Documento generado automáticamente desde ActuarIQ con **todo el contenido de cada módulo** (preguntas, respuestas, procedimientos y explicaciones), organizado por parcial. Las preguntas numéricas usan valores de ejemplo; el método y la respuesta son los del generador del curso.

_Materia: `estadistica-no-parametrica` · 9 módulos · actualizado 2026-07-11_

## 🧮 Fórmulas clave

| Tema | Fórmula / idea |
|---|---|
| **Función empírica** | F_n(x)=(1/n)Σ I(X_i≤x). Glivenko-Cantelli: sup\|F_n−F\|→0. |
| **Kolmogórov-Smirnov** | D=máx\|F_n(x)−F_0(x)\|. Si estimas parámetros de los datos → Lilliefors. |
| **Bondad de ajuste χ²** | χ²=Σ(O_i−E_i)²/E_i ; gl=k−1−(#parámetros estimados). |
| **Proporción / binomial** | z=(p̂−p_0)/√(p_0(1−p_0)/n) ; exacta con X~Bin(n,p_0). |
| **Prueba de los signos** | X~Bin(n,0.5); los empates con la mediana se descartan (n efectivo). |
| **McNemar (pareada 2×2)** | Solo discordantes B y C: χ²=(\|B−C\|−1)²/(B+C) ; exacta con Bin(B+C,0.5). |
| **Cox-Stuart (tendencia)** | Parear x_i con x_i+c, tomar signos; T~Bin(#no empates,0.5). |
| **Spearman** | ρ_s=1−6Σd_i²/[n(n²−1)]. |
| **Mann-Whitney** | U=n_1n_2+n_1(n_1+1)/2−R_1. |

## 🗂️ Módulos por parcial _(división sugerida, ajústala con tu profesor)_

> 📌 El examen enviado es del 2.º parcial (cuantiles, signos, McNemar, Cox-Stuart).

**Primer parcial:** ⚖️ Fundamentos no paramétricos · 📶 Función empírica y Glivenko-Cantelli · 📉 Kolmogórov-Smirnov y Lilliefors · 🎲 Bondad de ajuste χ² · 📊 Proporciones y binomial exacta

**Segundo parcial:** ➕ Cuantiles y prueba de los signos · 🔀 Prueba de McNemar · 📈 Prueba de Cox-Stuart · 🏅 Rangos: Spearman y Mann-Whitney

---

## ⚖️ Módulo 1 · Fundamentos no paramétricos

- **Parcial:** Primer parcial
- **Contenido:** Paramétrico vs. no paramétrico, tipos de dato, H₀/H₁, errores I y II.
- **Tipo de práctica:** Quiz mixto

### 📘 Lección

📊 Fundamentos no paramétricos
Las pruebas no paramétricas requieren menos supuestos sobre la distribución poblacional (no que no tengan ninguno). Son útiles con muestras pequeñas, datos ordinales o nominales, distribuciones asimétricas o presencia de atípicos (mayor robustez).
H₀: hipótesis nula · H₁: alternativa.
α: nivel de significancia = P(error tipo I).
Error I: rechazar H₀ verdadera. Error II: no rechazar H₀ falsa.
Región crítica: valores del estadístico que llevan a rechazar H₀.

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Opción múltiple]** El error tipo I consiste en:

   - **Rechazar H₀ siendo verdadera ✅**
   - No rechazar H₀ siendo falsa
   - Aceptar H₁ siendo verdadera
   - Calcular mal la media

   - **Respuesta:** Rechazar H₀ siendo verdadera
   - _Explicación:_ Error tipo I: rechazar H₀ cuando es verdadera (su probabilidad es α). Tipo II: no rechazar H₀ siendo falsa.

**2. [Opción múltiple]** ¿Cuándo conviene una prueba no paramétrica en vez de una paramétrica?

   - **Con muestras pequeñas, datos ordinales o cuando no se cumple la normalidad ✅**
   - Siempre que haya muchos datos y sean normales
   - Solo cuando la varianza es conocida
   - Únicamente para datos perfectamente normales

   - **Respuesta:** Con muestras pequeñas, datos ordinales o cuando no se cumple la normalidad
   - _Explicación:_ Las no paramétricas exigen menos supuestos sobre la distribución poblacional; útiles con muestras pequeñas, datos ordinales/nominales o distribuciones asimétricas.

**3. [Relacionar]** Relaciona cada concepto:

   - **Respuesta:** α ↔ Nivel de significancia / P(error I) · Error II ↔ No rechazar H₀ siendo falsa · Región crítica ↔ Valores que llevan a rechazar H₀ · H₀ ↔ Hipótesis nula

**4. [Verdadero/Falso]** «No paramétrico» significa que la prueba no tiene ningún supuesto.

   - **Respuesta:** Falso
   - _Explicación:_ No es ausencia total de supuestos: se requieren menos supuestos sobre la distribución poblacional.

**5. [Verdadero/Falso]** La probabilidad del error tipo I es el nivel de significancia α.

   - **Respuesta:** Verdadero
   - _Explicación:_ α = P(rechazar H₀ | H₀ verdadera).

**6. [Opción múltiple]** Clasifica el dato: «El monto exacto de un siniestro en pesos».

   - Nominal
   - **Cuantitativo ✅**
   - Ordinal

   - **Respuesta:** Cuantitativo
   - _Explicación:_ Es un dato de tipo Cuantitativo.

**7. [Opción múltiple]** Clasifica el dato: «El tipo de sangre (A, B, AB, O)».

   - Cuantitativo
   - **Nominal ✅**
   - Ordinal

   - **Respuesta:** Nominal
   - _Explicación:_ Es un dato de tipo Nominal.

**8. [Opción múltiple]** Clasifica el dato: «El nivel de satisfacción (bajo, medio, alto)».

   - **Ordinal ✅**
   - Cuantitativo
   - Nominal

   - **Respuesta:** Ordinal
   - _Explicación:_ Es un dato de tipo Ordinal.

---

## 📶 Módulo 2 · Función empírica y Glivenko-Cantelli

- **Parcial:** Primer parcial
- **Contenido:** Fₙ(x)=(1/n)ΣI(Xᵢ≤x) y convergencia uniforme.
- **Tipo de práctica:** Quiz + cálculo

### 📘 Lección

📈 Función empírica y Glivenko-Cantelli
La función de distribución empírica es Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ x): se ordenan los datos, se cuenta cuántos son ≤ x y se divide entre n. Para 3,5,7,8: Fₙ(6)=2/4=0.5 (50% de los datos ≤ 6).
Glivenko-Cantelli: sup|Fₙ(x)−F(x)| → 0 cuando n → ∞ (la empírica converge uniformemente a la verdadera). Se distingue de la LGN (media→μ) y del TCL (suma estandarizada→Normal).

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Opción múltiple]** Para la muestra 3, 5, 7, 8, ¿cuánto vale Fₙ(6)?

   - **2/4 = 0.5 ✅**
   - 3/4 = 0.75
   - 1/4 = 0.25
   - 6/4 = 1.5

   - **Respuesta:** 2/4 = 0.5
   - _Explicación:_ Hay 2 datos ≤ 6 (el 3 y el 5): Fₙ(6)=2/4=0.5 ⇒ 50% de los datos son ≤ 6.

**2. [Completar]** La función de distribución empírica es Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ ____ ).

   - **Respuesta:** x

**3. [Opción múltiple]** El teorema de Glivenko-Cantelli afirma que:

   - **sup|Fₙ(x) − F(x)| → 0 cuando n → ∞ ✅**
   - La media muestral → μ
   - La suma estandarizada → Normal
   - La varianza siempre es 0

   - **Respuesta:** sup|Fₙ(x) − F(x)| → 0 cuando n → ∞
   - _Explicación:_ Glivenko-Cantelli: la distribución empírica converge uniformemente a la verdadera. (La LGN es sobre la media; el TCL, sobre la suma estandarizada.)

**4. [Relacionar]** Relaciona cada teorema con su convergencia:

   - **Respuesta:** Glivenko-Cantelli ↔ Fₙ → F uniformemente · Ley Grandes Números ↔ media muestral → μ · Teorema Central del Límite ↔ suma estandarizada → Normal

**5. [Cálculo numérico]** Para la muestra ordenada {3, 7, 8, 10, 14, 17}, calcula la función de distribución empírica Fₙ(7).

   - **Respuesta:** 0.3333
   - _Procedimiento:_ Observaciones ≤ 7: 2 → n = 6 → Fₙ(7) = 2/6 = 0.3333
   - _Explicación:_ Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ x): cuenta cuántos datos son ≤ x y divide entre n.

**6. [Cálculo numérico]** Para la muestra ordenada {6, 10, 13, 14}, calcula la función de distribución empírica Fₙ(10).

   - **Respuesta:** 0.5
   - _Procedimiento:_ Observaciones ≤ 10: 2 → n = 4 → Fₙ(10) = 2/4 = 0.5
   - _Explicación:_ Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ x): cuenta cuántos datos son ≤ x y divide entre n.

**7. [Ordenar pasos]** Ordena los pasos para construir Fₙ(x):

   - **Respuesta:** 1) Ordenar los datos de menor a mayor  2) Para cada x, contar cuántas observaciones son ≤ x  3) Dividir ese conteo entre n  4) Graficar la escalera resultante

**8. [Cálculo numérico]** Para la muestra ordenada {8, 11, 15, 17, 20}, calcula la función de distribución empírica Fₙ(11).

   - **Respuesta:** 0.4
   - _Procedimiento:_ Observaciones ≤ 11: 2 → n = 5 → Fₙ(11) = 2/5 = 0.4
   - _Explicación:_ Fₙ(x) = (1/n)·Σ I(Xᵢ ≤ x): cuenta cuántos datos son ≤ x y divide entre n.

---

## 📉 Módulo 3 · Kolmogórov-Smirnov y Lilliefors

- **Parcial:** Primer parcial
- **Contenido:** D=máx|Fₙ−F|, parámetros conocidos vs. estimados.
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

📉 Kolmogórov-Smirnov y Lilliefors
Comprueban si una muestra proviene de una distribución propuesta. H₀: los datos siguen la distribución; H₁: no.
D = máx|Fₙ(xᵢ) − F(xᵢ)| con Fₙ(xᵢ)=i/n.
Parámetros conocidos: z=(xᵢ−μ)/σ, tabla KS.
Parámetros estimados con la muestra: z=(xᵢ−x̄)/s, tabla de Lilliefors.
Se compara D con D_crítico: si D > D_crítico se rechaza H₀.

### 📝 Preguntas y respuestas (10 plantillas)

**1. [Cálculo numérico]** Prueba KS de ajuste a N(100,5) (parámetros conocidos). Datos: {92, 92, 92, 93, 93, 94, 100, 102}. Usa z=(xᵢ−μ)/σ y F(xᵢ)=Φ(z). Calcula D = máx|i/n − F(xᵢ)|.

   - **Respuesta:** 0.6349
   - _Procedimiento:_ Para cada xᵢ: z=(xᵢ−100)/5, F(xᵢ)=Φ(z) → Diferencia máxima en x = 94 → D = 0.6349
   - _Explicación:_ Con parámetros conocidos se estandariza z=(xᵢ−μ)/σ y se usa la tabla normal para F(xᵢ)=Φ(z); D es la mayor diferencia con i/n.

**2. [Verdadero/Falso]** En KS, H₀ afirma que los datos sí provienen de la distribución propuesta.

   - **Respuesta:** Verdadero
   - _Explicación:_ H₀: los datos siguen la distribución; H₁: no la siguen.

**3. [Opción múltiple]** Si la media y la desviación se estiman con la propia muestra, ¿qué tabla de valores críticos se usa?

   - **La de Lilliefors ✅**
   - La de Kolmogórov-Smirnov estándar
   - La χ² con gl=n
   - La t de Student

   - **Respuesta:** La de Lilliefors
   - _Explicación:_ Al estimar parámetros con la muestra se usa Lilliefors (no la tabla KS estándar).

**4. [Cálculo numérico]** Prueba KS de bondad de ajuste a U(0,1). Datos ordenados: {0.02, 0.28, 0.36, 0.46, 0.47, 0.57, 0.68, 0.72}. Con Fₙ(xᵢ)=i/n y F(x)=x, calcula D = máx|Fₙ(xᵢ)−F(xᵢ)|.

   - **Respuesta:** 0.28
   - _Procedimiento:_ En cada xᵢ: |i/n − xᵢ| → El máximo ocurre en x = 0.72 → D = 0.28
   - _Explicación:_ Para la Uniforme(0,1), F(xᵢ)=xᵢ. Se calcula |i/n − xᵢ| en cada punto y se toma el máximo.

**5. [Cálculo numérico]** Prueba KS de bondad de ajuste a U(0,1). Datos ordenados: {0.1, 0.44, 0.51, 0.75, 0.97, 0.98}. Con Fₙ(xᵢ)=i/n y F(x)=x, calcula D = máx|Fₙ(xᵢ)−F(xᵢ)|.

   - **Respuesta:** 0.1367
   - _Procedimiento:_ En cada xᵢ: |i/n − xᵢ| → El máximo ocurre en x = 0.97 → D = 0.1367
   - _Explicación:_ Para la Uniforme(0,1), F(xᵢ)=xᵢ. Se calcula |i/n − xᵢ| en cada punto y se toma el máximo.

**6. [Cálculo numérico]** Para estandarizar en KS (parámetros conocidos), calcula z = (xᵢ − μ)/σ con xᵢ=78, μ=80 y σ=4.

   - **Respuesta:** -0.5
   - _Procedimiento:_ z = (78 − 80)/4 = -0.5
   - _Explicación:_ z=(xᵢ−centro)/dispersión. Con parámetros conocidos se usa μ,σ; si se estiman con la muestra, x̄,s (y la tabla de Lilliefors).

**7. [Cálculo numérico]** Prueba KS de ajuste a N(18,10) (parámetros conocidos). Datos: {8, 9, 13, 23, 31, 33}. Usa z=(xᵢ−μ)/σ y F(xᵢ)=Φ(z). Calcula D = máx|i/n − F(xᵢ)|.

   - **Respuesta:** 0.1915
   - _Procedimiento:_ Para cada xᵢ: z=(xᵢ−18)/10, F(xᵢ)=Φ(z) → Diferencia máxima en x = 13 → D = 0.1915
   - _Explicación:_ Con parámetros conocidos se estandariza z=(xᵢ−μ)/σ y se usa la tabla normal para F(xᵢ)=Φ(z); D es la mayor diferencia con i/n.

**8. [Cálculo numérico]** Para estandarizar en KS (parámetros estimados con x̄ y s), calcula z = (xᵢ − x̄)/s con xᵢ=77, x̄=80 y s=6.

   - **Respuesta:** -0.5
   - _Procedimiento:_ z = (77 − 80)/6 = -0.5
   - _Explicación:_ z=(xᵢ−centro)/dispersión. Con parámetros conocidos se usa μ,σ; si se estiman con la muestra, x̄,s (y la tabla de Lilliefors).

**9. [Ordenar pasos]** Ordena el procedimiento de la prueba KS:

   - **Respuesta:** 1) Plantear H₀ (sigue la distribución) y H₁  2) Ordenar los datos  3) Calcular Fₙ(xᵢ)=i/n  4) Calcular F(xᵢ) teórica  5) Obtener |Fₙ(xᵢ)−F(xᵢ)| y tomar el máximo D  6) Comparar D con el valor crítico y concluir

**10. [Cálculo numérico]** Prueba KS de bondad de ajuste a U(0,1). Datos ordenados: {0.23, 0.24, 0.36, 0.41, 0.44, 0.7, 0.83}. Con Fₙ(xᵢ)=i/n y F(x)=x, calcula D = máx|Fₙ(xᵢ)−F(xᵢ)|.

   - **Respuesta:** 0.2743
   - _Procedimiento:_ En cada xᵢ: |i/n − xᵢ| → El máximo ocurre en x = 0.44 → D = 0.2743
   - _Explicación:_ Para la Uniforme(0,1), F(xᵢ)=xᵢ. Se calcula |i/n − xᵢ| en cada punto y se toma el máximo.

---

## 🎲 Módulo 4 · Bondad de ajuste χ²

- **Parcial:** Primer parcial
- **Contenido:** χ²=Σ(Oᵢ−Eᵢ)²/Eᵢ, gl=k−p−1, ajuste exponencial.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Cálculo numérico]** Para ajustar una exponencial a una muestra de tiempos con n=25 y Σtᵢ=755, estima λ̂ = n / Σtᵢ.

   - **Respuesta:** 0.033113
   - _Procedimiento:_ λ̂ = n/Σtᵢ = 25/755 = 0.033113
   - _Explicación:_ El estimador de máxima verosimilitud de la exponencial es λ̂ = n/Σtᵢ.

**2. [Cálculo numérico]** En una prueba χ² de bondad de ajuste con k=4 clases y p=2 parámetro(s) estimado(s), ¿cuántos grados de libertad hay? (gl = k − p − 1)

   - **Respuesta:** 1
   - _Procedimiento:_ gl = k − p − 1 = 4 − 2 − 1 = 1
   - _Explicación:_ gl = k − p − 1.

**3. [Cálculo numérico]** Con frecuencias esperadas Eᵢ=5 en las 4 clases y observadas Oᵢ = [7, 2, 2, 9], calcula χ² = Σ(Oᵢ−Eᵢ)²/Eᵢ.

   - **Respuesta:** 7.6
   - _Procedimiento:_ (7−5)²/5 + (2−5)²/5 + (2−5)²/5 + (9−5)²/5 → = 7.6
   - _Explicación:_ χ² suma, en cada clase, (Oᵢ−Eᵢ)²/Eᵢ.

**4. [Ordenar pasos]** Ordena la prueba χ² de bondad de ajuste:

   - **Respuesta:** 1) Proponer una distribución y estimar parámetros si hace falta  2) Formar clases (aquí, con probabilidades iguales)  3) Calcular las frecuencias esperadas Eᵢ  4) Contar las observadas Oᵢ  5) Sumar χ²=Σ(Oᵢ−Eᵢ)²/Eᵢ  6) Comparar con el valor crítico y concluir

**5. [Relacionar]** Relaciona los símbolos de la prueba χ²:

   - **Respuesta:** Oᵢ ↔ Frecuencia observada · Eᵢ ↔ Frecuencia esperada · k ↔ Número de clases · gl ↔ k − p − 1

**6. [Verdadero/Falso]** Para la exponencial, F(t) = 1 − e^(−λt).

   - **Respuesta:** Verdadero
   - _Explicación:_ Es la función de distribución de la exponencial.

---

## 📊 Módulo 5 · Proporciones y binomial exacta

- **Parcial:** Primer parcial
- **Contenido:** z de proporción (con p₀) y prueba binomial exacta.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Cálculo numérico]** Prueba de proporción: n=150, x=68 éxitos, H₀: p=p₀=0.5. Calcula el estadístico z = (p̂ − p₀) / √[p₀(1−p₀)/n]. (Bajo H₀ se usa p₀ en el error estándar.)

   - **Respuesta:** -1.1431
   - _Procedimiento:_ p̂ = x/n = 68/150 = 0.4533 → EE = √[p₀(1−p₀)/n] = √[0.5·0.5/150] = 0.0408 → z = (0.4533 − 0.5)/0.0408 = -1.1431
   - _Explicación:_ Bajo H₀ el error estándar usa p₀ (no p̂): z = (p̂−p₀)/√[p₀(1−p₀)/n].

**2. [Verdadero/Falso]** Bajo H₀, el error estándar de la prueba z de proporción usa p₀ (no p̂).

   - **Respuesta:** Verdadero
   - _Explicación:_ Como H₀ fija p=p₀, el error estándar se calcula con p₀.

**3. [Cálculo numérico]** Muestra pequeña: X ~ Bin(15, 0.5). Calcula el valor p de cola derecha P(X ≥ 10).

   - **Respuesta:** 0.1509
   - _Procedimiento:_ P(X≥10) = Σ desde k=10 hasta 15 de C(15,k)·0.5^15 → = 0.1509
   - _Explicación:_ P(X≥x) = Σ_{k=x}^{n} C(n,k) p₀^k (1−p₀)^{n−k}.

**4. [Opción múltiple]** ¿Cuándo conviene la prueba binomial exacta en vez de la aproximación normal?

   - **Con muestras pequeñas ✅**
   - Con muestras muy grandes
   - Cuando p₀=0
   - Nunca

   - **Respuesta:** Con muestras pequeñas
   - _Explicación:_ La aproximación normal requiere n grande; con muestras pequeñas se usa la binomial exacta.

**5. [Opción múltiple]** Para una prueba binomial exacta de cola derecha, el valor p es:

   - **P(X ≥ x_obs) ✅**
   - P(X ≤ x_obs)
   - P(X = x_obs)
   - 1 − p₀

   - **Respuesta:** P(X ≥ x_obs)
   - _Explicación:_ Cola derecha: p = P(X ≥ x_obs). Cola izquierda: P(X ≤ x_obs).

**6. [Cálculo numérico]** En una muestra de n=100 con x=9 defectuosos, calcula la proporción muestral p̂ = x/n.

   - **Respuesta:** 0.09
   - _Procedimiento:_ p̂ = 9/100 = 0.09
   - _Explicación:_ p̂ = X/n.

---

## ➕ Módulo 6 · Cuantiles y prueba de los signos

- **Parcial:** Segundo parcial
- **Contenido:** Mediana, empates, tamaño efectivo y X~Bin(n,0.5).
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Opción múltiple]** El valor que divide la muestra en dos mitades iguales (50% a cada lado) es:

   - **La mediana ✅**
   - La media
   - La moda
   - El rango

   - **Respuesta:** La mediana
   - _Explicación:_ La mediana es el cuantil 0.5.

**2. [Opción múltiple]** En datos pareados antes/después, un empate (diferencia = 0) se debe:

   - **Eliminar y reducir el tamaño efectivo ✅**
   - Contar como signo +
   - Contar como signo −
   - Duplicar

   - **Respuesta:** Eliminar y reducir el tamaño efectivo
   - _Explicación:_ Los empates se eliminan y n se reduce al tamaño efectivo.

**3. [Cálculo numérico]** Prueba de los signos para la mediana propuesta 50. Datos: {54, 55, 44, 53, 51, 56, 55, 53, 47, 51, 49}. Tras eliminar los empates con 50, ¿cuál es el tamaño efectivo n?

   - **Respuesta:** 11
   - _Procedimiento:_ Empates con 50: 0 → Menores: 3 · Mayores: 8 → n efectivo = 11 − 0 = 11
   - _Explicación:_ Se descartan los valores iguales a la mediana propuesta; el tamaño efectivo es n menos los empates.

**4. [Cálculo numérico]** En la prueba de los signos, bajo H₀ el número de signos «+» es X ~ Bin(10, 0.5). Calcula P(X ≤ 1).

   - **Respuesta:** 0.0107
   - _Procedimiento:_ P(X ≤ 1) = Σ desde k=0 hasta 1 de C(10,k)·0.5^10 = 0.0107
   - _Explicación:_ Bajo H₀ (la mediana es la propuesta), cada signo es + o − con probabilidad 0.5.

**5. [Verdadero/Falso]** La prueba de los signos usa solo la dirección (signo) de las diferencias, no su magnitud.

   - **Respuesta:** Verdadero
   - _Explicación:_ Solo importa el signo (+/−); la magnitud se ignora.

**6. [Completar]** Bajo H₀, en la prueba de los signos X ~ Bin(n, ____ ).

   - **Respuesta:** 0.5

**7. [Cálculo numérico]** Prueba de los signos para la mediana propuesta 20. Datos: {18, 19, 18, 24, 25, 17, 23, 23, 15}. Tras eliminar los empates con 20, ¿cuál es el tamaño efectivo n?

   - **Respuesta:** 9
   - _Procedimiento:_ Empates con 20: 0 → Menores: 5 · Mayores: 4 → n efectivo = 9 − 0 = 9
   - _Explicación:_ Se descartan los valores iguales a la mediana propuesta; el tamaño efectivo es n menos los empates.

**8. [Cálculo numérico]** Prueba de los signos para la mediana propuesta 100. Datos: {102, 95, 105, 100, 102, 101, 99, 105, 99, 103}. Tras eliminar los empates con 100, ¿cuál es el tamaño efectivo n?

   - **Respuesta:** 9
   - _Procedimiento:_ Empates con 100: 1 → Menores: 3 · Mayores: 6 → n efectivo = 10 − 1 = 9
   - _Explicación:_ Se descartan los valores iguales a la mediana propuesta; el tamaño efectivo es n menos los empates.

---

## 🔀 Módulo 7 · Prueba de McNemar

- **Parcial:** Segundo parcial
- **Contenido:** Tabla 2×2 pareada, discordantes B/C, Yates o exacta.
- **Tipo de práctica:** Ejercicios + tabla

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Relacionar]** En la tabla 2×2 de McNemar (antes → después):

   - **Respuesta:** A ↔ éxito → éxito · B ↔ éxito → fracaso · C ↔ fracaso → éxito · D ↔ fracaso → fracaso

**2. [Opción múltiple]** ¿Qué celdas aportan evidencia sobre el cambio en McNemar?

   - **Solo B y C (los discordantes) ✅**
   - A y D
   - Todas por igual
   - Solo A

   - **Respuesta:** Solo B y C (los discordantes)
   - _Explicación:_ Los pares concordantes (A, D) no informan sobre el cambio; solo B y C.

**3. [Cálculo numérico]** Prueba de McNemar (datos pareados). Tabla 2×2: A=280, B=16, C=20, D=174. Como B+C=36 ≥ 20, usa χ² con corrección de Yates: (|B−C|−1)²/(B+C).

   - **Respuesta:** 0.25
   - _Procedimiento:_ |B−C| = |16−20| = 4 → χ² = (|B−C|−1)²/(B+C) = (4−1)²/36 = 0.25
   - _Explicación:_ Solo los discordantes B y C aportan evidencia. Yates: (|B−C|−1)²/(B+C), con gl=1.

**4. [Completar]** Los grados de libertad de la χ² de McNemar son ____ .

   - **Respuesta:** 1

**5. [Verdadero/Falso]** Con B+C < 20 se prefiere el método exacto (binomial); con B+C ≥ 20, la χ² (con corrección de Yates).

   - **Respuesta:** Verdadero
   - _Explicación:_ Esa es la regla de decisión del método.

**6. [Cálculo numérico]** Prueba de McNemar. Discordantes B=3, C=7 (B+C=10 exacto). Con X ~ Bin(10, 0.5), calcula P(X ≤ 3) (cola con el menor de B y C).

   - **Respuesta:** 0.1719
   - _Procedimiento:_ menor(B,C) = 3 → P(X ≤ 3) con Bin(10,0.5) = 0.1719
   - _Explicación:_ Con B+C<20 se usa la binomial exacta sobre los pares discordantes: X ~ Bin(B+C, 0.5).

---

## 📈 Módulo 8 · Prueba de Cox-Stuart

- **Parcial:** Segundo parcial
- **Contenido:** Tendencia temporal formando parejas y T~Bin(C,0.5).
- **Tipo de práctica:** Ejercicios + serie

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Ordenar pasos]** Ordena la prueba de Cox-Stuart:

   - **Respuesta:** 1) Conservar el orden temporal  2) Si n es impar, eliminar la observación central  3) Dividir la serie en dos mitades y formar parejas  4) Calcular el signo de cada diferencia y eliminar empates  5) Contar los signos y usar T ~ Bin(C, 0.5)  6) Construir la región crítica y concluir sobre la tendencia

**2. [Cálculo numérico]** Prueba de Cox-Stuart de tendencia. Serie cronológica: {70, 66, 65, 60, 59, 55, 53, 49, 48, 43}. Se forman 5 parejas (xᵢ, xᵢ₊5). Con C=5 parejas efectivas y T ~ Bin(5, 0.5), calcula P(T ≤ 0) (cola del menor número de signos).

   - **Respuesta:** 0.0313
   - _Procedimiento:_ Signos +: 0 · signos −: 5 · C = 5 → menor = 0 → P(T ≤ 0) con Bin(5,0.5) = 0.0313
   - _Explicación:_ Se comparan las dos mitades formando parejas; el signo indica aumento/disminución. Bajo H₀ (sin tendencia), T ~ Bin(C, 0.5).

**3. [Opción múltiple]** La prueba de Cox-Stuart sirve para detectar:

   - **Una tendencia creciente o decreciente en el tiempo ✅**
   - Diferencia entre dos grupos independientes
   - Normalidad
   - Asociación entre rangos

   - **Respuesta:** Una tendencia creciente o decreciente en el tiempo
   - _Explicación:_ Cox-Stuart detecta tendencia en una serie ordenada cronológicamente.

**4. [Cálculo numérico]** Si las 6 parejas de Cox-Stuart muestran todas disminución (0 signos «+»), el valor p de esa cola es P(T ≤ 0) = (0.5)⁶. Calcula ese valor.

   - **Respuesta:** 0.015625
   - _Procedimiento:_ (0.5)⁶ = 0.015625
   - _Explicación:_ (0.5)⁶ = 1/64 = 0.015625.

**5. [Verdadero/Falso]** En Cox-Stuart, si n es impar se elimina la observación central antes de formar las parejas.

   - **Respuesta:** Verdadero
   - _Explicación:_ Así las dos mitades tienen el mismo tamaño.

**6. [Cálculo numérico]** Prueba de Cox-Stuart de tendencia. Serie cronológica: {75, 71, 70, 65, 61, 58, 57, 54, 51, 46, 43, 39}. Se forman 6 parejas (xᵢ, xᵢ₊6). Con C=6 parejas efectivas y T ~ Bin(6, 0.5), calcula P(T ≤ 0) (cola del menor número de signos).

   - **Respuesta:** 0.0156
   - _Procedimiento:_ Signos +: 0 · signos −: 6 · C = 6 → menor = 0 → P(T ≤ 0) con Bin(6,0.5) = 0.0156
   - _Explicación:_ Se comparan las dos mitades formando parejas; el signo indica aumento/disminución. Bajo H₀ (sin tendencia), T ~ Bin(C, 0.5).

---

## 🏅 Módulo 9 · Rangos: Spearman y Mann-Whitney

- **Parcial:** Segundo parcial
- **Contenido:** ρs de asociación monótona y U de dos grupos.
- **Tipo de práctica:** Ejercicios + caso

### 📘 Lección

🔢 Spearman y Mann-Whitney
Spearman mide asociación monótona con rangos: ρs = 1 − 6Σdᵢ²/[n(n²−1)], con dᵢ=Rxᵢ−Ryᵢ. Escala de |ρs|: 0–0.1 ninguna · 0.1–0.3 baja · 0.3–0.5 media · 0.5–0.7 alta · 0.7–1 muy alta.
Mann-Whitney compara dos grupos independientes: U₁=n₁n₂+n₁(n₁+1)/2−R₁, U₂=n₁n₂−U₁, U=mín(U₁,U₂). Se rechaza H₀ si U ≤ U_crítico.

### 📝 Preguntas y respuestas (9 plantillas)

**1. [Cálculo numérico]** Correlación de Spearman con n=8 y Σdᵢ²=0.5 (dᵢ = Rxᵢ − Ryᵢ). Calcula ρs = 1 − 6Σdᵢ² / [n(n²−1)].

   - **Respuesta:** 0.994
   - _Procedimiento:_ n(n²−1) = 8·(8²−1) = 504 → ρs = 1 − 6·0.5/504 = 0.994
   - _Explicación:_ ρs = 1 − 6Σdᵢ²/[n(n²−1)]. Signo + relación creciente, − decreciente.

**2. [Opción múltiple]** La prueba de Mann-Whitney es la alternativa no paramétrica a:

   - **La t de dos muestras independientes ✅**
   - La χ² de bondad de ajuste
   - La prueba de los signos
   - Cox-Stuart

   - **Respuesta:** La t de dos muestras independientes
   - _Explicación:_ Mann-Whitney compara dos grupos independientes sin suponer normalidad.

**3. [Cálculo numérico]** Con n=7 y Σdᵢ²=40, aplica ρs = 1 − 6Σdᵢ²/[n(n²−1)].

   - **Respuesta:** 0.2857
   - _Procedimiento:_ ρs = 1 − 6(40)/[7(7²−1)] = 1 − 240/336 = 0.2857
   - _Explicación:_ Sustitución directa en la fórmula de Spearman.

**4. [Opción múltiple]** En Mann-Whitney se rechaza H₀ cuando:

   - **U ≤ U_crítico ✅**
   - U ≥ U_crítico
   - U = n₁n₂
   - U > 0

   - **Respuesta:** U ≤ U_crítico
   - _Explicación:_ Se rechaza H₀ si U ≤ U_crítico (tabla de Mann-Whitney).

**5. [Cálculo numérico]** Mann-Whitney con Grupo A={15, 18, 19, 20} (n₁=4) y Grupo B={23, 24, 25, 26} (n₂=4). Al ordenar todo, la suma de rangos de A es R₁=10. Calcula U = mín(U₁, U₂) con U₁=n₁n₂+n₁(n₁+1)/2−R₁ y U₂=n₁n₂−U₁.

   - **Respuesta:** 0
   - _Procedimiento:_ U₁ = 4·4 + 4·5/2 − 10 = 16 → U₂ = 4·4 − 16 = 0 → U = mín(16, 0) = 0
   - _Explicación:_ U₁=n₁n₂+n₁(n₁+1)/2−R₁; U₂=n₁n₂−U₁; U=mín(U₁,U₂). Se rechaza H₀ si U ≤ U_crítico.

**6. [Opción múltiple]** Un ρs de Spearman cercano a −1 indica:

   - **Asociación monótona decreciente muy fuerte ✅**
   - Ninguna asociación
   - Asociación creciente
   - Datos normales

   - **Respuesta:** Asociación monótona decreciente muy fuerte
   - _Explicación:_ ρs≈−1: relación monótona decreciente muy alta; ≈+1 creciente; ≈0 débil/nula.

**7. [Cálculo numérico]** Mann-Whitney con Grupo A={17, 18, 21, 22, 24} (n₁=5) y Grupo B={27, 28, 29, 32} (n₂=4). Al ordenar todo, la suma de rangos de A es R₁=15. Calcula U = mín(U₁, U₂) con U₁=n₁n₂+n₁(n₁+1)/2−R₁ y U₂=n₁n₂−U₁.

   - **Respuesta:** 0
   - _Procedimiento:_ U₁ = 5·4 + 5·6/2 − 15 = 20 → U₂ = 5·4 − 20 = 0 → U = mín(20, 0) = 0
   - _Explicación:_ U₁=n₁n₂+n₁(n₁+1)/2−R₁; U₂=n₁n₂−U₁; U=mín(U₁,U₂). Se rechaza H₀ si U ≤ U_crítico.

**8. [Cálculo numérico]** Mann-Whitney con Grupo A={11, 13, 15, 16, 17} (n₁=5) y Grupo B={18, 19, 21, 24, 26} (n₂=5). Al ordenar todo, la suma de rangos de A es R₁=15. Calcula U = mín(U₁, U₂) con U₁=n₁n₂+n₁(n₁+1)/2−R₁ y U₂=n₁n₂−U₁.

   - **Respuesta:** 0
   - _Procedimiento:_ U₁ = 5·5 + 5·6/2 − 15 = 25 → U₂ = 5·5 − 25 = 0 → U = mín(25, 0) = 0
   - _Explicación:_ U₁=n₁n₂+n₁(n₁+1)/2−R₁; U₂=n₁n₂−U₁; U=mín(U₁,U₂). Se rechaza H₀ si U ≤ U_crítico.

**9. [Cálculo numérico]** Mann-Whitney con Grupo A={15, 17, 20, 21} (n₁=4) y Grupo B={24, 26, 27, 28, 29} (n₂=5). Al ordenar todo, la suma de rangos de A es R₁=10. Calcula U = mín(U₁, U₂) con U₁=n₁n₂+n₁(n₁+1)/2−R₁ y U₂=n₁n₂−U₁.

   - **Respuesta:** 0
   - _Procedimiento:_ U₁ = 4·5 + 4·5/2 − 10 = 20 → U₂ = 4·5 − 20 = 0 → U = mín(20, 0) = 0
   - _Explicación:_ U₁=n₁n₂+n₁(n₁+1)/2−R₁; U₂=n₁n₂−U₁; U=mín(U₁,U₂). Se rechaza H₀ si U ≤ U_crítico.

---

