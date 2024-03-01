import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancelPaymentRoutingModule } from './cancel-payment-routing.module';
import { CancelPaymentComponent } from './cancel-payment.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    CancelPaymentComponent
  ],
  imports: [
    CommonModule,
    CancelPaymentRoutingModule,
    MatCardModule,
    MatButtonModule,
    FlexLayoutModule
  ]
})
export class CancelPaymentModule { }
