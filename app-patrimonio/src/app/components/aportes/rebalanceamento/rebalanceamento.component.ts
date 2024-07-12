import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, take } from 'rxjs';
import { Carteira } from '../../../models/investimento.model';
import { ConsolidacaoService } from '../../../services/consolidacao.service';
import { ModalService } from '../../../services/modal.service';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { Alocacoes, Rebalanceamento, Totalizador } from '../../../models/aportes.model';

@Component({
  selector: 'app-rebalanceamento',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    JsonPipe
  ],
  templateUrl: './rebalanceamento.component.html',
  styleUrl: './rebalanceamento.component.scss'
})
export class RebalanceamentoComponent {

  private investimentoStateService = inject(InvestimentoStateService)

  private consolidacaoService = inject(ConsolidacaoService)

  private modalService = inject(ModalService)

  aporte: number = 0;

  readonly totais = new Totalizador();

  constructor() { 
    this.consolidacaoService.consolidarAlocacoes().pipe(
      map(consolidacoes => this.converter(consolidacoes))
    ).subscribe(consolidado=>this.totais.rebalanceamentos = consolidado)  
  }  

  private converter(consolidacoes: Alocacoes) {
    const rebalanceamentos: Rebalanceamento[] = 
      consolidacoes.alocacoes.map(consolidacao => new Rebalanceamento(consolidacao, this.totais));
    

    return rebalanceamentos;
  }

  abrirModal(item: Rebalanceamento): void {
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
    return this.totais.aporte - this.aporte;
  }

}
