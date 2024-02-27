import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentEditPopupComponent } from './comment-edit-popup.component';

describe('CommentEditPopupComponent', () => {
  let component: CommentEditPopupComponent;
  let fixture: ComponentFixture<CommentEditPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentEditPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
