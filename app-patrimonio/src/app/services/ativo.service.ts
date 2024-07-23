import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../environments/environment";
import { Ativo, IAtivo } from "../models/investimento.model";

export type FilterAtivos = {
    termo?: string,
    in?: string[]
}

@Injectable({
    providedIn: 'root'
})
export class AtivoService {
    readonly http = inject(HttpClient);

    private _http = inject(HttpClient);

    getAtivos(filter?: FilterAtivos): Observable<Ativo[]> {
        const params = new HttpParams();
        if (filter?.termo) {
            params.append("nome", filter.termo);
        }
        if (filter?.in) {
            filter.in.forEach(id=>{
                params.append("in", id);
            })
        }
        
        return this._http.get<IAtivo[]>(`${environment.apiUrl}/ativo`, { params })
            .pipe(
                map(ativos => ativos.map(ativo => new Ativo(ativo)))
            )
    }
    addAtivo(ativo: IAtivo): Observable<Ativo> {
        return this._http.post<IAtivo>(`${environment.apiUrl}/ativo`, ativo)
            .pipe(
                map(ativo => new Ativo(ativo))
            )
    }
    updateAtivo(ativo: Ativo): Observable<Ativo> {
        const data = { ...ativo };
        const cotacao = ativo.cotacao;
        delete data.cotacao;
        return this._http.put<IAtivo>(`${environment.apiUrl}/ativo`, data)
            .pipe(
                map(ativo => new Ativo(ativo, cotacao))
            )
    }
    removeAtivo(ativo: Ativo): Observable<Ativo> {
        return this._http.delete<IAtivo>(`${environment.apiUrl}/ativo/id/${ativo._id}`)
            .pipe(
                map(ativo => new Ativo(ativo))
            )
    }

}
