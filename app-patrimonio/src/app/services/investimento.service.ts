import { Injectable } from '@angular/core';
import { AtivoService } from './ativo.service';
import { CarteiraService } from './carteira.service';
import { CotacaoService } from './cotacao.service';
import { concatMap, forkJoin, map, mergeMap, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestimentoService {

  constructor(
    private carteiraService: CarteiraService,
    private ativoService: AtivoService,
    private cotacaoService: CotacaoService
  ) { }

  obterAlocacoes() {
    return forkJoin({ 
      carteiras: this.carteiraService.getCarteiras(),
      ativos: this.ativoService.getAtivos()
    }).pipe(
      mergeMap(({ carteiras, ativos }) => 
        this.cotacaoService.getCotacoes(ativos).pipe(
          map(cotacoes=>({
            carteiras,
            ativos,
            cotacoes
          }))
        )
      ))
  }
}
