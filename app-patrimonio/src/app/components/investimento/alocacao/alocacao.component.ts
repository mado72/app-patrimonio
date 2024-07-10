import { Component, inject } from '@angular/core';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

type Alocacao = {
  carteira: string;
  financeiro: number;
  planejado: number
}

@Component({
  selector: 'app-alocacao',
  standalone: true,
  imports: [
    AsyncPipe
  ],
  templateUrl: './alocacao.component.html',
  styleUrl: './alocacao.component.scss'
})
export class AlocacaoComponent {

  private investimentoStateService = inject(InvestimentoStateService)

  alocacoes$ = this.investimentoStateService.carteira$.pipe(
    map(carteiras=>carteiras.map(carteira=>({
      carteira: carteira.nome,
      financeiro: carteira.valor,
      planejado: carteira.objetivo
    } as Alocacao)))
  )

  totais$ = this.alocacoes$.pipe(
    map(alocacoes=>alocacoes.reduce(
      (acc, curr) => ({
        ...acc,
        financeiro: acc.financeiro + curr.financeiro,
        planejado: acc.planejado + curr.planejado
      }),
      {carteira: 'Total', financeiro: 0, planejado: 0} as Alocacao))
    );

  atual(alocacao: Alocacao, totais: Alocacao) {
    return alocacao.financeiro / totais.financeiro;
  }

}
