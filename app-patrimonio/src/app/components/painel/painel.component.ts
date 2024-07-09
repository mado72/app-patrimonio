import { Component } from '@angular/core';
import { PortifolioComponent } from '../investimento/portifolio/portifolio.component';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [
    PortifolioComponent
  ],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent {

}
