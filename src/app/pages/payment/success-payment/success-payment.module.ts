import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuccessPaymentRoutingModule } from './success-payment-routing.module';
import { SuccessPaymentComponent } from './success-payment.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    SuccessPaymentComponent
  ],
  imports: [
    CommonModule,
    SuccessPaymentRoutingModule,
    MatCardModule,
    MatButtonModule,
    FlexLayoutModule,
    MatProgressSpinnerModule
  ]
})
export class SuccessPaymentModule { }
