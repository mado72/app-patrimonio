import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Component, effect, inject, Signal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { TipoInvestimento } from '../../../models/investimento.model';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { FormsModule } from '@angular/forms';

type Alocacao = {
  id: string;
  classe: TipoInvestimento;
  carteira: string;
  financeiro: number;
  planejado: number;
  atual?: number;
}

type Alocacoes = {
  alocacoes: Required<Alocacao>[];
  totais: Required<Alocacao>;
}

@Component({
  selector: 'app-alocacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './alocacao.component.html',
  styleUrl: './alocacao.component.scss'
})
export class AlocacaoComponent {

  private investimentoStateService = inject(InvestimentoStateService)

  private _listaPorClasse = signal(true);

  get expandido() {
    return this._listaPorClasse();
  }

  set expandido(value: boolean) {
    this._listaPorClasse.set(value);
    this._listaPorClasse.update(this._listaPorClasse)
  }

  alocacoes$ = this.obterAlocacoes();

  obterAlocacoes() {
    return toObservable(this._listaPorClasse).pipe(
      tap(console.debug),
      switchMap(()=> this.investimentoStateService.calcularTotaisTodasCarteiras().pipe(
            map(consolidados=>{
              let alocacoes : Alocacao[] = consolidados.map(consolidado=>({
                id: consolidado.identity.toString(),
                classe: consolidado.classe,
                carteira: consolidado.nome,
                financeiro: consolidado.vlTotal,
                planejado: consolidado.objetivo
              }));
        
              const totais = this.totais(alocacoes);
        
              return {alocacoes, totais};
            }),
            map(calculado=>{
              const totalPlanejado = calculado.alocacoes.reduce((acc,v)=>acc+=this.atual(v, calculado.totais),0)
              const alocacoes = calculado.alocacoes.map(alocacao=>({...alocacao, atual: this.atual(alocacao, calculado.totais)}));
              return {alocacoes, totais: {...calculado.totais, atual: totalPlanejado}};
            })
          ).pipe(
            map(consolidado=>{
              
              if (!this.expandido) {
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
              }
        
              const alocacoes = <Alocacoes>consolidado;
              return alocacoes;
            })
          )))
  }

  private totais = (alocacoes: Alocacao[]) => alocacoes.reduce(
    (acc, curr) => ({
      ...acc,
      financeiro: acc.financeiro + curr.financeiro,
      planejado: acc.planejado + curr.planejado
    }),
    {carteira: 'Total', financeiro: 0, planejado: 0} as Alocacao);

  atual(alocacao: Alocacao, totais: Alocacao) {
    return alocacao.financeiro / totais.financeiro;
  }

}
