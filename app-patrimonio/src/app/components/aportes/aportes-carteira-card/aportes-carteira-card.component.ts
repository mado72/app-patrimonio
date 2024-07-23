import { DecimalPipe, KeyValuePipe, PercentPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
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

  private readonly cotacao1 = new Cotacao({ data: new Date(), moeda: Moeda.BRL, simbolo: '', valor: 1});

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

  totais?: AporteTotaisType = undefined;

  constructor() { }
  get saldo() {
    if (!this.totais) {
      return this.aporte;
    }
    return this.aporte - Object.values(this._aportes).reduce((acc, aporte)=>acc+=aporte.cotacao.aplicar(aporte.qtdCompra),0);
  }
}