import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { Cotacao } from '../../../models/cotacao.models';
import { Carteira, CarteiraAtivo, ICarteiraAtivo } from '../../../models/investimento.model';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { calcularTotais, CarteiraAtivoItem, ConsolidadoTotal } from '../../../util/formulas';


@Component({
  selector: 'app-carteira-ativo-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './carteira-ativo-list.component.html',
  styleUrl: './carteira-ativo-list.component.scss'
})
export class CarteiraAtivoListComponent implements OnDestroy {

  consolidado !: ConsolidadoTotal<CarteiraAtivoItem>;

  private mapCarteira!: Map<string, Carteira>;

  private mapCotacao!: Map<string, Cotacao>;

  private investimentoStateService = inject(InvestimentoStateService);

  private subject = new Subject();

  constructor() {
    this.investimentoStateService.carteira$.subscribe(carteiras => {
      this.mapCarteira = new Map(carteiras.map(carteira => [carteira.identity.toString(), carteira]));
      this.subject.next({});
    });
    this.investimentoStateService.cotacao$.subscribe(cotacoes => {
      this.mapCotacao = new Map(cotacoes.map(cotacao => [cotacao.simbolo, new Cotacao(cotacao)]));
      this.subject.next({});
    });
    this.subject.subscribe(() => {
      this.consolidado = calcularTotais({
        carteira: this._carteira, 
        cotacaoAtivo: (carteira, ativo) => this.investimentoStateService.obterCotacaoMoeda(ativo.ativo?.moeda || carteira.moeda, carteira.moeda),
        mapCarteira: this.mapCarteira, 
        mapCotacao: this.mapCotacao
      });
    })
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
}
