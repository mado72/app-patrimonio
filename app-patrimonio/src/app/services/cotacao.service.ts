import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { parse } from 'date-fns';
import { Observable, map, of } from "rxjs";
import { environment } from "../../environments/environment";
import { Moeda } from "../models/base.model";
import { Cotacao, ICotacao } from "../models/cotacao.models";
import { Ativo, YahooQuote } from "../models/investimento.model";


export type InfoCotacaoBatch = {
    data: Date,
    total: number,
    processados: number,
    erros: number,
    status: string
}



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
        return this.http.put<string>(`${environment.apiUrl}/cotacao/batch/cotacoes`, {});
    }

    obterInfoCotacoesBatch() {
        return this.http.get<Map<string, InfoCotacaoBatch>>(`${environment.apiUrl}/cotacao/batch/cotacoes`);
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
