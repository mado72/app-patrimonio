import { Component } from '@angular/core';
import { PortifolioComponent } from '../investimento/portifolio/portifolio.component';
import { ContaListComponent } from '../patrimonio/conta-list/conta-list.component';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [
    PortifolioComponent,
    ContaListComponent,
  ],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent {

}
