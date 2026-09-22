import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FlightMapComponent } from './flight-map.component';
import { FlightStateService } from '../../../core/services/flight-state.service';
import { FlightService } from '../../../core/services/flight.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('FlightMapComponent', () => {
  let component: FlightMapComponent;
  let fixture: ComponentFixture<FlightMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightMapComponent],
      providers: [FlightStateService, FlightService, ThemeService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightMapComponent);
    component = fixture.componentInstance;
  });

  it('should create flight map component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle airports layer state signal', () => {
    expect(component.showAirports()).toBe(true);
    component.toggleAirportsLayer();
    expect(component.showAirports()).toBe(false);
  });

  it('should toggle routes layer state signal', () => {
    expect(component.showRoutes()).toBe(true);
    component.toggleRoutesLayer();
    expect(component.showRoutes()).toBe(false);
  });
});
