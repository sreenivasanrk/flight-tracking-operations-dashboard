import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlane,
  faTowerBroadcast,
  faClock,
  faCircleCheck,
  faTriangleExclamation,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, CardModule, FontAwesomeModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) value: number | string = 0;
  @Input() subtitle?: string;
  @Input() trend?: string;
  @Input() trendType: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() iconType: 'plane' | 'radar' | 'clock' | 'check' | 'alert' = 'plane';
  @Input() colorScheme: 'sky' | 'emerald' | 'amber' | 'indigo' | 'slate' = 'sky';
  @Input() isActive: boolean = false;
  @Input() clickable: boolean = true;

  @Output() cardClick = new EventEmitter<void>();

  // FontAwesome Icons
  readonly faPlane = faPlane;
  readonly faTowerBroadcast = faTowerBroadcast;
  readonly faClock = faClock;
  readonly faCircleCheck = faCircleCheck;
  readonly faTriangleExclamation = faTriangleExclamation;

  onClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }

  get colorSchemeClass(): string {
    return `scheme-${this.colorScheme}`;
  }

  get trendClass(): string {
    if (this.trendType === 'up') return 'text-green-500';
    if (this.trendType === 'down') return 'text-red-500';
    return 'text-muted';
  }

  get icon(): IconDefinition {
    switch (this.iconType) {
      case 'plane':
        return this.faPlane;
      case 'radar':
        return this.faTowerBroadcast;
      case 'clock':
        return this.faClock;
      case 'check':
        return this.faCircleCheck;
      case 'alert':
        return this.faTriangleExclamation;
      default:
        return this.faPlane;
    }
  }
}
