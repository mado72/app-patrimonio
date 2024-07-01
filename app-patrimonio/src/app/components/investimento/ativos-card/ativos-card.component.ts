import { Component, Input, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Ativo } from '../../../models/investimento.model';
import { ativoActions } from '../../../store/ativo.actions';
import { ativosSelectors } from '../../../store/investimento.selectors';
import { AtivoListComponent } from '../ativo-list/ativo-list.component';

@Component({
  selector: 'app-ativos-card',
  standalone: true,
  imports: [
    AtivoListComponent
  ],
  templateUrl: './ativos-card.component.html',
  styleUrl: './ativos-card.component.scss'
})
export class AtivosCardComponent implements OnInit {

  @Input() ativos: Ativo[] = [];

  private store = inject(Store);

  ngOnInit(): void {
      if (! this.ativos.length) {
        this.store.select(ativosSelectors.selectAll).subscribe(ativos=> this.ativos = ativos);
      }
  }

  removerAtivo(ativo: Ativo) {
    this.store.dispatch(ativoActions.removeAtivo({ativo}));
  }

}
