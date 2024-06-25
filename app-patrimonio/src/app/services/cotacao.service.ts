import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Ativo } from "../models/investimento.model";
import { Observable, map, of } from "rxjs";
import { Cotacao, ICotacao } from "../models/cotacao.models";
import { Moeda } from "../models/base.model";

@Injectable({
    providedIn: 'root'
})
export class CotacaoService {
    readonly http = inject(HttpClient);

    getCotacoes(ativos: Ativo[]) : Observable<Ativo[]> {
        const siglas = new Map(ativos.map(ativo=>[ativo.sigla, ativo]))
        const cotacoes = [...siglas.keys()].map(sigla=>new Cotacao({
            data: new Date(),
            moeda: Moeda.BRL,
            simbolo: sigla,
            valor: Math.random() * 200,
            _id: crypto.randomUUID()
        }))
        return of(cotacoes).pipe(
            map(cotacoes=>cotacoes.map(cotacao=>{
                const ativo = siglas.get(cotacao.simbolo) as Ativo;
                ativo.cotacao = cotacao;
                return ativo;
            }))
        )
    }

    setCotacao(ativo: Ativo, valor: number): Observable<Cotacao> {
        ativo.cotacao = new Cotacao({
            data: new Date(),
            moeda: ativo.moeda,
            simbolo: ativo.sigla,
            valor,
            _id: crypto.randomUUID()
        })
        return of(ativo.cotacao as Cotacao);
    }
}