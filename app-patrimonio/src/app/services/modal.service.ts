import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, from, map, of, tap } from 'rxjs';
import { AtivoModalComponent } from '../components/investimento/ativo-modal/ativo-modal.component';
import { CarteiraAtivoModalComponent } from '../components/investimento/carteira-ativo-modal/carteira-ativo-modal.component';
import { Ativo, Carteira, CarteiraAtivo } from '../models/investimento.model';
import { CarteiraModalComponent } from '../components/investimento/carteira-modal/carteira-modal.component';

export type ModalResult<T> = {
  comando: 'cancelar' | 'excluir' | 'salvar',
  dados: T
}


@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private modal: NgbModal) { }

  openAtivoModalComponent(ativo: Ativo) {
    type ResultType = ModalResult<Ativo>;
        
    const modalRef = this.modal.open(AtivoModalComponent, { size: 'lg' });
    const component = modalRef.componentInstance as AtivoModalComponent;
    
    component.ativo = ativo;
    component.onClose.subscribe(()=>modalRef.dismiss('cancelar'));
    component.onRemove.subscribe((event)=>modalRef.close({comando: 'excluir', dados: event} as ResultType));
    component.onSave.subscribe((event)=>modalRef.close({comando: 'salvar', dados: event} as ResultType));

    return from(modalRef.result).pipe(
      map(r=>r as ResultType)
    )

  }

  openCarteiraAtivoModalComponent(ativos: Ativo[], carteiraAtivo?: CarteiraAtivo) {
    type ResultType = ModalResult<CarteiraAtivo>;
    if (!carteiraAtivo) {
      carteiraAtivo = CarteiraAtivoModalComponent.createCarteiraAtivo();
    }
    const modalRef = this.modal.open(CarteiraAtivoModalComponent, { size: 'lg' });
    const component = modalRef.componentInstance as CarteiraAtivoModalComponent;
    
    component.ativos = ativos;
    component.carteiraAtivo = carteiraAtivo;
    component.onCancelar.subscribe(()=>modalRef.dismiss({comando: 'cancelar'}));
    component.onExcluir.subscribe((event)=>modalRef.close({comando: 'excluir', dados: event} as  ResultType));
    component.onSalvar.subscribe((event)=>{
      console.log(`Salvando carteiraAtivo`, event);
      modalRef.close({comando: 'salvar', dados: event} as  ResultType);
    });

    const subscription = component.onTermoChanged.subscribe((termo)=>{
      termo = termo.toLocaleUpperCase();
      component.ativos = ativos.filter(ativo=> ativo.sigla.toLocaleUpperCase().includes(termo)
          || ativo.nome.toLocaleUpperCase().includes(termo))
    });

    return from(modalRef.result).pipe(
      tap(()=>subscription.unsubscribe()),
      map((r: ResultType)=>{
        console.log(`Modal Result: `, r);
        if (!r.dados) throw `Ativo não selecionado`
        return r
      }),
      catchError(err=>of(null))
    );
  }

  openCarteiraModalComponent(carteira: Carteira) {
    type ResultType = ModalResult<Carteira>;

    const modalRef = this.modal.open(CarteiraModalComponent, {size: 'lg'});
    const component = modalRef.componentInstance as CarteiraModalComponent;

    component.carteira = carteira;
    component.onCancelar.subscribe(()=> modalRef.dismiss({comando: 'cancelar'}));
    const subscription = component.onSalvar.subscribe((event)=>modalRef.close({comando: 'salvar', dados: event} as ResultType));

    return from(modalRef.result).pipe(
      tap(()=>subscription.unsubscribe()),
      map((r: ResultType)=>{
        console.log(`Modal Result: `, r);
        if (!r.dados) throw `Carteira não salva`
        return r
      }),
      catchError(err=>of(null))
    )
  }
}
