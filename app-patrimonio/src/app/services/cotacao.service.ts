import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { format, parse } from 'date-fns';
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

export type InicioCotacaoBatch = {
    data: Date,
    siglas: string[],
    uuid: string
}



@Injectable({
    providedIn: 'root'
})
export class CotacaoService {
    readonly http = inject(HttpClient);

    getCotacoes(ativos: Ativo[]): Observable<Cotacao[]> {
        const siglas = ativos.map(ativo => ativo.siglaYahoo || ativo.sigla);

        const simbolos = encodeURIComponent([...siglas.values()].join(','));

        return this.http.get<YahooQuote[]>(`${environment.apiUrl}/cotacao`, { params: { simbolo: simbolos } })
            .pipe(
                map((quotes: YahooQuote[]) => quotes.map(quote => converterDeYahooQuoteEmCotacao(quote))),
            );
    }

    setCotacao(simbolo: string, valor: number, moeda: Moeda): Observable<Cotacao> {
        simbolo = simbolo.trim();
        const cotacao ={
            data: format(new Date(), 'yyyy-MM-dd'),
            moeda,
            simbolo,
            preco: valor,
            manual: true
        }
        return this.http.post<ICotacao>(`${environment.apiUrl}/cotacao`, cotacao).pipe(
            map(cotacao => new Cotacao(cotacao))
        )
    }

    atualizarCotacoesBatch() {
        return this.http.put<InicioCotacaoBatch>(`${environment.apiUrl}/cotacao/batch/cotacoes`, {});
    }

    obterInfoCotacoesBatch(key: InicioCotacaoBatch) {
        return this.http.get<any>(`${environment.apiUrl}/cotacao/batch/cotacoes`).pipe(
            map(infoCotacoesBatch => {
                console.debug(`Processando ${key.uuid}`);
                const info = infoCotacoesBatch[key.uuid] as InfoCotacaoBatch;
                return info;
            })
        );
    }

}


const converterDeYahooQuoteEmCotacao = (quote: YahooQuote): Cotacao => {
    const data: ICotacao = {
        simbolo: quote.simbolo as string,
        preco: quote.preco as number,
        moeda: quote.moeda as Moeda,
        manual: quote.manual,
        data: parse(quote.data, "yyyy-MM-dd", new Date())
    };
    return new Cotacao(data);
}
