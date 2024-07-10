import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Conta, TipoConta } from '../../../models/conta.model';
import { Moeda } from '../../../models/base.model';
import { FormsModule } from '@angular/forms';
import { CapitalizePipe } from '../../../pipes/capitalize.pipe';

@Component({
  selector: 'app-conta-modal',
  standalone: true,
  imports: [
    FormsModule,
    CapitalizePipe
  ],
  templateUrl: './conta-modal.component.html',
  styleUrl: './conta-modal.component.scss'
})
export class ContaModalComponent {

  private _conta!: Conta;

  @Output() onSalvarConta = new EventEmitter<Conta>();

  @Output() onExcluirConta = new EventEmitter<Conta>();

  @Output() onCancelar = new EventEmitter();

  get conta() {
    return this._conta
  }

  @Input()
  set conta(conta: Conta) {
    this._conta = Object.assign({} as Conta, conta);
  }

  salvar() {
    this.onSalvarConta.emit(this.conta);
  }

  excluir() {
    this.onExcluirConta.emit(this.conta);
  }

  cancelar() {
    this.onCancelar.emit();
  }

  /**
   * @description
   * Método que retorna um array de tipos disponíveis.
   *
   * @returns {string[]} - Um array de tipos disponíveis.
   * @memberof CarteiraAtivoFormComponent
   */
  get tipos(): string[] {
    return Object.values(TipoConta);
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

}
