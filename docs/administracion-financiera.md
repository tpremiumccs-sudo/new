# 💼 Administración Financiera — Temario completo

> Documento generado automáticamente desde ActuarIQ con **todo el contenido de cada módulo** (preguntas, respuestas, procedimientos y explicaciones), organizado por parcial. Las preguntas numéricas usan valores de ejemplo; el método y la respuesta son los del generador del curso.

_Materia: `administracion-financiera` · 8 módulos · actualizado 2026-07-11_

## 🧮 Fórmulas clave

| Tema | Fórmula / idea |
|---|---|
| **Rentabilidad** | ROA=UN/Activos ; ROE=UN/Capital. Apalancamiento: ROE=ROA+(D/C)(ROA−i(1−t)). |
| **Estructura óptima** | Con i(x)=a+bx²: (D/C)*=√[(r−a)/(3b)]. |
| **Sartoris-Hill** | VP de la política = flujos descontados al costo de capital diario, menos incobrables y descuentos. |
| **Gallinger / insolvencia** | λ=(L_0+μT)/(σ√T) ; P(insolvencia)=1−Φ(λ). |
| **Lote económico (EOQ)** | Q*=√(2D·C_o/C_m), C_m=rP ; costo=D·C_o/Q+C_m·Q/2+DP ; reorden=d·L. |
| **CAPM / WACC** | k_e=r_f+β(r_m−r_f) ; WACC=(E/V)k_e+(D/V)k_d(1−t). |
| **DuPont y crecimiento** | ROE=margen×rotación×apalancamiento ; g=b·ROE (b = tasa de retención). |
| **Valuación (Gordon)** | V=D_1/(k−g) ; dos etapas: flujos explícitos + valor terminal descontado. |

## 🗂️ Módulos por parcial _(división sugerida, ajústala con tu profesor)_

**Primer parcial:** 💰 Rentabilidad y apalancamiento · ⚖️ Estructura óptima de capital · 🧾 Políticas de crédito (Sartoris-Hill) · 🚨 Gallinger y riesgo de insolvencia

**Segundo parcial:** 📦 Inventarios y lote económico · 🏷️ Descuentos por volumen · 🏦 FLE, CAPM, WACC y crecimiento · 🏢 Valuación de empresas

---

## 💰 Módulo 1 · Rentabilidad y apalancamiento

- **Parcial:** Primer parcial
- **Contenido:** ROA, ROE, utilidad neta y efecto de la deuda (D/C).
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

💰 Rentabilidad y apalancamiento
A_T = C + D. ROA = r = UO/A_T y ROE = U_N/C. Con deuda:
ROE = [r + (r − i)(D/C)](1 − t), U_N = ROE·C
Si r>i, el apalancamiento (D/C) aumenta el ROE.
Si r<i, la deuda lo reduce (puede volverlo negativo).
No confundir ROA (UO/A_T) con ROE (U_N/C), ni D/A con D/C.

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Cálculo numérico]** Con ROE=0.3 y capital C=$2,500, calcula la utilidad neta U_N = ROE · C.

   - **Respuesta:** 750
   - _Procedimiento:_ U_N = 0.3 · 2500 = 750
   - _Explicación:_ U_N = ROE · C.

**2. [Cálculo numérico]** Una empresa tiene utilidad operativa UO=$1,375 y activos totales A_T=$5,000. Calcula el retorno sobre activos ROA = UO / A_T.

   - **Respuesta:** 0.275
   - _Procedimiento:_ ROA = 1375 / 5000 = 0.275
   - _Explicación:_ ROA = r = UO / A_T.

**3. [Opción múltiple]** El apalancamiento financiero aumenta el ROE cuando:

   - **r > i (el retorno de activos supera el costo de la deuda) ✅**
   - r < i
   - D = 0
   - la tasa de impuestos es 0

   - **Respuesta:** r > i (el retorno de activos supera el costo de la deuda)
   - _Explicación:_ Si r>i, endeudarse amplifica el ROE; si r<i, lo reduce (incluso puede volverlo negativo).

**4. [Cálculo numérico]** Con utilidad neta U_N=$200 y capital contable C=$1,000, calcula el retorno sobre capital ROE = U_N / C.

   - **Respuesta:** 0.2
   - _Procedimiento:_ ROE = 200 / 1000 = 0.2
   - _Explicación:_ ROE = U_N / C.

**5. [Cálculo numérico]** Con deuda: ROE = [r + (r−i)(D/C)](1−t). Con r=0.275, i=0.1, D=1500, C=2500 y t=0.3, calcula el ROE.

   - **Respuesta:** 0.266
   - _Procedimiento:_ D/C = 1500/2500 = 0.6 → r−i = 0.275−0.1 = 0.175 → ROE = [0.275 + 0.175·0.6]·(1−0.3) = 0.266
   - _Explicación:_ El apalancamiento amplifica el ROE cuando r>i.

**6. [Completar]** Los activos totales se reparten en A_T = C + ____ .

   - **Respuesta:** D (deuda)

**7. [Opción múltiple]** No debes confundir:

   - **ROA = UO/A_T con ROE = U_N/C ✅**
   - ROA = U_N/C con ROE = UO/A_T
   - ROA y ROE son idénticos
   - ROE = UO/D

   - **Respuesta:** ROA = UO/A_T con ROE = U_N/C
   - _Explicación:_ ROA usa utilidad operativa sobre activos; ROE, utilidad neta sobre capital.

**8. [Verdadero/Falso]** La razón D/C representa el nivel de apalancamiento.

   - **Respuesta:** Verdadero
   - _Explicación:_ D/C mide cuánta deuda hay por cada unidad de capital.

---

## ⚖️ Módulo 2 · Estructura óptima de capital

- **Parcial:** Primer parcial
- **Contenido:** i(x)=a+bx², ROE(x) y (D/C)*=√[(r−a)/(3b)].
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Cálculo numérico]** El costo de la deuda crece con el apalancamiento: i(x) = a + b·x², con x=D/C. Con a=0.08, b=0.08 y x=0.5, calcula i(x).

   - **Respuesta:** 0.1
   - _Procedimiento:_ x² = 0.5² = 0.25 → i = 0.08 + 0.08·0.25 = 0.1
   - _Explicación:_ i(x) = a + b·x².

**2. [Opción múltiple]** ¿Cuándo la fórmula x*=√[(r−a)/(3b)] da una raíz inválida?

   - **Cuando r ≤ a (el radicando sería ≤ 0) ✅**
   - Cuando r > a
   - Cuando b > 0
   - Nunca

   - **Respuesta:** Cuando r ≤ a (el radicando sería ≤ 0)
   - _Explicación:_ Si r≤a el radicando es negativo o cero y no hay óptimo válido.

**3. [Cálculo numérico]** En la estructura óptima x*=0.78528 con i*=0.15167, r=0.275 y t=0.3, calcula el ROE óptimo = [r + (r − i*)x*](1 − t).

   - **Respuesta:** 0.2603
   - _Procedimiento:_ (r − i*)·x* = (0.275−0.15167)·0.78528 = 0.09685 → ROE* = [0.275 + 0.09685]·(1−0.3) = 0.2603
   - _Explicación:_ Se evalúa ROE(x) en el óptimo x*.

**4. [Cálculo numérico]** La estructura óptima de capital es (D/C)* = √[(r − a)/(3b)]. Con r=0.25, a=0.08 y b=0.12, calcula x*. (Requiere r>a y b>0.)

   - **Respuesta:** 0.68718
   - _Procedimiento:_ (r−a)/(3b) = (0.25−0.08)/(3·0.12) = 0.47222 → x* = √0.47222 = 0.68718
   - _Explicación:_ x* = √[(r−a)/(3b)] surge de derivar ROE(x) e igualar a cero.

**5. [Ordenar pasos]** Ordena la obtención de la estructura óptima:

   - **Respuesta:** 1) Definir x = D/C  2) Sustituir i(x)=a+bx² en ROE(x)  3) Derivar ROE(x) respecto de x  4) Igualar la derivada a cero  5) Despejar x* = √[(r−a)/(3b)]  6) Verificar que sea real y positivo (r>a, b>0)

**6. [Verdadero/Falso]** El óptimo x* se obtiene derivando ROE(x) e igualando a cero.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es un problema de máximo: dROE/dx = 0.

---

## 🧾 Módulo 3 · Políticas de crédito (Sartoris-Hill)

- **Parcial:** Primer parcial
- **Contenido:** VP con costo de capital diario, incobrables y descuentos.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Cálculo numérico]** El costo de capital anual es CPPC=0.15. Calcula el costo de capital diario k = CPPC/365.

   - **Respuesta:** 0.000411
   - _Procedimiento:_ k = 0.15/365 = 0.000411
   - _Explicación:_ k_diario = CPPC / 365.

**2. [Cálculo numérico]** Modelo de Sartoris-Hill: VP = PQ/(1+k)^DSO − cQ. Con P=15, Q=500, c=6, k=CPPC/365=0.000274 (CPPC=0.1) y DSO=30 días, calcula VP.

   - **Respuesta:** 4438.62
   - _Procedimiento:_ (1+k)^DSO = (1+0.000274)^30 = 1.00825 → PQ/(1+k)^DSO = 7500/1.00825 = 7438.62 → VP = 7438.62 − 3000 = 4438.62
   - _Explicación:_ Se descuenta el ingreso PQ al costo diario durante DSO días y se resta el costo variable cQ.

**3. [Cálculo numérico]** Con cuentas incobrables: VP = PQ(1−b)/(1+k)^DSO − cQ. Con P=15, Q=1000, c=8, k=0.000411, DSO=60 y b=0.05, calcula VP.

   - **Respuesta:** 5903
   - _Procedimiento:_ PQ(1−b) = 15000·(1−0.05) = 14250 → VP = 14250/1.02496 − 8000 = 5903
   - _Explicación:_ La fracción incobrable b reduce el ingreso cobrable a PQ(1−b).

**4. [Verdadero/Falso]** En Sartoris-Hill el ingreso PQ se descuenta durante el periodo promedio de cobro (DSO).

   - **Respuesta:** Verdadero
   - _Explicación:_ El cobro llega en promedio a los DSO días, por eso se descuenta ese plazo.

**5. [Completar]** Si el costo de capital es anual, el diario es k = CPPC / ____ .

   - **Respuesta:** 365

**6. [Opción múltiple]** En el modelo con descuento/plazo neto/cobro, las proporciones PDR, PN y PRC deben cumplir:

   - **PDR + PN + PRC = 1 (y cada una entre 0 y 1) ✅**
   - PDR + PN + PRC = DSO
   - Pueden sumar más de 1
   - Deben ser negativas

   - **Respuesta:** PDR + PN + PRC = 1 (y cada una entre 0 y 1)
   - _Explicación:_ Son proporciones de clientes por forma de pago: suman 1 y están en [0,1].

---

## 🚨 Módulo 4 · Gallinger y riesgo de insolvencia

- **Parcial:** Primer parcial
- **Contenido:** pₙ de Gallinger y λ=(L₀+μT)/(σ√T), P=1−Φ(λ).
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Cálculo numérico]** Modelo de Gallinger: pₙ = (c/S)(n−1) + V(1+k)ⁿ. Con S=10000, c=200, V=0.01, k=0.01 y n=4 meses, calcula pₙ.

   - **Respuesta:** 0.07041
   - _Procedimiento:_ (c/S)(n−1) = (200/10000)·3 = 0.06 → V(1+k)ⁿ = 0.01·(1+0.01)^4 = 0.01041 → pₙ = 0.06 + 0.01041 = 0.07041
   - _Explicación:_ Se aplica la fórmula del cuaderno directamente (S: ventas mensuales, c: costo de cobranza, V: proporción incobrable, k: costo de capital por periodo).

**2. [Verdadero/Falso]** Una λ más grande (mayor reserva relativa) implica menor probabilidad de insolvencia.

   - **Respuesta:** Verdadero
   - _Explicación:_ P=1−Φ(λ) decrece cuando λ crece.

**3. [Cálculo numérico]** La probabilidad de insolvencia es P = 1 − Φ(λ) (cola derecha de la normal). Con λ=1.5, calcula P.

   - **Respuesta:** 0.0668
   - _Procedimiento:_ Φ(1.5) = 0.9332 → P = 1 − 0.9332 = 0.0668
   - _Explicación:_ Se consulta Φ(λ) en la normal estándar y se toma 1−Φ(λ).

**4. [Cálculo numérico]** Índice de liquidez: λ = (L₀ + μT)/(σ√T). Con L₀=4000, μT=-400, σ=1200 y T=9, calcula λ.

   - **Respuesta:** 1
   - _Procedimiento:_ L₀ + μT = 4000 + (-400) = 3600 → σ√T = 1200·√9 = 3600 → λ = 3600 / 3600 = 1
   - _Explicación:_ λ estandariza la reserva más el flujo neto esperado acumulado.

**5. [Ordenar pasos]** Ordena el cálculo del riesgo de insolvencia:

   - **Respuesta:** 1) Registrar los flujos netos de caja  2) Calcular la media μ y la desviación σ  3) Establecer T e identificar L₀  4) Calcular λ = (L₀+μT)/(σ√T)  5) Consultar la normal estándar Φ(λ)  6) Obtener P = 1−Φ(λ) e interpretar el riesgo

---

## 📦 Módulo 5 · Inventarios y lote económico

- **Parcial:** Segundo parcial
- **Contenido:** Q*=√(2DC_o/C_m), costos y punto de reorden.
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

📦 Inventarios y lote económico
Costo total: CT(Q)=(Q/2)C_m+(D/Q)C_o. Derivando e igualando a cero:
Q* = √(2·D·C_o / C_m)
En Q* el costo de mantener ≈ el de ordenar. Inventario promedio = Q/2; número de pedidos = D/Q. Punto de reorden PR = ΔT_e·C_d + I_s, con consumo diario C_d = D/días.

### 📝 Preguntas y respuestas (7 plantillas)

**1. [Ordenar pasos]** Ordena la derivación del lote económico:

   - **Respuesta:** 1) Escribir CT(Q)=(Q/2)C_m+(D/Q)C_o  2) Derivar dCT/dQ = C_m/2 − DC_o/Q²  3) Igualar a cero: C_m/2 = DC_o/Q²  4) Despejar Q* = √(2DC_o/C_m)

**2. [Completar]** El inventario promedio es Q/____ .

   - **Respuesta:** 2

**3. [Verdadero/Falso]** En el lote óptimo, el costo de mantener es aproximadamente igual al costo de ordenar.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es una propiedad del EOQ: ambos costos se igualan en Q*.

**4. [Cálculo numérico]** Punto de reorden: PR = ΔT_e·C_d + I_s, con consumo diario C_d = D/días. Con D=36500, días=365, ΔT_e=3, I_s=200, calcula PR.

   - **Respuesta:** 500
   - _Procedimiento:_ C_d = 36500/365 = 100 → PR = 3·100 + 200 = 500
   - _Explicación:_ Primero el consumo diario C_d=D/días; luego PR=ΔT_e·C_d+I_s.

**5. [Cálculo numérico]** Lote económico: Q* = √(2·D·C_o / C_m). Con demanda D=5000, costo de ordenar C_o=4.5 y costo de mantener C_m=10, calcula Q*.

   - **Respuesta:** 67.082
   - _Procedimiento:_ 2·D·C_o = 2·5000·4.5 = 45000 → Q* = √(45000/10) = 67.082
   - _Explicación:_ Q* minimiza CT(Q)=(Q/2)C_m+(D/Q)C_o.

**6. [Cálculo numérico]** Con D=2000, C_o=120, C_m=10 y Q*=219.089, calcula el costo de mantener ((Q/2)·C_m).

   - **Respuesta:** 1095.4451
   - _Procedimiento:_ (Q/2)·C_m = (219.089/2)·10 = 1095.4451
   - _Explicación:_ En el óptimo el costo de mantener ≈ el costo de ordenar.

**7. [Cálculo numérico]** Con D=2000, C_o=50, C_m=20 y Q*=100, calcula el costo de ordenar ((D/Q)·C_o).

   - **Respuesta:** 1000
   - _Procedimiento:_ (D/Q)·C_o = (2000/100)·50 = 1000
   - _Explicación:_ En el óptimo el costo de mantener ≈ el costo de ordenar.

---

## 🏷️ Módulo 6 · Descuentos por volumen

- **Parcial:** Segundo parcial
- **Contenido:** C_m=rP, Q* por rango y comparación de costo total.
- **Tipo de práctica:** Ejercicios + caso

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Opción múltiple]** Al comparar alternativas con descuento por volumen, se elige:

   - **La de menor costo total (incluyendo el precio de compra) ✅**
   - Siempre el Q* más pequeño
   - El precio más bajo sin importar el lote
   - El lote más grande posible

   - **Respuesta:** La de menor costo total (incluyendo el precio de compra)
   - _Explicación:_ No se elige por Q* solo: hay que comparar el CTI completo, que incluye P·D.

**2. [Cálculo numérico]** Cuando el costo de mantener es un % del precio (C_m=r·P), el lote es Q* = √(2·D·C_o/(r·P)). Con D=5000, C_o=80, r=0.25 y P=20, calcula Q*.

   - **Respuesta:** 400
   - _Procedimiento:_ C_m = r·P = 0.25·20 = 5 → Q* = √(2·5000·80/5) = 400
   - _Explicación:_ Se sustituye C_m=r·P en la fórmula del EOQ.

**3. [Cálculo numérico]** Costo total del inventario: CTI = P·D + (D/Q)C_o + (Q/2)C_m. Con P=10, D=10000, Q=707, C_o=50 y C_m=r·P=2, calcula CTI.

   - **Respuesta:** 101414.21
   - _Procedimiento:_ P·D = 10·10000 = 100000 → (D/Q)C_o = (10000/707)·50 = 707.21 → (Q/2)C_m = (707/2)·2 = 707 → CTI = 100000 + 707.21 + 707 = 101414.21
   - _Explicación:_ Incluye el costo de compra P·D, el de ordenar y el de mantener.

**4. [Verdadero/Falso]** Si el Q* calculado no cae en su rango de precio, se usa el punto mínimo factible de ese rango.

   - **Respuesta:** Verdadero
   - _Explicación:_ Se ajusta Q al límite factible del rango antes de comparar costos.

**5. [Ordenar pasos]** Ordena la decisión con descuentos por volumen:

   - **Respuesta:** 1) Calcular Q* para cada precio  2) Verificar si Q* pertenece a su rango  3) Si no pertenece, usar el mínimo factible del rango  4) Calcular el CTI (incluyendo el costo de compra P·D)  5) Comparar candidatos y elegir el de menor costo total

---

## 🏦 Módulo 7 · FLE, CAPM, WACC y crecimiento

- **Parcial:** Segundo parcial
- **Contenido:** Flujo libre, costo de capital, WACC, DuPont y g sostenible.
- **Tipo de práctica:** Ejercicios ilimitados

### 📘 Lección

🏦 FLE, CAPM y WACC
FLE = UO(1−T) + Dep − CAPEX − ΔCWT (la depreciación se suma; CAPEX y el aumento de capital de trabajo se restan).
CAPM: R_e = R_f + β(R_m−R_f), β = Cov/Var. Costo de deuda después de impuestos: R_d(1−T).
WACC = (D/A_T)R_d(1−T) + (C/A_T)R_e. Crecimiento sostenible g = ROE·TR, con TR=1−d. DuPont: ROE = margen × rotación × multiplicador del capital.

### 📝 Preguntas y respuestas (8 plantillas)

**1. [Cálculo numérico]** WACC = (D/A_T)·R_d(1−T) + (C/A_T)·R_e. Con D=1000, C=3000 (A_T=D+C=4000), R_d=0.12, R_e=0.18 y T=0.3, calcula el WACC.

   - **Respuesta:** 0.156
   - _Procedimiento:_ (D/A_T)·R_d(1−T) = (1000/4000)·0.12·(1−0.3) = 0.021 → (C/A_T)·R_e = (3000/4000)·0.18 = 0.135 → WACC = 0.021 + 0.135 = 0.156
   - _Explicación:_ Promedio ponderado del costo de la deuda (después de impuestos) y del capital propio.

**2. [Cálculo numérico]** CAPM: R_e = R_f + β(R_m − R_f). Con R_f=0.05, β=0.8 y R_m=0.1, calcula el costo del capital propio R_e.

   - **Respuesta:** 0.09
   - _Procedimiento:_ R_m − R_f = 0.1−0.05 = 0.05 → R_e = 0.05 + 0.8·0.05 = 0.09
   - _Explicación:_ R_e = tasa libre de riesgo + beta × prima de riesgo del mercado.

**3. [Cálculo numérico]** Flujo libre de efectivo: FLE = UO(1−T) + Dep − CAPEX − ΔCWT. Con UO=1500, T=0.35, Dep=100, CAPEX=400 y ΔCWT=50, calcula FLE.

   - **Respuesta:** 625
   - _Procedimiento:_ UO(1−T) = 1500·(1−0.35) = 975 → FLE = 975 + 100 − 400 − (50) = 625
   - _Explicación:_ La depreciación se suma (no es salida de efectivo); CAPEX y el aumento de capital de trabajo se restan.

**4. [Verdadero/Falso]** La depreciación se suma al calcular el FLE porque no representa una salida de efectivo.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es un gasto contable no monetario, por eso se reintegra.

**5. [Cálculo numérico]** Crecimiento sostenible: g = ROE · TR, con tasa de retención TR = 1 − d. Con ROE=0.15 y tasa de pago de dividendos d=0.4, calcula g.

   - **Respuesta:** 0.09
   - _Procedimiento:_ TR = 1 − d = 1 − 0.4 = 0.6 → g = 0.15·0.6 = 0.09
   - _Explicación:_ TR es lo que la empresa reinvierte; g = ROE × TR.

**6. [Cálculo numérico]** La beta se obtiene con β = Cov(R_i,R_m) / Var(R_m). Con Cov=0.012 y Var(R_m)=0.006, calcula β.

   - **Respuesta:** 2
   - _Procedimiento:_ β = 0.012/0.006 = 2
   - _Explicación:_ β mide la sensibilidad del activo respecto al mercado.

**7. [Opción múltiple]** La descomposición DuPont del ROE es:

   - **margen neto × rotación de activos × multiplicador del capital ✅**
   - margen × precio × cantidad
   - deuda × capital × impuestos
   - ventas − costos

   - **Respuesta:** margen neto × rotación de activos × multiplicador del capital
   - _Explicación:_ ROE = (UN/Ventas)(Ventas/Activos)(Activos/Capital).

**8. [Cálculo numérico]** Flujo libre de efectivo: FLE = UO(1−T) + Dep − CAPEX − ΔCWT. Con UO=1000, T=0.35, Dep=200, CAPEX=300 y ΔCWT=-50, calcula FLE.

   - **Respuesta:** 600
   - _Procedimiento:_ UO(1−T) = 1000·(1−0.35) = 650 → FLE = 650 + 200 − 300 − (-50) = 600
   - _Explicación:_ La depreciación se suma (no es salida de efectivo); CAPEX y el aumento de capital de trabajo se restan.

---

## 🏢 Módulo 8 · Valuación de empresas

- **Parcial:** Segundo parcial
- **Contenido:** Gordon en una etapa y modelo de dos etapas con valor terminal.
- **Tipo de práctica:** Ejercicios + caso

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Ordenar pasos]** Ordena la valuación en dos etapas:

   - **Respuesta:** 1) Calcular el FLE base y el crecimiento g₁  2) Proyectar y descontar cada FLE de la primera etapa  3) Calcular FLE del año n  4) Calcular el valor terminal VT_n = FLE_n(1+g₂)/(WACC−g₂)  5) Descontar el valor terminal  6) Sumar todos los valores presentes

**2. [Opción múltiple]** Si la empresa no paga dividendos, entonces:

   - **d = 0 y TR = 1 ✅**
   - d = 1 y TR = 0
   - g = WACC
   - no se puede valuar

   - **Respuesta:** d = 0 y TR = 1
   - _Explicación:_ Sin dividendos, la tasa de pago d=0 y la retención TR=1.

**3. [Opción múltiple]** Si al valuar resulta WACC ≤ g, se debe:

   - **No calcular un valor convencional y revisar los supuestos ✅**
   - Usar el valor negativo tal cual
   - Cambiar g por WACC
   - Ignorar la advertencia

   - **Respuesta:** No calcular un valor convencional y revisar los supuestos
   - _Explicación:_ La fórmula de Gordon exige WACC>g; si no, el resultado no tiene sentido y hay que revisar supuestos.

**4. [Verdadero/Falso]** No hay que confundir FLE₀ con FLE₁: FLE₁ = FLE₀(1+g).

   - **Respuesta:** Verdadero
   - _Explicación:_ El numerador de Gordon usa el flujo del siguiente periodo, FLE₁.

**5. [Cálculo numérico]** Valuación en una etapa (Gordon): V_F = FLE₁/(WACC − g), con FLE₁=FLE₀(1+g). Con FLE₀=1200, g=0.02 y WACC=0.08 (WACC>g), calcula V_F.

   - **Respuesta:** 20400
   - _Procedimiento:_ FLE₁ = FLE₀(1+g) = 1200·(1+0.02) = 1224 → V_F = 1224/(0.08−0.02) = 1224/0.06 = 20400
   - _Explicación:_ Requiere WACC>g. Primero se proyecta FLE₁, luego se capitaliza a (WACC−g).

**6. [Cálculo numérico]** Valor terminal (segunda etapa): VT_n = FLE_n(1+g₂)/(WACC − g₂). Con FLE_n=1500, g₂=0.03 y WACC=0.1, calcula VT_n.

   - **Respuesta:** 22071.43
   - _Procedimiento:_ FLE_n(1+g₂) = 1500·(1+0.03) = 1545 → VT_n = 1545/(0.1−0.03) = 22071.43
   - _Explicación:_ Es una perpetuidad creciente al final de la primera etapa.

---

