import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FlightStateService } from './flight-state.service';
import { FlightService } from './flight.service';

describe('FlightStateService', () => {
  let service: FlightStateService;
  let flightService: FlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightStateService, FlightService]
    });
    service = TestBed.inject(FlightStateService);
    flightService = TestBed.inject(FlightService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should initialize and load flights into state store', async () => {
    const flights = await firstValueFrom(service.flights$);
    expect(flights).toBeDefined();
    expect(flights.length).toBeGreaterThanOrEqual(15);
  });

  it('should calculate accurate KPIs from full fleet dataset', async () => {
    const kpis = await firstValueFrom(service.kpis$);
    expect(kpis.total).toBeGreaterThanOrEqual(15);
    expect(kpis.active).toBeGreaterThan(0);
    expect(kpis.delayed).toBeGreaterThanOrEqual(1);
    expect(kpis.arrived).toBeGreaterThanOrEqual(1);
    expect(kpis.scheduled).toBeGreaterThanOrEqual(1);
  });

  it('should preserve fleet KPI counts when filtering flights by status', async () => {
    const initialKpis = await firstValueFrom(service.kpis$);
    
    // Filter to DELAYED flights
    service.filterByStatus('DELAYED');
    const filtered = await firstValueFrom(service.filteredFlights$);
    const kpisAfterFilter = await firstValueFrom(service.kpis$);

    // Filtered flights should only show delayed
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(f => expect(f.status).toBe('DELAYED'));

    // Remaining KPI bucket counts should remain intact (not collapsed to 0)
    expect(kpisAfterFilter.total).toBe(initialKpis.total);
    expect(kpisAfterFilter.delayed).toBe(initialKpis.delayed);
    expect(kpisAfterFilter.active).toBe(initialKpis.active);
    expect(kpisAfterFilter.arrived).toBe(initialKpis.arrived);
  });

  it('should toggle status filter back to ALL when re-clicking same status', async () => {
    service.filterByStatus('DELAYED');
    let filters = await firstValueFrom(service.filters$);
    expect(filters.status).toBe('DELAYED');

    // Click same status again -> toggles back to ALL
    service.filterByStatus('DELAYED');
    filters = await firstValueFrom(service.filters$);
    expect(filters.status).toBe('ALL');
  });

  it('should filter flights by callsign search query', async () => {
    service.updateFilter({ searchQuery: 'BAW178' });
    const filtered = await firstValueFrom(service.filteredFlights$);
    expect(filtered.length).toBe(1);
    expect(filtered[0].callsign).toBe('BAW178');
    expect(filtered[0].flightNumber).toBe('BA178');
  });

  it('should filter flights by case-insensitive airline name', async () => {
    service.updateFilter({ searchQuery: 'emirates' });
    const filtered = await firstValueFrom(service.filteredFlights$);
    expect(filtered.length).toBeGreaterThanOrEqual(2);
    filtered.forEach(f => {
      expect(f.airline.toLowerCase()).toContain('emirates');
    });
  });

  it('should filter flights by origin airport IATA code', async () => {
    service.updateFilter({ originIata: 'JFK' });
    const filtered = await firstValueFrom(service.filteredFlights$);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(f => {
      expect(f.originAirport.iata).toBe('JFK');
    });
  });

  it('should filter flights by destination airport IATA code', async () => {
    service.updateFilter({ destinationIata: 'LHR' });
    const filtered = await firstValueFrom(service.filteredFlights$);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(f => {
      expect(f.destinationAirport.iata).toBe('LHR');
    });
  });

  it('should combine multiple filter criteria with AND logic', async () => {
    service.updateFilter({
      originIata: 'JFK',
      destinationIata: 'LHR',
      status: 'EN_ROUTE'
    });
    const filtered = await firstValueFrom(service.filteredFlights$);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(f => {
      expect(f.originAirport.iata).toBe('JFK');
      expect(f.destinationAirport.iata).toBe('LHR');
      expect(f.status).toBe('EN_ROUTE');
    });
  });

  it('should select a flight by ID and emit the selected flight entity', async () => {
    const flights = await firstValueFrom(service.flights$);
    const target = flights[0];

    service.setSelectedFlight(target.id);
    const selected = await firstValueFrom(service.selectedFlight$);
    expect(selected).toBeDefined();
    expect(selected?.id).toBe(target.id);
    expect(selected?.flightNumber).toBe(target.flightNumber);
  });

  it('should reset all filters back to initial state', async () => {
    service.updateFilter({
      searchQuery: 'NonExistentXYZ',
      status: 'CANCELLED',
      originIata: 'JFK'
    });

    let filtered = await firstValueFrom(service.filteredFlights$);
    expect(filtered.length).toBe(0);

    service.resetFilters();
    filtered = await firstValueFrom(service.filteredFlights$);
    expect(filtered.length).toBeGreaterThanOrEqual(15);
  });

  it('should advance flight simulation telemetry on step', async () => {
    const initialFlights = await firstValueFrom(service.flights$);
    const initialActive = initialFlights.find(f => f.status === 'EN_ROUTE');
    expect(initialActive).toBeDefined();

    const initialProg = initialActive!.telemetry.progressPct;
    service.stepSimulation();

    const updatedFlights = await firstValueFrom(service.flights$);
    const updatedActive = updatedFlights.find(f => f.id === initialActive!.id);
    expect(updatedActive!.telemetry.progressPct).toBeGreaterThanOrEqual(initialProg);
  });
});
