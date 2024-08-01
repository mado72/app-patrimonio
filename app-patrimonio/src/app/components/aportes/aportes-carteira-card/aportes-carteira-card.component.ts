import { DecimalPipe, KeyValuePipe, PercentPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, of, Subject, tap } from 'rxjs';
import { AporteAtivo } from '../../../models/aportes.model';
import { Dictionary } from '../../../models/base.model';
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
export class AportesCarteiraCardComponent implements OnInit, OnDestroy {

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

  @Output() aporteAtivoChange = new EventEmitter<{aporteAtivo: AporteAtivo, valor: number}>();

  totais?: AporteTotaisType = undefined;

  private fieldChanged = new Subject<{aporteAtivo: AporteAtivo, valor: number}>();

  constructor() { }

  ngOnInit(): void {
      this.fieldChanged.pipe(debounceTime(1000)).subscribe(changed=>{
        this.aporteAtivoChange.emit(changed);
      })
  }

  ngOnDestroy(): void {
      this.fieldChanged.complete();
  }

  get total() {
    const aportes = Object.values(this._aportes).reduce((acc, aporte)=>acc+=aporte.cotacao.aplicar(aporte.qtdCompra),0);
    return Math.round(1000000 * (aportes - this.aporte))/ 1000000;
  }

  fireAporteChanged(aporteAtivo: AporteAtivo) {
    this.fieldChanged.next({aporteAtivo, valor: aporteAtivo.total});
  }
}
