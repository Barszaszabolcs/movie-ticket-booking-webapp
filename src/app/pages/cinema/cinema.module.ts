import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CinemaRoutingModule } from './cinema-routing.module';
import { CinemaComponent } from './cinema.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgImageSliderModule } from 'ng-image-slider';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    CinemaComponent
  ],
  imports: [
    CommonModule,
    CinemaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgImageSliderModule,
    FlexLayoutModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class CinemaModule { }
