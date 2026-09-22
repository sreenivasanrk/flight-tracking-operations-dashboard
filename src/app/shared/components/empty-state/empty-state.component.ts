import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlane, faCompass } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule, FontAwesomeModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() title: string = 'No Flight Selected';
  @Input() message: string = 'Select a flight from the map or list panel to inspect live telemetry, waypoints, route details, and flight progress.';
  @Input() actionLabel?: string;

  @Output() actionClick = new EventEmitter<void>();

  // FontAwesome Icons
  readonly faPlane = faPlane;
  readonly faCompass = faCompass;
}
