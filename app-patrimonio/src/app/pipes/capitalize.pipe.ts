import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    if (!value) return value;
    return value.split(' ').map(s=>`${s[0].toLocaleUpperCase()}${s.slice(1).toLocaleLowerCase()}`).join(' ');
  }

}
