import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subscription,
  timer,
  filter,
  map,
  distinctUntilChanged,
  shareReplay
} from 'rxjs';
import { Flight, FlightFilter, FlightKpis, FlightStatus, Airport } from '../models/flight.model';
import { FlightService } from './flight.service';

const INITIAL_FILTER: FlightFilter = {
  searchQuery: '',
  status: 'ALL',
  originIata: 'ALL',
  destinationIata: 'ALL'
};

@Injectable({
  providedIn: 'root'
})
export class FlightStateService implements OnDestroy {
  private readonly flightService = inject(FlightService);

  // Core State Subjects (BehaviorSubjects)
  private readonly flightsSubject = new BehaviorSubject<Flight[]>([]);
  private readonly selectedFlightIdSubject = new BehaviorSubject<string | null>(null);
  private readonly filterSubject = new BehaviorSubject<FlightFilter>(INITIAL_FILTER);
  private readonly isSimulationRunningSubject = new BehaviorSubject<boolean>(false);
  private readonly simulationSpeedSubject = new BehaviorSubject<number>(1);

  // Raw Observables
  readonly flights$: Observable<Flight[]> = this.flightsSubject.asObservable();
  readonly selectedFlightId$: Observable<string | null> = this.selectedFlightIdSubject.asObservable();
  readonly filters$: Observable<FlightFilter> = this.filterSubject.asObservable();
  readonly isSimulationRunning$: Observable<boolean> = this.isSimulationRunningSubject.asObservable();
  readonly simulationSpeed$: Observable<number> = this.simulationSpeedSubject.asObservable();

  // Derived Filtered Flights Stream
  readonly filteredFlights$: Observable<Flight[]> = combineLatest([
    this.flights$,
    this.filters$
  ]).pipe(
    map(([flights, filters]) => this.applyFilters(flights, filters)),
    distinctUntilChanged((prev, curr) => {
      if (prev.length !== curr.length) return false;
      return prev.every((flight, index) => {
        const c = curr[index];
        return (
          flight.id === c.id &&
          flight.status === c.status &&
          flight.telemetry.progressPct === c.telemetry.progressPct &&
          flight.telemetry.currentLatitude === c.telemetry.currentLatitude &&
          flight.telemetry.currentLongitude === c.telemetry.currentLongitude
        );
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Derived Selected Flight Stream
  readonly selectedFlight$: Observable<Flight | null> = combineLatest([
    this.flights$,
    this.selectedFlightId$
  ]).pipe(
    map(([flights, selectedId]) => {
      if (!selectedId) return null;
      return flights.find(f => f.id === selectedId || f.flightNumber.toLowerCase() === selectedId.toLowerCase()) || null;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Derived Reactive KPIs from All Flights (Preserves total bucket counts while filtering)
  readonly kpis$: Observable<FlightKpis> = this.flights$.pipe(
    map(flights => this.calculateKpis(flights)),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Derived Unique Origins from dataset
  readonly availableOrigins$: Observable<{ label: string; value: string; city: string }[]> = this.flights$.pipe(
    map(flights => {
      const originMap = new Map<string, { label: string; value: string; city: string }>();
      originMap.set('ALL', { label: 'All Origins', value: 'ALL', city: '' });
      flights.forEach(f => {
        if (f.originAirport && !originMap.has(f.originAirport.iata)) {
          originMap.set(f.originAirport.iata, {
            label: `${f.originAirport.iata} - ${f.originAirport.city}`,
            value: f.originAirport.iata,
            city: f.originAirport.city
          });
        }
      });
      return Array.from(originMap.values());
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Derived Unique Destinations from dataset
  readonly availableDestinations$: Observable<{ label: string; value: string; city: string }[]> = this.flights$.pipe(
    map(flights => {
      const destMap = new Map<string, { label: string; value: string; city: string }>();
      destMap.set('ALL', { label: 'All Destinations', value: 'ALL', city: '' });
      flights.forEach(f => {
        if (f.destinationAirport && !destMap.has(f.destinationAirport.iata)) {
          destMap.set(f.destinationAirport.iata, {
            label: `${f.destinationAirport.iata} - ${f.destinationAirport.city}`,
            value: f.destinationAirport.iata,
            city: f.destinationAirport.city
          });
        }
      });
      return Array.from(destMap.values());
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Derived Unique Status Options
  readonly availableStatuses$: Observable<{ label: string; value: string }[]> = this.flights$.pipe(
    map(() => [
      { label: 'All Statuses', value: 'ALL' },
      { label: 'En Route', value: 'EN_ROUTE' },
      { label: 'Approaching', value: 'APPROACHING' },
      { label: 'Boarding', value: 'BOARDING' },
      { label: 'Delayed', value: 'DELAYED' },
      { label: 'Landed', value: 'LANDED' },
      { label: 'Scheduled', value: 'SCHEDULED' },
      { label: 'Cancelled', value: 'CANCELLED' },
      { label: 'Diverted', value: 'DIVERTED' }
    ]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Derived Airport hubs
  readonly airportHubs$: Observable<Airport[]> = this.flightService.getAirports().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private simulationSub: Subscription;

  constructor() {
    // Initial data load
    this.loadInitialData();

    // Setup live simulation ticker (ticks every 1000ms when simulation is active)
    this.simulationSub = timer(0, 1000)
      .pipe(filter(() => this.isSimulationRunningSubject.value))
      .subscribe(() => {
        this.stepSimulation();
      });
  }

  ngOnDestroy(): void {
    if (this.simulationSub) {
      this.simulationSub.unsubscribe();
    }
  }

  // --- Actions / Mutators ---

  /**
   * Load initial flight dataset into store
   */
  loadInitialData(): void {
    this.flightService.getFlights().subscribe(flights => {
      this.flightsSubject.next(flights);
    });
  }

  /**
   * Set or clear the currently selected flight ID
   */
  setSelectedFlight(flightId: string | null): void {
    this.selectedFlightIdSubject.next(flightId);
  }

  /**
   * Update one or more filter criteria
   */
  updateFilter(partialFilter: Partial<FlightFilter>): void {
    const current = this.filterSubject.value;
    this.filterSubject.next({
      ...current,
      ...partialFilter
    });
  }

  /**
   * Quick filter by status from KPI cards or tags (toggles back to ALL if already selected)
   */
  filterByStatus(status: FlightStatus | 'ALL'): void {
    const current = this.filterSubject.value.status;
    if (current === status && status !== 'ALL') {
      this.updateFilter({ status: 'ALL' });
    } else {
      this.updateFilter({ status });
    }
  }

  /**
   * Reset all filters to default
   */
  resetFilters(): void {
    this.filterSubject.next(INITIAL_FILTER);
  }

  /**
   * Toggle real-time flight playback simulation
   */
  toggleSimulation(): void {
    const nextState = !this.isSimulationRunningSubject.value;
    this.isSimulationRunningSubject.next(nextState);
  }

  /**
   * Set simulation speed multiplier (1x, 2x, 4x)
   */
  setSimulationSpeed(speed: number): void {
    this.simulationSpeedSubject.next(Math.max(1, speed));
  }

  /**
   * Advance telemetry for all active flights by one step
   */
  stepSimulation(): void {
    const currentFlights = this.flightsSubject.value;
    const speed = this.simulationSpeedSubject.value;
    const updatedFlights = this.flightService.advanceFlightSimulation(currentFlights, speed);
    this.flightsSubject.next(updatedFlights);
  }

  /**
   * Apply AND-logic filtering across all filter dimensions
   */
  private applyFilters(flights: Flight[], filters: FlightFilter): Flight[] {
    const query = filters.searchQuery?.trim().toLowerCase() || '';
    const status = filters.status;
    const origin = filters.originIata;
    const destination = filters.destinationIata;

    return flights.filter(flight => {
      // 1. Text Search (matches Callsign, Flight Number, Airline, Origin City, or Dest City)
      if (query) {
        const matchesFlightNumber = flight.flightNumber.toLowerCase().includes(query);
        const matchesCallsign = flight.callsign.toLowerCase().includes(query);
        const matchesAirline = flight.airline.toLowerCase().includes(query);
        const matchesAircraft = flight.aircraft.model.toLowerCase().includes(query) || flight.aircraft.registration.toLowerCase().includes(query);
        const matchesOriginCity = flight.originAirport.city.toLowerCase().includes(query);
        const matchesDestCity = flight.destinationAirport.city.toLowerCase().includes(query);

        if (!matchesFlightNumber && !matchesCallsign && !matchesAirline && !matchesAircraft && !matchesOriginCity && !matchesDestCity) {
          return false;
        }
      }

      // 2. Status Filter
      if (status && status !== 'ALL') {
        if (flight.status !== status) {
          return false;
        }
      }

      // 3. Origin Airport Filter
      if (origin && origin !== 'ALL') {
        if (flight.originAirport.iata !== origin) {
          return false;
        }
      }

      // 4. Destination Airport Filter
      if (destination && destination !== 'ALL') {
        if (flight.destinationAirport.iata !== destination) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Compute aggregate KPI numbers from filtered flight list
   */
  private calculateKpis(flights: Flight[]): FlightKpis {
    let active = 0;
    let delayed = 0;
    let arrived = 0;
    let scheduled = 0;
    let cancelled = 0;

    for (const f of flights) {
      switch (f.status) {
        case 'EN_ROUTE':
        case 'APPROACHING':
        case 'BOARDING':
        case 'DEPARTED':
          active++;
          break;
        case 'DELAYED':
          delayed++;
          active++; // Delayed active flights count in active too
          break;
        case 'LANDED':
          arrived++;
          break;
        case 'SCHEDULED':
          scheduled++;
          break;
        case 'CANCELLED':
        case 'DIVERTED':
          cancelled++;
          break;
      }
    }

    return {
      total: flights.length,
      active,
      delayed,
      arrived,
      scheduled,
      cancelled
    };
  }
}
