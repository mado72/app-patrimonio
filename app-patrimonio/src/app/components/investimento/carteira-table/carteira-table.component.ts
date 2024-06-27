import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { Ativo, Carteira, CarteiraAtivo } from '../../../models/investimento.model';
import { createAtivo } from '../../../store/ativo.reducers';
import { selectAtivosIdIn } from '../../../store/ativo.selectors';
import { AtivoListComponent } from '../ativo-list/ativo-list.component';
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
    return this.store.select(selectAtivosIdIn(ids)).pipe(
      map(ativos=>ativos.filter(ativo=>ativo) as Ativo[])
    )
  }

}
