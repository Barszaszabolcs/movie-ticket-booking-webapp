import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HungarianDateFormatPipe } from '../hungarian-date-format.pipe';



@NgModule({
  declarations: [HungarianDateFormatPipe],
  imports: [
    CommonModule
  ],
  exports: [HungarianDateFormatPipe]
})
export class SharedPipesModule { }
