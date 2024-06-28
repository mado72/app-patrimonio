import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { InvestimentoData } from '../../../models/app.models';
import { Ativo, Carteira, CarteiraAtivo, createAtivo, createCarteira } from '../../../models/investimento.model';
import { ativoActions } from '../../../store/ativo.actions';
import { carteiraActions } from '../../../store/carteira.actions';
import { ativosSelectors, carteirasSelectors, cotacoesSelectors } from '../../../store/investimento.selectors';
import { AtivosCardComponent } from '../ativos-card/ativos-card.component';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';


@Component({
  selector: 'app-protifolio',
  standalone: true,
  imports: [
    CommonModule,
    CarteiraTableComponent,
    AtivosCardComponent
  ],
  templateUrl: './portifolio.component.html',
  styleUrl: './portifolio.component.scss'
})
export class PortifolioComponent implements OnInit {
removerCarteiraAtivo($event: { carteira: Carteira; carteiraAtivo: CarteiraAtivo; }) {
throw new Error('Method not implemented.');
}
adicionarCarteiraAtivo($event: { carteira: Carteira; ativo: Ativo; }) {
throw new Error('Method not implemented.');
}

  private store = inject(Store<InvestimentoData>);

  carteiras = {
    dados$: this.store.select(carteirasSelectors.selectAll),
    erros$: this.store.select(carteirasSelectors.errors),
    status$: this.store.select(carteirasSelectors.status)
  };
  ativos = {
    dados$: this.store.select(ativosSelectors.selectAll),
    erros$: this.store.select(ativosSelectors.errors),
    status$: this.store.select(ativosSelectors.status)
  };
  cotacoes = {
    dados$: this.store.select(cotacoesSelectors.selectAll),
    erros$: this.store.select(cotacoesSelectors.errors),
    status$: this.store.select(cotacoesSelectors.status)
  };

  ngOnInit(): void {
  }

  adicionarCarteira() {
    const carteira = createCarteira();
    this.store.dispatch(carteiraActions.addCarteira({carteira}))
  }

  removerCarteira(carteira: Carteira) {
    this.store.dispatch(carteiraActions.removeCarteira({carteira}));
  }

  adicionarAtivo() {
    const ativo = createAtivo();
    this.store.dispatch(ativoActions.addAtivo({ativo}))
  }

  removerAtivo(ativo: Ativo) {
    this.store.dispatch(ativoActions.removeAtivo({ativo}));
  }

  incluirCarteiraAtivo() {
    const carteira = createCarteira();
    const ativo = createAtivo();
    const carteiraAtivo : CarteiraAtivo = {
      ativoId: ativo.identity,
      quantidade: 1,
      objetivo: 1000,
      vlInicial: 1000,
      ativo: ativo
    }
    this.store.dispatch(carteiraActions.addCarteiraAtivo({carteira, ativo: carteiraAtivo}));
  }
}
