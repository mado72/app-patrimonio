import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, map, tap } from 'rxjs';
import { AtivoModalComponent } from '../components/investimento/ativo-modal/ativo-modal.component';
import { CarteiraAtivoModalComponent } from '../components/investimento/carteira-ativo-modal/carteira-ativo-modal.component';
import { Ativo, CarteiraAtivo } from '../models/investimento.model';

export type ModalResult = {
  comando: 'cancelar' | 'excluir' | 'salvar',
  ativo?: Ativo,
  carteiraAtivo?: CarteiraAtivo
}


@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private modal: NgbModal) { }

  openAtivoModalComponent(ativo: Ativo) {
        
    const modalRef = this.modal.open(AtivoModalComponent, { size: 'lg' });
    const component = modalRef.componentInstance as AtivoModalComponent;
    
    component.ativo = {...ativo} as Ativo;
    component.onClose.subscribe(()=>modalRef.dismiss('cancelar'));
    component.onRemove.subscribe((event)=>modalRef.close({comando: 'excluir', ativo: event} as ModalResult));
    component.onSave.subscribe((event)=>modalRef.close({comando: 'salvar', ativo: event} as ModalResult));

    return from(modalRef.result).pipe(
      map(r=>r as ModalResult)
    )

  }

  openCarteiraAtivoModalComponent(ativos: Ativo[], carteiraAtivo?: CarteiraAtivo) {
    if (!carteiraAtivo) {
      carteiraAtivo = CarteiraAtivoModalComponent.createCarteiraAtivo();
    }
    const modalRef = this.modal.open(CarteiraAtivoModalComponent, { size: 'lg' });
    const component = modalRef.componentInstance as CarteiraAtivoModalComponent;
    
    component.ativos = ativos;
    component.carteiraAtivo = carteiraAtivo;
    component.onCancelar.subscribe(()=>modalRef.dismiss({comando: 'cancelar'}));
    component.onExcluir.subscribe((event)=>modalRef.close({comando: 'excluir', carteiraAtivo: event} as ModalResult));
    component.onSalvar.subscribe((event)=>{
      console.log(`Salvando carteiraAtivo`, event);
      modalRef.close({comando: 'salvar', carteiraAtivo: event} as ModalResult);
    });

    const subscription = component.onTermoChanged.subscribe((termo)=>{
      termo = termo.toLocaleUpperCase();
      component.ativos = ativos.filter(ativo=> ativo.sigla.toLocaleUpperCase().includes(termo)
          || ativo.nome.toLocaleUpperCase().includes(termo))
    });

    return from(modalRef.result).pipe(
      tap(()=>subscription.unsubscribe()),
      map((r:ModalResult)=>{
        console.log(`Modal Result: `, r);
        if (!r.carteiraAtivo) throw `Ativo não selecionado`
        return r
      })
    );
  }
}
