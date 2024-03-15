import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriumCreateComponent } from './auditorium-create.component';

describe('AuditoriumCreateComponent', () => {
  let component: AuditoriumCreateComponent;
  let fixture: ComponentFixture<AuditoriumCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditoriumCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditoriumCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
