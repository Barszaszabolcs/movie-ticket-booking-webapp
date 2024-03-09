import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListUsersRoutingModule } from './list-users-routing.module';
import { ListUsersComponent } from './list-users.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { AdminCreatePopupComponent } from './admin-create-popup/admin-create-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';


@NgModule({
  declarations: [
    ListUsersComponent,
    AdminCreatePopupComponent
  ],
  imports: [
    CommonModule,
    ListUsersRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatDialogModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ]
})
export class ListUsersModule { }
