import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  it('should initialize with dark theme as default', () => {
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('should toggle theme from dark to light and back', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBe(false);

    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });
});
