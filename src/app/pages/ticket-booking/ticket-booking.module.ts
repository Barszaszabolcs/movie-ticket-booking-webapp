import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketBookingRoutingModule } from './ticket-booking-routing.module';
import { TicketBookingComponent } from './ticket-booking.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { SeatSelectorComponent } from './seat-selector/seat-selector.component';


@NgModule({
  declarations: [
    TicketBookingComponent,
    SeatSelectorComponent
  ],
  imports: [
    CommonModule,
    TicketBookingRoutingModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule
  ]
})
export class TicketBookingModule { }
