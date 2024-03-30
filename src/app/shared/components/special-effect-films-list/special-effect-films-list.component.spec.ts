import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialEffectFilmsListComponent } from './special-effect-films-list.component';

describe('SpecialEffectFilmsListComponent', () => {
  let component: SpecialEffectFilmsListComponent;
  let fixture: ComponentFixture<SpecialEffectFilmsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialEffectFilmsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialEffectFilmsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
