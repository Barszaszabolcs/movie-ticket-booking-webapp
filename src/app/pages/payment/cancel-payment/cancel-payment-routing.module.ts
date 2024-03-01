import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CancelPaymentComponent } from './cancel-payment.component';

const routes: Routes = [{ path: '', component: CancelPaymentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CancelPaymentRoutingModule { }
