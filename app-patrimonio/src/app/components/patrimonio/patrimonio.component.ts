import { Component } from '@angular/core';
import { PortifolioComponent } from '../investimento/portifolio/portifolio.component';

@Component({
  selector: 'app-patrimonio',
  standalone: true,
  imports: [PortifolioComponent],
  templateUrl: './patrimonio.component.html',
  styleUrl: './patrimonio.component.scss'
})
export class PatrimonioComponent {

}
