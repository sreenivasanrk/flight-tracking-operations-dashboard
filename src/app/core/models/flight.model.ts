export type FlightStatus =
  | 'SCHEDULED'
  | 'BOARDING'
  | 'DEPARTED'
  | 'EN_ROUTE'
  | 'APPROACHING'
  | 'LANDED'
  | 'DELAYED'
  | 'CANCELLED'
  | 'DIVERTED';

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationFt: number;
  timezone: string;
}

export interface Aircraft {
  model: string;
  typeCode: string;
  registration: string;
  airline: string;
  airlineCode: string;
  capacity?: number;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitudeFt?: number;
  name?: string;
}

export interface FlightTelemetry {
  currentLatitude: number;
  currentLongitude: number;
  altitudeFt: number;
  groundSpeedKts: number;
  headingDeg: number;
  verticalRateFpm: number;
  progressPct: number;
  lastUpdated: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  callsign: string;
  airline: string;
  airlineIcao: string;
  airlineLogo?: string;
  aircraft: Aircraft;
  originAirport: Airport;
  destinationAirport: Airport;
  status: FlightStatus;
  scheduledDeparture: string;
  actualDeparture?: string;
  estimatedArrival: string;
  actualArrival?: string;
  gate?: string;
  terminal?: string;
  baggageClaim?: string;
  distanceNm: number;
  telemetry: FlightTelemetry;
  routeWaypoints: GeoPoint[];
  remarks?: string;
}

export interface FlightFilter {
  searchQuery: string;
  status: FlightStatus | 'ALL' | null;
  originIata: string | 'ALL' | null;
  destinationIata: string | 'ALL' | null;
}

export interface FlightKpis {
  total: number;
  active: number;
  delayed: number;
  arrived: number;
  scheduled: number;
  cancelled: number;
}
