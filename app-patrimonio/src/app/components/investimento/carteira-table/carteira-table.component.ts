import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { Ativo, Carteira, CarteiraAtivo, createAtivo } from '../../../models/investimento.model';
import { ativosSelectors } from '../../../store/investimento.selectors';
import { CarteiraAtivoListComponent } from '../carteira-ativo-list/carteira-ativo-list.component';

@Component({
  selector: 'app-carteira-table',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    CarteiraAtivoListComponent
  ],
  templateUrl: './carteira-table.component.html',
  styleUrl: './carteira-table.component.scss'
})
export class CarteiraTableComponent {

  @Input() carteira!: Carteira;
  @Output() onRemoverCarteira = new EventEmitter<Carteira>();
  @Output() onRemoverCarteiraAtivo = new EventEmitter<{carteira: Carteira, carteiraAtivo: CarteiraAtivo}>();
  @Output() onAdicionarCarteiraAtivo = new EventEmitter<{carteira: Carteira, ativo: Ativo}>();

  constructor(private store: Store) { }

  novoAtivo() {
    this.onAdicionarCarteiraAtivo.emit({carteira: this.carteira, ativo: createAtivo()});
  }

  removerCarteira() {
    this.onRemoverCarteira.emit(this.carteira);
  }

  removeCarteiraAtivo(carteiraAtivo: CarteiraAtivo) {
    this.onRemoverCarteiraAtivo.emit({carteira: this.carteira, carteiraAtivo })
  }

  get ativos() {
    const ids = this.carteira.ativos.map(carteiraAtivo => carteiraAtivo.ativoId);
    return this.store.select(ativosSelectors.ativosIdIn(ids)).pipe(
      map(ativos=>ativos.filter(ativo=>ativo) as Ativo[])
    )
  }

}
