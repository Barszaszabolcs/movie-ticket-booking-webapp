import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreatePopupComponent } from './admin-create-popup.component';

describe('AdminCreatePopupComponent', () => {
  let component: AdminCreatePopupComponent;
  let fixture: ComponentFixture<AdminCreatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCreatePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCreatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
