import { Component, Input, OnInit, inject } from '@angular/core';
import { Ativo } from '../../../models/investimento.model';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
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

  private investimentoStateService = inject(InvestimentoStateService);


  ngOnInit(): void {
      if (! this.ativos.length) {
        this.investimentoStateService.ativo.subscribe((ativos: Ativo[]) => {
          this.ativos = ativos;
        });
      }
  }

  removerAtivo(ativo: Ativo) {
    this.investimentoStateService.removerAtivo(ativo);
  }

}
