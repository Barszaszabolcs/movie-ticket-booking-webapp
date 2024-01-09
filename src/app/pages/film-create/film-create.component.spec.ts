import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmCreateComponent } from './film-create.component';

describe('FilmCreateComponent', () => {
  let component: FilmCreateComponent;
  let fixture: ComponentFixture<FilmCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilmCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilmCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
