import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { Ativo, Carteira, CarteiraAtivo, ICarteiraAtivo, TipoInvestimento } from '../../../models/investimento.model';
import { ConsolidadoTotal, consolidaValores } from '../../../util/formulas';
import { Cotacao } from '../../../models/cotacao.models';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { Subject } from 'rxjs';

type AuxAtivo = Pick<Ativo, "identity" | "nome" | "sigla" | "moeda" | "cotacao">;
type ListItem = AuxAtivo & Omit<CarteiraAtivo, "ativo">;

@Component({
  selector: 'app-carteira-ativo-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './carteira-ativo-list.component.html',
  styleUrl: './carteira-ativo-list.component.scss'
})
export class CarteiraAtivoListComponent implements OnDestroy{

  consolidado !: ConsolidadoTotal<ListItem>;

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
    this.subject.subscribe(()=>{
      this.consolidado = calcularTotais(this._ativos, this.mapCarteira, this.mapCotacao);
    })
  }

  ngOnDestroy(): void {
    this.subject.complete();
  }

  private _ativos: CarteiraAtivo[] = [];

  public get ativos(): CarteiraAtivo[] {
    return this._ativos;
  }

  @Input()
  public set ativos(value: CarteiraAtivo[]) {
    const diff = this._ativos != value;
    this._ativos = value;
    diff && this.subject.next({});
  }

  @Output() onRemoveAtivo = new EventEmitter<CarteiraAtivo>();

  @Output() onEditarAtivo = new EventEmitter<CarteiraAtivo>();

  @Output() onAdicionarAtivo = new EventEmitter<void>();

  removerAtivo(listItem: ListItem): void {
    const ativo: ICarteiraAtivo = this.extrairCarteiraAtivo(listItem)
    this.onRemoveAtivo.emit(ativo);
  }

  editarAtivo(listItem: ListItem) {
    const ativo: ICarteiraAtivo = this.extrairCarteiraAtivo(listItem)
    this.onEditarAtivo.emit(ativo);
  }

  private extrairCarteiraAtivo(listItem: ListItem): CarteiraAtivo {
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

export type CalcularTotaisReturnType = ReturnType<typeof calcularTotais>;

function transform(item: CarteiraAtivo) {
  return Object.assign({}, item, item.ativo as AuxAtivo);
}

type ValorCarteira = (carteira: Carteira) => number;

function calcularTotais(itensAtivos: CarteiraAtivo[], mapCarteira: Map<string | undefined, Carteira>, mapCotacao: Map<string, Cotacao>) {
  const ativos = itensAtivos.map(item => transform(item));

  const consolidado = consolidaValores(
    ativos,
    (ativo) => ativo.quantidade,
    (ativo) => ativo.vlInicial,
    (ativo) => ativo.objetivo,
    (ativo) => calcularValorCotacao(
      ativo, 
      (carteira)=>carteira.valor,
      ativo.vlAtual, 
      mapCarteira.get(ativo.ativo?.referencia?.id), 
      mapCotacao.get(ativo.ativo?.siglaYahoo as string)));

  return consolidado;
}

function calcularValorCotacao(ativo: CarteiraAtivo & AuxAtivo, valorCarteira: ValorCarteira, valor?: number, carteira?: Carteira, cotacao?: Cotacao) {
  {
    if (ativo.ativo?.tipo === TipoInvestimento.Referencia) {
      if (ativo.ativo.referencia?.tipo == TipoInvestimento.Carteira && carteira) {
        if (carteira.moeda === ativo.moeda) {
          return valorCarteira(carteira);
        }
        else if (cotacao) {
          return cotacao.valor * valorCarteira(carteira);
        }
      }
      if (ativo.ativo.referencia?.tipo == TipoInvestimento.Moeda && cotacao) {
        return cotacao.valor;
      }
    }
    ativo.cotacao = cotacao;
    return (ativo.cotacao ? ativo.cotacao?.aplicar(ativo.quantidade) : valor) || NaN;
  }
}
