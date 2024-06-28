import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { parse } from 'date-fns';
import { Observable, map, of } from "rxjs";
import { environment } from "../../environments/environment";
import { Moeda } from "../models/base.model";
import { Cotacao, ICotacao } from "../models/cotacao.models";
import { Ativo, YahooQuote } from "../models/investimento.model";
import { ativosSelectors } from "../store/investimento.selectors";
import { cotacaoActions } from "../store/cotacao.actions";

@Injectable({
    providedIn: 'root'
})
export class CotacaoService {
    readonly http = inject(HttpClient);

    getCotacoes(ativos: Ativo[]): Observable<Cotacao[]> {
        const siglas = new Map(ativos.filter(ativo => ativo.siglaYahoo)
            .map(ativo => [ativo.siglaYahoo as string, ativo]));

        const simbolo = encodeURIComponent([...siglas.keys()].join(','));

        return this.http.get<YahooQuote[]>(`${environment.apiUrl}/cotacao`, { params: { simbolo: simbolo } })
            .pipe(
                map((quotes: YahooQuote[]) => quotes.map(quote => converterDeYahooQuoteEmCotacao(quote))),
            );
    }

    setCotacao(simbolo: string, valor: number, moeda: Moeda): Observable<Cotacao> {
        console.warn(`TODO: Acrescentar método para atualizar a cotação manualmente.`)
        const cotacao = new Cotacao({
            data: new Date(),
            moeda,
            simbolo,
            valor,
            _id: crypto.randomUUID()
        })
        return of(cotacao);
    }

    atualizarCotacoesBatch() {
        return this.http.put<string[]>(`${environment.apiUrl}/cotacao/batch/cotacoes`, {});
    }

    atualizarCotacoes(store: Store): Observable<void> {
        return new Observable<void>(observer => {
            let obteveCotacao = false;
            store.select(ativosSelectors.selectAll).subscribe({
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


const converterDeYahooQuoteEmCotacao = (quote: YahooQuote): Cotacao => {
    const data: ICotacao = {
        simbolo: quote.simbolo as string,
        valor: quote.preco as number,
        moeda: quote.moeda as Moeda,
        data: parse(quote.data, "yyyy-MM-dd", new Date())
    };
    return new Cotacao(data);
}
