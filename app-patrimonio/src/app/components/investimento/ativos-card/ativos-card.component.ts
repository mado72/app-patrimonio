import { Component, Input } from '@angular/core';
import { Ativo } from '../../../models/investimento.model';
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
export class AtivosCardComponent {

  @Input() ativos: Ativo[] = [];


}
