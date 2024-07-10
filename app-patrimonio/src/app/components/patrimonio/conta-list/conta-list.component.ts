import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { map } from 'rxjs';
import { Moeda } from '../../../models/base.model';
import { Conta, TipoConta } from '../../../models/conta.model';
import { AbsolutePipe } from '../../../pipes/absolute.pipe';
import { CapitalizePipe } from '../../../pipes/capitalize.pipe';
import { NegativoDirective } from '../../../pipes/negativo.directive';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { PatrimonioStateService } from '../../../state/patrimonio-state.service';
import { ModalService } from '../../../services/modal.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-conta-list',
  standalone: true,
  imports: [
    CommonModule,
    AbsolutePipe,
    CapitalizePipe,
    NegativoDirective,
    NgbDropdownModule
  ],
  templateUrl: './conta-list.component.html',
  styleUrls: ['./conta-list.component.scss']
})
export class ContaListComponent {

  readonly tiposConta: TipoConta[] = Object.values(TipoConta);

  tiposContaSelecionados: TipoConta[] = Object.values(TipoConta);

  private patrimonioStateService = inject(PatrimonioStateService);

  private investimentoStateService = inject(InvestimentoStateService);

  private modalService = inject(ModalService);
  
  get contas$() {
    return this.patrimonioStateService.conta$
  }

  get contasListadas$() {
    return this.contas$.pipe(
      map(contas=>contas.filter(conta=>this.tiposContaSelecionados.includes(conta.tipo)))
    )
  }

  get totais$() {
    return this.contasListadas$.pipe(
      map(contas=>contas.reduce((acc,vl)=>acc+=this.saldoReal(vl) || 0, 0))
    )
  }

  sigla(moeda: Moeda): string {
    return moeda;
  }

  saldoReal(item: Conta): number {
    return this.investimentoStateService.obterCotacaoMoeda(item.moeda, Moeda.BRL).aplicar(item.saldo);
  }

  atualizarListaContas () {
    this.patrimonioStateService.notificar();
  }

  contaClick(conta: Conta): void {
    this.modalService.openContaModalComponent(conta).subscribe(result=>{
      if (!result) return;
      if (result.comando === 'excluir') {
        this.patrimonioStateService.excluirConta(result.dados);
      }
      else if (result.comando ==='salvar') {
        this.patrimonioStateService.atualizarConta(result.dados);
      }
      this.atualizarListaContas();
    })
  }

  tipoContaAlternar(tipoConta: TipoConta) {
    if (this.tipoContaAtivo(tipoConta)) {
      this.tiposContaSelecionados = this.tiposContaSelecionados.filter(tipo=>tipo !== tipoConta)
    }
    else {
      this.tiposContaSelecionados.push(tipoConta)
    }
    this.atualizarListaContas();
  }

  tipoContaAtivo(tipoConta: TipoConta) {
    return this.tiposContaSelecionados.includes(tipoConta);
  }

  tipoAbrev(tipoConta: TipoConta) {
    switch (tipoConta) {
      case TipoConta.CARTAO: return 'CARTAO';
      case TipoConta.CORRENTE: return 'C/C';
      case TipoConta.INVESTIMENTO: return 'INV';
      case TipoConta.POUPANCA: return 'POUP';
    }
  }

}
