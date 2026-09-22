import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Flight, Airport, FlightStatus } from '../models/flight.model';
import flightsData from '../data/flights.mock.json';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private mockFlights: Flight[] = JSON.parse(JSON.stringify(flightsData)) as Flight[];

  /**
   * Returns all flights as an Observable stream
   */
  getFlights(): Observable<Flight[]> {
    return of(this.mockFlights);
  }

  /**
   * Retrieves unique airports present across all flights
   */
  getAirports(): Observable<Airport[]> {
    const airportMap = new Map<string, Airport>();
    for (const flight of this.mockFlights) {
      if (flight.originAirport && !airportMap.has(flight.originAirport.iata)) {
        airportMap.set(flight.originAirport.iata, flight.originAirport);
      }
      if (flight.destinationAirport && !airportMap.has(flight.destinationAirport.iata)) {
        airportMap.set(flight.destinationAirport.iata, flight.destinationAirport);
      }
    }
    return of(Array.from(airportMap.values()));
  }

  /**
   * Advance telemetry for all active en-route flights by one simulation step
   */
  advanceFlightSimulation(flights: Flight[], speedMultiplier: number = 1): Flight[] {
    return flights.map(flight => {
      if (flight.status !== 'EN_ROUTE' && flight.status !== 'APPROACHING' && flight.status !== 'DELAYED') {
        return flight;
      }

      const waypoints = flight.routeWaypoints;
      if (!waypoints || waypoints.length < 2) return flight;

      // Increment progress percentage
      const deltaPct = (0.35 * speedMultiplier);
      let newProgress = flight.telemetry.progressPct + deltaPct;
      let newStatus: FlightStatus = flight.status;

      if (newProgress >= 100) {
        newProgress = 100;
        newStatus = 'LANDED';
      } else if (newProgress >= 90 && flight.status !== 'DELAYED') {
        newStatus = 'APPROACHING';
      }

      // Interpolate coordinates along waypoints
      const totalSegments = waypoints.length - 1;
      const progressFraction = newProgress / 100;
      const scaledIndex = progressFraction * totalSegments;
      const segIndex = Math.min(Math.floor(scaledIndex), totalSegments - 1);
      const segFraction = scaledIndex - segIndex;

      const p1 = waypoints[segIndex];
      const p2 = waypoints[segIndex + 1];

      const currentLat = p1.latitude + (p2.latitude - p1.latitude) * segFraction;
      const currentLng = p1.longitude + (p2.longitude - p1.longitude) * segFraction;

      // Compute heading between p1 and p2
      const heading = this.calculateBearing(p1.latitude, p1.longitude, p2.latitude, p2.longitude);

      return {
        ...flight,
        status: newStatus,
        telemetry: {
          ...flight.telemetry,
          currentLatitude: Number(currentLat.toFixed(4)),
          currentLongitude: Number(currentLng.toFixed(4)),
          headingDeg: Math.round(heading),
          progressPct: Number(newProgress.toFixed(1)),
          lastUpdated: new Date().toISOString()
        }
      };
    });
  }

  /**
   * Calculate geographic bearing (heading) in degrees between two coordinates
   */
  private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lon2 - lon1);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    const theta = Math.atan2(y, x);
    return (toDeg(theta) + 360) % 360;
  }
}
