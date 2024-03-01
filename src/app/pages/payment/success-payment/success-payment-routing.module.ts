import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuccessPaymentComponent } from './success-payment.component';

const routes: Routes = [{ path: '', component: SuccessPaymentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuccessPaymentRoutingModule { }
