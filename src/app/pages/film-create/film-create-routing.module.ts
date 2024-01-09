import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilmCreateComponent } from './film-create.component';

const routes: Routes = [{ path: '', component: FilmCreateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilmCreateRoutingModule { }
