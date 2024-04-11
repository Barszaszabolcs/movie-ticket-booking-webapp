import { TestBed } from '@angular/core/testing';

import { FilmPageGuard } from './film-page.guard';

describe('FilmPageGuard', () => {
  let guard: FilmPageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FilmPageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
