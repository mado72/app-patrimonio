import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Moeda } from '../../../models/base.model';
import { Ativo, Carteira, TipoInvestimento, TipoInvestimentoStr } from '../../../models/investimento.model';
import { carteirasSelectors } from '../../../store/investimento.selectors';


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
export class AtivoModalComponent {

  @Input() ativo!: Ativo;

  @Output() onClose = new EventEmitter<any>();

  @Output() onSave = new EventEmitter<Ativo>();

  @Output() onRemove = new EventEmitter<Ativo>();

  readonly moedas = Object.values(Moeda);

  readonly tiposKey = Object.keys(TipoInvestimentoStr);
  readonly tiposStr = Object.values(TipoInvestimentoStr);

  readonly tipoMoedaRef = TipoInvestimento.Moeda;

  readonly tipoCarteiraRef = TipoInvestimento.Carteira;

  carteiras$ = this.store.select(carteirasSelectors.selectAll);

  constructor(
    private store: Store
  ) {  }

  close() {
    this.onClose.emit();
  }

  save() {
    this.onSave.emit(this.ativo);
  }

  remove() {
    this.onRemove.emit(this.ativo);
  }

  get carteiraReferenciaId() {
    return this.ativo.referencia?.id;
  }

  set carteiraReferenciaId(id: string | undefined) {
    this.ativo.referencia = id ? {
      id,
      tipo: TipoInvestimento.Carteira
    } : undefined;
  }

  get moedaReferenciaId() {
    return this.ativo.referencia?.id;
  }

  set moedaReferenciaId(id: string | undefined) {
    this.ativo.referencia = id? {
      id,
      tipo: TipoInvestimento.Moeda
    } : undefined;
  }

}
