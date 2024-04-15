import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuditoriumCreateRoutingModule } from './auditorium-create-routing.module';
import { AuditoriumCreateComponent } from './auditorium-create.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    AuditoriumCreateComponent
  ],
  imports: [
    CommonModule,
    AuditoriumCreateRoutingModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ]
})
export class AuditoriumCreateModule { }
