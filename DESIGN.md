# DESIGN & FUNCTIONAL SPECIFICATION: Café del Centro — Web Prototype

## 1. Project Overview & Technical Context
- **Project Name:** Café del Centro — Sistema Digital de Reservas, Aforo y Pedidos Externos (Grupo 4)
- **Consulting Firm:** Linuxeros Digital Consulting (LDC)
- **Design System:** Material Design 3 (MD3)
- **Target Build & Deployment:** Single-Page Application (SPA) funcional generada con **Antigravity** y alojada en **GitHub Pages** (HTML/CSS/JS o React estático con rutas relativas y estado compartido en `localStorage` para sincronización instantánea entre vistas sin requerir backend externo).
- **Business Type:** Specialty Coffee Shop (Posición #59 en el Top 100 de Latinoamérica y el Caribe).
- **Location Context:** Centro Histórico de San Salvador (Esquina opuesta al Parque Libertad).
- **Core Problems Solved by the Prototype:**
  1. **Physical Space Saturation (Épica 1 — Reservas y Aforo):** Local de espacio reducido donde la demanda supera la capacidad y los métodos filtrados en mesa requieren mayor tiempo de atención por parte del barista.
  2. **Manual External Orders (Épica 2 — Pedidos Externos Pick-up y B2B):** Eliminación del flujo informal por WhatsApp y correo electrónico mediante un catálogo con trazabilidad, carrito Pick-up/B2B, barra de progreso en vivo y cola operativa de barra.
- **Target Roles (Multi-View Prototype):**
  1. **Cliente** (Comensal local, turista y comprador corporativo/marca aliada B2B)
  2. **Mesero / Barista de Especialidad** (Operador de salón y barra en tablet)
  3. **Administradora** (Gestión de despachos B2B, ventanas logísticas y bloqueos de aforo)

---

## 2. Color System & Material Design 3 Tokens (RNF-02)
The UI must strictly apply these HEX values mapped to Material Design 3 roles:

### Core Brand Tokens
- **`--md-sys-color-primary`: `#013542`**
  - *Usage:* Top App Bar, Navigation Bar active indicators, Floating Action Buttons (FAB), Primary Filled Buttons ("Confirmar Reserva", "Confirmar Pedido"), and primary branding headers.
  - *Context:* Matches the deep blue architectural facade and main signage of the physical shop in the Centro Histórico.
- **`--md-sys-color-tertiary`: `#7D2D04`**
  - *Usage:* Accents, "Top #59 Latam" badges, interactive secondary actions ("Agregar al Carrito", "Solicitar Método en Mesa"), and business rule alert banners (`RN-01` to `RN-04`).
  - *Context:* Represents the warm, roasted tones of specialty coffee beans and baked pastries.
- **`--md-sys-color-surface-container`: `#A9BFC0`**
  - *Usage:* Backgrounds for MD3 Elevated Cards (Menu items, Table status cards, Order queue cards), modal bottom sheets, and secondary containers.
- **`--md-sys-color-on-surface`: `#192C3D`**
  - *Usage:* Primary typography, data labels, icons on standard backgrounds, and outlines for high contrast.
- **`--md-sys-color-background`: `#F4F7F7`**
  - *Usage:* Main page background surface to ensure clean contrast with `#A9BFC0` cards.

### Semantic & Table Status Tokens (Required for RF-01, HU-01 & RN-01)
Every status indicator in the UI must display both color and an explicit text label (never color alone, per `HU-01`):
- **Status — Disponible / Listo para Empacar:** `#2E6F40` (Forest Green badge/border + texto explícito)
- **Status — Reservada / En Preparación:** `#D97706` (Warm Amber badge/border + texto explícito)
- **Status — Ocupada / Alerta de Regla de Negocio:** `#7D2D04` (Roasted Red/Brown) or `#B3261E` (MD3 Error)
- **Status — Exclusivo Walk-in (20%) / No Disponible (Agotado):** `#64748B` (Slate Grey disabled state)

---

## 3. Typography Guidelines (RNF-02)
- **Headings (Display / Headline):** Use a modern, elegant Serif font (*Playfair Display* or *Lora* via Google Fonts) to match the physical sign *"Café del Centro"*.
- **Body & UI Controls (Title / Body / Label):** Use a clean Sans-Serif font (*Inter* or *Roboto*) for menus, reservation forms, status chips, and traceability metadata. Matches the sub-branding *"Specialty Coffee | Est 2023"*.

---

## 4. Global Navigation & Real-Time State Synchronization (RNF-01, RNF-03)
To support live usability testing and the 10-minute executive defense on GitHub Pages, the application must feature a persistent **Global Top App Bar (`#013542`)** containing:
1. **Brand Title:** *"Café del Centro | Specialty Coffee"* (Serif).
2. **Live Sync Indicator (`RNF-03`):** Badge showing *"Sincronización en tiempo real activa (menos de 3 s)"*. Any state change in Customer View (new reservation or order) must immediately update Staff/Admin View and vice versa.
3. **Role Switcher Segmented Control:**
   - `Vista Cliente (Móvil: 390px container o responsivo)`
   - `Vista Mesero / Barista (Tablet Barra: 1024px)`
   - `Vista Administradora (Panel Ejecutivo)`
4. **Demo Reset Action:** A subtle button *"Restaurar Datos Demo"* to reset initial mock data before each usability test.

---

## 5. Screen Architecture & User Stories Traceability (P-01 to P-08)

### BLOCK A: VISTA CLIENTE (Mobile-First — Max 4 Steps per Flow per RNF-01)

#### Screen P-01: Home, Cultura Cafetalera y Catálogo con Trazabilidad (`PDW-7` / `HU-09` | `RF-04`)
- **Hero Section:** High-resolution specialty coffee imagery (iced lattes in branded cups / latte art in matte black mugs on terrazzo tables) + Prominent Badge: *"Posición #59 en el Top 100 Mejores Cafeterías de Latinoamérica y el Caribe"*.
- **Primary Navigation Tabs:** `Catálogo Pick-up y B2B` | `Reservar Mesa` | `Seguimiento de Pedido`.
- **Category Filter Chips (`HU-09`):** `Todos` | `Bebidas de Barra` | `Pastelería` | `Café en Grano (Libras)`.
- **Elevated Product Cards (`#A9BFC0` surface, `#192C3D` text):**
  - **Mandatory Traceability Metadata (`RF-04`, `HU-09`):** Each specialty coffee card must display tags for **Finca**, **Caficultor**, **Proceso**, **Variedad**, and **Tostador**.
  - **Out-of-Stock Acceptance Criterion (`HU-09`):** Items out of stock (e.g., *Bolsa Geisha Reserva Especial*) must display a badge *"No disponible"* and have their *"Agregar al carrito"* button disabled.
- **Educational Section:**
  - Title: *"¿QUÉ ES UN CAFÉ DE ESPECIALIDAD?"*
  - Body: *"Celebramos la herencia cafetalera del Centro Histórico de San Salvador frente al Parque Libertad. Trabajamos con granos de puntuación superior, provenientes de fincas específicas y variedades cultivadas en nuestras cordilleras. Cuando nos visitas, conoces el nombre del caficultor, del tostador y del barista detrás de tu taza."*

#### Screen P-02: Mapa de Disponibilidad y Reserva de Mesa (`PDW-6` / `HU-01`, `PDW-3` / `HU-02`, `PDW-13` / `HU-03`)
- **Step 1 — Date, Time Block & Guest Counter (`HU-02`):**
  - Date picker (default: *Hoy*), Guest counter (`1` to `6` personas), and Time Block chips:
    - `3:00 PM - 4:00 PM` (Disponible)
    - `4:00 PM - 5:00 PM` (Aforo digital al 80% — Clicking this triggers **Modal P-02.1**)
    - `5:15 PM - 6:30 PM` (Disponible)
- **Step 2 — Interactive 8-Table Salon Map (`HU-01`, `HU-02`):**
  - Grid of 8 tables (`Mesa 1` to `Mesa 8`).
  - Displays **color + explicit text status + guest capacity**.
  - **Capacity Filter (`HU-02`):** Only tables with capacity greater than or equal to the selected number of guests can be selected.
  - **Walk-in Quota (`RN-01`, `HU-04`):** `Mesa 7` and `Mesa 8` are permanently labeled *"Exclusivo Walk-in (20% presencial)"* and cannot be selected online.
- **Step 3 — Experience Mode Selector (`PDW-13` / `HU-03` | `RN-03`):**
  - Option A: `Consumo Estándar` -> Displays duration pill: *"Duración asignada: 45 minutos"*.
  - Option B: `Experiencia de Barismo (Métodos en Mesa)` -> Displays duration pill: *"Duración asignada: 75 minutos"* and auto-assigns an available barista from the shift (*"Barista asignado: Alejandro Sura"*). If a slot has no barista available, the UI informs the client and suggests the next available slot (`HU-03`).
- **Step 4 — Confirmation Action:** Customer name input and primary button `"Confirmar Reserva"` (`#013542`), completing the flow in maximum 4 steps (`RNF-01`).

#### Modal P-02.1: Alerta de Límite de Aforo Digital 80/20 (`PDW-11` / `HU-04` | `RN-01`)
- **Trigger:** Selecting a time block that has reached 80% digital reservation capacity (e.g., `4:00 PM - 5:00 PM`) or a block closed by Admin.
- **Behavior (`HU-04`):** Blocks reservation confirmation in that slot, explains that 20% of tables are reserved for walk-in visitors in the Centro Histórico, and provides a 1-click button in `#7D2D04`: *"Seleccionar siguiente horario disponible: 5:15 PM - 6:30 PM"*.

#### Screen P-03: Confirmación de Reserva Exitosa (`PDW-3` / `HU-02` | `RN-02`)
- **Summary Card:** Displays generated reservation code (e.g., `#RES-104`), date, time block, number of guests, selected table, experience modality, duration (45 or 75 min), and assigned barista.
- **Grace Period Notice (`RN-02`):** Prominent notice stating: *"Regla de Tolerancia (RN-02): Tu mesa cuenta con un período de gracia máximo de 15 minutos después de la hora programada. Pasado ese tiempo sin registrar Check-in en barra, la mesa se liberará automáticamente a estado Disponible."*

#### Screen P-04 & Alert P-04.1: Carrito y Checkout Pick-up / Mayorista B2B (`PDW-5` / `HU-10`, `PDW-9` / `HU-11` | `RF-05`, `RN-04`)
- **Modality Selector Tabs:**
  1. **Pasar a Traer — Pick-up (`PDW-5` / `HU-10`):** Allows adding coffee beans by weight (lbs) or drinks for same-day pickup in maximum 4 steps. If a required field is missing, inline validation highlights the field without clearing already entered data (`HU-10`).
  2. **Pedido Mayorista — Marca Aliada B2B (`PDW-9` / `HU-11`):** For bulk coffee bean orders (5 lbs or more) with external distribution or scheduled collection.
- **Business Rule Validation Alert P-04.1 (`RN-04`, `HU-11`):**
  - For orders of 5 lbs or more, the system enforces a minimum 24-hour advance notice and restricts delivery/collection to authorized logistics windows configured by the Administrator (pre-opening or post-closing).
  - If the user selects same-day delivery or a regular operating hour, an alert banner in `#7D2D04` displays the rule and offers a 1-click button to select the first valid window (e.g., *"Mañana, 07:00 AM - 08:30 AM — Pre-apertura"*).

#### Screen P-05: Seguimiento de Estado de Pedido en Vivo (`PDW-10` / `HU-12` | `RF-06`, `RNF-03`)
- **Live 4-Step Progress Stepper (`HU-12`):**
  1. `Orden Recibida`
  2. `En Preparación / Tostado`
  3. `Listo para Empacar / Entrega`
  4. `Entregado / En Ruta`
- **Real-Time Notification (`HU-12`, `RNF-03`):** Updates in under 3 seconds when the Barista advances the order in `P-07`. When reaching step 3 (`Listo para Empacar / Entrega`), displays an active notification banner alerting the customer that they can pick up their order at the bar.

---

### BLOCK B: VISTA BARISTA Y ADMINISTRADORA (Tablet / Desktop)

#### Screen P-06: Tablet de Barra — Mapa de Salón y Check-in (`PDW-12` / `HU-05`, `PDW-15` / `HU-06`, `PDW-14` / `HU-07`)
- **Time Block Filter (`HU-05`):** Filter salon view by time block (`Todos`, `3:00 PM`, `4:00 PM`, `5:15 PM`).
- **Interactive 8-Table Salon Grid (`HU-05`, `HU-06`):**
  - Displays each table's current state (`Disponible`, `Reservada`, `Ocupada`), reservation arrival time, customer name, and a special badge if it is an `Experiencia de Barismo (75 min)`.
  - **Check-in Action (`HU-06`):** Clicking *"Registrar Check-in"* changes the table state to `Ocupada`, logs the real arrival timestamp, and updates the customer map in under 3 seconds. Staff can also manually toggle table states (`Disponible`, `Reservada`, `Ocupada`).
- **Automatic 15-Minute No-Show Release (`PDW-14` / `HU-07` | `RN-02`):**
  - Displays a pre-expiration warning badge on delayed tables at 10 minutes (e.g., *"Aviso RN-02: 12 min de retraso sin Check-in — Se liberará en 3 min"*).
  - Includes an interactive simulation button *"Simular 15 min sin Check-in (RN-02)"*: when triggered, the table automatically reverts to `Disponible` (`#2E6F40`) and logs the reservation as *"No presentó"* in the salon history panel.

#### Screen P-07: Tablet de Barra — Cola de Pedidos Externos (`PDW-8` / `HU-13` | `RF-05`, `RF-06`)
- **Urgency-Sorted Order Queue (`HU-13`):** Displays incoming Pick-up and B2B orders sorted by delivery/pickup time.
- **Order Card Metadata:** Order ID (`#ORD-209`), customer/brand name, product, weight in lbs, modality (`Pasar a traer` or `Distribución B2B`), and scheduled time.
- **One-Tap State Advancement (`HU-13`):** A single tap advances the order state (`Orden Recibida` -> `En Preparación/Tostado` -> `Listo para Empacar/Entrega` -> `Entregado/En Ruta`). Orders in step 3 are visually highlighted with a prominent *"Listo para empacar"* badge.

#### Screen P-08: Panel de Administradora — Logística B2B, Ventanas y Bloqueos (`PDW-18` / `HU-08`, `PDW-16` / `HU-14`, `PDW-17` / `HU-15`)
1. **Module A — Aprobación y Despacho de Pedidos Externos B2B (`PDW-16` / `HU-14`):**
   - Table of pending B2B wholesale orders showing weight in lbs, client brand, delivery address, and requested date/window.
   - Actions to *"Aprobar Despacho"* or *"Rechazar Pedido"*. Rejecting requires entering a rejection reason and triggers a notification to the client (`HU-14`).
2. **Module B — Configuración de Ventanas Logísticas de Entrega (`PDW-17` / `HU-15` | `RN-04`):**
   - Controls by day of the week to define authorized B2B delivery/collection windows outside public operating hours (e.g., `Pre-apertura: 07:00 AM - 08:30 AM`, `Post-cierre: 07:30 PM - 09:00 PM`).
   - B2B clients in `P-04` can only select from active windows configured here. Changes apply exclusively to new orders without altering already approved orders (`HU-15`).
3. **Module C — Bloqueo de Horarios y Mesas por Eventos o Patrocinios (`PDW-18` / `HU-08`):**
   - Form to select Date, Time Block, Scope (specific tables or entire venue), and Reason (e.g., *"Patrocinio Torneo Nacional de Tenis / Cata Privada"*).
   - **Conflict Validation (`HU-08`):** If active reservations already exist in the selected block, the system lists the affected reservations and asks the Administrator for explicit confirmation before applying the block. Blocked slots appear as unavailable in the Customer View (`P-02`).

---

## 6. Initial Mock Data (Catalog, Traceability & Tables)

### A. Café en Grano por Libras (Con Trazabilidad Completa — RF-04, HU-09)
- **Bolsa Café Pacamara (1 lb / 5 lb B2B)** — `$14.00 / lb`
  - *Finca:* Las Brumas | *Caficultor:* Don Carlos | *Proceso:* Honey | *Variedad:* Pacamara | *Tostador:* Café del Centro | *Estado:* `Disponible`
- **Bolsa Café Bourbon Salvadoreño (1 lb / 5 lb B2B)** — `$12.50 / lb`
  - *Finca:* El Manzano, Santa Ana | *Caficultor:* Familia Pacas | *Proceso:* Lavado | *Variedad:* Bourbon | *Tostador:* Café del Centro | *Estado:* `Disponible`
- **Bolsa Geisha Reserva Especial (1 lb)** — `$22.00 / lb`
  - *Finca:* Montecarlos | *Caficultor:* Carlos Batres | *Proceso:* Natural | *Variedad:* Geisha | *Tostador:* Café del Centro | *Estado:* `No disponible` (Agotado — Botón deshabilitado según `HU-09`)

### B. Experiencia en Mesa (Métodos Filtrados — RN-03, HU-03)
- **Método V60 / Chemex en Mesa (Experiencia Educativa)** — `$5.50`
  - *Detalle:* Incluye demostración de granos en mesa y explicación de finca, productor y tostador por el barista (Bloquea mesa por 75 minutos).

### C. Bebidas de Barra y Pastelería (Menú de Ventana)
- **Espresso** — *Finca El Manzano | Tueste Medio* (`$2.50`)
- **Americano** — *Cordillera de Apaneca | Notas a chocolate oscuro y panela* (`$2.75`)
- **Capuccino** — *Servido en taza negra mate artesanal con arte latte* (`$3.50`)
- **Latte** — *Leche texturizada + Espresso doble de especialidad* (`$3.75`)
- **Iced Latte** — *Vaso transparente con envoltura impresa de la casa* (`$4.00`)
- **Frappe** — *Especialidad fría de la casa* (`$4.50`)
- **Croissant Sandwich Artesanal** — *Servido en papel encerado con branding de Café del Centro* (`$4.75`)
- **Postre de la Casa** — *Maridaje ideal para cafés de filtro* (`$3.50`)