import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningCreateComponent } from './screening-create.component';

describe('ScreeningCreateComponent', () => {
  let component: ScreeningCreateComponent;
  let fixture: ComponentFixture<ScreeningCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreeningCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreeningCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
