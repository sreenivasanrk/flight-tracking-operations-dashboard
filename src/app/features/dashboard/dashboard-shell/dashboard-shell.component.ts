import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { SplitterModule, SplitterResizeEndEvent } from 'primeng/splitter';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

import { FlightStateService } from '../../../core/services/flight-state.service';
import { ThemeService } from '../../../core/services/theme.service';
import { KpiBarComponent } from '../kpi-bar/kpi-bar.component';
import { FlightMapComponent } from '../flight-map/flight-map.component';
import { FlightListPanelComponent } from '../flight-list-panel/flight-list-panel.component';
import { FlightDetailsPanelComponent } from '../flight-details-panel/flight-details-panel.component';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DatePipe,
    ToolbarModule,
    ButtonModule,
    SplitterModule,
    DrawerModule,
    TooltipModule,
    TabsModule,
    FontAwesomeModule,
    KpiBarComponent,
    FlightMapComponent,
    FlightListPanelComponent,
    FlightDetailsPanelComponent
  ],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardShellComponent implements OnInit, OnDestroy {
  @ViewChild('desktopMap') desktopMap?: FlightMapComponent;
  @ViewChild('mobileMap') mobileMap?: FlightMapComponent;

  private readonly flightState = inject(FlightStateService);
  private readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly filteredFlights$ = this.flightState.filteredFlights$;
  readonly isSimulationRunning$ = this.flightState.isSimulationRunning$;
  readonly simulationSpeed$ = this.flightState.simulationSpeed$;

  readonly isDarkMode = this.themeService.isDark;
  readonly drawerVisible = signal<boolean>(false);

  // FontAwesome Icons
  readonly faSun = faSun;
  readonly faMoon = faMoon;
  readonly activeTab = signal<string | number | undefined>('list');
  readonly currentUtcTime = signal<Date>(new Date());

  private subscriptions: Subscription[] = [];

  onTabChange(tab: string | number | undefined): void {
    if (tab !== undefined) {
      this.activeTab.set(tab);
    }
  }

  ngOnInit(): void {
    // Sync UTC Clock every second
    const clockSub = interval(1000).subscribe(() => {
      this.currentUtcTime.set(new Date());
    });
    this.subscriptions.push(clockSub);

    // Sync Route parameter `/dashboard/flight/:id` with state store
    const routeSub = this.route.paramMap.subscribe(params => {
      const flightId = params.get('id');
      if (flightId) {
        this.flightState.setSelectedFlight(flightId);
        this.activeTab.set('details');
      }
    });
    this.subscriptions.push(routeSub);

    // When flight selection changes in store, auto-switch tab to 'details' if selected
    const selectSub = this.flightState.selectedFlightId$.subscribe(selectedId => {
      if (selectedId) {
        this.activeTab.set('details');
      }
    });
    this.subscriptions.push(selectSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSimulation(): void {
    this.flightState.toggleSimulation();
  }

  cycleSimulationSpeed(): void {
    const speeds = [1, 2, 5];
    const currentSpeed = (this.flightState as any).simulationSpeedSubject?.value || 1;
    const nextIndex = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
    this.flightState.setSimulationSpeed(speeds[nextIndex]);
  }

  onSplitterResize(event: SplitterResizeEndEvent): void {
    this.desktopMap?.invalidateSize();
  }
}
