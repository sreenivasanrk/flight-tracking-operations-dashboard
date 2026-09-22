import { Injectable, signal, computed, effect } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'flight_tracker_theme';
  
  // Signal for reactive UI consumption
  readonly currentTheme = signal<AppTheme>('dark');
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    let initialTheme: AppTheme = 'dark';
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(this.THEME_STORAGE_KEY) as AppTheme | null : null;
      if (saved === 'light' || saved === 'dark') {
        initialTheme = saved;
      }
    } catch {
      // ignore storage errors
    }
    this.currentTheme.set(initialTheme);

    // Apply class to HTML element whenever theme changes
    effect(() => {
      const isDarkMode = this.isDark();
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (isDarkMode) {
          root.classList.add('app-dark');
          root.classList.remove('app-light');
        } else {
          root.classList.add('app-light');
          root.classList.remove('app-dark');
        }
      }
    });
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.THEME_STORAGE_KEY, theme);
      }
    } catch {
      // ignore storage errors
    }
  }
}
