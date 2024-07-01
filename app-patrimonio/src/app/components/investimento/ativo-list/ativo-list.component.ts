import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { Ativo, createAtivo } from '../../../models/investimento.model';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AtivoModalComponent } from '../ativo-modal/ativo-modal.component';
import { Store } from '@ngrx/store';
import { carteiraActions } from '../../../store/carteira.actions';
import { ativosSelectors, carteirasSelectors } from '../../../store/investimento.selectors';
import { ativoActions } from '../../../store/ativo.actions';

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

  private modal = inject(NgbModal)
  
  @Input() ativos: Ativo[] = [];

  @Output() onRemoveAtivo = new EventEmitter<Ativo>();

  private store = inject(Store);


  removerAtivo(ativo: Ativo): void {
    this.onRemoveAtivo.emit(ativo);
  }

  editarAtivo(ativo: Ativo) {
    
    const modalRef = this.modal.open(AtivoModalComponent, { size: 'lg' });
    const component = modalRef.componentInstance as AtivoModalComponent;
    
    component.ativo = {...ativo} as Ativo;
    component.onClose.subscribe(()=>modalRef.dismiss('closed'));
    component.onRemove.subscribe((event)=>modalRef.close(event));
    component.onSave.subscribe((event)=>modalRef.close(event));

    modalRef.result.then((ativo: Ativo) => {
      if (ativo._id) {
        this.store.dispatch(ativoActions.updateAtivo({ativo}));
      }
      else {
        this.store.dispatch(ativoActions.addAtivo({ativo}));
      }
    });

  }

  adicionarAtivo(): void {
    const novoAtivo = createAtivo();
    this.editarAtivo(novoAtivo);
  }

}
