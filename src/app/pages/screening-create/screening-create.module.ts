import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScreeningCreateRoutingModule } from './screening-create-routing.module';
import { ScreeningCreateComponent } from './screening-create.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ScreeningCreateComponent
  ],
  imports: [
    CommonModule,
    ScreeningCreateRoutingModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ]
})
export class ScreeningCreateModule { }
