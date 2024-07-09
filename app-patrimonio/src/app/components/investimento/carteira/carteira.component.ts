import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { Carteira, CarteiraAtivo } from '../../../models/investimento.model';
import { map, mergeMap, take, tap } from 'rxjs';
import { Cotacao } from '../../../models/cotacao.models';
import { CarteiraCardComponent } from '../carteira-card/carteira-card.component';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [CarteiraCardComponent],
  templateUrl: './carteira.component.html',
  styleUrl: './carteira.component.scss'
})
export class CarteiraComponent implements OnInit {
  
  private activatedRoute = inject(ActivatedRoute);

  private investimentoStateService = inject(InvestimentoStateService);

  private modalService = inject(ModalService);

  private router = inject(Router);

  carteira!: Carteira;

  carteiras!: Carteira[];

  cotacoes!: Cotacao[];

  ngOnInit(): void {
    const carteiraId = this.activatedRoute.snapshot.params['id'];
    if (!!carteiraId) {
      this.investimentoStateService.carteira$.subscribe(carteiras=>{
        this.carteiras = carteiras;
        const carteira = carteiras.find(carteira=> carteira._id === carteiraId);
        if (! carteira) {
          throw new Error(`Carteira não encontrada: ${carteiraId}`);
        }
        this.carteira = carteira;
      });

      this.investimentoStateService.cotacao$.subscribe(cotacoes=>this.cotacoes = cotacoes);
    }
  }

  editarCarteira(carteira: Carteira) {
    this.modalService.openCarteiraModalComponent(carteira).subscribe(result => {
      if (result.comando === 'salvar') {
        if (!result.dados._id) {
          this.investimentoStateService.adicionarCarteira(result.dados);
        }
        else {
          this.investimentoStateService.atualizarCarteira(result.dados);
        }
      }
    })
  }

  removerCarteira(carteira: Carteira) {
    this.investimentoStateService.removerCarteira(carteira);
    this.router.navigate(['investimento/portifolio'])
  }

  ocultarCarteira(carteira: Carteira) {
    this.investimentoStateService.ocultarCarteira(carteira);
  }

  editarCarteiraAtivo($event: { carteira: Carteira; carteiraAtivo: CarteiraAtivo }) {
    this.investimentoStateService.ativo$.pipe(
      take(1),
      tap(ativos =>
        this.modalService.openCarteiraAtivoModalComponent(ativos, $event.carteiraAtivo).subscribe((result) => {
          const carteiraAtivo = { ...result.dados } as CarteiraAtivo;
          switch (result.comando) {
            case 'excluir':
              this.removerCarteiraAtivo({ carteira: $event.carteira, carteiraAtivo });
              break;
            case 'salvar':
              const update = {
                ...$event.carteira,
                ativos: [...$event.carteira.ativos.filter(item => item.ativoId != carteiraAtivo.ativoId), carteiraAtivo],
              } as Carteira;
              this.investimentoStateService.atualizarCarteira(update);
              break;
          }
        })
      )
    ).subscribe();
  }

  adicionarCarteiraAtivo(carteira: Carteira) {
    const carteiraAtivo: CarteiraAtivo = {
      ativoId: '',
      quantidade: 1,
      objetivo: 0,
      vlInicial: 0
    }
    this.editarCarteiraAtivo({ carteira, carteiraAtivo });
  }

  removerCarteiraAtivo($event: { carteira: Carteira; carteiraAtivo: CarteiraAtivo; }) {
    const carteira = { ...$event.carteira } as Carteira;
    carteira.ativos = carteira.ativos.filter(ativo => ativo.ativoId !== $event.carteiraAtivo.ativoId);
    this.investimentoStateService.atualizarCarteira(carteira);
  }

}
