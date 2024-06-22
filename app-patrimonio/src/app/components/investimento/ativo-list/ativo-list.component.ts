import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ativo } from '../../../models/investimento.model';
import { JsonPipe } from '@angular/common';
import { AtivoItemComponent } from '../ativo-item/ativo-item.component';

@Component({
  selector: 'app-ativo-list',
  standalone: true,
  imports: [
    JsonPipe,
    AtivoItemComponent
  ],
  templateUrl: './ativo-list.component.html',
  styleUrl: './ativo-list.component.scss'
})
export class AtivoListComponent {

  @Input() ativos: Ativo[] = [];

  @Output() onRemoveAtivo = new EventEmitter<Ativo>();

  removerAtivo(ativo: Ativo): void {
    this.onRemoveAtivo.emit(ativo);
  }

}
