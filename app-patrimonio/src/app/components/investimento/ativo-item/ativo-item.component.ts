import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Moeda } from '../../../models/base.model';
import { Ativo } from '../../../models/investimento.model';

@Component({
  selector: 'app-ativo-item',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './ativo-item.component.html',
  styleUrl: './ativo-item.component.scss'
})
export class AtivoItemComponent {

  constructor() {}

  @Input() ativo = new Ativo({
    nome: '',
    valor: 0,
    tipo: 'Acao',
    moeda: Moeda.BRL
  })
  
  @Output() onRemoveAtivo = new EventEmitter<Ativo>();

  removerAtivo() {
    this.onRemoveAtivo.emit(this.ativo);
  }


}
