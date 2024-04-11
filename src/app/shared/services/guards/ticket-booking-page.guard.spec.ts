import { TestBed } from '@angular/core/testing';

import { TicketBookingPageGuard } from './ticket-booking-page.guard';

describe('TicketBookingPageGuard', () => {
  let guard: TicketBookingPageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TicketBookingPageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
