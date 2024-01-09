import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilmCreateRoutingModule } from './film-create-routing.module';
import { FilmCreateComponent } from './film-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    FilmCreateComponent
  ],
  imports: [
    CommonModule,
    FilmCreateRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    FlexLayoutModule
  ]
})
export class FilmCreateModule { }
