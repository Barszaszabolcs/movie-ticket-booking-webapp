import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketBookingComponent } from './ticket-booking.component';

const routes: Routes = [{ path: ':screeningId', component: TicketBookingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketBookingRoutingModule { }
