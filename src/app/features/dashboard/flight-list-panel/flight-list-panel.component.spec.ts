import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FlightListPanelComponent } from './flight-list-panel.component';
import { FlightStateService } from '../../../core/services/flight-state.service';
import { FlightService } from '../../../core/services/flight.service';

describe('FlightListPanelComponent', () => {
  let component: FlightListPanelComponent;
  let fixture: ComponentFixture<FlightListPanelComponent>;
  let flightState: FlightStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightListPanelComponent],
      providers: [FlightStateService, FlightService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightListPanelComponent);
    component = fixture.componentInstance;
    flightState = TestBed.inject(FlightStateService);
    fixture.detectChanges();
  });

  it('should create flight list panel component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filter form with default values', () => {
    expect(component.filterForm.value.searchQuery).toBe('');
    expect(component.filterForm.value.status).toBe('ALL');
    expect(component.filterForm.value.originIata).toBe('ALL');
    expect(component.filterForm.value.destinationIata).toBe('ALL');
  });

  it('should reset filters on resetFilters call', () => {
    component.filterForm.patchValue({ searchQuery: 'BAW178', status: 'DELAYED' });
    expect(component.isFiltersActive()).toBe(true);

    component.resetFilters();
    expect(component.filterForm.value.searchQuery).toBe('');
    expect(component.filterForm.value.status).toBe('ALL');
    expect(component.isFiltersActive()).toBe(false);
  });
});
