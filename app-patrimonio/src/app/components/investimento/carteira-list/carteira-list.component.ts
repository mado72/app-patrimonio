import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Ativo, Carteira, CarteiraAtivo } from '../../../models/investimento.model';
import { CotacaoService } from '../../../services/cotacao.service';
import { ativoActions } from '../../../store/ativo.actions';
import { createAtivo } from '../../../store/ativo.reducers';
import { selectAtivoAll, selectAtivoErrors as selectAtivoError, selectAtivoStatus } from '../../../store/ativo.selectors';
import { carteiraActions } from '../../../store/carteira.actions';
import { createCarteira } from '../../../store/carteira.reducers';
import { selectCarteiraError, selectCarteiraStatus, selectCarteirasAll } from '../../../store/carteira.selectors';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';
@Component({
  selector: 'app-carteira-list',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    CarteiraTableComponent,
  ],
  templateUrl: './carteira-list.component.html',
  styleUrl: './carteira-list.component.scss'
})
export class CarteiraListComponent implements OnInit {

  carteiras$ = this.store.select(selectCarteirasAll);
  carteiraStatus$ = this.store.select(selectCarteiraStatus);
  carteiraError$ = this.store.select(selectCarteiraError)
  ativos$ = this.store.select(selectAtivoAll);
  ativoStatus$ = this.store.select(selectAtivoStatus);
  ativosError$ = this.store.select(selectAtivoError);
  // cotacoes$ = this.store.select(getCotacoesState);

  constructor(
    private store: Store<any>, 
    private cotacaoService: CotacaoService
  ) { }

  ngOnInit(): void {
    this.store.dispatch(ativoActions.getAtivos());
    this.store.dispatch(carteiraActions.getCarteiras({}));
  }

  sortByNome = (a: Carteira, b: Carteira) => a.nome.localeCompare(b.nome);

  obterCotacoes() {
    this.cotacaoService.atualizarCotacoes(this.store).subscribe();  
  }

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

  removerCarteiraAtivo({carteiraAtivo, carteira}: {carteiraAtivo: CarteiraAtivo, carteira: Carteira}) {
    const ativo = carteiraAtivo.ativo as Ativo;
    this.store.dispatch(carteiraActions.removeCarteiraAtivo({carteira, ativo: carteiraAtivo}));
    this.store.dispatch(ativoActions.removeAtivo({ativo}))
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
