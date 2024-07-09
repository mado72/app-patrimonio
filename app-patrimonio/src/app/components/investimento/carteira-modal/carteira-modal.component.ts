import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Moeda } from '../../../models/base.model';
import { Carteira, TipoInvestimento } from '../../../models/investimento.model';

@Component({
  selector: 'app-carteira-modal',
  standalone: true,
  imports: [
    JsonPipe,
    FormsModule
  ],
  templateUrl: './carteira-modal.component.html',
  styleUrl: './carteira-modal.component.scss'
})
export class CarteiraModalComponent {

  @Output() onSalvar = new EventEmitter<Carteira>();
  
  @Output() onCancelar = new EventEmitter();

  private _carteira!: Carteira;

  get carteira(): Carteira {
    return this._carteira;
  }
  
  @Input()
  set carteira(carteira: Carteira) {
    this._carteira = {...carteira, valor: carteira.valor, vlInicial: carteira.vlInicial};
  }

  salvarEdicao() {
    this.onSalvar.emit(this._carteira);
  }
  cancelarEdicao() {
    this.onCancelar.emit();
  }

  /**
   * @description
   * Método que retorna um array de tipos disponíveis.
   *
   * @returns {string[]} - Um array de tipos disponíveis.
   * @memberof CarteiraAtivoFormComponent
   */
  get classes(): string[] {
    return Object.values(TipoInvestimento);
  }

  /**
   * @description
   * Método que retorna um array de moedas disponíveis.
   *
   * @returns {string[]} - Um array de moedas disponíveis.
   * @memberof CarteiraAtivoFormComponent
   */
  get moedas(): string[] {
    return Object.keys(Moeda);
  }

  /**
   * @description
   * Método que retorna a sigla da moeda baseada na string da moeda fornecida.
   *
   * @param {string} moedaString - A string da moeda.
   * @returns {any} - A sigla da moeda ou null se não encontrada.
   * @memberof CarteiraAtivoFormComponent
   */
  sigla(moedaString: string): any {
    const moeda = Object.values(Moeda).find(m => "" + m === moedaString);
    return !moeda? null: moedaString;
  }

  get objetivoPerc() {
    return this.carteira.objetivo * 100;
  }

  set objetivoPerc(value: number) {
    this.carteira.objetivo = value / 100;
  }

}
