import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Moeda } from '../../../models/base.model';
import { Ativo, Carteira } from '../../../models/investimento.model';
import { ativoActions } from '../../../store/ativo.actions';
import { carteiraActions } from '../../../store/carteira.actions';
import { getAtivosState, getCarteirasState, getCotacoesState } from '../../../store/investimento.selectors';
import { AtivoItemComponent } from '../ativo-item/ativo-item.component';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';
@Component({
  selector: 'app-carteira-list',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    CarteiraTableComponent,
    AtivoItemComponent
  ],
  templateUrl: './carteira-list.component.html',
  styleUrl: './carteira-list.component.scss'
})
export class CarteiraListComponent implements OnInit {

  carteiras$ = this.store.select(getCarteirasState);
  ativos$ = this.store.select(getAtivosState);
  cotacoes$ = this.store.select(getCotacoesState);

  constructor(private store: Store<any>) { }

  ngOnInit(): void {
    this.store.dispatch(ativoActions.getAtivos());
    this.store.dispatch(carteiraActions.getCarteiras());
  }

  adicionarCarteira() {
    const carteira = new Carteira({
      nome: 'Carteira',
      ativos: [],
      tipo: 'Carteira',
      moeda: Moeda.BRL
    });
    this.store.dispatch(carteiraActions.addCarteira({ carteira }))
  }

  adicionarAtivo() {
    const ativo = new Ativo({
      moeda: Moeda.BRL,
      nome: 'Ativo',
      tipo: 'Acao',
      valor: 0
    });
    this.store.dispatch(ativoActions.addAtivo({ ativo }))
  }

  removeAtivo(ativo: Ativo) {
    this.carteiras$.subscribe(carteiras => {
      carteiras.items.forEach(carteira => {
        if (carteira.ativos.find(item => item.identity === ativo.identity)) {
          this.store.dispatch(carteiraActions.removeAtivoCarteira({ carteira, ativo }))
        }
      })
      this.store.dispatch(ativoActions.removeAtivo({ ativo }))
    });
  }
    
}
