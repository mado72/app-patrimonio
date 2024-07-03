import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ativo, CarteiraAtivo, ICarteiraAtivo } from '../../../models/investimento.model';
import { ConsolidadoTotal, consolidaValores } from '../../../util/formulas';

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
export class CarteiraAtivoListComponent {

  private _ativos: CarteiraAtivo[] = [];

  public get ativos(): CarteiraAtivo[] {
    return this._ativos;
  }

  consolidado !: ConsolidadoTotal<ListItem>;

  @Input()
  public set ativos(value: CarteiraAtivo[]) {
    this._ativos = value;
    this.calcularTotais();
  }

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

  transform(item: CarteiraAtivo) {
    return Object.assign({}, item, item.ativo as AuxAtivo);
  }

  calcularTotais() {
    const ativos = this.ativos.map(item=>this.transform(item));

    const consolidado = consolidaValores(
      ativos, 
      (ativo)=>ativo.quantidade, 
      (ativo)=>ativo.vlInicial, 
      (ativo)=>ativo.objetivo, 
      (ativo)=>{
        return ativo.ativo?.cotacao ? ativo.ativo.cotacao.aplicar(ativo.quantidade) : ativo.vlAtual || NaN;
      });

    this.consolidado = consolidado;
  }

}

