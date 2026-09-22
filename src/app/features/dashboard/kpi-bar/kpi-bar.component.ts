import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FlightStateService } from '../../../core/services/flight-state.service';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { FlightStatus } from '../../../core/models/flight.model';

@Component({
  selector: 'app-kpi-bar',
  standalone: true,
  imports: [CommonModule, AsyncPipe, KpiCardComponent],
  templateUrl: './kpi-bar.component.html',
  styleUrl: './kpi-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiBarComponent {
  private readonly flightState = inject(FlightStateService);

  readonly kpis$ = this.flightState.kpis$;
  readonly filters$ = this.flightState.filters$;

  onFilterStatus(status: FlightStatus | 'ALL'): void {
    this.flightState.filterByStatus(status);
  }
}
