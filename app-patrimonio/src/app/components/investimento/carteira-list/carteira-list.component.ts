import { Component, OnInit } from '@angular/core';
import { Carteira } from '../../../models/investimento.model';
import { AppData } from '../../../models/app.models';
import { Store } from '@ngrx/store';
import { CarteiraTableComponent } from '../carteira-table/carteira-table.component';
import { JsonPipe } from '@angular/common';
import { addCarteira } from '../../../store/carteira.actions';
import { Moeda } from '../../../models/base.model';

@Component({
  selector: 'app-carteira-list',
  standalone: true,
  imports: [
    JsonPipe,
    CarteiraTableComponent
  ],
  templateUrl: './carteira-list.component.html',
  styleUrl: './carteira-list.component.scss'
})
export class CarteiraListComponent implements OnInit {

  appData: AppData = new AppData();

  constructor(private store: Store<any>) {}

  ngOnInit(): void {
    this.store.select('investimento').subscribe((investimento)=>{
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
      nome: 'Carteira'+ this.appData.carteiras.length,
      ativos: [],
      tipo: 'Carteira',
      moeda: Moeda.BRL
    });
    this.store.dispatch(addCarteira({ carteira: carteira }))
  }
  
}
