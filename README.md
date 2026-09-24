# AeroOps — Flight Tracking & Operations Dashboard

A modern, mission-critical aviation operations dashboard engineered with **Angular 21**, **PrimeNG 22**, **RxJS 7.8**, and **Leaflet 1.9.4**. AeroOps delivers real-time fleet situational awareness, interactive geodesic flight paths, live telemetry monitoring, and reactive multi-criteria filtering.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Setup & Installation Instructions](#-setup--installation-instructions)
- [Available Scripts](#-available-scripts)
- [Application Architecture & State Management](#-application-architecture--state-management)
- [Project Directory Structure](#-project-directory-structure)
- [Routing & Deep Linking](#-routing--deep-linking)
- [Testing & Quality Assurance](#-testing--quality-assurance)

---

## ✈️ Key Features

1. **Interactive Global Leaflet Radar Map**:
   - Visualizes commercial flights plotted across real-world airport hubs (JFK, LHR, CDG, FRA, DXB, SIN, HND, LAX, SFO, SYD).
   - Custom SVG aircraft markers dynamically rotated to aircraft headings.
   - Dual-layer glowing trajectory polyline upon flight selection with smooth `fitBounds` camera animation.
   - Interactive popups displaying flight callsign, altitude, speed, and status.

2. **Reactive State Store & Multi-Criteria Filtering**:
   - Centralized, single-source-of-truth service store (`FlightStateService`) leveraging RxJS `BehaviorSubject` and `combineLatest`.
   - Real-time reactive filters: text search (Callsign / Flight Number), status filter, origin airport, and destination airport.
   - Atomic state propagation across the map, fleet list, and KPI statistics without manual synchronization.

3. **Operations KPI Bar**:
   - Live metrics summary: **Total Flights**, **Active / Airborne**, **Delayed**, **Arrived / Landed**, and **Scheduled**.
   - Interactive quick-filtering: clicking any KPI card instantly filters the fleet view to flights matching that operational status.

4. **Telemetry & Flight Detail Inspection**:
   - Side panel displays aircraft type, registration, scheduled vs. estimated departure/arrival, terminal, and gate.
   - Live gauges and metrics for Altitude (ft), Vertical Speed (fpm), Ground Speed (kts & km/h), Heading (°), and Route Progress (%).
   - Simulation playback controls: Play, Pause, and speed multipliers (1x, 2x, 5x).
   - Clean empty state with an animated radar sweep when no flight is selected.

5. **Aviation Aesthetic & Adaptive Theming**:
   - Dark navy/slate operations control room theme powered by `@primeuix/themes` (`Aura` preset).
   - Instant Light/Dark mode toggle with theme persistence.
   - Responsive layout: desktop uses an adjustable `p-splitter`; tablet/mobile viewports (<1024px) collapse the fleet into an off-canvas drawer (`p-drawer`).

---

## 🛠️ Tech Stack

- **Framework**: Angular 21 (Standalone Components, Signals, Strict Mode)
- **UI & Theming**: PrimeNG 22, `@primeuix/themes`, PrimeFlex
- **Map Visualization**: Leaflet 1.9.4 (`@types/leaflet`)
- **Reactive Programming**: RxJS 7.8 (BehaviorSubject, combineLatest, distinctUntilChanged, shareReplay)
- **Icons**: FontAwesome SVG Core (`@fortawesome/angular-fontawesome`)
- **Testing Engine**: Vitest 4 with Angular build integration
- **Styling**: SCSS + CSS Custom Properties

---

## ⚙️ Prerequisites

Before getting started, ensure you have the following installed on your machine:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher (packaged with Node.js)
- **Git**

Verify your environment by running:
```bash
node -v
npm -v
```

---

## 🚀 Setup & Installation Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/sreenivasanrk/flight-tracking-operations-dashboard.git
cd flight-tracking-operations-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

> **Note for Windows Users**:
> If PowerShell restricts `.ps1` execution scripts (`UnauthorizedAccess` / `PSSecurityException`), you can either:
> 1. Run commands using `npm.cmd`:
>    ```powershell
>    npm.cmd start
>    ```
> 2. Or adjust the execution policy for your current user:
>    ```powershell
>    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
>    ```

### 3. Start the Development Server
```bash
npm start
# or
npx ng serve
```
Navigate to **`http://localhost:4200/`** in your browser. The application will automatically reload if you modify any source files.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Launches the local dev server at `http://localhost:4200/` |
| `npm test` | Runs the full Vitest unit test suite (39 tests) |
| `npm run test -- --no-watch` | Runs all unit tests once without watch mode (CI mode) |
| `npm run build` | Compiles and builds production-ready artifacts in `dist/` |
| `npm run watch` | Builds the app in development mode with active file watching |

---

## 🏗️ Application Architecture & State Management

AeroOps implements a **Single Source of Truth (SSOT)** reactive architecture via an RxJS Service Store (`FlightStateService`), intentionally choosing this over heavier alternatives like NgRx:

- **Minimal Boilerplate**: Eliminates hundreds of lines of actions, reducers, and effects while maintaining 100% unidirectional and deterministic data flow.
- **Atomic Derivations**: Fleet lists and KPIs are derived reactively via `combineLatest([flights$, filters$])`. Any filter change or telemetry tick flows immediately into both the Leaflet map and list components.
- **Angular Signals Synergy**: Local component state (e.g., active drawer, theme mode, UTC clock) leverages Angular Signals for lightning-fast change detection without triggering global stream recalculations.
- **Zone-Free Map Execution**: Leaflet map event handlers and tile rendering run outside Angular's zone (`NgZone.runOutsideAngular`) to maintain 60 FPS performance during high-frequency map interactions.

---

## 📁 Project Directory Structure

```
flight-tracking-operations-dashboard/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── data/
│   │   │   │   └── flights.mock.json           # Mock flight fleet with realistic international coordinates
│   │   │   ├── models/
│   │   │   │   └── flight.model.ts             # Domain interfaces (Flight, Airport, Telemetry, KPIs)
│   │   │   └── services/
│   │   │       ├── flight.service.ts           # Geodesic interpolation, route math, and mock simulation
│   │   │       ├── flight-state.service.ts     # Centralized reactive BehaviorSubject store
│   │   │       └── theme.service.ts            # Light/Dark operations room theme controller
│   │   ├── features/
│   │   │   └── dashboard/
│   │   │       ├── dashboard-shell/            # Navbar, UTC clock, responsive splitter & mobile drawer
│   │   │       ├── flight-details-panel/       # Live flight telemetry, gauges, and simulation controls
│   │   │       ├── flight-list-panel/          # Reactive search, airport filters, and flight cards
│   │   │       ├── flight-map/                 # Leaflet radar map, rotated aircraft icons, route polylines
│   │   │       └── kpi-bar/                    # Operations KPI cards with quick-filter triggers
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── empty-state/                # Radar scope illustration for unselected flights
│   │   │       ├── kpi-card/                   # Metric summary card with icons and trends
│   │   │       └── status-badge/               # Flight status tag with pulsing radar dot
│   │   ├── app.component.ts                    # Root application component
│   │   ├── app.config.ts                       # Application providers (PrimeNG theme, routing)
│   │   └── app.routes.ts                       # Route definitions
│   ├── styles.scss                             # Global typography, Leaflet marker styles, and animations
│   ├── main.ts                                 # Angular bootstrap entry point
│   └── index.html                              # Root HTML document with Inter font integration
├── DESIGN.md                                   # Comprehensive 2-page architectural design document
├── angular.json                                # Angular workspace configuration
├── package.json                                # Dependencies & build scripts
└── tsconfig.json                               # Strict TypeScript compiler options
```

---

## 🌐 Routing & Deep Linking

- `/dashboard` — Main operations overview displaying the full global fleet, map, and telemetry.
- `/dashboard/flight/:id` — Deep-linked route focusing directly on a specific flight (e.g., `/dashboard/flight/FL-001`), automatically centering the radar map and loading its full telemetry profile.

---

## 🧪 Testing & Quality Assurance

Unit tests are written using **Vitest** for fast execution and high reliability:
```bash
# Run tests with single pass (CI mode)
npm test -- --no-watch

# Run in watch mode during development
npm test
```

### Test Coverage Highlights:
- **`FlightStateService`**: Verifies atomic filtering, multi-criteria combinations, KPI derivations, and selection state updates.
- **`FlightService`**: Verifies geodesic distance calculations, heading mathematics, and route interpolation.
- **Components**: Verifies isolated rendering, user interactions, status badge pulsing classes, and empty state fallbacks across all 12 spec suites.
