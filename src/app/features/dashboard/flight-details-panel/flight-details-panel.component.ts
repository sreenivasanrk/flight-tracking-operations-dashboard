import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faPlay,
  faPause,
  faPlane,
  faShieldHalved,
  faPlaneDeparture,
  faCompass,
  faGaugeHigh,
  faLocationCrosshairs,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';

import { FlightStateService } from '../../../core/services/flight-state.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Flight } from '../../../core/models/flight.model';

@Component({
  selector: 'app-flight-details-panel',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    TooltipModule,
    DividerModule,
    FontAwesomeModule,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './flight-details-panel.component.html',
  styleUrl: './flight-details-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightDetailsPanelComponent {
  private readonly flightState = inject(FlightStateService);
  private readonly router = inject(Router);

  readonly selectedFlight$ = this.flightState.selectedFlight$;
  readonly isSimulationRunning$ = this.flightState.isSimulationRunning$;

  // FontAwesome Icons
  readonly faArrowLeft = faArrowLeft;
  readonly faPlay = faPlay;
  readonly faPause = faPause;
  readonly faPlane = faPlane;
  readonly faShieldHalved = faShieldHalved;
  readonly faPlaneDeparture = faPlaneDeparture;
  readonly faCompass = faCompass;
  readonly faGaugeHigh = faGaugeHigh;
  readonly faLocationCrosshairs = faLocationCrosshairs;
  readonly faCircleInfo = faCircleInfo;

  onCloseDetails(): void {
    this.flightState.setSelectedFlight(null);
    this.router.navigate(['/dashboard']);
  }

  onFocusList(): void {
    this.flightState.filterByStatus('ALL');
  }

  toggleSimulation(): void {
    this.flightState.toggleSimulation();
  }

  getCompassDirection(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  }
}
