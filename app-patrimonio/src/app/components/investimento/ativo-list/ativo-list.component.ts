import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Ativo, createAtivo } from '../../../models/investimento.model';
import { ModalService } from '../../../services/modal.service';
import { InvestimentoStateService } from '../../../state/investimento-state.service';

@Component({
  selector: 'app-ativo-list',
  standalone: true,
  imports: [
    JsonPipe,
    DecimalPipe,
    NgbModalModule
  ],
  templateUrl: './ativo-list.component.html',
  styleUrl: './ativo-list.component.scss'
})
export class AtivoListComponent {

  private modalService = inject(ModalService);

  private investimentoStateService = inject(InvestimentoStateService);
  
  @Input() ativos: Ativo[] = [];

  @Output() onRemoveAtivo = new EventEmitter<Ativo>();

  removerAtivo(ativo: Ativo): void {
    this.onRemoveAtivo.emit(ativo);
  }

  editarAtivo(ativo: Ativo) {
    this.modalService.openAtivoModalComponent(ativo).subscribe(result=>{
      const ativo = result.dados as Ativo;
      switch(result.comando) {
        case 'cancelar':
          break;
        case 'excluir':
          this.investimentoStateService.removerAtivo(ativo);
          break;
        case'salvar':
          if (ativo._id !== ativo.identity) {
            this.investimentoStateService.adicionarAtivo(ativo);
          }
          else {
            this.investimentoStateService.atualizarAtivo(ativo);
          }
          break;
        default:
          break;
      }
    })
  }

  adicionarAtivo(): void {
    const novoAtivo = createAtivo();
    this.editarAtivo(novoAtivo);
  }

}
