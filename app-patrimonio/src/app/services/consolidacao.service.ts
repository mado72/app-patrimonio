import { inject, Injectable } from '@angular/core';
import { InvestimentoStateService } from '../state/investimento-state.service';
import { map, Observable } from 'rxjs';
import { Moeda } from '../models/base.model';
import { Alocacao, Alocacoes } from '../models/aportes.model';

@Injectable({
  providedIn: 'root'
})
export class ConsolidacaoService {

  private investimentoStateService = inject(InvestimentoStateService)

  constructor() { }

  /**
  * Consolida os dados de alocação de todos os cartões de investimentos.
  *
  * Esta função busca os dados totais de alocação de cada carteira usando o `InvestimentoStateService`.
  * Em seguida, calcula os valores totais de finanças e planejados, e mapeia os dados de alocação para um novo formato.
  * Por fim, calcula a porcentagem de cada alocação em relação ao valor total de finanças.
  *
  * @returns Um Observable de `Alocacoes` contendo os dados de alocação consolidados.
  */
  consolidarAlocacoes(): Observable<Alocacoes> {
    return this.investimentoStateService.calcularTotaisTodasCarteiras().pipe(
      map(consolidados => {
        let alocacoes: Alocacao[] = consolidados.map(consolidado => {
          const alocacao: Alocacao = {
            idCarteira: consolidado.identity.toString(),
            classe: `${consolidado.classe} (${consolidado.moeda})`,
            carteira: consolidado.nome,
            financeiro: this.investimentoStateService.converteParaMoeda(consolidado.moeda, Moeda.BRL, consolidado.vlTotal),
            planejado: consolidado.objetivo
          };
          return alocacao;
        });

        const totais = this.totais(alocacoes);

        return { alocacoes, totais };
      }),
      map(calculado => {
        const totalPlanejado = calculado.alocacoes.reduce((acc, v) => acc += this.percentualFinanceiro(v, calculado.totais), 0)
        const alocacoes = calculado.alocacoes.map(alocacao => ({ ...alocacao, percentual: this.percentualFinanceiro(alocacao, calculado.totais) }));
        return { alocacoes, totais: { ...calculado.totais, percentual: totalPlanejado } };
      }))
  }

  consolidarPorClasse(consolidado: Alocacoes) {
    const mapPorClasse = consolidado.alocacoes.reduce((acc, alocacao) => {
      const tipo = alocacao.classe as string;
      let cons = acc.get(alocacao.classe) as Required<Alocacao>;
      if (!cons) {
        cons = {
          idCarteira: tipo,
          classe: alocacao.classe,
          carteira: tipo,
          financeiro: 0,
          planejado: 0,
          percentual: 0
        };
        acc.set(tipo, cons);
      }
      cons.financeiro += alocacao.financeiro;
      cons.planejado += alocacao.planejado;
      cons.percentual += alocacao.percentual;
      return acc;
    }, new Map<string, Required<Alocacao>>());

    consolidado.alocacoes = Array.from(mapPorClasse.values())
    return consolidado;
  }

  private totais(alocacoes: Alocacao[]) {
    return alocacoes.reduce(
      (acc, curr) => ({
        ...acc,
        financeiro: acc.financeiro + curr.financeiro,
        planejado: acc.planejado + curr.planejado
      }),
      { carteira: 'Total', financeiro: 0, planejado: 0 } as Alocacao);
  }

  percentualFinanceiro(alocacao: Alocacao, totais: Alocacao): number {
    if (totais.financeiro === 0) return 0;
    return alocacao.financeiro / totais.financeiro;
  }

}
