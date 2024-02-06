import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScreeningCreateComponent } from './screening-create.component';

const routes: Routes = [{ path: '', component: ScreeningCreateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScreeningCreateRoutingModule { }
