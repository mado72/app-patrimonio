import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet,  } from '@angular/router';
import { ProtifolioComponent } from './components/investimento/protifolio/protifolio.component';
import { Store } from '@ngrx/store';
import { InvestimentoData } from './models/app.models';
import { investimentoActions } from './store/investimento.actions';
import { ativosSelectors, carteirasSelectors, cotacoesSelectors } from './store/investimento.selectors';
import { ToastrService } from 'ngx-toastr';
import { Subscription, map, of, take, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProtifolioComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app-patrimonio';

  private timerSubscription! : Subscription;

  private store = inject(Store<InvestimentoData>);

  private toastrService = inject(ToastrService);

  carteiras = {
    erros$: this.store.select(carteirasSelectors.errors),
    status$: this.store.select(carteirasSelectors.status)
  };
  ativos = {
    erros$: this.store.select(ativosSelectors.errors),
    status$: this.store.select(ativosSelectors.status)
  };
  cotacoes = {
    erros$: this.store.select(cotacoesSelectors.errors),
    status$: this.store.select(cotacoesSelectors.status)
  };

  erro: any;

  ngOnInit(): void {
    this.store.dispatch(investimentoActions.obterAlocacoes())
    this.carteiras.erros$.subscribe(error=>this.displayError(error));
    this.ativos.erros$.subscribe(error=>this.displayError(error));
    this.cotacoes.erros$.subscribe(error=>this.displayError(error));
  }

  ngOnDestroy(): void {
      this.timerSubscription && this.timerSubscription.unsubscribe();
  }

  displayError(error: any): void {
    error && this.toastrService.error(typeof error === "string"? error : JSON.stringify(error), "Erro não capturado");
    this.timerSubscription && this.timerSubscription.unsubscribe();
    this.timerSubscription = timer(30000).pipe(
      map(()=>{
        console.warn("Fazendo reload...");
        this.ngOnInit();
      }),
      take(1)
    ).subscribe();
  }
}
