import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { take, tap } from 'rxjs';
import { Ativo, Carteira, CarteiraAtivo, createAtivo, createCarteira } from '../../../models/investimento.model';
import { ModalService } from '../../../services/modal.service';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { AtivosCardComponent } from '../ativos-card/ativos-card.component';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';

@Component({
  selector: 'app-protifolio',
  standalone: true,
  imports: [
    CommonModule,
    CarteiraTableComponent,
    AtivosCardComponent,
    NgbModalModule
  ],
  templateUrl: './portifolio.component.html',
  styleUrl: './portifolio.component.scss'
})
export class PortifolioComponent implements OnInit {

  private investimentoStateService = inject(InvestimentoStateService);

  private modalService = inject(ModalService);

  carteiras$ = this.investimentoStateService.carteira;
  ativos$ = this.investimentoStateService.ativo;
  cotacoes$ = this.investimentoStateService.cotacao;

  carteiraError$ = this.investimentoStateService.carteiraError;
  ativoError$ = this.investimentoStateService.ativoError;
  cotacoesError$ = this.investimentoStateService.cotacaoError;

  carteiraStatus$ = this.investimentoStateService.carteiraStatus;
  ativoStatus$ = this.investimentoStateService.ativoStatus;
  cotacoesStatus$ = this.investimentoStateService.cotacaoStatus;

  ngOnInit(): void {
  }

  adicionarCarteira() {
    const carteira = createCarteira();
    this.investimentoStateService.adicionarCarteira(carteira);
  }

  editarCarteira(carteira: Carteira) {
    console.warn(`Falta implementar a edição de carteira`);
    throw `Não implementado`;
  }

  removerCarteira(carteira: Carteira) {
    this.investimentoStateService.removerCarteira(carteira);
  }

  ocultarCarteira(carteira: Carteira) {
    this.investimentoStateService.ocultarCarteira(carteira);
  }

  adicionarAtivo() {
    const ativo = createAtivo();
    this.modalService.openAtivoModalComponent(ativo).subscribe(result=>{
      if (result.comando === 'salvar') {
        this.investimentoStateService.adicionarAtivo(ativo);
      }
    });
  }

  removerAtivo(ativo: Ativo) {
    this.investimentoStateService.removerAtivo(ativo);
  }

  editarCarteiraAtivo($event: { carteira: Carteira; carteiraAtivo: CarteiraAtivo; }) {
    this.investimentoStateService.ativo.pipe(
      take(1),
      tap(ativos=>
        this.modalService.openCarteiraAtivoModalComponent(ativos, $event.carteiraAtivo).subscribe((result) => {
          const carteiraAtivo = {...result.carteiraAtivo} as CarteiraAtivo;
          switch (result.comando) {
            case 'excluir':
              this.removerCarteiraAtivo({carteira: $event.carteira, carteiraAtivo});
              break;
            case 'salvar':
              const update = {
                ...$event.carteira,
                ativos: [...$event.carteira.ativos.filter(item=>item.ativoId != carteiraAtivo.ativoId), carteiraAtivo],
              } as Carteira;
              this.investimentoStateService.atualizarCarteira(update);
              break;
          }
        })
      )
    ).subscribe();
  }

  adicionarCarteiraAtivo(carteira: Carteira) {
    const carteiraAtivo : CarteiraAtivo = {
      ativoId: '',
      quantidade: 1,
      objetivo: 0,
      vlInicial: 0
    }
    this.editarCarteiraAtivo({carteira, carteiraAtivo});
  }

  removerCarteiraAtivo($event: { carteira: Carteira; carteiraAtivo: CarteiraAtivo; }) {
    const carteira = {...$event.carteira} as Carteira;
    carteira.ativos = carteira.ativos.filter(ativo=> ativo.ativoId !== $event.carteiraAtivo.ativoId);
    this.investimentoStateService.atualizarCarteira(carteira);
  }

}
