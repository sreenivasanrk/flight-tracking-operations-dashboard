import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FlightDetailsPanelComponent } from './flight-details-panel.component';
import { FlightStateService } from '../../../core/services/flight-state.service';
import { FlightService } from '../../../core/services/flight.service';

@Component({ template: '' })
class DummyComponent {}

describe('FlightDetailsPanelComponent', () => {
  let component: FlightDetailsPanelComponent;
  let fixture: ComponentFixture<FlightDetailsPanelComponent>;
  let flightState: FlightStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightDetailsPanelComponent],
      providers: [
        FlightStateService,
        FlightService,
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          { path: 'dashboard/flight/:id', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightDetailsPanelComponent);
    component = fixture.componentInstance;
    flightState = TestBed.inject(FlightStateService);
  });

  it('should create flight details panel component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate accurate compass direction from degrees', () => {
    expect(component.getCompassDirection(0)).toBe('N');
    expect(component.getCompassDirection(90)).toBe('E');
    expect(component.getCompassDirection(180)).toBe('S');
    expect(component.getCompassDirection(270)).toBe('W');
  });

  it('should clear selection on onCloseDetails', () => {
    flightState.setSelectedFlight('FL-001');
    component.onCloseDetails();
    let selected: any;
    flightState.selectedFlightId$.subscribe(id => selected = id);
    expect(selected).toBeNull();
  });
});
