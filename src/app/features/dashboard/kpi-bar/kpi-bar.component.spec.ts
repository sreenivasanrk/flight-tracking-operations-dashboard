import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiBarComponent } from './kpi-bar.component';
import { FlightStateService } from '../../../core/services/flight-state.service';
import { FlightService } from '../../../core/services/flight.service';

describe('KpiBarComponent', () => {
  let component: KpiBarComponent;
  let fixture: ComponentFixture<KpiBarComponent>;
  let flightState: FlightStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiBarComponent],
      providers: [FlightStateService, FlightService]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiBarComponent);
    component = fixture.componentInstance;
    flightState = TestBed.inject(FlightStateService);
  });

  it('should create KPI bar component', () => {
    expect(component).toBeTruthy();
  });

  it('should delegate status filter clicks to FlightStateService', () => {
    component.onFilterStatus('DELAYED');
    let currentFilter: any;
    flightState.filters$.subscribe(f => currentFilter = f);
    expect(currentFilter.status).toBe('DELAYED');
  });
});
