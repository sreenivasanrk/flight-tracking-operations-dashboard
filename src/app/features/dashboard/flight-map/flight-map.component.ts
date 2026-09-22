import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  NgZone,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FlightStateService } from '../../../core/services/flight-state.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Flight, Airport } from '../../../core/models/flight.model';

@Component({
  selector: 'app-flight-map',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './flight-map.component.html',
  styleUrl: './flight-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly flightState = inject(FlightStateService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  // Map state signals
  readonly showAirports = signal<boolean>(true);
  readonly showRoutes = signal<boolean>(true);
  readonly activeFlightCount = signal<number>(0);

  private map?: L.Map;
  private tileLayer?: L.TileLayer;
  private flightMarkersLayer = L.layerGroup();
  private airportMarkersLayer = L.layerGroup();
  private routePolylinesLayer = L.layerGroup();
  private selectedRouteLayer = L.layerGroup();

  private flightMarkerMap = new Map<string, L.Marker>();
  private subscriptions: Subscription[] = [];
  private currentSelectedId: string | null = null;
  private initialBoundsFitted = false;

  ngAfterViewInit(): void {
    // Run map initialization outside Angular zone for optimal high-frequency performance
    this.ngZone.runOutsideAngular(() => {
      this.initMap();
      this.listenToStateChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Resizes map when containers or splitters drag
   */
  invalidateSize(): void {
    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 50);
    }
  }

  private initMap(): void {
    const el = this.mapContainer.nativeElement;

    // Create Leaflet Map centered on Atlantic/Global view
    this.map = L.map(el, {
      center: [35.0, -10.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 17,
      zoomControl: true,
      attributionControl: false
    });

    // Custom dark/light CartoDB Positron / Voyager or OSM tile layer
    const isDark = this.themeService.isDark();
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    this.tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Add Layer Groups
    this.airportMarkersLayer.addTo(this.map);
    this.routePolylinesLayer.addTo(this.map);
    this.selectedRouteLayer.addTo(this.map);
    this.flightMarkersLayer.addTo(this.map);
  }

  private listenToStateChanges(): void {
    // Subscribe to Theme Changes to swap tile sets smoothly
    const themeSub = this.flightState.flights$.subscribe(() => {
      const isDark = this.themeService.isDark();
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      if (this.tileLayer) {
        this.tileLayer.setUrl(tileUrl);
      }
    });
    this.subscriptions.push(themeSub);

    // Subscribe to Airport Hubs
    const airportsSub = this.flightState.airportHubs$.subscribe(airports => {
      this.renderAirportHubs(airports);
    });
    this.subscriptions.push(airportsSub);

    // Subscribe to Filtered Flights & Selected Flight
    const flightsSub = combineLatest([
      this.flightState.filteredFlights$,
      this.flightState.selectedFlight$
    ]).subscribe(([flights, selectedFlight]) => {
      this.activeFlightCount.set(flights.length);
      this.renderFlights(flights, selectedFlight);

      const selectedId = selectedFlight ? selectedFlight.id : null;
      if (selectedId !== this.currentSelectedId) {
        this.currentSelectedId = selectedId;
        this.renderSelectedRoute(selectedFlight);
      }
    });
    this.subscriptions.push(flightsSub);
  }

  /**
   * Render Airport Hub Markers
   */
  private renderAirportHubs(airports: Airport[]): void {
    this.airportMarkersLayer.clearLayers();

    airports.forEach(airport => {
      const iconHtml = `
        <div class="airport-marker" title="${airport.name}">
          <div class="airport-dot"></div>
          <div class="airport-label">${airport.iata}</div>
        </div>
      `;

      const airportIcon = L.divIcon({
        className: 'custom-airport-div-icon',
        html: iconHtml,
        iconSize: [40, 30],
        iconAnchor: [20, 10]
      });

      const marker = L.marker([airport.latitude, airport.longitude], {
        icon: airportIcon,
        zIndexOffset: 100,
        keyboard: true,
        title: `${airport.iata} - ${airport.name}`
      });

      const popupHtml = `
        <div class="p-3" style="min-width: 180px;">
          <div class="text-xs text-muted uppercase font-bold tracking-wider">${airport.icao} / ${airport.iata}</div>
          <div class="text-sm font-bold text-primary mb-1">${airport.name}</div>
          <div class="text-xs text-muted">${airport.city}, ${airport.country}</div>
          <div class="text-xs font-mono text-muted mt-2">Elev: ${airport.elevationFt} ft | TZ: ${airport.timezone}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      this.airportMarkersLayer.addLayer(marker);
    });
  }

  /**
   * Render Flight Markers and update positions without recreating DOM nodes
   */
  private renderFlights(flights: Flight[], selectedFlight: Flight | null): void {
    const activeIds = new Set(flights.map(f => f.id));

    // Remove markers that are no longer in filtered flights
    for (const [id, marker] of this.flightMarkerMap.entries()) {
      if (!activeIds.has(id)) {
        this.flightMarkersLayer.removeLayer(marker);
        this.flightMarkerMap.delete(id);
      }
    }

    const bounds = L.latLngBounds([]);

    flights.forEach(flight => {
      const isSelected = selectedFlight?.id === flight.id;
      const lat = flight.telemetry.currentLatitude;
      const lng = flight.telemetry.currentLongitude;
      const heading = flight.telemetry.headingDeg;
      bounds.extend([lat, lng]);

      let marker = this.flightMarkerMap.get(flight.id);

      if (!marker) {
        // Create new marker
        const icon = this.createFlightIcon(flight, isSelected);
        marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: isSelected ? 1000 : 500,
          keyboard: true,
          title: `Flight ${flight.flightNumber} (${flight.callsign})`
        });

        marker.on('click', () => {
          this.ngZone.run(() => {
            this.flightState.setSelectedFlight(flight.id);
            this.router.navigate(['/dashboard', 'flight', flight.id]);
          });
        });

        // Bind rich popup
        marker.bindPopup(() => this.createPopupContent(flight));

        this.flightMarkersLayer.addLayer(marker);
        this.flightMarkerMap.set(flight.id, marker);
      } else {
        // Update existing marker position & icon rotation
        marker.setLatLng([lat, lng]);
        marker.setIcon(this.createFlightIcon(flight, isSelected));
        marker.setZIndexOffset(isSelected ? 1000 : 500);
      }
    });

    // Initial bounds fit on first load if flights exist
    if (!this.initialBoundsFitted && flights.length > 0 && this.map) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
      this.initialBoundsFitted = true;
    }
  }

  /**
   * Generates custom SVG aircraft icon rotated to actual heading
   */
  private createFlightIcon(flight: Flight, isSelected: boolean): L.DivIcon {
    const isDelayed = flight.status === 'DELAYED';
    const isLanded = flight.status === 'LANDED';
    const heading = flight.telemetry.headingDeg;

    let iconClass = 'plane-icon-wrapper';
    if (isSelected) iconClass += ' selected';
    else if (isDelayed) iconClass += ' delayed';
    else if (isLanded) iconClass += ' landed';

    const planeColor = isSelected
      ? '#10b981'
      : isDelayed
      ? '#f59e0b'
      : isLanded
      ? '#94a3b8'
      : '#38bdf8';

    const iconHtml = `
      <div class="plane-marker" style="transform: rotate(${heading}deg);" aria-label="${flight.flightNumber}">
        <div class="plane-marker-inner">
          <div class="plane-badge-label" style="transform: rotate(-${heading}deg);">${flight.flightNumber}</div>
          <div class="${iconClass}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${planeColor}" stroke="${planeColor}" stroke-width="1.5">
              <path d="M12 2L15 9L22 11L15 13L15 19L18 21L18 22L12 20L6 22L6 21L9 19L9 13L2 11L9 9L12 2Z"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-flight-div-icon',
      html: iconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  /**
   * Rich flight popup content
   */
  private createPopupContent(flight: Flight): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flight-popup p-3';
    container.style.minWidth = '220px';

    const isDelayed = flight.status === 'DELAYED';
    const statusColor = isDelayed ? '#f59e0b' : '#38bdf8';

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
        <span style="font-family: monospace; font-weight: 800; font-size: 15px; color: #38bdf8;">${flight.flightNumber}</span>
        <span style="font-size: 10px; font-weight: 700; color: ${statusColor}; text-transform: uppercase;">${flight.status}</span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">${flight.airline} &bull; ${flight.aircraft.model}</div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; margin-bottom: 8px;">
        <div style="text-align: left;">
          <div style="font-size: 14px; font-weight: bold; color: #f8fafc;">${flight.originAirport.iata}</div>
          <div style="font-size: 10px; color: #64748b;">${flight.originAirport.city}</div>
        </div>
        <div style="font-size: 12px; color: #38bdf8;">&rarr;</div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: bold; color: #f8fafc;">${flight.destinationAirport.iata}</div>
          <div style="font-size: 10px; color: #64748b;">${flight.destinationAirport.city}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; font-family: monospace; color: #cbd5e1; margin-bottom: 10px;">
        <div>Alt: ${flight.telemetry.altitudeFt.toLocaleString()} ft</div>
        <div>Spd: ${flight.telemetry.groundSpeedKts} kts</div>
        <div>Hdg: ${flight.telemetry.headingDeg}&deg;</div>
        <div>Prog: ${flight.telemetry.progressPct}%</div>
      </div>

      <button id="btn-select-popup-${flight.id}" style="width: 100%; background: #0284c7; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; cursor: pointer;">
        View Operations Telemetry
      </button>
    `;

    const btn = container.querySelector(`#btn-select-popup-${flight.id}`);
    if (btn) {
      btn.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.flightState.setSelectedFlight(flight.id);
          this.router.navigate(['/dashboard', 'flight', flight.id]);
        });
      });
    }

    return container;
  }

  /**
   * Render Route Polyline and fit bounds when flight is selected
   */
  private renderSelectedRoute(flight: Flight | null): void {
    this.selectedRouteLayer.clearLayers();

    if (!flight || !this.map) return;

    const waypoints = flight.routeWaypoints || [
      { latitude: flight.originAirport.latitude, longitude: flight.originAirport.longitude },
      { latitude: flight.destinationAirport.latitude, longitude: flight.destinationAirport.longitude }
    ];

    const latLngs: L.LatLngExpression[] = waypoints.map(w => [w.latitude, w.longitude]);

    // Outer glow polyline
    const glowLine = L.polyline(latLngs, {
      color: '#38bdf8',
      weight: 6,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    });

    // Primary route dashed polyline
    const primaryLine = L.polyline(latLngs, {
      color: '#10b981',
      weight: 2.5,
      opacity: 0.95,
      dashArray: '6, 8',
      lineCap: 'round'
    });

    this.selectedRouteLayer.addLayer(glowLine);
    this.selectedRouteLayer.addLayer(primaryLine);

    // Fit map bounds smoothly to route
    const routeBounds = L.latLngBounds(latLngs);
    this.map.fitBounds(routeBounds, {
      padding: [70, 70],
      maxZoom: 7,
      animate: true,
      duration: 1.2
    });
  }

  // --- Map Controls Actions ---

  resetMapView(): void {
    if (this.map) {
      this.map.flyTo([35.0, -10.0], 3, { duration: 1.2 });
    }
  }

  toggleAirportsLayer(): void {
    const current = this.showAirports();
    this.showAirports.set(!current);

    if (this.map) {
      if (!current) {
        this.airportMarkersLayer.addTo(this.map);
      } else {
        this.airportMarkersLayer.removeFrom(this.map);
      }
    }
  }

  toggleRoutesLayer(): void {
    const current = this.showRoutes();
    this.showRoutes.set(!current);

    if (this.map) {
      if (!current) {
        this.selectedRouteLayer.addTo(this.map);
      } else {
        this.selectedRouteLayer.removeFrom(this.map);
      }
    }
  }
}
