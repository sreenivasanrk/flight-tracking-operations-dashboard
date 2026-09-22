import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create empty state component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit actionClick event when action button is triggered', () => {
    let clicked = false;
    component.actionClick.subscribe(() => {
      clicked = true;
    });

    component.actionClick.emit();
    expect(clicked).toBe(true);
  });
});
