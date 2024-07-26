import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, mergeMap, take } from 'rxjs';
import { Alocacoes, AporteCarteira, AporteDB, AportesCarteira, Totalizador } from '../../../models/aportes.model';
import { Moeda } from '../../../models/base.model';
import { Cotacao } from '../../../models/cotacao.models';
import { Carteira, CarteiraAtivo } from '../../../models/investimento.model';
import { ConsolidacaoService } from '../../../services/consolidacao.service';
import { ModalService } from '../../../services/modal.service';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { AportesCarteiraCardComponent } from '../aportes-carteira-card/aportes-carteira-card.component';
import { InvestimentoService } from '../../../services/investimento.service';

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

  private investimentoService = inject(InvestimentoService);

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
    manual: false,
    preco: 1
  })

  constructor() {
    this.investimentoService.obterAportes({}).pipe(
      mergeMap(aportesDB=>this.consolidacaoService.consolidarAlocacoes().pipe(
        map(consolidacoes => {
          const mapAportes = aportesDB.reduce((acc, item)=>{
            acc[item.idCarteira] = acc[item.idCarteira] || {};
            acc[item.idCarteira][item.idAtivo] = item;
            return acc;
          }, {} as {[idCarteira: string] : {[idAtivo: string]: AporteDB}});

          return this.converter(consolidacoes, mapAportes);
        })
      ))
    ).subscribe(consolidado => {
      this.totais.rebalanceamentos = consolidado;
    })
  }

  private participacaoFn = (totalCarteira: number) => totalCarteira / this.totais.total;

  /**
   * Converte as alocações consolidadas em carteiras rebalanceáveis.
   *
   * @param consolidacoes - As alocações consolidadas a serem convertidas.
   * @returns Uma matriz de carteiras rebalanceáveis, cada uma contendo os dados de alocação convertidos.
   */
  private converter(consolidacoes: Alocacoes, mapAportes: { [idCarteira: string]: { [idAtivo: string]: AporteDB; }; }): AporteCarteira[] {
    const rebalanceamentos: AporteCarteira[] = 
      consolidacoes.alocacoes.map(consolidacao => {
        // Cria uma nova instância de AporteCarteira com os dados de alocação consolidados e a função de participação
        const aporteCarteira = new AporteCarteira(consolidacao, this.participacaoFn);

        // Recupera a carteira correspondente do InvestimentoStateService
        const carteira = this.investimentoStateService.getCarteira(consolidacao.idCarteira);
        
        // Converte cada ativo na carteira em um item AporteCarteira e adiciona à instância de AporteCarteira
        (carteira.ativos
          .map(ativo=> {
            let novaQuantidade = ativo.quantidade;
            if (mapAportes[consolidacao.idCarteira] && mapAportes[consolidacao.idCarteira][ativo.ativoId]) {
              novaQuantidade = mapAportes[consolidacao.idCarteira][ativo.ativoId].quantidade;
            }
            return this.converterCarteiraAtivoEmAporte(ativo, novaQuantidade)
          }))
          .forEach(item => aporteCarteira.addItem(item));

        // Retorna a instância de AporteCarteira
        return aporteCarteira;
      });

    // Retorna a matriz de carteiras rebalanceáveis
    return rebalanceamentos;
  }

  private converterCarteiraAtivoEmAporte(ativo: CarteiraAtivo, novaQuantidade: number): { ativoId: string; cotacao: Cotacao; quantidade: number; novaQuantidade: number; objetivo: number; sigla: string; } {
    return {
      ativoId: ativo.ativoId,
      cotacao: ativo.ativo?.cotacao || this.COTACAO_1x1,
      quantidade: ativo.quantidade,
      novaQuantidade: novaQuantidade,
      objetivo: ativo.objetivo,
      sigla: ativo.ativo?.sigla as string
    };
  }

  abrirModal(item: AporteCarteira): void {
    this.investimentoStateService.carteiraEntities$.pipe(
      take(1)
    ).subscribe(entities=>{
      const carteira = {...entities[item.idCarteira]} as Carteira;
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
    return this.investimentoStateService.getCarteira(itemSelecionado.idCarteira);
  }

}
