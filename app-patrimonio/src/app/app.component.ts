import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet, } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, map, take, timer } from 'rxjs';
import { PortifolioComponent } from './components/investimento/portifolio/portifolio.component';
import { InvestimentoStateService } from './state/investimento-state.service';
import { MenuSuperiorComponent } from './components/menu-superior/menu-superior.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuSuperiorComponent, PortifolioComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  title = 'app-patrimonio';

  private timerSubscription! : Subscription;

  private toastrService = inject(ToastrService);

  private investimentoStateService = inject(InvestimentoStateService);

  carregado = false;

  erro: any;

  constructor() {
    this.investimentoStateService.ativoError$.subscribe(error=> {
      if(!!error){
        this.displayError(error, "Ativos não carregados");
        this.investimentoStateService.limparErrosAtivos();
      }
    });
    this.investimentoStateService.carteiraError$.subscribe(error=> {
      if(!!error){
        this.displayError(error, "Carteira não carregada");
        this.investimentoStateService.limparErrosCarteiras();
      }
    });
    this.investimentoStateService.cotacaoError$.subscribe(error=> {
      if(!!error){
        this.displayError(error, "Cotações não carregadas");
        this.investimentoStateService.limparErrosCotacoes();
      }
    })
    this.obterAlocacoes();
  }

  private obterAlocacoes() {
    this.investimentoStateService.obterAlocacoes().subscribe((result) => {
      console.log(`Alocacao concluída`, result);
      this.investimentoStateService.notificar();
      this.carregado = true;
    });
  }

  ngOnDestroy(): void {
      this.timerSubscription && this.timerSubscription.unsubscribe();
  }

  displayError(error: any, title?: string): void {
    if (!!error) {
      this.toastrService.error(typeof error === "string"? error : JSON.stringify(error), title || "Erro não capturado");
      this.timerSubscription && this.timerSubscription.unsubscribe();
      this.timerSubscription = timer(30000).pipe(
        map(()=>{
          console.warn("Fazendo reload...");
          this.obterAlocacoes();
        }),
        take(1)
      ).subscribe();
    }
  }
}
