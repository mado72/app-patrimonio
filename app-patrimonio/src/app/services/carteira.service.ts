import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, of } from 'rxjs';
import { Ativo, Carteira, CarteiraAtivo, ICarteira } from '../models/investimento.model';
import { selectAtivoAll } from '../store/ativo.selectors';
import { Moeda } from '../models/base.model';
import { environment } from '../../environments/environment';

type CarteiraAtivoSemAtivo = Omit<CarteiraAtivo, "ativo"> & {ativo?: Ativo};
@Injectable({
  providedIn: 'root'
})
export class CarteiraService {

  constructor(
    private store: Store
  ) {}

  mock: Carteira[] = [];

  readonly _http = inject(HttpClient);

  getCarteiras(filtro?: {moeda?: Moeda, classe?: string}): Observable<Carteira[]> {
    let params = new HttpParams();
    if (!! filtro?.moeda) {
      params.append('moeda', filtro?.moeda);
    }
    if (!! filtro?.classe) {
      params.append('classe', filtro?.classe);
    }
    return this._http.get<ICarteira[]>(`${environment.apiUrl}/carteira`, { params })
      .pipe(
        map(carteiras=>carteiras.map(carteira=> new Carteira(carteira)))
      )
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
