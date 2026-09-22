import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FlightService } from './flight.service';

describe('FlightService', () => {
  let service: FlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightService]
    });
    service = TestBed.inject(FlightService);
  });

  it('should load mock flights stream', async () => {
    const flights = await firstValueFrom(service.getFlights());
    expect(flights).toBeDefined();
    expect(flights.length).toBeGreaterThanOrEqual(15);
  });

  it('should aggregate unique airport hubs', async () => {
    const airports = await firstValueFrom(service.getAirports());
    expect(airports).toBeDefined();
    expect(airports.length).toBeGreaterThan(0);
    const iataCodes = airports.map(a => a.iata);
    expect(iataCodes).toContain('JFK');
    expect(iataCodes).toContain('LHR');
  });

  it('should advance flight coordinates and progress percentage during simulation step', () => {
    const flights = [
      {
        id: 'FL-TEST',
        flightNumber: 'TEST1',
        callsign: 'TST1',
        airline: 'Test Air',
        airlineIcao: 'TST',
        aircraft: { model: 'A350', typeCode: 'A359', registration: 'N123', airline: 'Test', airlineCode: 'TA' },
        originAirport: { icao: 'KJFK', iata: 'JFK', name: 'JFK', city: 'NYC', country: 'USA', latitude: 40.0, longitude: -73.0, elevationFt: 10, timezone: 'UTC' },
        destinationAirport: { icao: 'EGLL', iata: 'LHR', name: 'LHR', city: 'London', country: 'UK', latitude: 51.0, longitude: 0.0, elevationFt: 80, timezone: 'UTC' },
        status: 'EN_ROUTE' as const,
        scheduledDeparture: '2026-09-22T08:00:00Z',
        estimatedArrival: '2026-09-22T16:00:00Z',
        distanceNm: 3000,
        telemetry: {
          currentLatitude: 40.0,
          currentLongitude: -73.0,
          altitudeFt: 35000,
          groundSpeedKts: 500,
          headingDeg: 75,
          verticalRateFpm: 0,
          progressPct: 10,
          lastUpdated: '2026-09-22T10:00:00Z'
        },
        routeWaypoints: [
          { latitude: 40.0, longitude: -73.0, name: 'JFK' },
          { latitude: 51.0, longitude: 0.0, name: 'LHR' }
        ]
      }
    ];

    const updated = service.advanceFlightSimulation(flights, 2);
    expect(updated[0].telemetry.progressPct).toBeGreaterThan(10);
    expect(updated[0].telemetry.lastUpdated).toBeDefined();
  });
});
