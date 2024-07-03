import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Moeda } from '../models/base.model';
import { Ativo, Carteira, CarteiraAtivo, ICarteira, ICarteiraAtivo } from '../models/investimento.model';

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {

  constructor() {}

  mock: Carteira[] = [];

  readonly _http = inject(HttpClient);

  getCarteiras({moeda, classe, ativo}: {moeda?: Moeda, classe?: string, ativo?: Ativo}): Observable<Carteira[]> {
    let params = new HttpParams();
    if (!! moeda) {
      params.append('moeda', moeda);
    }
    if (!! classe) {
      params.append('classe', classe);
    }
    return this._http.get<ICarteira[]>(`${environment.apiUrl}/carteira`, { params })
      .pipe(
        map(carteiras=>carteiras.map(carteira=> new Carteira(carteira)))
      )
  }

  getCarteira(carteiraId: string) {
    return this._http.get<ICarteira>(`${environment.apiUrl}/carteira/${carteiraId}`)
      .pipe(
        map(carteira=>new Carteira(carteira))
      )
  }

  addCarteira(carteira: ICarteira): Observable<Carteira> {
    const dados : Omit<ICarteira, "ativo"> = carteira;
    return this._http.post<ICarteira>(`${environment.apiUrl}/carteira`, dados).pipe(
      map(carteira=> new Carteira(carteira))
    )
  }
  updateCarteira(carteira: ICarteira, adicionarCarteiraAtivo?: ICarteiraAtivo): Observable<Carteira> {
    const dados = {...carteira};
    dados.ativos = [...dados.ativos].map(item=>{
      item = {...item, ativo: undefined};
      return item;
    });

    return this._http.put<Carteira>(`${environment.apiUrl}/carteira`, dados);
  }
  removeCarteira(carteira: ICarteira): Observable<Carteira> {
    return this._http.delete<ICarteira>(`${environment.apiUrl}/carteira/${carteira._id as string}`).pipe(
      map(carteira=> new Carteira(carteira))
    )
  }

}
