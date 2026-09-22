import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-shell/dashboard-shell.component').then(
        m => m.DashboardShellComponent
      )
  },
  {
    path: 'dashboard/flight/:id',
    loadComponent: () =>
      import('./features/dashboard/dashboard-shell/dashboard-shell.component').then(
        m => m.DashboardShellComponent
      )
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
