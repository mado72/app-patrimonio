import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { Ativo, Carteira } from '../../../models/investimento.model';
import { selectAtivoAll } from '../../../store/ativo.selectors';
import { AtivoListComponent } from '../ativo-list/ativo-list.component';
import { createAtivo } from '../../../store/ativo.reducers';

@Component({
  selector: 'app-carteira-table',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    AtivoListComponent
  ],
  templateUrl: './carteira-table.component.html',
  styleUrl: './carteira-table.component.scss'
})
export class CarteiraTableComponent {

  @Input() carteira!: Carteira;
  @Output() onRemoverCarteira = new EventEmitter<Carteira>();
  @Output() onRemoverCarteiraAtivo = new EventEmitter<{carteira: Carteira, ativo: Ativo}>();
  @Output() onAdicionarCarteiraAtivo = new EventEmitter<{carteira: Carteira, ativo: Ativo}>();

  constructor(private store: Store) { }

  novoAtivo() {
    this.onAdicionarCarteiraAtivo.emit({carteira: this.carteira, ativo: createAtivo()});
  }

  removerCarteira() {
    this.onRemoverCarteira.emit(this.carteira);
  }

  removeCarteiraAtivo(ativo: Ativo) {
    this.onRemoverCarteiraAtivo.emit({carteira: this.carteira, ativo})
  }

  get ativos$() {
    const ids = this.carteira.ativos.map(carteiraAtivo => carteiraAtivo.ativoId);
    return this.store.select(selectAtivoAll)
    .pipe(
      map(ativos=>ativos.filter(ativo=>ativo._id && ids && ids.includes(ativo._id)))
    )
  }

}
