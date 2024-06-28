import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProtifolioComponent } from './components/investimento/protifolio/protifolio.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProtifolioComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app-patrimonio';
}
