import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnShowFilmsListComponent } from './on-show-films-list.component';

describe('OnShowFilmsListComponent', () => {
  let component: OnShowFilmsListComponent;
  let fixture: ComponentFixture<OnShowFilmsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnShowFilmsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnShowFilmsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
