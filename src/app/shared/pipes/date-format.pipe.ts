import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    let tzOffset = (new Date(value)).getTimezoneOffset() * 60000;
    let minOffset = new Date(value).getTime() - tzOffset
    let localISOTime = (new Date(minOffset)).toISOString().replace('Z', '').replace('T', ' ').split('.')[0];
    return localISOTime;
  }

}