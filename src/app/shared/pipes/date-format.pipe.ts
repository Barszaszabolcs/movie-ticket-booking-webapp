import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    // * 60000 -> milliszekundumban számolunk
    let tzOffset = (new Date(value)).getTimezoneOffset() * 60000;
    // Kivonjuk az időzóna különbséget
    let minOffset = new Date(value).getTime() - tzOffset
    // Z-t, T-t és a milliszekundom + utáni részt kivágjuk
    let localISOTime = (new Date(minOffset)).toISOString().replace('Z', '').replace('T', ' ').split('.')[0];
    return localISOTime;
  }

}