# Technical Design Document: Flight Tracking & Operations Dashboard

## 1. Executive Summary & Problem Scope
The **Flight Tracking & Operations Dashboard** is an enterprise-grade mission-control aviation interface engineered for real-time fleet visibility, telemetry monitoring, multi-criteria flight filtering, and situational awareness. 

This document articulates the core architectural decisions, data flow pipelines, state management strategy, map integration lifecycle, and UI styling methodology implemented in the solution.

---

## 2. Architecture & State Management

### 2.1 State Management Approach: Lightweight RxJS Service Store vs. NgRx
A key design decision for this application was selecting a **lightweight service-based reactive store (RxJS BehaviorSubjects)** over a full **NgRx (Store/Effects/Entity/Selectors)** framework.

#### Why RxJS Service Store?
1. **Single Source of Truth without Boilerplate**:
   - For an operational dashboard managing 15–50 active flight entities, `FlightStateService` provides a centralized, deterministic state pipeline with zero action-reducer-effect boilerplate.
   - Core state slices are preserved in discrete `BehaviorSubject` instances:
     - `flightsSubject` (fleet dataset & real-time telemetry)
     - `selectedFlightIdSubject` (active selection)
     - `filterSubject` (multi-criteria search, origin, destination, status)
     - `isSimulationRunningSubject` / `simulationSpeedSubject` (telemetry tick controller)

2. **Reactive Derivations via `combineLatest` & Pure Pipelines**:
   - `filteredFlights$` is derived reactively using `combineLatest([flights$, filters$])` and pure filter predicates.
   - `kpis$` (Total, Active, Delayed, Landed, Scheduled) is derived directly from `filteredFlights$` via `.pipe(map(flights => calculateKpis(flights)), distinctUntilChanged(), shareReplay(1))`.
   - Any change to the search input, status dropdown, origin/destination select, or background telemetry immediately and atomically updates both the map markers and the flight list without manual synchronization.

3. **Performance & Memory Footprint**:
   - NgRx introduces runtime overhead, selector memoization cache layers, and extensive bundle weight (~40–80KB gzip).
   - In contrast, the RxJS Service Store utilizes Angular's tree-shakable DI and `shareReplay({ bufferSize: 1, refCount: true })` to prevent multicast subscriber leaks and excessive re-executions.

4. **Signals Integration**:
   - Angular Signals (`signal()`, `effect()`) are leveraged in local components (e.g., drawer toggles, active tab, UI themes, UTC clock) for instant template change detection without triggering unnecessary global RxJS streams.

---

## 3. Component Breakdown & Directory Structure

The project follows a clean separation of concerns:

```
src/app/
├── core/
│   ├── models/
│   │   └── flight.model.ts          # Strongly-typed domain interfaces (Flight, Airport, Telemetry, KPIs)
│   ├── services/
│   │   ├── flight.service.ts        # Data provider & geodesic calculation / simulation logic
│   │   ├── flight-state.service.ts  # Centralized reactive BehaviorSubject store
│   │   └── theme.service.ts         # Dark/Light mode manager & DOM theme binding
│   └── data/
│       └── flights.mock.json        # 18 realistic international flights across major global hubs
├── shared/
│   └── components/
│       ├── status-badge/            # Reusable flight status tag with pulsing radar dot
│       ├── kpi-card/                # Metric summary card with icons and interactive filter trigger
│       └── empty-state/             # Radar scope visual illustration for unselected states
└── features/
    └── dashboard/
        ├── dashboard-shell/         # Top navbar, UTC clock, responsive splitter & mobile drawer
        ├── flight-map/              # Leaflet map, custom SVG rotated markers, airport nodes, routes
        ├── flight-list-panel/       # Reactive Form filters + scrollable flight cards
        ├── flight-details-panel/    # Telemetry meters, route progression, simulation controls
        └── kpi-bar/                 # Top metrics row (Total, Active, Delayed, Landed, Scheduled)
```

---

## 4. Leaflet Map Integration & Lifecycle

### 4.1 Native Leaflet 1.9.4 Integration Pattern
- **Lifecycle Encapsulation**: Rather than relying on third-party wrapper packages, Leaflet is directly instantiated within `ngAfterViewInit` and cleaned up in `ngOnDestroy` via `map.remove()`.
- **NgZone Optimization**: Leaflet event listeners and tile loads are executed outside Angular's zone (`ngZone.runOutsideAngular(...)`) to prevent high-frequency DOM events from triggering unnecessary Angular change detection cycles.
- **Marker Re-use & Smooth Telemetry Updating**:
  - Rather than wiping the layer on every telemetry tick, individual markers are mapped by flight ID (`Map<string, L.Marker>`).
  - Position updates use `marker.setLatLng()` and icon heading rotation without DOM node reconstruction.
- **Dynamic Polyline Geodesics**:
  - On flight selection, a dual-layer polyline is drawn (outer glowing trajectory + inner dashed track) and map bounds are fitted with smooth easing (`map.fitBounds(bounds, { animate: true, duration: 1.2 })`).

---

## 5. UI/UX & PrimeNG Theme Architecture

- **Dark Aviation Operations Theme**: Default aesthetic uses dark navy/slate tones (`#090d16`, `#0f172a`, `#1e293b`) with neon accents (emerald for en route, amber for delayed, sky blue for telemetry).
- **PrimeNG 22 + `@primeuix/themes`**: Configured via `definePreset(Aura, ...)` in `app.config.ts`, ensuring all PrimeNG widgets (`p-card`, `p-select`, `p-table`, `p-button`, `p-splitter`, `p-drawer`) inherit native token styles without ad-hoc CSS overrides.
- **Responsive Docking**: Desktop uses `p-splitter` for adjustable split views between map and telemetry. Screens `< 1024px` transition to a full-screen map with a slide-out `p-drawer` for fleet inspection.
