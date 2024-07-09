import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Ativo, Carteira, CarteiraAtivo, ICarteiraAtivo, TipoInvestimento } from '../../../models/investimento.model';
import { ConsolidadoTotal, consolidaValores } from '../../../util/formulas';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { forkJoin, map } from 'rxjs';
import { Cotacao } from '../../../models/cotacao.models';

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
export class CarteiraAtivoListComponent implements OnInit {

  private investimentoStateService = inject(InvestimentoStateService);

  private _ativos: CarteiraAtivo[] = [];

  public get ativos(): CarteiraAtivo[] {
    return this._ativos;
  }

  consolidado!: CalcularTotaisReturnType;
  //= this.calcularTotais();

  ngOnInit(): void {
      this.consolidado = calcularTotais(this.carteiras, this.cotacoes, this._ativos);
  }

  @Input()
  public set ativos(value: CarteiraAtivo[]) {
    this._ativos = value;
  }

  @Input() carteiras!: Carteira[];

  @Input() cotacoes!: Cotacao[];

  @Output() onRemoveAtivo = new EventEmitter<CarteiraAtivo>();

  @Output() onEditarAtivo = new EventEmitter<CarteiraAtivo>();

  @Output() onAdicionarAtivo = new EventEmitter<void>();

  removerAtivo(listItem: ListItem): void {
    const ativo : ICarteiraAtivo = this.extrairCarteiraAtivo(listItem)
    this.onRemoveAtivo.emit(ativo);
  }

  editarAtivo(listItem: ListItem) {
    const ativo : ICarteiraAtivo = this.extrairCarteiraAtivo(listItem)
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


function transform(item: CarteiraAtivo) {
  return Object.assign({}, item, item.ativo as AuxAtivo);
}

export type CalcularTotaisReturnType = ReturnType<typeof calcularTotais>;

function calcularTotais(carteiras: Carteira[], cotacoes: Cotacao[], ativos: CarteiraAtivo[]) {
  const mapCarteira = new Map(carteiras.map(carteira => [carteira.identity.toString(), carteira]));
  const mapCotacao = new Map(cotacoes.map(cotacao => [cotacao.simbolo, cotacao]));

  const itemAtivos = ativos.map(item=>transform(item));

  const consolidado = consolidaValores(
    itemAtivos, 
    (ativo)=>ativo.quantidade, 
    (ativo)=>ativo.vlInicial, 
    (ativo)=>ativo.objetivo, 
    (ativo)=>{
      if (ativo.ativo?.tipo === TipoInvestimento.Referencia) {
        if (ativo.ativo.referencia?.tipo == TipoInvestimento.Carteira) {
          const carteira = mapCarteira.get(ativo.ativo.referencia.id);
          if (carteira) {
            if (carteira.moeda === ativo.moeda) {
              return carteira.valor;
            }
            else {
              const cotacaoAtivo = mapCotacao.get(`${ativo.moeda}${carteira.moeda}`);
              if (cotacaoAtivo ) {
                return cotacaoAtivo.valor * carteira.valor;
              }
            }
          }
        }
        if (ativo.ativo.referencia?.tipo == TipoInvestimento.Moeda) {
          const cotacao = mapCotacao.get(ativo.ativo.referencia.id);
          if (cotacao) {
            return cotacao.valor;
          }
        }
      }
      ativo.cotacao = mapCotacao.get(ativo.ativo?.siglaYahoo as string);
      return (ativo.cotacao ? ativo.cotacao?.aplicar(ativo.quantidade) : ativo.vlAtual) || NaN;
    });

  return consolidado;
}
