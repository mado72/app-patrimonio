import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Moeda } from '../../../models/base.model';
import { Ativo, TipoInvestimento, TipoInvestimentoStr } from '../../../models/investimento.model';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { Cotacao } from '../../../models/cotacao.models';


type TipoObjetoReferenciado = 'Carteira' | 'Ativo' | 'Moeda';

class ReferenciaCarteira {
  id: string;
  tipo: TipoObjetoReferenciado;
  nome: string;
  constructor(id: string, tipo: TipoObjetoReferenciado, nome: string) {
    this.id = id;
    this.tipo = tipo;
    this.nome = nome;
  }
}
@Component({
  selector: 'app-ativo-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ativo-modal.component.html',
  styleUrl: './ativo-modal.component.scss'
})
export class AtivoModalComponent implements OnInit {

  @Input() ativo!: Ativo;

  @Output() onClose = new EventEmitter<any>();

  @Output() onSave = new EventEmitter<Ativo>();

  @Output() onRemove = new EventEmitter<Ativo>();

  readonly moedas = Object.values(Moeda);

  readonly tiposKey = Object.keys(TipoInvestimentoStr);

  readonly tiposStr = Object.values(TipoInvestimentoStr);

  readonly tipoCarteiraRef = TipoInvestimento.Referencia;

  private investimentoStateService = inject(InvestimentoStateService);

  carteiras$ = this.investimentoStateService.carteira$;

  get tipo() {
    return this.ativo.tipo;
  }
  
  set tipo(t: TipoInvestimento | undefined) {
    if (t !== TipoInvestimento.Referencia) {
      this.ativo.referencia = undefined;
    }
    this.ativo.tipo = t;
  }
  
  private _cotacao: number = 0;

  get cotacao() {
    return this._cotacao;
  }

  set cotacao(c: number) {
    this._cotacao = c;
    if (this.ativo.cotacao) {
      this.ativo.cotacao.preco = c;
    }
  }

  constructor(
  ) {  }

  ngOnInit() {
    if (this.ativo.cotacao) {
      this._cotacao = this.ativo.cotacao.preco;
    }
  }

  close() {
    this.onClose.emit();
  }

  save() {
    if (! this.ativo.cotacao && this._cotacao) {
      this.ativo.cotacao = new Cotacao({
        data: new Date(),
        preco: this._cotacao,
        manual: true,
        moeda: this.ativo.moeda,
        simbolo: this.ativo.sigla
      });
    }
    this.onSave.emit(this.ativo);
  }

  remove() {
    this.onRemove.emit(this.ativo);
  }

  get disableCotacao() {
    return this.ativo.cotacao === undefined ? this.ativo.tipo === TipoInvestimento.Referencia : !this.ativo.cotacao.manual;
  }

  get carteiraReferenciaId() {
    return this.ativo.referencia?.id;
  }

  set carteiraReferenciaId(id: string | undefined) {
    this.ativo.tipo = TipoInvestimento.Referencia;
    this.ativo.referencia = id ? {id, tipo: TipoInvestimento.Carteira} : undefined;
  }

  get moedaReferenciaId() {
    return this.ativo.referencia?.id;
  }

  set moedaReferenciaId(id: string | undefined) {
    this.ativo.referencia = id ? {id, tipo: TipoInvestimento.Moeda} : undefined;
  }

}
