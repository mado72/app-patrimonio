import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Ativo, Carteira, CarteiraAtivo } from '../../../models/investimento.model';
import { ativoActions } from '../../../store/ativo.actions';
import { createAtivo } from '../../../store/ativo.reducers';
import { carteiraActions } from '../../../store/carteira.actions';
import { createCarteira } from '../../../store/carteira.reducers';
import { AtivoItemComponent } from '../ativo-item/ativo-item.component';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';
import { selectCarteiraStatus, selectCarteirasAll } from '../../../store/carteira.selectors';
import { selectAtivoAll, selectAtivoStatus } from '../../../store/ativo.selectors';
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

  carteiraStatus$ = this.store.select(selectCarteiraStatus);
  carteiras$ = this.store.select(selectCarteirasAll);
  ativoStatus$ = this.store.select(selectAtivoStatus);
  ativos$ = this.store.select(selectAtivoAll);
  // cotacoes$ = this.store.select(getCotacoesState);

  constructor(private store: Store<any>) { }

  ngOnInit(): void {
    this.store.dispatch(ativoActions.getAtivos());
    this.store.dispatch(carteiraActions.getCarteiras());
  }

  sortByNome = (a: Carteira, b: Carteira) => a.nome.localeCompare(b.nome);

  adicionarCarteira() {
    const carteira = createCarteira();
    this.store.dispatch(carteiraActions.addCarteira({ carteira }))
  }

  adicionarAtivo() {
    const ativo = createAtivo();
    this.store.dispatch(ativoActions.addAtivo({ ativo }))
  }

  adicionarCarteiraAtivo({ativo, carteira}: {ativo: Ativo, carteira: Carteira}) {
    this.store.dispatch(ativoActions.addAtivo({ativo}));
    this.store.dispatch(carteiraActions.addCarteiraAtivo({carteira, ativo: {
      ativoId: ativo.identity,
      objetivo: 0,
      quantidade: 100,
      vlInicial: 10,
      ativo
    }}))
  }

  removerCarteiraAtivo({ativo, carteira}: {ativo: Ativo, carteira: Carteira}) {
    const carteiraAtivo = carteira.ativos.find(item=>item.ativoId === ativo.identity );
    if (carteiraAtivo) {
      this.store.dispatch(carteiraActions.removeCarteiraAtivo({carteira, ativo: carteiraAtivo}));
      this.store.dispatch(ativoActions.removeAtivo({ativo}))
    }
    else {
      console.warn(`Ativo ${ativo.sigla} não encontrado na carteira`);
    }
  }

  removerCarteira(carteira: Carteira) {
    this.store.dispatch(carteiraActions.removeCarteira({carteira}));
  }

  removeAtivo(ativo: Ativo) {
    this.carteiras$.subscribe(carteiras => {
      carteiras.forEach(carteira => {
        const carteiraAtivo = carteira.ativos.find(item=>item.ativoId == ativo._id);
        if (carteiraAtivo) {
          this.store.dispatch(carteiraActions.removeCarteiraAtivo({carteira, ativo: carteiraAtivo}));
        }
      })
      this.store.dispatch(ativoActions.removeAtivo({ ativo }))
    });
  }
    
}
