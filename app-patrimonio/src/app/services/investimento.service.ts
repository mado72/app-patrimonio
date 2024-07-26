import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Provento, Retirada } from '../models/investimento.model';
import { environment } from '../../environments/environment';
import { format } from 'date-fns';
import { AporteDB } from '../models/aportes.model';

@Injectable({
  providedIn: 'root'
})
export class InvestimentoService {

  private http = inject(HttpClient);

  constructor() { }

  obterAportes({idCarteira, data}: {idCarteira?: string, data?: string}) {
    const params = new HttpParams();
    if (idCarteira) params.set('idCarteira', idCarteira);
    if (data) params.set('data', data);

    return this.http.get<AporteDB[]>(`${environment.apiUrl}/aporte`, { params })
  }

  salvarAporte(aporte: AporteDB) {
    return this.http.post<AporteDB>(`${environment.apiUrl}/aporte`, aporte);
  }

  atualizarAporte(aporte: AporteDB) {
    return this.http.put<AporteDB>(`${environment.apiUrl}/aporte/${aporte._id}`, aporte);
  }

  removerAporte(aporte: AporteDB) {
    return this.http.delete<void>(`${environment.apiUrl}/aporte/${aporte._id}`);
  }

  obterProventos(dataInicio: Date, dataFinal: Date, agregado?: boolean) {
    const params = new HttpParams()
     .set('dataInicio', format(dataInicio, 'yyyy-MM-dd'))
     .set('dataFinal', format(dataFinal, 'yyyy-MM-dd'))
     .set('agregado', agregado? 'true' : 'false');
    
    return this.http.get<Provento[]>(`${environment.apiUrl}/provento`, { params });
  }

  salvarProvento(provento: Provento) {
    return this.http.post<Provento>(`${environment.apiUrl}/provento`, provento);
  }

  atualizarProvento(provento: Provento) {
    return this.http.put<Provento>(`${environment.apiUrl}/provento/${provento._id}`, provento);
  }

  removerProvento(provento: Provento) {
    return this.http.delete<void>(`${environment.apiUrl}/provento/${provento._id}`);
  }

  obterRetiradas(dataInicio: Date, dataFinal: Date) {
    const params = new HttpParams()
      .set('dataInicio', format(dataInicio, 'yyyy-MM-dd'))
      .set('dataFinal', format(dataFinal, 'yyyy-MM-dd'));
    return this.http.get<Retirada[]>(`${environment.apiUrl}/retirada`, {params});
  }

  salvarRetirada(retirada: Retirada) {
    return this.http.post<Retirada>(`${environment.apiUrl}/retirada`, retirada);
  }

  atualizarRetirada(retirada: Retirada) {
    return this.http.put<Retirada>(`${environment.apiUrl}/retirada/${retirada._id}`, retirada);
  }

  removerRetirada(retirada: Retirada) {
    return this.http.delete<void>(`${environment.apiUrl}/retirada/${retirada._id}`);
  }
}
