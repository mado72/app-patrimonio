import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, take } from 'rxjs';
import { Alocacoes, AporteCarteira, AportesCarteira, Totalizador } from '../../../models/aportes.model';
import { Moeda } from '../../../models/base.model';
import { Cotacao } from '../../../models/cotacao.models';
import { Carteira } from '../../../models/investimento.model';
import { ConsolidacaoService } from '../../../services/consolidacao.service';
import { ModalService } from '../../../services/modal.service';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { AportesCarteiraCardComponent } from '../aportes-carteira-card/aportes-carteira-card.component';

@Component({
  selector: 'app-rebalanceamento',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    JsonPipe,
    AportesCarteiraCardComponent
  ],
  templateUrl: './rebalanceamento.component.html',
  styleUrl: './rebalanceamento.component.scss'
})
export class RebalanceamentoComponent {

  private investimentoStateService = inject(InvestimentoStateService)

  private consolidacaoService = inject(ConsolidacaoService)

  private modalService = inject(ModalService)

  aporte: number = 0;

  itemSelecionado?: AporteCarteira = undefined;

  aportes : AportesCarteira = {};

  readonly totais = new Totalizador();

  readonly COTACAO_1x1 = new Cotacao ({
    data: new Date(),
    moeda: Moeda.BRL,
    simbolo: '1x1',
    valor: 1
  })

  constructor() {
    this.consolidacaoService.consolidarAlocacoes().pipe(
      map(consolidacoes => this.converter(consolidacoes))
    ).subscribe(consolidado => {
      this.totais.rebalanceamentos = consolidado;
    })
  }

  private participacaoFn = (totalCarteira: number) => totalCarteira / this.totais.total;

  private converter(consolidacoes: Alocacoes) {
    const rebalanceamentos: AporteCarteira[] = 
      consolidacoes.alocacoes.map(consolidacao => {
        const aporteCarteira = new AporteCarteira(consolidacao, this.participacaoFn);
        const carteira = this.investimentoStateService.getCarteira(consolidacao.id);
        (carteira.ativos.map(ativo=> ({
            ativoId: ativo.ativoId,
            cotacao: ativo.ativo?.cotacao || this.COTACAO_1x1,
            quantidade: ativo.quantidade,
            novaQuantidade: ativo.quantidade,
            objetivo: ativo.objetivo,
            sigla: ativo.ativo?.sigla as string
        }))).forEach(item => aporteCarteira.addItem(item));
        return aporteCarteira;
      });

    return rebalanceamentos;
  }

  abrirModal(item: AporteCarteira): void {
    this.investimentoStateService.carteiraEntities$.pipe(
      take(1)
    ).subscribe(entities=>{
      const carteira = {...entities[item.id]} as Carteira;
      this.modalService.openCarteiraModalComponent(carteira).subscribe(result=>{
        if (result == null) return;
        if(result.comando === 'excluir'){
          this.modalService.openDialog('Excluir carteira', `Carteira ${carteira.nome} será excluída`).subscribe(confirma=>{
            if (confirma)
              this.investimentoStateService.removerCarteira(carteira)
          })
        } else if(result.comando ==='salvar'){
          this.investimentoStateService.atualizarCarteira(result.dados);
        }
      })
    })
  }

  get diferencaAporte() {
    return this.aporte - this.totais.aporte;
  }

  selecionarItem(item: AporteCarteira) {
    if (this.itemSelecionado === item) {
      this.itemSelecionado = undefined;
    }
    else {
      this.itemSelecionado = item;
    }
  }

  carteiraSelecionada(itemSelecionado: AporteCarteira) {
    return this.investimentoStateService.getCarteira(itemSelecionado.id);
  }

}
