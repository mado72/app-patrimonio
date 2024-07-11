import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { Alocacao, Alocacoes, ConsolidacaoService } from '../../../services/consolidacao.service';

@Component({
  selector: 'app-alocacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './alocacao.component.html',
  styleUrl: './alocacao.component.scss'
})
export class AlocacaoComponent {

  private consolidacaoService = inject(ConsolidacaoService)

  private _expandido = signal(true);

  get expandido() {
    return this._expandido();
  }

  set expandido(value: boolean) {
    this._expandido.set(value);
  }

  alocacoes$ = this.obterAlocacoes();

  obterAlocacoes() {
    return toObservable(this._expandido).pipe(
      switchMap(()=> this.consolidacaoService.consolidarAlocacoes().pipe(
        map(consolidado=>{
          
          if (!this.expandido) {
            return this.consolidacaoService.consolidarPorClasse(consolidado);
          }
    
          return consolidado;
        })
      )))
  }

}
