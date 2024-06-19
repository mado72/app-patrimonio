import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarteiraListComponent } from './components/investimento/carteira-list/carteira-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CarteiraListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app-patrimonio';
}
