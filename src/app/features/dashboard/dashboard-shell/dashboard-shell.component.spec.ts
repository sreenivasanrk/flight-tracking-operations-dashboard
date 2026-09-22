import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardShellComponent } from './dashboard-shell.component';
import { FlightStateService } from '../../../core/services/flight-state.service';
import { FlightService } from '../../../core/services/flight.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('DashboardShellComponent', () => {
  let component: DashboardShellComponent;
  let fixture: ComponentFixture<DashboardShellComponent>;
  let themeService: ThemeService;
  let flightState: FlightStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardShellComponent],
      providers: [FlightStateService, FlightService, ThemeService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardShellComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    flightState = TestBed.inject(FlightStateService);
  });

  it('should create dashboard shell component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle tab change', () => {
    expect(component.activeTab()).toBe('list');
    component.onTabChange('details');
    expect(component.activeTab()).toBe('details');
  });

  it('should toggle theme through ThemeService', () => {
    themeService.setTheme('dark');
    expect(component.isDarkMode()).toBe(true);

    component.toggleTheme();
    expect(component.isDarkMode()).toBe(false);
  });
});
