import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CinemaRoutingModule } from './cinema-routing.module';
import { CinemaComponent } from './cinema.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CinemaComponent
  ],
  imports: [
    CommonModule,
    CinemaRoutingModule,
    FormsModule
  ]
})
export class CinemaModule { }
