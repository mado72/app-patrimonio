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
export class CarteiraAtivoListComponent implements OnDestroy {

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

type CotacaoAtivo = (carteira: Carteira, ativo: CarteiraAtivo) => Cotacao;

function calcularTotais({ carteira, cotacaoAtivo, mapCarteira, mapCotacao }: {
  carteira: Carteira, cotacaoAtivo: CotacaoAtivo,
  mapCarteira: Map<string | undefined, Carteira>, mapCotacao: Map<string, Cotacao>
}) {

  const ativos = carteira.ativos.map(item => transform(item));

  const consolidado = consolidaValores<CarteiraAtivo & AuxAtivo>(
    {
      items: ativos,
      quantidadeFn: (ativo) => ativo.quantidade,
      valorInicialFn: (ativo) => cotacaoAtivo(carteira, ativo).aplicar(ativo.vlInicial),
      objetivoFn: (ativo) => ativo.objetivo,
      cotacaoFn: (ativo) => ativo.ativo?.cotacao && cotacaoAtivo(carteira, ativo).converterPara(ativo.ativo?.cotacao),
      valorAtualFn: (ativo) => calcularValorCotacao(
        {
          ativo,
          cotacaoMoeda: cotacaoAtivo(carteira, ativo),
          valor: ativo.vlAtual,
          carteiraRef: mapCarteira.get(ativo.ativo?.referencia?.id),
          cotacaoAtivo: mapCotacao.get(ativo.ativo?.siglaYahoo as string)
        })
    }
  );

  return consolidado;
}

function calcularValorCotacao({ ativo, cotacaoMoeda, valor, carteiraRef: carteira, cotacaoAtivo }:
  { ativo: CarteiraAtivo & AuxAtivo; cotacaoMoeda: Cotacao; valor?: number; carteiraRef?: Carteira; cotacaoAtivo?: Cotacao; }) {

    const valorCalculado = () => {
      if (ativo.ativo?.tipo === TipoInvestimento.Referencia) {
        if (ativo.ativo.referencia?.tipo == TipoInvestimento.Carteira && carteira) {
          if (carteira.moeda === ativo.moeda) {
            return carteira.valor;
          }
          else if (cotacaoAtivo) {
            return cotacaoAtivo.valor * carteira.valor;
          }
        }
        if (ativo.ativo.referencia?.tipo == TipoInvestimento.Moeda && cotacaoAtivo) {
          return cotacaoAtivo.valor;
        }
      }
      ativo.cotacao = cotacaoAtivo;
      return (ativo.cotacao ? ativo.cotacao?.aplicar(ativo.quantidade) : valor) || NaN;
    };

    return cotacaoMoeda.aplicar(valorCalculado())

}
