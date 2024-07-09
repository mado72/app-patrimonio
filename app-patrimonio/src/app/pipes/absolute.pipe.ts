import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'absolute',
  standalone: true
})
export class AbsolutePipe implements PipeTransform {

  transform(value: number, signal : boolean = false): number | string {
    if (signal) {
      if (isNaN(value)) return NaN
      const isNegative = value < 0
      return isNegative? '-' : '';
    }
    return Math.abs(value);
  }

}
