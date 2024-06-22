import { Component, OnInit } from '@angular/core';
import { Ativo, Carteira } from '../../../models/investimento.model';
import { AppData } from '../../../models/app.models';
import { Store } from '@ngrx/store';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';
import { JsonPipe } from '@angular/common';
import { addCarteira, removeAtivoCarteira } from '../../../store/carteira.actions';
import { Moeda } from '../../../models/base.model';
import { addAtivo, removeAtivo } from '../../../store/ativo.actions';
import { AtivoItemComponent } from '../ativo-item/ativo-item.component';

@Component({
  selector: 'app-carteira-list',
  standalone: true,
  imports: [
    JsonPipe,
    CarteiraTableComponent,
    AtivoItemComponent
  ],
  templateUrl: './carteira-list.component.html',
  styleUrl: './carteira-list.component.scss'
})
export class CarteiraListComponent implements OnInit {

  appData: AppData = new AppData();

  constructor(private store: Store<any>) { }

  ngOnInit(): void {
    this.store.select('investimento').subscribe((investimento) => {
      this.appData = investimento;
      console.log(this.appData);
    });
  }

  trackByIdentity(index: number, item: Carteira) {
    console.log(`trackByIdentity: index: ${index}, identity: ${item.identity}`);

    return item.identity;
  }

  adicionarCarteira() {
    const carteira = new Carteira({
      nome: 'Carteira' + this.appData.carteiras.length,
      ativos: [],
      tipo: 'Carteira',
      moeda: Moeda.BRL
    });
    this.store.dispatch(addCarteira({ carteira }))
  }

  adicionarAtivo() {
    const ativo = new Ativo({
      moeda: Moeda.BRL,
      nome: 'Ativo' + this.appData.ativos.length,
      tipo: 'Acao',
      valor: 0
    });
    this.store.dispatch(addAtivo({ ativo }))
  }

  removeAtivo(ativo: Ativo) {
    this.appData.carteiras.forEach(carteira=>{
      if (carteira.ativos.find(item=> item.identity === ativo.identity)) {
        this.store.dispatch(removeAtivoCarteira({ carteira, ativo}))
      }
    })
    this.store.dispatch(removeAtivo({ ativo }))
  }
    
}
