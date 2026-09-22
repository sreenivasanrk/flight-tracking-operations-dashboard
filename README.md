# AeroOps — Flight Tracking & Operations Dashboard

A mission-critical aviation operations dashboard built with **Angular 21**, **PrimeNG 22**, **RxJS 7.8**, and **Leaflet 1.9.4**.

---

## Key Features

1. **Interactive Global Leaflet Radar Map**:
   - 18 mock international & domestic flights plotted across real-world airports (JFK, LHR, CDG, FRA, DXB, SIN, HND, LAX, SFO, SYD).
   - Custom SVG aircraft markers rotated to match real-time aircraft headings.
   - Distinct airport hub marker layer with ICAO/IATA labels and metadata.
   - Dual-layer glowing route trajectory polyline on flight selection with smooth `fitBounds` camera animation.
   - Interactive marker popups with operations telemetry summary.

2. **Reactive State Store & Multi-Criteria Filtering**:
   - Lightweight, robust RxJS service-based state store (`FlightStateService`) using `BehaviorSubject`, `combineLatest`, `map`, and `distinctUntilChanged`.
   - Reactive Form search & filters (Callsign / Flight # text search, Status dropdown, Origin airport dropdown, Destination airport dropdown) combined with strict AND logic.
   - Synchronized live updates across map markers, list panel, and KPI metrics.

3. **Operations KPI Bar**:
   - Real-time reactive cards for **Total Flights**, **Active Flights**, **Delayed Flights**, **Arrived Flights**, and **Scheduled Flights**.
   - Interactive quick-filtering: click any KPI card to instantly filter the fleet by that status.

4. **Deep Flight Telemetry & Route Details Panel**:
   - Displays Flight Number, Callsign, Aircraft Type, Registration, Origin/Destination schedule times, and terminal/gate info.
   - Live telemetry gauges: Altitude (ft), Vertical Rate (fpm), Ground Speed (kts / km/h), Compass Heading (°), and Route Progress (%).
   - Real-time flight simulation playback controls (Play, Pause, Speed Multiplier 1x/2x/5x).
   - Polished empty state with radar sweep animation when no flight is selected.

5. **Modern Aviation Aesthetic & Theming**:
   - Dark navy/slate operations center theme configured via `@primeuix/themes` (`Aura` preset with custom tokens).
   - Live Light/Dark mode toggle with DOM-level class bindings.
   - Responsive layout: desktop Splitter layout docks the fleet panel alongside the map; tablet/mobile views (<1024px) collapse the fleet panel into a PrimeNG Drawer.
   - Accessibility: ARIA roles, high-contrast typography (Inter & JetBrains Mono), keyboard navigation.

---

## Tech Stack & Architecture

- **Framework**: Angular 21 (standalone components, no NgModules)
- **UI Component Library**: PrimeNG 22 + `@primeuix/themes` + PrimeFlex
- **Map Engine**: Leaflet 1.9.4 (native integration inside `ngAfterViewInit` / `ngOnDestroy` lifecycle)
- **State Management**: RxJS 7.8 `BehaviorSubject` service store (no NgRx) combined with Angular Signals
- **Testing**: Vitest 4
- **Language**: TypeScript in Strict Mode

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm start
# or
ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### 3. Run Unit Tests (Vitest)
```bash
npm test -- --watch=false
# or
npx ng test --watch=false
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## Routing Structure

- `/dashboard` — Main operations center overview
- `/dashboard/flight/:id` — Deep telemetry view for a specific flight (e.g., `/dashboard/flight/FL-001`)

---

## Architecture Design Document

For a comprehensive explanation of architectural decisions, state management trade-offs (RxJS BehaviorSubjects vs. NgRx), Leaflet integration lifecycle, and component structure, see [DESIGN.md](./DESIGN.md).
