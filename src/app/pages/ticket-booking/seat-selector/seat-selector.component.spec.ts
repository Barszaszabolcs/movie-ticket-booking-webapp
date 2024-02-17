import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatSelectorComponent } from './seat-selector.component';

describe('SeatSelectorComponent', () => {
  let component: SeatSelectorComponent;
  let fixture: ComponentFixture<SeatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeatSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
