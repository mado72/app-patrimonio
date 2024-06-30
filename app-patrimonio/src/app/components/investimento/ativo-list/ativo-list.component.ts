import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Ativo } from '../../../models/investimento.model';

@Component({
  selector: 'app-ativo-list',
  standalone: true,
  imports: [
    JsonPipe,
    DecimalPipe,
  ],
  templateUrl: './ativo-list.component.html',
  styleUrl: './ativo-list.component.scss'
})
export class AtivoListComponent {

  // private modal = inject(NgModal)

  @Input() ativos: Ativo[] = [];

  @Output() onRemoveAtivo = new EventEmitter<Ativo>();

  @Output() onAdicionarAtivo = new EventEmitter<void>();

  removerAtivo(ativo: Ativo): void {
    this.onRemoveAtivo.emit(ativo);
  }

  editarAtivo(ativo: Ativo) {

  }

  adicionarAtivo(): void {
    this.onAdicionarAtivo.emit();
  }

}
