import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Conta, TipoConta } from '../../../models/conta.model';
import { Moeda } from '../../../models/base.model';
import { CapitalizePipe } from '../../../pipes/capitalize.pipe';
import { NegativoDirective } from '../../../pipes/negativo.directive';
import { AbsolutePipe } from '../../../pipes/absolute.pipe';
import { CommonModule } from '@angular/common';
import { PatrimonioStateService } from '../../../state/patrimonio-state.service';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-conta-list',
  standalone: true,
  imports: [
    CommonModule,
    AbsolutePipe,
    CapitalizePipe,
    NegativoDirective
  ],
  templateUrl: './conta-list.component.html',
  styleUrls: ['./conta-list.component.scss']
})
export class ContaListComponent {

  @Output() contaClicked = new EventEmitter<Conta>();

  readonly tiposConta: TipoConta[] = Object.values(TipoConta);

  tiposContaSelecionados: TipoConta[] = Object.values(TipoConta);

  private patrimonioStateService = inject(PatrimonioStateService);
  
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
      map(contas=>contas.reduce((acc,vl)=>acc+=vl.saldoReal || 0, 0))
    )
  }

  sigla(moeda: Moeda): string {
    return moeda;
  }

  atualizarListaContas () {
    this.patrimonioStateService.notificar();
  }

  contaClick(conta: Conta): void {
    this.contaClicked.emit(conta);
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

}
