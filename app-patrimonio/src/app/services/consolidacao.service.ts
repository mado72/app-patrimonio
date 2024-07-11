import { inject, Injectable } from '@angular/core';
import { InvestimentoStateService } from '../state/investimento-state.service';
import { map, Observable } from 'rxjs';
import { Moeda } from '../models/base.model';

export type Alocacao = {
  id: string;
  classe: string;
  carteira: string;
  financeiro: number;
  planejado: number;
  atual?: number;
}

export type Alocacoes = {
  alocacoes: Required<Alocacao>[];
  totais: Required<Alocacao>;
}

@Injectable({
  providedIn: 'root'
})
export class ConsolidacaoService {

  private investimentoStateService = inject(InvestimentoStateService)

  constructor() { }

  consolidarAlocacoes () : Observable<Alocacoes>{
    return this.investimentoStateService.calcularTotaisTodasCarteiras().pipe(
      map(consolidados=>{
        let alocacoes : Alocacao[] = consolidados.map(consolidado=>{
          const alocacao : Alocacao = {
            id: consolidado.identity.toString(),
            classe: `${consolidado.classe} (${consolidado.moeda})`,
            carteira: consolidado.nome,
            financeiro: this.investimentoStateService.converteParaMoeda(consolidado.moeda, Moeda.BRL, consolidado.vlTotal),
            planejado: consolidado.objetivo
          };
          return alocacao;
        });
  
        const totais = this.totais(alocacoes);
  
        return {alocacoes, totais};
      }),
      map(calculado=>{
        const totalPlanejado = calculado.alocacoes.reduce((acc,v)=>acc+=this.percentualFinanceiro(v, calculado.totais),0)
        const alocacoes = calculado.alocacoes.map(alocacao=>({...alocacao, atual: this.percentualFinanceiro(alocacao, calculado.totais)}));
        return {alocacoes, totais: {...calculado.totais, atual: totalPlanejado}};
      }))
  }

  consolidarPorClasse(consolidado: Alocacoes) {
    const mapPorClasse = consolidado.alocacoes.reduce((acc, alocacao) => {
      const tipo = alocacao.classe as string;
      let cons = acc.get(alocacao.classe) as Required<Alocacao>;
      if (!cons) {
        cons = {
          id: tipo,
          classe: alocacao.classe,
          carteira: tipo,
          financeiro: 0,
          planejado: 0,
          atual: 0
        };
        acc.set(tipo, cons);
      }
      cons.financeiro += alocacao.financeiro;
      cons.planejado += alocacao.planejado;
      cons.atual += alocacao.atual;
      return acc;
    }, new Map<string, Required<Alocacao>>());

    consolidado.alocacoes = Array.from(mapPorClasse.values())
    return consolidado;
  }
  
  private totais (alocacoes: Alocacao[]) {
    return alocacoes.reduce(
      (acc, curr) => ({
        ...acc,
        financeiro: acc.financeiro + curr.financeiro,
        planejado: acc.planejado + curr.planejado
      }),
      {carteira: 'Total', financeiro: 0, planejado: 0} as Alocacao);
  }

  percentualFinanceiro(alocacao: Alocacao, totais: Alocacao): number {
    if(totais.financeiro === 0) return 0;
    return alocacao.financeiro / totais.financeiro;
  }

}
