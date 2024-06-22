import { JsonPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Moeda } from '../../../models/base.model';
import { Ativo, Carteira, IAtivo } from '../../../models/investimento.model';
import { addAtivoCarteira, removeAtivoCarteira, removeCarteira } from '../../../store/carteira.actions';
import { AtivoListComponent } from '../ativo-list/ativo-list.component';

@Component({
  selector: 'app-carteira-table',
  standalone: true,
  imports: [
    JsonPipe,
    AtivoListComponent
  ],
  templateUrl: './carteira-table.component.html',
  styleUrl: './carteira-table.component.scss'
})
export class CarteiraTableComponent {

  @Input() carteira = new Carteira({
    nome: 'Carteira 1',
    ativos: [],
    moeda: Moeda.BRL,
    tipo: 'Carteira',
  });

  constructor(private store: Store) { }

  adicionaAtivo(ativo: IAtivo) {
    const novoAtivo: Ativo = (<Ativo>ativo).identity !== undefined ? <Ativo>ativo : new Ativo(ativo);
    this.store.dispatch(addAtivoCarteira({ ativo: novoAtivo, carteira: this.carteira }))
  }

  novoAtivo() {
    this.adicionaAtivo(new Ativo({
      nome: `Novo ativo ${this.carteira.ativos.length}`,
      valor: 100 * Math.random(),
      moeda: Moeda.BRL,
      tipo: 'Acao'
    }))
  }

  removerCarteira() {
    this.store.dispatch(removeCarteira({ carteira: this.carteira }));
  }

  removeCarteiraAtivo(ativo: Ativo) {
    try {
      this.store.dispatch(removeAtivoCarteira({ carteira: this.carteira, ativo }));

    } catch (error) {
      console.error(error);
    }
  }


}
