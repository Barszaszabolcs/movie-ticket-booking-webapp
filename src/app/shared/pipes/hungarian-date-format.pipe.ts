import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hungarianDateFormat'
})
export class HungarianDateFormatPipe implements PipeTransform {

  // Teljes hosszában íratja ki magyarul a napokat ("Hétfő")
  transform(value: any, ...args: unknown[]): string {
    const date = new Date(value);
    const locale = 'hu-HU'; // Magyar nyelv kiválasztása
    return date.toLocaleDateString(locale, { weekday: 'long' }).charAt(0).toUpperCase() +
      date.toLocaleDateString(locale, { weekday: 'long' }).slice(1);
  }
}
