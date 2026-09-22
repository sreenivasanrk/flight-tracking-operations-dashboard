import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMagnifyingGlass,
  faFilterCircleXmark,
  faFilter,
  faPlaneDeparture,
  faCircleQuestion
} from '@fortawesome/free-solid-svg-icons';

import { FlightStateService } from '../../../core/services/flight-state.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Flight } from '../../../core/models/flight.model';

@Component({
  selector: 'app-flight-list-panel',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    FontAwesomeModule,
    StatusBadgeComponent
  ],
  templateUrl: './flight-list-panel.component.html',
  styleUrl: './flight-list-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightListPanelComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly flightState = inject(FlightStateService);
  private readonly router = inject(Router);

  readonly filteredFlights$ = this.flightState.filteredFlights$;
  readonly selectedFlightId$ = this.flightState.selectedFlightId$;
  readonly availableStatuses$ = this.flightState.availableStatuses$;
  readonly availableOrigins$ = this.flightState.availableOrigins$;
  readonly availableDestinations$ = this.flightState.availableDestinations$;

  // FontAwesome Icons
  readonly faMagnifyingGlass = faMagnifyingGlass;
  readonly faFilterCircleXmark = faFilterCircleXmark;
  readonly faFilter = faFilter;
  readonly faPlaneDeparture = faPlaneDeparture;
  readonly faCircleQuestion = faCircleQuestion;

  filterForm: FormGroup = this.fb.group({
    searchQuery: [''],
    status: ['ALL'],
    originIata: ['ALL'],
    destinationIata: ['ALL']
  });

  private formSub?: Subscription;

  ngOnInit(): void {
    // Synchronize form value changes into state store with light debounce
    this.formSub = this.filterForm.valueChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(val => {
        this.flightState.updateFilter({
          searchQuery: val.searchQuery,
          status: val.status,
          originIata: val.originIata,
          destinationIata: val.destinationIata
        });
      });

    // Synchronize external filter state changes (e.g. from KPI cards) back to the form controls
    this.flightState.filters$.subscribe(filters => {
      this.filterForm.patchValue(
        {
          searchQuery: filters.searchQuery || '',
          status: filters.status || 'ALL',
          originIata: filters.originIata || 'ALL',
          destinationIata: filters.destinationIata || 'ALL'
        },
        { emitEvent: false }
      );
    });
  }

  ngOnDestroy(): void {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  isFiltersActive(): boolean {
    const val = this.filterForm.value;
    return Boolean(
      (val.searchQuery && val.searchQuery.trim().length > 0) ||
      (val.status && val.status !== 'ALL') ||
      (val.originIata && val.originIata !== 'ALL') ||
      (val.destinationIata && val.destinationIata !== 'ALL')
    );
  }

  resetFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      status: 'ALL',
      originIata: 'ALL',
      destinationIata: 'ALL'
    });
    this.flightState.resetFilters();
  }

  onSelectFlight(flight: Flight): void {
    this.flightState.setSelectedFlight(flight.id);
    this.router.navigate(['/dashboard', 'flight', flight.id]);
  }
}
