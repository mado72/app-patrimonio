import { formatCurrency } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numFormat',
  standalone: true
})
export class NumFormatPipe implements PipeTransform {

  transform(value: number, locale: string, currency: string, currencyCode?: string | undefined, digitsInfo?: string | undefined): string {
    if (!value || isNaN(value)) return "-";

    let negative = value < 0;

    let valor = formatCurrency(Math.abs(value), locale || 'pt', currency || 'BRL', currencyCode, digitsInfo);

    if (negative) {
      valor = `(${valor})`;
    }
    return valor;
  }

}
