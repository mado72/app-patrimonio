import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { map } from 'rxjs';
import { Carteira, CarteiraAtivo } from '../../../models/investimento.model';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { CarteiraAtivoListComponent } from '../carteira-ativo-list/carteira-ativo-list.component';

@Component({
  selector: 'app-carteira-card',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    CarteiraAtivoListComponent
  ],
  styleUrl: './carteira-card.component.scss',
  templateUrl: './carteira-card.component.html',
})
export class CarteiraCardComponent {

  @Input() carteira!: Carteira;
  @Input() ocultarClose = false;
  @Output() onEditarCarteira = new EventEmitter<Carteira>();
  @Output() onRemoverCarteira = new EventEmitter<Carteira>();
  @Output() onOcultarCarteira = new EventEmitter<Carteira>();
  @Output() onRemoverCarteiraAtivo = new EventEmitter<{ carteira: Carteira, carteiraAtivo: CarteiraAtivo }>();
  @Output() onAdicionarCarteiraAtivo = new EventEmitter<Carteira>();
  @Output() onEditarCarteiraAtivo = new EventEmitter<{ carteira: Carteira, carteiraAtivo: CarteiraAtivo }>();

  private investimentoStateService = inject(InvestimentoStateService);

  constructor() { }

  novoAtivo() {
    this.onAdicionarCarteiraAtivo.emit(this.carteira);
  }

  editarCarteira() {
    this.onEditarCarteira.emit(this.carteira);
  }

  adicionarCarteiraAtivo() {
    this.onAdicionarCarteiraAtivo.emit(this.carteira);
  }

  editarCarteiraAtivo(carteiraAtivo: CarteiraAtivo) {
    this.onEditarCarteiraAtivo.emit({ carteira: this.carteira, carteiraAtivo });
  }

  removerCarteira() {
    this.onRemoverCarteira.emit(this.carteira);
  }

  ocultarCarteira() {
    this.onOcultarCarteira.emit(this.carteira);
  }

  removeCarteiraAtivo(carteiraAtivo: CarteiraAtivo) {
    this.onRemoverCarteiraAtivo.emit({ carteira: this.carteira, carteiraAtivo })
  }

  get ativos() {
    const ids = this.carteira.ativos.map(carteiraAtivo => carteiraAtivo.ativoId);
    return this.investimentoStateService.ativo$.pipe(
      map((ativos)=>ativos.filter(ativo=>ids.includes(ativo.identity.toString())))
    );
  }

}
