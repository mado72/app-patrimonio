import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Conta, IConta } from '../models/conta.model';
import { environment } from '../../environments/environment';
import { Moeda } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class ContaService {

  constructor(
    private _http: HttpClient
  ) { }

  obterContas(): Observable<Conta[]> {
    return this._http.get<IConta[]>(`${environment.apiUrl}/conta`).pipe(
      map(contas=>contas.map(item=>new Conta(item)).sort((a,b)=>a.conta.localeCompare(b.conta))),
      tap(console.log)
    );
  }

  salvarConta(conta: Conta) {
    if (!conta._id) {
      return this._http.post<Conta>(`${environment.apiUrl}/conta`, conta)
        .pipe(
          map(item => new Conta(item))
        )
    }
    return this._http.put<Conta>(`${environment.apiUrl}/conta`, conta)
      .pipe(
        map(item => new Conta(item))
      )
  }

  excluirConta(conta: Conta) {
    return this._http.delete<IConta>(`${environment.apiUrl}/conta/${conta._id}`)
     .pipe(
        map(item => new Conta(item))
      );
  }

  converterSaldoParaMoeda(conta: Conta, moeda: Moeda) : number {
    return conta.saldo;
    // TODO Utilizar mecanismo para calcular a cotação de uma moeda para real
  }

}
