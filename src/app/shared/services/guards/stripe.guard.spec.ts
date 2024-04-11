import { TestBed } from '@angular/core/testing';

import { StripeGuard } from './stripe.guard';

describe('StripeGuard', () => {
  let guard: StripeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(StripeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
