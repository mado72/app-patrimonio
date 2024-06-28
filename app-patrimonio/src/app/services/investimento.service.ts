import { Injectable } from '@angular/core';
import { AtivoService } from './ativo.service';
import { CarteiraService } from './carteira.service';
import { CotacaoService } from './cotacao.service';
import { concatMap, forkJoin, map, mergeMap, switchMap } from 'rxjs';
import { InvestimentoData } from '../models/app.models';

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
    return this.ativoService.getAtivos().pipe(
      mergeMap(ativos=>{
        return forkJoin({
          carteiras: this.carteiraService.getCarteiras({}),
          cotacoes: this.cotacaoService.getCotacoes(ativos)
        }).pipe(
          map(item=>{
            const mapCotacoes = new Map(item.cotacoes.map(cotacao=>[cotacao.simbolo, cotacao]));
            ativos.filter(ativo=>ativo.siglaYahoo).forEach(ativo=>ativo.cotacao = mapCotacoes.get(ativo.siglaYahoo as string));

            const mapAtivos = new Map(ativos.map(ativo=>[ativo.identity, ativo]));
            item.carteiras.forEach(carteira=>{
              carteira.ativos.forEach(item=>item.ativo = mapAtivos.get(item.ativoId));
              carteira.ativos = carteira.ativos.sort((a, b)=>a.ativo && b.ativo ? a.ativo?.sigla.localeCompare(b.ativo?.sigla) : (a.ativo ? -1 : 1))
            })

            return {ativos, carteiras: item.carteiras, cotacoes: item.cotacoes};
          }),
          map(investimentoData=>({
            carteiras: investimentoData.carteiras.sort((a,b)=>a.nome.localeCompare(b.nome)),
            ativos: investimentoData.ativos.sort((a,b)=>a.sigla.localeCompare(b.sigla)),
            cotacoes: investimentoData.cotacoes.sort((a,b)=>a.simbolo.localeCompare(b.simbolo))
          } as InvestimentoData))
        )
      }));
  }
}
