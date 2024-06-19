import { Component, Input } from '@angular/core';
import { Ativo } from '../../../models/investimento.model';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-ativo-list',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './ativo-list.component.html',
  styleUrl: './ativo-list.component.scss'
})
export class AtivoListComponent {

  @Input() ativos: Ativo[] = [];

}
