import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgImageSliderModule } from 'ng-image-slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

import { FilmListComponent } from '../../shared/components/film-list/film-list.component';
import { OnShowFilmsListComponent } from '../../shared/components/on-show-films-list/on-show-films-list.component';
import { SpecialEffectFilmsListComponent } from '../../shared/components/special-effect-films-list/special-effect-films-list.component';


@NgModule({
  declarations: [
    MainComponent,
    FilmListComponent,
    OnShowFilmsListComponent,
    SpecialEffectFilmsListComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    NgImageSliderModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    MatInputModule
  ]
})
export class MainModule { }
