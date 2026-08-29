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

**1. [Cálculo numérico]** Con deuda: ROE = [r + (r−i)(D/C)](1−t). Con r=0.25, i=0.15, D=1500, C=2500 y t=0.35, calcula el ROE.

   - **Respuesta:** 0.2015
   - _Procedimiento:_ D/C = 1500/2500 = 0.6 → r−i = 0.25−0.15 = 0.1 → ROE = [0.25 + 0.1·0.6]·(1−0.35) = 0.2015
   - _Explicación:_ El apalancamiento amplifica el ROE cuando r>i.

**2. [Cálculo numérico]** Una empresa tiene utilidad operativa UO=$450 y activos totales A_T=$3,000. Calcula el retorno sobre activos ROA = UO / A_T.

   - **Respuesta:** 0.15
   - _Procedimiento:_ ROA = 450 / 3000 = 0.15
   - _Explicación:_ ROA = r = UO / A_T.

**3. [Opción múltiple]** No debes confundir:

   - **ROA = UO/A_T con ROE = U_N/C ✅**
   - ROA = U_N/C con ROE = UO/A_T
   - ROA y ROE son idénticos
   - ROE = UO/D

   - **Respuesta:** ROA = UO/A_T con ROE = U_N/C
   - _Explicación:_ ROA usa utilidad operativa sobre activos; ROE, utilidad neta sobre capital.

**4. [Cálculo numérico]** Con ROE=0.26 y capital C=$2,500, calcula la utilidad neta U_N = ROE · C.

   - **Respuesta:** 650
   - _Procedimiento:_ U_N = 0.26 · 2500 = 650
   - _Explicación:_ U_N = ROE · C.

**5. [Opción múltiple]** El apalancamiento financiero aumenta el ROE cuando:

   - **r > i (el retorno de activos supera el costo de la deuda) ✅**
   - r < i
   - D = 0
   - la tasa de impuestos es 0

   - **Respuesta:** r > i (el retorno de activos supera el costo de la deuda)
   - _Explicación:_ Si r>i, endeudarse amplifica el ROE; si r<i, lo reduce (incluso puede volverlo negativo).

**6. [Cálculo numérico]** Con utilidad neta U_N=$600 y capital contable C=$3,000, calcula el retorno sobre capital ROE = U_N / C.

   - **Respuesta:** 0.2
   - _Procedimiento:_ ROE = 600 / 3000 = 0.2
   - _Explicación:_ ROE = U_N / C.

**7. [Completar]** Los activos totales se reparten en A_T = C + ____ .

   - **Respuesta:** D (deuda)

**8. [Verdadero/Falso]** La razón D/C representa el nivel de apalancamiento.

   - **Respuesta:** Verdadero
   - _Explicación:_ D/C mide cuánta deuda hay por cada unidad de capital.

---

## ⚖️ Módulo 2 · Estructura óptima de capital

- **Parcial:** Primer parcial
- **Contenido:** i(x)=a+bx², ROE(x) y (D/C)*=√[(r−a)/(3b)].
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Cálculo numérico]** La estructura óptima de capital es (D/C)* = √[(r − a)/(3b)]. Con r=0.3, a=0.09 y b=0.1, calcula x*. (Requiere r>a y b>0.)

   - **Respuesta:** 0.83666
   - _Procedimiento:_ (r−a)/(3b) = (0.3−0.09)/(3·0.1) = 0.7 → x* = √0.7 = 0.83666
   - _Explicación:_ x* = √[(r−a)/(3b)] surge de derivar ROE(x) e igualar a cero.

**2. [Opción múltiple]** ¿Cuándo la fórmula x*=√[(r−a)/(3b)] da una raíz inválida?

   - **Cuando r ≤ a (el radicando sería ≤ 0) ✅**
   - Cuando r > a
   - Cuando b > 0
   - Nunca

   - **Respuesta:** Cuando r ≤ a (el radicando sería ≤ 0)
   - _Explicación:_ Si r≤a el radicando es negativo o cero y no hay óptimo válido.

**3. [Verdadero/Falso]** El óptimo x* se obtiene derivando ROE(x) e igualando a cero.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es un problema de máximo: dROE/dx = 0.

**4. [Cálculo numérico]** En la estructura óptima x*=0.78528 con i*=0.15167, r=0.275 y t=0.3, calcula el ROE óptimo = [r + (r − i*)x*](1 − t).

   - **Respuesta:** 0.2603
   - _Procedimiento:_ (r − i*)·x* = (0.275−0.15167)·0.78528 = 0.09685 → ROE* = [0.275 + 0.09685]·(1−0.3) = 0.2603
   - _Explicación:_ Se evalúa ROE(x) en el óptimo x*.

**5. [Ordenar pasos]** Ordena la obtención de la estructura óptima:

   - **Respuesta:** 1) Definir x = D/C  2) Sustituir i(x)=a+bx² en ROE(x)  3) Derivar ROE(x) respecto de x  4) Igualar la derivada a cero  5) Despejar x* = √[(r−a)/(3b)]  6) Verificar que sea real y positivo (r>a, b>0)

**6. [Cálculo numérico]** El costo de la deuda crece con el apalancamiento: i(x) = a + b·x², con x=D/C. Con a=0.09, b=0.08 y x=0.6, calcula i(x).

   - **Respuesta:** 0.1188
   - _Procedimiento:_ x² = 0.6² = 0.36 → i = 0.09 + 0.08·0.36 = 0.1188
   - _Explicación:_ i(x) = a + b·x².

---

## 🧾 Módulo 3 · Políticas de crédito (Sartoris-Hill)

- **Parcial:** Primer parcial
- **Contenido:** VP con costo de capital diario, incobrables y descuentos.
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Opción múltiple]** En el modelo con descuento/plazo neto/cobro, las proporciones PDR, PN y PRC deben cumplir:

   - **PDR + PN + PRC = 1 (y cada una entre 0 y 1) ✅**
   - PDR + PN + PRC = DSO
   - Pueden sumar más de 1
   - Deben ser negativas

   - **Respuesta:** PDR + PN + PRC = 1 (y cada una entre 0 y 1)
   - _Explicación:_ Son proporciones de clientes por forma de pago: suman 1 y están en [0,1].

**2. [Cálculo numérico]** Modelo de Sartoris-Hill: VP = PQ/(1+k)^DSO − cQ. Con P=10, Q=1000, c=8, k=CPPC/365=0.000274 (CPPC=0.1) y DSO=30 días, calcula VP.

   - **Respuesta:** 1918.16
   - _Procedimiento:_ (1+k)^DSO = (1+0.000274)^30 = 1.00825 → PQ/(1+k)^DSO = 10000/1.00825 = 9918.16 → VP = 9918.16 − 8000 = 1918.16
   - _Explicación:_ Se descuenta el ingreso PQ al costo diario durante DSO días y se resta el costo variable cQ.

**3. [Cálculo numérico]** Con cuentas incobrables: VP = PQ(1−b)/(1+k)^DSO − cQ. Con P=12, Q=1000, c=10, k=0.000411, DSO=75 y b=0.02, calcula VP.

   - **Respuesta:** 1403.14
   - _Procedimiento:_ PQ(1−b) = 12000·(1−0.02) = 11760 → VP = 11760/1.0313 − 10000 = 1403.14
   - _Explicación:_ La fracción incobrable b reduce el ingreso cobrable a PQ(1−b).

**4. [Cálculo numérico]** El costo de capital anual es CPPC=0.15. Calcula el costo de capital diario k = CPPC/365.

   - **Respuesta:** 0.000411
   - _Procedimiento:_ k = 0.15/365 = 0.000411
   - _Explicación:_ k_diario = CPPC / 365.

**5. [Verdadero/Falso]** En Sartoris-Hill el ingreso PQ se descuenta durante el periodo promedio de cobro (DSO).

   - **Respuesta:** Verdadero
   - _Explicación:_ El cobro llega en promedio a los DSO días, por eso se descuenta ese plazo.

**6. [Completar]** Si el costo de capital es anual, el diario es k = CPPC / ____ .

   - **Respuesta:** 365

---

## 🚨 Módulo 4 · Gallinger y riesgo de insolvencia

- **Parcial:** Primer parcial
- **Contenido:** pₙ de Gallinger y λ=(L₀+μT)/(σ√T), P=1−Φ(λ).
- **Tipo de práctica:** Ejercicios ilimitados

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Cálculo numérico]** Índice de liquidez: λ = (L₀ + μT)/(σ√T). Con L₀=6000, μT=-800, σ=1200 y T=6, calcula λ.

   - **Respuesta:** 1.7691
   - _Procedimiento:_ L₀ + μT = 6000 + (-800) = 5200 → σ√T = 1200·√6 = 2939.3877 → λ = 5200 / 2939.3877 = 1.7691
   - _Explicación:_ λ estandariza la reserva más el flujo neto esperado acumulado.

**2. [Cálculo numérico]** La probabilidad de insolvencia es P = 1 − Φ(λ) (cola derecha de la normal). Con λ=1.5, calcula P.

   - **Respuesta:** 0.0668
   - _Procedimiento:_ Φ(1.5) = 0.9332 → P = 1 − 0.9332 = 0.0668
   - _Explicación:_ Se consulta Φ(λ) en la normal estándar y se toma 1−Φ(λ).

**3. [Verdadero/Falso]** Una λ más grande (mayor reserva relativa) implica menor probabilidad de insolvencia.

   - **Respuesta:** Verdadero
   - _Explicación:_ P=1−Φ(λ) decrece cuando λ crece.

**4. [Ordenar pasos]** Ordena el cálculo del riesgo de insolvencia:

   - **Respuesta:** 1) Registrar los flujos netos de caja  2) Calcular la media μ y la desviación σ  3) Establecer T e identificar L₀  4) Calcular λ = (L₀+μT)/(σ√T)  5) Consultar la normal estándar Φ(λ)  6) Obtener P = 1−Φ(λ) e interpretar el riesgo

**5. [Cálculo numérico]** Modelo de Gallinger: pₙ = (c/S)(n−1) + V(1+k)ⁿ. Con S=20000, c=300, V=0.03, k=0.01 y n=6 meses, calcula pₙ.

   - **Respuesta:** 0.10685
   - _Procedimiento:_ (c/S)(n−1) = (300/20000)·5 = 0.075 → V(1+k)ⁿ = 0.03·(1+0.01)^6 = 0.03185 → pₙ = 0.075 + 0.03185 = 0.10685
   - _Explicación:_ Se aplica la fórmula del cuaderno directamente (S: ventas mensuales, c: costo de cobranza, V: proporción incobrable, k: costo de capital por periodo).

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

**1. [Cálculo numérico]** Lote económico: Q* = √(2·D·C_o / C_m). Con demanda D=5000, costo de ordenar C_o=4.5 y costo de mantener C_m=20, calcula Q*.

   - **Respuesta:** 47.4342
   - _Procedimiento:_ 2·D·C_o = 2·5000·4.5 = 45000 → Q* = √(45000/20) = 47.4342
   - _Explicación:_ Q* minimiza CT(Q)=(Q/2)C_m+(D/Q)C_o.

**2. [Cálculo numérico]** Con D=5000, C_o=95, C_m=10 y Q*=308.2207, calcula el costo de ordenar ((D/Q)·C_o).

   - **Respuesta:** 1541.1035
   - _Procedimiento:_ (D/Q)·C_o = (5000/308.2207)·95 = 1541.1035
   - _Explicación:_ En el óptimo el costo de mantener ≈ el costo de ordenar.

**3. [Cálculo numérico]** Punto de reorden: PR = ΔT_e·C_d + I_s, con consumo diario C_d = D/días. Con D=73000, días=365, ΔT_e=3, I_s=100, calcula PR.

   - **Respuesta:** 700
   - _Procedimiento:_ C_d = 73000/365 = 200 → PR = 3·200 + 100 = 700
   - _Explicación:_ Primero el consumo diario C_d=D/días; luego PR=ΔT_e·C_d+I_s.

**4. [Completar]** El inventario promedio es Q/____ .

   - **Respuesta:** 2

**5. [Verdadero/Falso]** En el lote óptimo, el costo de mantener es aproximadamente igual al costo de ordenar.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es una propiedad del EOQ: ambos costos se igualan en Q*.

**6. [Ordenar pasos]** Ordena la derivación del lote económico:

   - **Respuesta:** 1) Escribir CT(Q)=(Q/2)C_m+(D/Q)C_o  2) Derivar dCT/dQ = C_m/2 − DC_o/Q²  3) Igualar a cero: C_m/2 = DC_o/Q²  4) Despejar Q* = √(2DC_o/C_m)

**7. [Cálculo numérico]** Con D=10000, C_o=95, C_m=42 y Q*=212.6925, calcula el costo de mantener ((Q/2)·C_m).

   - **Respuesta:** 4466.5423
   - _Procedimiento:_ (Q/2)·C_m = (212.6925/2)·42 = 4466.5423
   - _Explicación:_ En el óptimo el costo de mantener ≈ el costo de ordenar.

---

## 🏷️ Módulo 6 · Descuentos por volumen

- **Parcial:** Segundo parcial
- **Contenido:** C_m=rP, Q* por rango y comparación de costo total.
- **Tipo de práctica:** Ejercicios + caso

### 📝 Preguntas y respuestas (5 plantillas)

**1. [Cálculo numérico]** Costo total del inventario: CTI = P·D + (D/Q)C_o + (Q/2)C_m. Con P=10, D=5000, Q=566, C_o=80 y C_m=r·P=2.5, calcula CTI.

   - **Respuesta:** 51414.21
   - _Procedimiento:_ P·D = 10·5000 = 50000 → (D/Q)C_o = (5000/566)·80 = 706.71 → (Q/2)C_m = (566/2)·2.5 = 707.5 → CTI = 50000 + 706.71 + 707.5 = 51414.21
   - _Explicación:_ Incluye el costo de compra P·D, el de ordenar y el de mantener.

**2. [Cálculo numérico]** Cuando el costo de mantener es un % del precio (C_m=r·P), el lote es Q* = √(2·D·C_o/(r·P)). Con D=5000, C_o=50, r=0.25 y P=50, calcula Q*.

   - **Respuesta:** 200
   - _Procedimiento:_ C_m = r·P = 0.25·50 = 12.5 → Q* = √(2·5000·50/12.5) = 200
   - _Explicación:_ Se sustituye C_m=r·P en la fórmula del EOQ.

**3. [Ordenar pasos]** Ordena la decisión con descuentos por volumen:

   - **Respuesta:** 1) Calcular Q* para cada precio  2) Verificar si Q* pertenece a su rango  3) Si no pertenece, usar el mínimo factible del rango  4) Calcular el CTI (incluyendo el costo de compra P·D)  5) Comparar candidatos y elegir el de menor costo total

**4. [Opción múltiple]** Al comparar alternativas con descuento por volumen, se elige:

   - **La de menor costo total (incluyendo el precio de compra) ✅**
   - Siempre el Q* más pequeño
   - El precio más bajo sin importar el lote
   - El lote más grande posible

   - **Respuesta:** La de menor costo total (incluyendo el precio de compra)
   - _Explicación:_ No se elige por Q* solo: hay que comparar el CTI completo, que incluye P·D.

**5. [Verdadero/Falso]** Si el Q* calculado no cae en su rango de precio, se usa el punto mínimo factible de ese rango.

   - **Respuesta:** Verdadero
   - _Explicación:_ Se ajusta Q al límite factible del rango antes de comparar costos.

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

**1. [Cálculo numérico]** La beta se obtiene con β = Cov(R_i,R_m) / Var(R_m). Con Cov=0.009 y Var(R_m)=0.004, calcula β.

   - **Respuesta:** 2.25
   - _Procedimiento:_ β = 0.009/0.004 = 2.25
   - _Explicación:_ β mide la sensibilidad del activo respecto al mercado.

**2. [Cálculo numérico]** Flujo libre de efectivo: FLE = UO(1−T) + Dep − CAPEX − ΔCWT. Con UO=500, T=0.35, Dep=200, CAPEX=300 y ΔCWT=100, calcula FLE.

   - **Respuesta:** 125
   - _Procedimiento:_ UO(1−T) = 500·(1−0.35) = 325 → FLE = 325 + 200 − 300 − (100) = 125
   - _Explicación:_ La depreciación se suma (no es salida de efectivo); CAPEX y el aumento de capital de trabajo se restan.

**3. [Cálculo numérico]** WACC = (D/A_T)·R_d(1−T) + (C/A_T)·R_e. Con D=1000, C=4000 (A_T=D+C=5000), R_d=0.12, R_e=0.18 y T=0.35, calcula el WACC.

   - **Respuesta:** 0.1596
   - _Procedimiento:_ (D/A_T)·R_d(1−T) = (1000/5000)·0.12·(1−0.35) = 0.0156 → (C/A_T)·R_e = (4000/5000)·0.18 = 0.144 → WACC = 0.0156 + 0.144 = 0.1596
   - _Explicación:_ Promedio ponderado del costo de la deuda (después de impuestos) y del capital propio.

**4. [Cálculo numérico]** Flujo libre de efectivo: FLE = UO(1−T) + Dep − CAPEX − ΔCWT. Con UO=1500, T=0.35, Dep=200, CAPEX=150 y ΔCWT=-50, calcula FLE.

   - **Respuesta:** 1075
   - _Procedimiento:_ UO(1−T) = 1500·(1−0.35) = 975 → FLE = 975 + 200 − 150 − (-50) = 1075
   - _Explicación:_ La depreciación se suma (no es salida de efectivo); CAPEX y el aumento de capital de trabajo se restan.

**5. [Cálculo numérico]** Crecimiento sostenible: g = ROE · TR, con tasa de retención TR = 1 − d. Con ROE=0.15 y tasa de pago de dividendos d=0.3, calcula g.

   - **Respuesta:** 0.105
   - _Procedimiento:_ TR = 1 − d = 1 − 0.3 = 0.7 → g = 0.15·0.7 = 0.105
   - _Explicación:_ TR es lo que la empresa reinvierte; g = ROE × TR.

**6. [Opción múltiple]** La descomposición DuPont del ROE es:

   - **margen neto × rotación de activos × multiplicador del capital ✅**
   - margen × precio × cantidad
   - deuda × capital × impuestos
   - ventas − costos

   - **Respuesta:** margen neto × rotación de activos × multiplicador del capital
   - _Explicación:_ ROE = (UN/Ventas)(Ventas/Activos)(Activos/Capital).

**7. [Cálculo numérico]** CAPM: R_e = R_f + β(R_m − R_f). Con R_f=0.05, β=1.5 y R_m=0.12, calcula el costo del capital propio R_e.

   - **Respuesta:** 0.155
   - _Procedimiento:_ R_m − R_f = 0.12−0.05 = 0.07 → R_e = 0.05 + 1.5·0.07 = 0.155
   - _Explicación:_ R_e = tasa libre de riesgo + beta × prima de riesgo del mercado.

**8. [Verdadero/Falso]** La depreciación se suma al calcular el FLE porque no representa una salida de efectivo.

   - **Respuesta:** Verdadero
   - _Explicación:_ Es un gasto contable no monetario, por eso se reintegra.

---

## 🏢 Módulo 8 · Valuación de empresas

- **Parcial:** Segundo parcial
- **Contenido:** Gordon en una etapa y modelo de dos etapas con valor terminal.
- **Tipo de práctica:** Ejercicios + caso

### 📝 Preguntas y respuestas (6 plantillas)

**1. [Cálculo numérico]** Valuación en una etapa (Gordon): V_F = FLE₁/(WACC − g), con FLE₁=FLE₀(1+g). Con FLE₀=800, g=0.02 y WACC=0.12 (WACC>g), calcula V_F.

   - **Respuesta:** 8160
   - _Procedimiento:_ FLE₁ = FLE₀(1+g) = 800·(1+0.02) = 816 → V_F = 816/(0.12−0.02) = 816/0.1 = 8160
   - _Explicación:_ Requiere WACC>g. Primero se proyecta FLE₁, luego se capitaliza a (WACC−g).

**2. [Cálculo numérico]** Valor terminal (segunda etapa): VT_n = FLE_n(1+g₂)/(WACC − g₂). Con FLE_n=1500, g₂=0.03 y WACC=0.09, calcula VT_n.

   - **Respuesta:** 25750
   - _Procedimiento:_ FLE_n(1+g₂) = 1500·(1+0.03) = 1545 → VT_n = 1545/(0.09−0.03) = 25750
   - _Explicación:_ Es una perpetuidad creciente al final de la primera etapa.

**3. [Opción múltiple]** Si la empresa no paga dividendos, entonces:

   - **d = 0 y TR = 1 ✅**
   - d = 1 y TR = 0
   - g = WACC
   - no se puede valuar

   - **Respuesta:** d = 0 y TR = 1
   - _Explicación:_ Sin dividendos, la tasa de pago d=0 y la retención TR=1.

**4. [Opción múltiple]** Si al valuar resulta WACC ≤ g, se debe:

   - **No calcular un valor convencional y revisar los supuestos ✅**
   - Usar el valor negativo tal cual
   - Cambiar g por WACC
   - Ignorar la advertencia

   - **Respuesta:** No calcular un valor convencional y revisar los supuestos
   - _Explicación:_ La fórmula de Gordon exige WACC>g; si no, el resultado no tiene sentido y hay que revisar supuestos.

**5. [Verdadero/Falso]** No hay que confundir FLE₀ con FLE₁: FLE₁ = FLE₀(1+g).

   - **Respuesta:** Verdadero
   - _Explicación:_ El numerador de Gordon usa el flujo del siguiente periodo, FLE₁.

**6. [Ordenar pasos]** Ordena la valuación en dos etapas:

   - **Respuesta:** 1) Calcular el FLE base y el crecimiento g₁  2) Proyectar y descontar cada FLE de la primera etapa  3) Calcular FLE del año n  4) Calcular el valor terminal VT_n = FLE_n(1+g₂)/(WACC−g₂)  5) Descontar el valor terminal  6) Sumar todos los valores presentes

---

