import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Ativo } from "../models/investimento.model";
import { Observable, delay, map, of, tap } from "rxjs";
import { Cotacao, ICotacao } from "../models/cotacao.models";
import { Moeda } from "../models/base.model";
import { Store } from "@ngrx/store";
import { selectAtivoAll } from "../store/ativo.selectors";
import { cotacaoActions } from "../store/cotacao.actions";

@Injectable({
    providedIn: 'root'
})
export class CotacaoService {
    readonly http = inject(HttpClient);

    getCotacoes(ativos: Ativo[]): Observable<Cotacao[]> {
        const siglas = new Map(ativos.map(ativo => [ativo.sigla, ativo]))
        const cotacoes = [...siglas.keys()].map(sigla => new Cotacao({
            data: new Date(),
            moeda: Moeda.BRL,
            simbolo: sigla,
            valor: Math.random() * 200,
            _id: crypto.randomUUID()
        }))
        return of(cotacoes).pipe(
            delay(2_000)
        );
    }

    setCotacao(simbolo: string, valor: number, moeda: Moeda): Observable<Cotacao> {
        const cotacao = new Cotacao({
            data: new Date(),
            moeda,
            simbolo,
            valor,
            _id: crypto.randomUUID()
        })
        return of(cotacao);
    }

    atualizarCotacoes(store: Store): Observable<void> {
        return new Observable<void>(observer => {
            let obteveCotacao = false;
            store.select(selectAtivoAll).subscribe({
                next:
                    ativos => {
                        console.log(`Obtendo cotações dos ativos`, ativos);
                        if (!obteveCotacao) {
                            obteveCotacao = true;
                            store.dispatch(cotacaoActions.getCotacoes.getCotacoesExecute({ ativos }));
                            observer.next();
                            observer.complete();
                        }
                    },
                error:
                    error => {
                        observer.error(error);
                        observer.complete();
                    }
            }).unsubscribe();
        })
    }
}