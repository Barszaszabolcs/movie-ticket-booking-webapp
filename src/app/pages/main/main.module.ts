import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FilmListComponent } from '../../shared/components/film-list/film-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    MainComponent,
    FilmListComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class MainModule { }
