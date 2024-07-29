import { DecimalPipe, KeyValuePipe, PercentPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AporteAtivo } from '../../../models/aportes.model';
import { Dictionary, Moeda } from '../../../models/base.model';
import { Cotacao } from '../../../models/cotacao.models';
import { Carteira } from '../../../models/investimento.model';

type AporteTotaisType = {
  financeiro: number;
  objetivo: number;
  novo: number;
};

@Component({
  selector: 'app-aportes-carteira-card',
  standalone: true,
  imports: [
    FormsModule,
    PercentPipe,
    DecimalPipe,
    KeyValuePipe
  ],
  templateUrl: './aportes-carteira-card.component.html',
  styleUrl: './aportes-carteira-card.component.scss'
})
export class AportesCarteiraCardComponent {

  private _carteira!: Carteira;
  public get carteira(): Carteira {
    return this._carteira;
  }
  @Input()
  public set carteira(value: Carteira) {
    this._carteira = value;
  }

  @Input() aporte: number = 0;

  private _aportes: Dictionary<AporteAtivo> = {};
  public get aportes(): Dictionary<AporteAtivo> {
    return this._aportes;
  }
  @Input()
  public set aportes(value: Dictionary<AporteAtivo>) {
    this._aportes = value;

    this.totais = Object.values(this._aportes).reduce((acc, aporte)=>({
      financeiro: acc.financeiro + aporte.financeiro,
      objetivo: acc.objetivo + aporte.objetivo,
      novo: acc.novo + aporte.novo
    }), {
      financeiro: 0,
      objetivo: 0,
      novo: 0
    });
  }

  @Output() aporteChange = new EventEmitter<number>();

  @Output() saldoChange = new EventEmitter<number>();

  totais?: AporteTotaisType = undefined;

  constructor() { }

  fireAporteChanged(aporteAtivo: AporteAtivo) {
    this.aporteChange.emit(aporteAtivo.total);
    const saldo =  Math.round(1000000 * Object.values(this._aportes).reduce((acc, aporte)=>acc+=aporte.cotacao.aplicar(aporte.qtdCompra),0))/ 1000000;
    this.saldoChange.emit(saldo);
  }

  get saldo() {
    return this.aporte;
  }
}
