import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditoriumCreateComponent } from './auditorium-create.component';

const routes: Routes = [{ path: '', component: AuditoriumCreateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditoriumCreateRoutingModule { }
