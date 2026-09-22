import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    component.title = 'Active Flights';
    component.value = 12;
  });

  it('should create KPI card component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cardClick event on click when clickable', () => {
    let emitted = false;
    component.cardClick.subscribe(() => {
      emitted = true;
    });

    component.clickable = true;
    component.onClick();
    expect(emitted).toBe(true);
  });

  it('should return appropriate color scheme CSS class', () => {
    component.colorScheme = 'emerald';
    expect(component.colorSchemeClass).toBe('scheme-emerald');

    component.colorScheme = 'amber';
    expect(component.colorSchemeClass).toBe('scheme-amber');
  });
});
