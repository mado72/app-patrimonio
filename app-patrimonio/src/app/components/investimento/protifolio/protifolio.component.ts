import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';
import { AtivoListComponent } from '../ativo-list/ativo-list.component';
import { InvestimentoData } from '../../../models/app.models';
import { Store } from '@ngrx/store';
import { ativosSelectors, carteirasSelectors, cotacoesSelectors } from '../../../store/investimento.selectors';
import { investimentoActions } from '../../../store/investimento.actions';
import { Ativo, Carteira, CarteiraAtivo, createAtivo, createCarteira } from '../../../models/investimento.model';
import { carteiraActions } from '../../../store/carteira.actions';
import { ativoActions } from '../../../store/ativo.actions';


@Component({
  selector: 'app-protifolio',
  standalone: true,
  imports: [
    CommonModule,
    CarteiraTableComponent,
    AtivoListComponent
  ],
  templateUrl: './protifolio.component.html',
  styleUrl: './protifolio.component.scss'
})
export class ProtifolioComponent implements OnInit {
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
      this.store.dispatch(investimentoActions.obterAlocacoes())
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
