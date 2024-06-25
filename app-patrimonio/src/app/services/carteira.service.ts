import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, of } from 'rxjs';
import { Ativo, Carteira, CarteiraAtivo, ICarteira } from '../models/investimento.model';
import { selectAtivoAll } from '../store/ativo.selectors';

type CarteiraAtivoSemAtivo = Omit<CarteiraAtivo, "ativo"> & {ativo?: Ativo};
@Injectable({
  providedIn: 'root'
})
export class CarteiraService {

  constructor(
    private store: Store
  ) {}

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
    const c = carteira.ativos.map(ativo=>ativo as CarteiraAtivoSemAtivo);
    c.forEach(i=>{
      if (! i.ativo ) {
        throw JSON.stringify(i);
      }
    })
    return of(carteira);
  }
  removeCarteira(carteira: Carteira): Observable<Carteira> {
    console.log(carteira.identity);
    this.mock = this.mock.filter(item=> item.identity !== carteira.identity);
    return of(carteira);
  }
  loadCarteiraAtivos(carteira: Carteira): Observable<Carteira> {
    return this.store.select(selectAtivoAll).pipe(
      map(ativos=>{
        const ativosId = carteira.ativos.map(ativo=>ativo?.ativoId);
        const mapAtivos = new Map(ativos
          .filter(ativo=>ativo._id && ativosId.includes(ativo._id))
          .map(ativo=>[ativo._id as string, ativo]));

        carteira.ativos.forEach(carteiraAtivo=>{
          carteiraAtivo.ativo = mapAtivos.get(carteiraAtivo.ativoId);
        });
        return carteira;
      }))
  }

}
