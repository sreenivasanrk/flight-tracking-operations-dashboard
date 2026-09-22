import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { FlightStatus } from '../../../core/models/flight.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: FlightStatus | string = 'SCHEDULED';
  @Input() showPulse: boolean = true;
  @Input() rounded: boolean = true;
  @Input() size: 'small' | 'normal' | 'large' = 'normal';

  get isLiveStatus(): boolean {
    return ['EN_ROUTE', 'APPROACHING', 'BOARDING', 'DELAYED'].includes(this.status);
  }

  get formattedLabel(): string {
    switch (this.status) {
      case 'EN_ROUTE': return 'En Route';
      case 'APPROACHING': return 'Approaching';
      case 'BOARDING': return 'Boarding';
      case 'DEPARTED': return 'Departed';
      case 'LANDED': return 'Landed';
      case 'DELAYED': return 'Delayed';
      case 'SCHEDULED': return 'Scheduled';
      case 'CANCELLED': return 'Cancelled';
      case 'DIVERTED': return 'Diverted';
      default: return this.status;
    }
  }

  get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (this.status) {
      case 'EN_ROUTE':
      case 'APPROACHING':
        return 'success';
      case 'BOARDING':
      case 'DEPARTED':
        return 'info';
      case 'DELAYED':
        return 'warn';
      case 'CANCELLED':
      case 'DIVERTED':
        return 'danger';
      case 'LANDED':
      case 'SCHEDULED':
      default:
        return 'secondary';
    }
  }

  get customTagStyle(): Record<string, string> {
    const base: Record<string, string> = {
      'font-weight': '600',
      'letter-spacing': '0.3px',
      'text-transform': 'uppercase',
      'font-size': this.size === 'small' ? '0.7rem' : this.size === 'large' ? '0.9rem' : '0.75rem',
      'padding': this.size === 'small' ? '0.15rem 0.5rem' : '0.25rem 0.65rem'
    };

    if (this.status === 'EN_ROUTE') {
      base['background'] = 'rgba(16, 185, 129, 0.15)';
      base['color'] = '#34d399';
      base['border'] = '1px solid rgba(16, 185, 129, 0.3)';
    } else if (this.status === 'DELAYED') {
      base['background'] = 'rgba(245, 158, 11, 0.15)';
      base['color'] = '#fbbf24';
      base['border'] = '1px solid rgba(245, 158, 11, 0.35)';
    } else if (this.status === 'APPROACHING') {
      base['background'] = 'rgba(56, 189, 248, 0.15)';
      base['color'] = '#38bdf8';
      base['border'] = '1px solid rgba(56, 189, 248, 0.3)';
    }

    return base;
  }
}
