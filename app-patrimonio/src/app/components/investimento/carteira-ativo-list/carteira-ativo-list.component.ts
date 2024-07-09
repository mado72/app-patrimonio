import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { Ativo, Carteira, CarteiraAtivo, ICarteiraAtivo, TipoInvestimento } from '../../../models/investimento.model';
import { ConsolidadoTotal, consolidaValores } from '../../../util/formulas';
import { Cotacao } from '../../../models/cotacao.models';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { Subject } from 'rxjs';
import { Moeda } from '../../../models/base.model';

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
      this.consolidado = calcularTotais(this._carteira, this.mapCarteira, this.mapCotacao);
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

function calcularTotais(carteira: Carteira, mapCarteira: Map<string | undefined, Carteira>, mapCotacao: Map<string, Cotacao>) {
  const ativos = carteira.ativos.map(item => transform(item));

  const consolidado = consolidaValores(
    ativos,
    (ativo) => ativo.quantidade,
    (ativo) => converteParaMoeda(ativo.vlInicial, ativo.moeda, carteira.moeda, mapCotacao),
    (ativo) => ativo.objetivo,
    (ativo) => 
      converteParaMoeda(
        calcularValorCotacao(
          ativo, 
          (carteira)=>carteira.valor,
          ativo.vlAtual, 
          mapCarteira.get(ativo.ativo?.referencia?.id), 
          mapCotacao.get(ativo.ativo?.siglaYahoo as string)),
        ativo.moeda, carteira.moeda, mapCotacao));

  return consolidado;
}

function converteParaMoeda(valor: number, de: Moeda, para: Moeda, mapCotacao: Map<string, Cotacao>) {
  if (de === para) return valor;
  const cotacao = mapCotacao.get(`${de}${para}`);
  if (!cotacao) {
    console.warn(`Cotação não encontrada para ${de} -> ${para}`);
    return NaN;
  }
  return cotacao.aplicar(valor);
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
