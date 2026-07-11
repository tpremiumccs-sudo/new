# 🎲 Procesos Estocásticos — Temario completo

> Documento generado automáticamente desde ActuarIQ con **todo el contenido de cada módulo** (preguntas, respuestas, procedimientos y explicaciones), organizado por parcial. Las preguntas numéricas usan valores de ejemplo; el método y la respuesta son los del generador del curso.

_Materia: `stoch` · 12 módulos · actualizado 2026-07-11_

## 🧮 Fórmulas clave

| Tema | Fórmula / idea |
|---|---|
| **Proceso estocástico** | {X_t : t∈T}: familia de variables aleatorias indexadas por el tiempo (Ω×T→S). |
| **Caminata aleatoria** | X_n=Σε_k con ε=±1. E[X_n]=n(2p−1), Var(X_n)=4np(1−p). |
| **Regreso al origen** | Solo en pasos pares; p_2n=C(2n,n)p^nq^n. Primer regreso f_n ≠ estar en 0 (p_n). |
| **Cadena de Markov** | P(X_n+1=j \| X_n=i)=p_ij. Filas de P suman 1; v_n=v_0P^n; límite π con πP=π. |
| **Proceso de Poisson** | N(t)~Poisson(λt): P(N=k)=e^−λt(λt)^k/k!. E[N]=Var(N)=λt. |
| **Exponencial** | P(X>t)=e^−λt. E[X]=1/λ, Var(X)=1/λ². Tiempo entre eventos de Poisson. |
| **Pérdida de memoria** | P(X>t+s \| X>s)=P(X>t): lo ya esperado no cuenta. |
| **Erlang / Gamma** | S_n=T_1+…+T_n (n-ésimo evento). E[S_n]=n/λ, Var=n/λ². |
| **Propiedades de Poisson** | Adelgazamiento λp; superposición λ_1+λ_2; condicional N(s)\|N(t)=n ~ Bin(n, s/t); compuesto E[S]=E[N]·E[X]. |

## 🗂️ Módulos por parcial

**Primer parcial:** 📐 Fundamentos de procesos · 🔀 Tipos y propiedades · 🚶 Caminata aleatoria · ↩️ Regreso al origen · 🔗 Cadenas de Markov · 🕸️ Diagramas de transición · 🔢 Matrices de transición

**Segundo parcial:** ⏱️ Proceso de Poisson · 📉 Distribución exponencial · 🧠 Pérdida de memoria · ⛓️ Erlang/Gamma (evento n) · 🧩 Propiedades de Poisson

---

## 📐 Módulo 1 · Fundamentos de procesos

- **Parcial:** Primer parcial
- **Contenido:** Definición, Ω×T→S, trayectorias y notación básica.
- **Tipo de práctica:** Quiz mixto

### 📘 Lección

📐 Fundamentos de procesos estocásticos
Un proceso estocástico es una colección de variables aleatorias {X_t : t ∈ T} que describe cómo evoluciona un sistema con azar a lo largo del tiempo.
Formalmente X: Ω × T → S, donde:
Ω: espacio muestral (los resultados del azar).
T: espacio temporal (discreto {0,1,2,…} o continuo [0,∞)).
S: espacio de estados (los valores posibles).
Si fijamos ω y variamos t, obtenemos una trayectoria (realización). Si fijamos t y variamos ω, obtenemos una variable aleatoria X_t.

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Verdadero/Falso]** Si fijamos t y dejamos variar ω, obtenemos una trayectoria completa.

   - **Respuesta:** Falso
   - _Explicación:_ Al fijar t obtenemos una variable aleatoria X_t, no una trayectoria. La trayectoria surge al fijar ω.

**2. [Completar]** El conjunto de todos los valores que puede tomar el proceso se llama espacio de ______.

   - **Respuesta:** estados

**3. [Relacionar]** Relaciona cada elemento de X: Ω × T → S con su significado:

   - **Respuesta:** Ω ↔ Espacio muestral (resultados del azar) · T ↔ Espacio temporal (índice) · S ↔ Espacio de estados (valores posibles) · X(ω,t) ↔ Valor del proceso

**4. [Verdadero/Falso]** Si fijamos ω (un resultado del azar) y variamos t, obtenemos una trayectoria o realización del proceso.

   - **Respuesta:** Verdadero
   - _Explicación:_ Fijar ω da una trayectoria (función del tiempo); fijar t da una variable aleatoria X_t.

**5. [Opción múltiple]** ¿Qué es un proceso estocástico?

   - **Una colección de variables aleatorias indexadas por el tiempo: {X_t : t ∈ T} ✅**
   - Una sola variable aleatoria constante en el tiempo
   - Una función determinista del tiempo sin azar
   - Un promedio de datos históricos

   - **Respuesta:** Una colección de variables aleatorias indexadas por el tiempo: {X_t : t ∈ T}
   - _Explicación:_ Un proceso estocástico es una familia de variables aleatorias {X_t} indexada por un conjunto de tiempos T.

**6. [Opción múltiple]** En un proceso a tiempo discreto, el conjunto T es típicamente:

   - **{0, 1, 2, 3, …} ✅**
   - Un intervalo [0, ∞)
   - Los números reales ℝ
   - Un único punto

   - **Respuesta:** {0, 1, 2, 3, …}
   - _Explicación:_ Tiempo discreto ⇒ T = {0,1,2,…}. Tiempo continuo ⇒ T = [0,∞).

---

## 🔀 Módulo 2 · Tipos y propiedades

- **Parcial:** Primer parcial
- **Contenido:** i.i.d., Markov, incrementos independientes y estacionariedad.
- **Tipo de práctica:** Clasificación

### 📝 Preguntas y respuestas (7 plantillas)

**1. [Opción múltiple]** Clasifica: «El clima de mañana depende solo del clima de hoy, no del de días previos».

   - Incrementos independientes
   - Ensayos i.i.d.
   - **Propiedad de Markov ✅**
   - Estacionariedad

   - **Respuesta:** Propiedad de Markov
   - _Explicación:_ Corresponde a: Propiedad de Markov.

**2. [Verdadero/Falso]** Variables i.i.d. significa independientes y con la misma distribución.

   - **Respuesta:** Verdadero
   - _Explicación:_ i.i.d. = independientes e idénticamente distribuidas.

**3. [Verdadero/Falso]** La propiedad de Markov dice que el futuro depende del presente y no de los estados anteriores.

   - **Respuesta:** Verdadero
   - _Explicación:_ Markov: dado el presente, el futuro es independiente del pasado.

**4. [Opción múltiple]** Que un proceso tenga incrementos independientes significa que:

   - **Los cambios en intervalos de tiempo disjuntos son independientes entre sí ✅**
   - El proceso nunca cambia de valor
   - Todos los estados son igualmente probables
   - El futuro depende de todo el pasado

   - **Respuesta:** Los cambios en intervalos de tiempo disjuntos son independientes entre sí
   - _Explicación:_ Incrementos independientes: lo que ocurre en intervalos que no se traslapan es independiente.

**5. [Opción múltiple]** Clasifica: «El número acumulado de llamadas donde cada intervalo aporta llamadas independientes».

   - **Incrementos independientes ✅**
   - Estacionariedad
   - Ensayos i.i.d.
   - Propiedad de Markov

   - **Respuesta:** Incrementos independientes
   - _Explicación:_ Corresponde a: Incrementos independientes.

**6. [Opción múltiple]** Clasifica: «El resultado de lanzar un dado en cada tiro, sin relación entre tiros».

   - Propiedad de Markov
   - **Ensayos i.i.d. ✅**
   - Incrementos independientes
   - Estacionariedad

   - **Respuesta:** Ensayos i.i.d.
   - _Explicación:_ Corresponde a: Ensayos i.i.d..

**7. [Opción múltiple]** Clasifica: «La distribución del proceso no cambia si desplazamos el origen del tiempo».

   - Incrementos independientes
   - Propiedad de Markov
   - Ensayos i.i.d.
   - **Estacionariedad ✅**

   - **Respuesta:** Estacionariedad
   - _Explicación:_ Corresponde a: Estacionariedad.

---

## 🚶 Módulo 3 · Caminata aleatoria

- **Parcial:** Primer parcial
- **Contenido:** Xₙ=Σεₖ, esperanza, varianza y probabilidad de posición.
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

🚶 Caminata aleatoria
Partimos de X_0=0 y en cada paso sumamos ε_n = +1 (con prob. p) o −1 (con prob. q=1−p):
X_n = X_n−1 + ε_n = ε_1 + … + ε_n
Esperanza: E[X_n] = n(p − q).
Varianza: Var[X_n] = n(1 − (p−q)²) = 4npq.
Posición: para llegar a k en n pasos hacen falta r=(n+k)/2 pasos «+1»: P(X_n=k) = C(n,r) p^r q^n−r.
X_n siempre tiene la misma paridad que n.

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Cálculo numérico]** Caminata aleatoria con X_0=0 y pasos ε=+1 (prob p) o −1 (prob q). Con p=0.6, q=0.4 y n=7 pasos, ¿cuánto vale E[X_7]?

   - **Respuesta:** 1.3999999999999997
   - _Procedimiento:_ Cada paso: E[ε] = (+1)·p + (−1)·q = p − q = 0.6 − 0.4 = 0.2 → E[X_n] = n·(p − q) = 7·(0.2) = 1.4
   - _Explicación:_ E[X_n] = n·(p − q).

**2. [Verdadero/Falso]** Después de n pasos, X_n solo puede tomar valores con la misma paridad que n.

   - **Respuesta:** Verdadero
   - _Explicación:_ Cada paso cambia la posición en ±1, así que X_n y n tienen la misma paridad.

**3. [Cálculo numérico]** Caminata con p=0.5. Tras n=4 pasos, ¿cuál es P(X_4 = 4)?

   - **Respuesta:** 0.0625
   - _Procedimiento:_ r = (n + k)/2 = (4 + (4))/2 = 4 pasos hacia +1 → P = C(4,4)·0.5^4·0.5^0 → P = 1·0.0625·1 = 0.0625
   - _Explicación:_ Para llegar a k en n pasos se necesitan r = (n+k)/2 pasos «+1»: P = C(n,r)·p^r·q^n−r.

**4. [Cálculo numérico]** Caminata aleatoria (pasos ±1). Con p=0.7, q=0.3 y n=9, ¿cuánto vale Var[X_9]?

   - **Respuesta:** 7.56
   - _Procedimiento:_ Var(ε) = 1 − (p − q)² = 4pq = 4·0.7·0.3 = 0.84 → Var[X_n] = n·4pq = 9·0.84 = 7.56
   - _Explicación:_ Var[X_n] = n·(1 − (p−q)²) = 4·n·p·q.

**5. [Cálculo numérico]** Caminata con p=0.4. Tras n=6 pasos, ¿cuál es P(X_6 = -2)?

   - **Respuesta:** 0.311
   - _Procedimiento:_ r = (n + k)/2 = (6 + (-2))/2 = 2 pasos hacia +1 → P = C(6,2)·0.4^2·0.6^4 → P = 15·0.16·0.1296 = 0.311
   - _Explicación:_ Para llegar a k en n pasos se necesitan r = (n+k)/2 pasos «+1»: P = C(n,r)·p^r·q^n−r.

**6. [Completar]** En la caminata aleatoria simétrica, q = 1 − ____ .

   - **Respuesta:** p

---

## ↩️ Módulo 4 · Regreso al origen

- **Parcial:** Primer parcial
- **Contenido:** Estar en 0 (pₙ) vs. primer regreso (fₙ) y paridad.
- **Tipo de práctica:** Ejercicios + retos

### 📝 Preguntas y respuestas (4 plantillas)

**1. [Cálculo numérico]** Caminata con p=0.6. ¿Cuál es la probabilidad de estar en el origen en el tiempo n=2, P(X_2=0)?

   - **Respuesta:** 0.48
   - _Procedimiento:_ Caminos que regresan a 0 en 2 pasos: (+1,−1) y (−1,+1) → P = pq + qp = 2pq = 2·0.6·0.4 = 0.48
   - _Explicación:_ Para volver a 0 en 2 pasos: subir y bajar (o bajar y subir): 2pq.

**2. [Ordenar pasos]** Ordena el análisis del primer regreso al origen:

   - **Respuesta:** 1) Salir del origen en el primer paso  2) Observar la trayectoria sin tocar el 0  3) Registrar el primer instante n en que X_n=0  4) Ese n define el primer regreso f_n

**3. [Verdadero/Falso]** El regreso al origen solo puede ocurrir en un número par de pasos.

   - **Respuesta:** Verdadero
   - _Explicación:_ Para volver a 0 hacen falta igual número de pasos +1 y −1, así que n debe ser par.

**4. [Opción múltiple]** ¿Cuál es la diferencia entre regresar al origen y regresar por primera vez?

   - **p_n = prob. de estar en 0 al tiempo n (aunque ya hubiera pasado antes); f_n = prob. del primer regreso en n ✅**
   - Son exactamente lo mismo
   - f_n siempre es mayor que p_n
   - p_n solo aplica a n impar

   - **Respuesta:** p_n = prob. de estar en 0 al tiempo n (aunque ya hubiera pasado antes); f_n = prob. del primer regreso en n
   - _Explicación:_ p_n: estar en 0 en el paso n. f_n: que ese sea el primer regreso al 0.

---

## 🔗 Módulo 5 · Cadenas de Markov

- **Parcial:** Primer parcial
- **Contenido:** Propiedad de Markov, estados y construcción de cadenas.
- **Tipo de práctica:** Quiz conceptual

### 📝 Preguntas y respuestas (4 plantillas)

**1. [Opción múltiple]** La propiedad de Markov se expresa como:

   - **P(X_n+1=j | X_n=i, …, X_0) = P(X_n+1=j | X_n=i) ✅**
   - P(X_n+1=j) = P(X_n+1=j | todo el pasado)
   - Todos los estados tienen la misma probabilidad
   - X_n+1 es independiente de X_n

   - **Respuesta:** P(X_n+1=j | X_n=i, …, X_0) = P(X_n+1=j | X_n=i)
   - _Explicación:_ Dado el estado presente X_n, el futuro no depende del pasado.

**2. [Completar]** En una cadena de Markov, el futuro depende del ______ y no del pasado.

   - **Respuesta:** presente

**3. [Verdadero/Falso]** En una cadena de Markov, para predecir el siguiente estado basta conocer el estado actual.

   - **Respuesta:** Verdadero
   - _Explicación:_ Esa es justamente la propiedad de Markov.

**4. [Opción múltiple]** «El clima de mañana depende solo del de hoy». Los estados podrían ser:

   - **{Soleado, Nublado, Lluvioso} ✅**
   - {1 día, 2 días, 3 días}
   - {−1, 0, +1}
   - La temperatura exacta con infinitos decimales

   - **Respuesta:** {Soleado, Nublado, Lluvioso}
   - _Explicación:_ El espacio de estados es el conjunto de situaciones posibles del sistema.

---

## 🕸️ Módulo 6 · Diagramas de transición

- **Parcial:** Primer parcial
- **Contenido:** Nodos, flechas, lazos y probabilidades que suman 1.
- **Tipo de práctica:** Quiz conceptual

### 📝 Preguntas y respuestas (4 plantillas)

**1. [Verdadero/Falso]** La suma de las probabilidades de las flechas que salen de un estado debe ser 1.

   - **Respuesta:** Verdadero
   - _Explicación:_ Desde un estado, algo tiene que ocurrir: las salidas suman 1.

**2. [Opción múltiple]** Un lazo (flecha de un estado hacia sí mismo) representa:

   - **La probabilidad de permanecer en ese estado ✅**
   - Un error en el diagrama
   - Que el estado es absorbente siempre
   - Una transición imposible

   - **Respuesta:** La probabilidad de permanecer en ese estado
   - _Explicación:_ El lazo es la probabilidad de quedarse en el mismo estado (p_ii).

**3. [Cálculo numérico]** De un estado salen dos flechas: una con probabilidad 0.3 hacia otro estado y un lazo hacia sí mismo. ¿Qué probabilidad tiene el lazo?

   - **Respuesta:** 0.7
   - _Procedimiento:_ Suma de salidas = 1 → Lazo = 1 − 0.3 = 0.7
   - _Explicación:_ Las salidas suman 1: lazo = 1 − 0.3 = 0.7.

**4. [Opción múltiple]** En un diagrama de transición, las flechas representan:

   - **Las probabilidades de pasar de un estado a otro ✅**
   - El número de estados
   - El tiempo total
   - La media del proceso

   - **Respuesta:** Las probabilidades de pasar de un estado a otro
   - _Explicación:_ Nodos = estados; flechas = transiciones con su probabilidad.

---

## 🔢 Módulo 7 · Matrices de transición

- **Parcial:** Primer parcial
- **Contenido:** Construir P, filas que suman 1, P² y vₙ=v₀Pⁿ.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Verdadero/Falso]** Para obtener las probabilidades en n pasos se usa P^n (la matriz P elevada a la n).

   - **Respuesta:** Verdadero
   - _Explicación:_ (P^n)_ij = P(X_n=j | X_0=i).

**2. [Cálculo numérico]** Sea P = [ [0.7, 0.3] , [0.4, 0.6] ]. Calcula la entrada (P²)_11 (fila 1, columna 1, empezando en 1).

   - **Respuesta:** 0.61
   - _Procedimiento:_ (P²)_11 = 0.7·0.7 + 0.3·0.4 → = 0.49 + 0.12 = 0.61
   - _Explicación:_ (P²)_11 = fila 1 · columna 1 = P_11·P_11 + P_12·P_21.

**3. [Verdadero/Falso]** En P, la entrada p_ij es la probabilidad de pasar del estado i al estado j en un paso.

   - **Respuesta:** Verdadero
   - _Explicación:_ p_ij = P(X_n+1=j | X_n=i).

**4. [Cálculo numérico]** En una matriz de transición, la primera fila es [ 0.2 , ? ]. Como cada fila debe sumar 1, ¿cuál es el valor que falta?

   - **Respuesta:** 0.8
   - _Procedimiento:_ Cada fila suma 1 → Faltante = 1 − 0.2 = 0.8
   - _Explicación:_ Cada fila de P suma 1: el faltante es 1 − 0.2.

**5. [Cálculo numérico]** El vector inicial es v_0 = [1, 0] (empezamos seguro en el estado 0). Con P_11=0.4 y P_12=0.6, ¿cuál es la probabilidad de estar en el estado 0 tras un paso (primera entrada de v_1 = v_0P)?

   - **Respuesta:** 0.4
   - _Procedimiento:_ v_1 = [1,0]·P = primera fila de P → Probabilidad de estado 0 = P_11 = 0.4
   - _Explicación:_ v_1 = v_0·P. Como v_0=[1,0], v_1 es la primera fila de P.

---

## ⏱️ Módulo 8 · Proceso de Poisson

- **Parcial:** Segundo parcial
- **Contenido:** N(t)~Poisson(λt): exacto, al menos, a lo más y unidades.
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

⏱️ Proceso de Poisson
El proceso de Poisson cuenta llegadas: N(t) = número de eventos en [0,t]. Los tiempos entre eventos T_i son Exponenciales(λ) independientes.
N(t) ~ Poisson(λt) ⇒ P(N(t)=k) = e^−λt(λt)^k / k!
Tiene incrementos estacionarios e independientes y la propiedad de Markov.
E[N(t)] = Var[N(t)] = λt.
«Al menos» y «a lo más» se resuelven con el complemento y sumas de la fórmula.
Ojo con las unidades: ajusta λ al tiempo (por hora, minuto, etc.).

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Verdadero/Falso]** En un proceso de Poisson, E[N(t)] = Var[N(t)] = λt.

   - **Respuesta:** Verdadero
   - _Explicación:_ La Poisson tiene media y varianza iguales a λt.

**2. [Cálculo numérico]** Un proceso de Poisson tiene tasa λ=4 por unidad de tiempo. ¿Cuál es P(N(3)=0)?

   - **Respuesta:** 0
   - _Procedimiento:_ λt = 4·3 = 12 → P(N(3)=0) = e^−12·(12)^0 / 0! → = 0
   - _Explicación:_ P(N(t)=k) = e^−λt(λt)^k / k!.

**3. [Cálculo numérico]** Llegan en promedio 12 clientes por hora (Poisson). ¿Cuál es la probabilidad de que lleguen exactamente 0 en 15 minutos?

   - **Respuesta:** 0.0498
   - _Procedimiento:_ λ por minuto = 12/60 = 0.2 → λt = 0.2·15 = 3 → P(N=0) = e^−3·(3)^0/0! = 0.0498
   - _Explicación:_ Hay que ajustar la tasa a la unidad del tiempo: λt = (12/60)·15.

**4. [Cálculo numérico]** Proceso de Poisson con λ=2, t=1. ¿Cuál es P(N(1) ≤ 2)?

   - **Respuesta:** 0.6767
   - _Procedimiento:_ λt = 2 → Suma P(N=0..2) = 0.6767
   - _Explicación:_ P(N≤k) = Σ_i=0^k e^−λt(λt)^i/i!.

**5. [Cálculo numérico]** Proceso de Poisson con λ=1.5 por unidad. ¿Cuál es la probabilidad de que no ocurra ningún evento en 1 unidad(es), P(N(1)=0)?

   - **Respuesta:** 0.2231
   - _Procedimiento:_ λt = 1.5·1 = 1.5 → P(N=0) = e^−1.5 = 0.2231
   - _Explicación:_ P(N(t)=0) = e^−λt.

**6. [Cálculo numérico]** Proceso de Poisson con λ=3, t=1. ¿Cuál es P(N(1) ≥ 2)? (usa el complemento)

   - **Respuesta:** 0.8009
   - _Procedimiento:_ λt = 3 → P(N=0) = e^−3 = 0.0498; P(N=1) = e^−3·3 = 0.1494 → P(N≥2) = 1 − 0.0498 − 0.1494 = 0.8009
   - _Explicación:_ P(N≥2) = 1 − P(N=0) − P(N=1).

---

## 📉 Módulo 9 · Distribución exponencial

- **Parcial:** Segundo parcial
- **Contenido:** P(X>t)=e^(−λt), despejar λ o t, media y varianza.
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

📉 Distribución exponencial
La Exponencial(λ) mide el tiempo entre eventos de un proceso de Poisson.
Supervivencia: P(X>t) = e^−λt.
Distribución: F(t)=1−e^−λt.
E[X]=1/λ, Var(X)=1/λ².
Pérdida de memoria: P(X>t+s | X>s) = P(X>t). Lo ya esperado no cuenta.
El tiempo hasta la n-ésima llegada es S_n=T_1+…+T_n ~ Erlang/Gamma, con E[S_n]=n/λ y Var=n/λ².

### 📝 Preguntas y respuestas (7 plantillas)

**1. [Cálculo numérico]** Para un tiempo Exponencial con λ=0.5, ¿cuánto vale Var(X)?

   - **Respuesta:** 4
   - _Procedimiento:_ Var(X) = 1/λ² = 1/0.5² = 4
   - _Explicación:_ Var(X) = 1/λ².

**2. [Cálculo numérico]** Tiempo de espera Exponencial con λ=0.5. ¿Cuál es P(1 ?

   - **Respuesta:** 0.2387
   - _Procedimiento:_ P(X>1) = e^−0.5 = 0.6065 → P(X>2) = e^−1 = 0.3679 → P(1<X<2) = 0.6065 − 0.3679 = 0.2387
   - _Explicación:_ P(aa) − P(X>b) = e^−λa − e^−λb.

**3. [Cálculo numérico]** El tiempo entre eventos es Exponencial con λ=0.25. ¿Cuál es P(X > 1)?

   - **Respuesta:** 0.7788
   - _Procedimiento:_ P(X>t) = e^−λt = e^−0.25·1 = e^−0.25 = 0.7788
   - _Explicación:_ Función de supervivencia: P(X>t) = e^−λt.

**4. [Opción múltiple]** La distribución Exponencial modela:

   - **El tiempo entre eventos consecutivos de un proceso de Poisson ✅**
   - El número de eventos en un intervalo
   - La suma de todas las llegadas
   - La probabilidad de un dado

   - **Respuesta:** El tiempo entre eventos consecutivos de un proceso de Poisson
   - _Explicación:_ Poisson cuenta eventos; la Exponencial mide el tiempo entre ellos.

**5. [Cálculo numérico]** Para un tiempo Exponencial con λ=0.25, ¿cuánto vale E[X]?

   - **Respuesta:** 4
   - _Procedimiento:_ E[X] = 1/λ = 1/0.25 = 4
   - _Explicación:_ E[X] = 1/λ.

**6. [Cálculo numérico]** Con λ=0.5 (Exponencial), ¿para qué tiempo t se cumple P(X > t) = 0.5?

   - **Respuesta:** 1.3863
   - _Procedimiento:_ e^−0.5·t = 0.5 → t = −ln(0.5)/0.5 = 1.3863
   - _Explicación:_ De e^−λt = p ⇒ t = −ln(p)/λ.

**7. [Cálculo numérico]** Se sabe que P(X > 2) = 0.3 para un tiempo Exponencial. Despeja λ.

   - **Respuesta:** 0.602
   - _Procedimiento:_ e^−λ·2 = 0.3 → −λ·2 = ln(0.3) = -1.204 → λ = −ln(0.3)/2 = 0.602
   - _Explicación:_ De e^−λt = p se despeja λ = −ln(p)/t.

---

## 🧠 Módulo 10 · Pérdida de memoria

- **Parcial:** Segundo parcial
- **Contenido:** P(X>t+s|X>s)=P(X>t) y el tiempo esperado adicional.
- **Tipo de práctica:** Ejercicios + retos

### 📝 Preguntas y respuestas (3 plantillas)

**1. [Cálculo numérico]** Un camión pasa en promedio cada 6 min (tiempos Exponenciales). Llevas 2 min esperando y no ha pasado. ¿Cuánto tiempo esperado adicional falta para que pase?

   - **Respuesta:** 6 min
   - _Procedimiento:_ Pérdida de memoria: P(X > t+s | X > s) = P(X > t) → El proceso «olvida» los 2 min ya esperados → Tiempo esperado adicional = media = 6 min
   - _Explicación:_ Por la pérdida de memoria, el tiempo que ya esperaste no cuenta: el tiempo esperado adicional sigue siendo la media.

**2. [Opción múltiple]** La propiedad de pérdida de memoria de la Exponencial dice:

   - **P(X > t+s | X > s) = P(X > t) ✅**
   - P(X > t+s) = P(X > t)·P(X > s)·2
   - El tiempo esperado disminuye mientras esperas
   - X siempre vale su media

   - **Respuesta:** P(X > t+s | X > s) = P(X > t)
   - _Explicación:_ Haber esperado s no cambia la distribución del tiempo restante.

**3. [Verdadero/Falso]** Si un componente con vida Exponencial ya funcionó 100 h, su probabilidad de durar 50 h más es la misma que la de uno nuevo de durar 50 h.

   - **Respuesta:** Verdadero
   - _Explicación:_ Justamente eso implica la pérdida de memoria.

---

## ⛓️ Módulo 11 · Erlang/Gamma (evento n)

- **Parcial:** Segundo parcial
- **Contenido:** Sₙ=T₁+…+Tₙ, E[Sₙ]=n/λ y Var=n/λ².
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (4 plantillas)

**1. [Opción múltiple]** El tiempo hasta la n-ésima llegada de un proceso de Poisson se distribuye:

   - **Erlang/Gamma (suma de n exponenciales) ✅**
   - Poisson
   - Uniforme
   - Binomial

   - **Respuesta:** Erlang/Gamma (suma de n exponenciales)
   - _Explicación:_ S_n = T_1+…+T_n, suma de n exponenciales i.i.d. ⇒ Erlang/Gamma.

**2. [Completar]** La esperanza del tiempo hasta el evento n-ésimo es E[S_n] = ____ (en términos de n y λ).

   - **Respuesta:** n/λ

**3. [Cálculo numérico]** El tiempo hasta el evento n-ésimo es S_n=T_1+…+T_n (Erlang). Con λ=0.5 y n=4, ¿cuánto vale E[S4]?

   - **Respuesta:** 8
   - _Procedimiento:_ E[S_n] = n/λ = 4/0.5 = 8
   - _Explicación:_ E[S_n] = n/λ.

**4. [Cálculo numérico]** El tiempo hasta el evento n-ésimo es S_n=T_1+…+T_n (Erlang). Con λ=2 y n=6, ¿cuánto vale Var(S6)?

   - **Respuesta:** 1.5
   - _Procedimiento:_ Var(S_n) = n/λ² = 6/2² = 1.5
   - _Explicación:_ Var(S_n) = n/λ².

---

## 🧩 Módulo 12 · Propiedades de Poisson

- **Parcial:** Segundo parcial
- **Contenido:** Adelgazamiento λp, superposición, Binomial(n,s/t) y compuesto.
- **Tipo de práctica:** Casos integradores

### 📝 Preguntas y respuestas (7 plantillas)

**1. [Opción múltiple]** Dado que en (0,t) ocurrieron n eventos de Poisson, ¿cómo se distribuye el número que cae en (0,s) con s<t?

   - **Binomial(n, s/t) ✅**
   - Poisson(λs)
   - Uniforme(0,n)
   - Exponencial(s/t)

   - **Respuesta:** Binomial(n, s/t)
   - _Explicación:_ N(s) | N(t)=n ~ Binomial(n, s/t).

**2. [Cálculo numérico]** En un proceso de Poisson se sabe que ocurrieron N(6)=4 eventos. ¿Cuál es la probabilidad de que 1 de ellos ocurrieran antes de s=3, es decir P(N(3)=1 | N(6)=4)?

   - **Respuesta:** 0.25
   - _Procedimiento:_ s/t = 3/6 = 0.5 → P = C(4,1)·(0.5)^1·(0.5)^3 → = 4·0.5·0.125 = 0.25
   - _Explicación:_ Dado N(t)=n, N(s) ~ Binomial(n, s/t): P = C(n,k)(s/t)^k(1−s/t)^n−k.

**3. [Cálculo numérico]** Proceso de Poisson compuesto X(t)=ΣY_i, con λ=2 eventos por unidad y monto medio E[Y]=10 por evento. ¿Cuál es E[X(1)]?

   - **Respuesta:** 20
   - _Procedimiento:_ E[X(t)] = λt · E[Y] = 2·1·10 → = 2·10 = 20
   - _Explicación:_ Para el Poisson compuesto, E[X(t)] = λt · E[Y].

**4. [Cálculo numérico]** Se superponen (suman) dos procesos de Poisson independientes con tasas λ_1=2 y λ_2=1. ¿Cuál es la tasa del proceso combinado?

   - **Respuesta:** 3
   - _Procedimiento:_ λ = λ_1 + λ_2 = 2 + 1 = 3
   - _Explicación:_ La superposición de Poisson independientes es Poisson con tasa λ_1+λ_2.

**5. [Cálculo numérico]** Poisson con λ=3; los eventos son de «tipo A» con prob. p=0.6. En t=1, ¿cuál es P(N_A(1)=1)?

   - **Respuesta:** 0.2975
   - _Procedimiento:_ λ_A = λp = 3·0.6 = 1.8 → P(N_A(1)=1) = e^−1.8·(1.8)^1/1! = 0.2975
   - _Explicación:_ El subproceso A es Poisson con tasa λp; luego se aplica la fórmula de Poisson.

**6. [Cálculo numérico]** Un proceso de Poisson tiene tasa λ=4. Cada evento es de «tipo A» con probabilidad p=0.15 (adelgazamiento). ¿Cuál es la nueva tasa λ_A del proceso de eventos tipo A?

   - **Respuesta:** 0.6
   - _Procedimiento:_ λ_A = λ·p = 4·0.15 = 0.6
   - _Explicación:_ Al clasificar/adelgazar un Poisson, cada subproceso es Poisson con tasa λ·p.

**7. [Cálculo numérico]** Un proceso de Poisson con λ=1.7 se clasifica: una categoría ocurre con prob. p=0.5. En t=1, ¿cuál es P(N_cat(1) ≥ 2)?

   - **Respuesta:** 0.2093
   - _Procedimiento:_ λp = 1.7·0.5 = 0.85 → P(N=0)=e^−0.85=0.4274; P(N=1)=0.3633 → P(N≥2)=1−0.4274−0.3633 = 0.2093
   - _Explicación:_ Nueva tasa λp; luego P(N≥2)=1−P(0)−P(1).

---

