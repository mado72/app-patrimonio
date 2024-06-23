import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Carteira, ICarteira } from '../models/investimento.model';

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {

  mock: Carteira[] = [];

  readonly http = inject(HttpClient);
  getCarteiras(): Observable<Carteira[]> {
    console.log(this.mock);
    return of([...this.mock]);
  }
  addCarteira(carteira: ICarteira): Observable<Carteira> {
    const novoItem = new Carteira(carteira);
    console.log(novoItem.identity);
    this.mock.push(novoItem);
    return of(novoItem);
  }
  updateCarteira(carteira: Carteira): Observable<Carteira> {
    console.log(carteira.identity);
    return of(carteira);
  }
  removeCarteira(carteira: Carteira): Observable<Carteira> {
    console.log(carteira.identity);
    this.mock = this.mock.filter(item=> item.identity !== carteira.identity);
    return of(carteira);
  }

}
