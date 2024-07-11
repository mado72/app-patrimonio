import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { Moeda } from '../../../models/base.model';
import { Carteira, CarteiraAtivo, ICarteiraAtivo } from '../../../models/investimento.model';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { CarteiraAtivoItem, ConsolidadoTotal } from '../../../util/formulas';


@Component({
  selector: 'app-carteira-ativo-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './carteira-ativo-list.component.html',
  styleUrl: './carteira-ativo-list.component.scss'
})
export class CarteiraAtivoListComponent implements OnInit, OnDestroy {

  consolidado !: ConsolidadoTotal<CarteiraAtivoItem>;

  readonly BRL = Moeda.BRL;

  private investimentoStateService = inject(InvestimentoStateService);

  private subject = new Subject();

  constructor() {
  }
  
  ngOnInit(): void {
    this.investimentoStateService.calcularTotaisCarteira(this.carteira).subscribe(consolidado=> this.consolidado = consolidado);
  }

  ngOnDestroy(): void {
    this.subject.complete();
  }

  private _carteira!: Carteira;

  public get carteira(): Carteira {
    return this._carteira;
  }

  @Input()
  public set carteira(value: Carteira) {
    const diff = this._carteira != value;
    this._carteira = value;
    diff && this.subject.next({});
  }

  get ativos() {
    return this._carteira?.ativos;
  }

  @Output() onRemoveAtivo = new EventEmitter<CarteiraAtivo>();

  @Output() onEditarAtivo = new EventEmitter<CarteiraAtivo>();

  @Output() onAdicionarAtivo = new EventEmitter<void>();

  removerAtivo(listItem: CarteiraAtivoItem): void {
    const ativo: ICarteiraAtivo = this.extrairCarteiraAtivo(listItem)
    this.onRemoveAtivo.emit(ativo);
  }

  editarAtivo(listItem: CarteiraAtivoItem) {
    const ativo: ICarteiraAtivo = this.extrairCarteiraAtivo(listItem)
    this.onEditarAtivo.emit(ativo);
  }

  private extrairCarteiraAtivo(listItem: CarteiraAtivoItem): CarteiraAtivo {
    return {
      ativoId: listItem.ativoId,
      ativo: (listItem as any).ativo,
      quantidade: listItem.quantidade,
      objetivo: listItem.objetivo,
      vlInicial: listItem.vlInicial,
      vlAtual: listItem.vlAtual
    };
  }

  adicionarAtivo(): void {
    this.onAdicionarAtivo.emit();
  }

  converterParaBRL(valor: number): number {
    return this.investimentoStateService.converteParaMoeda(this.carteira.moeda, this.BRL, valor);
  }
}
