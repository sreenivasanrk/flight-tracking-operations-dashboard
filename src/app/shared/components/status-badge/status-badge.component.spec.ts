import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create status badge component', () => {
    expect(component).toBeTruthy();
  });

  it('should format labels correctly for different flight statuses', () => {
    component.status = 'EN_ROUTE';
    expect(component.formattedLabel).toBe('En Route');
    expect(component.severity).toBe('success');
    expect(component.isLiveStatus).toBe(true);

    component.status = 'DELAYED';
    expect(component.formattedLabel).toBe('Delayed');
    expect(component.severity).toBe('warn');
    expect(component.isLiveStatus).toBe(true);

    component.status = 'LANDED';
    expect(component.formattedLabel).toBe('Landed');
    expect(component.severity).toBe('secondary');
    expect(component.isLiveStatus).toBe(false);
  });
});
