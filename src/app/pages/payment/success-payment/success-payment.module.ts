import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuccessPaymentRoutingModule } from './success-payment-routing.module';
import { SuccessPaymentComponent } from './success-payment.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    SuccessPaymentComponent
  ],
  imports: [
    CommonModule,
    SuccessPaymentRoutingModule,
    MatCardModule,
    MatButtonModule,
    FlexLayoutModule
  ]
})
export class SuccessPaymentModule { }
