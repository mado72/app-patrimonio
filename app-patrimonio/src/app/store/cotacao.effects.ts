import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CotacaoService } from "../services/cotacao.service";
import { cotacaoActions } from "./cotacao.actions";
import { catchError, map, mergeMap, of, switchMap, tap } from "rxjs";
import { Cotacao } from "../models/cotacao.models";
import { ativoActions } from "./ativo.actions";
import { Ativo } from "../models/investimento.model";

export const getCotacoesEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CotacaoService)
) => action$.pipe(
    ofType(cotacaoActions.getCotacoes.getCotacoesExecute),
    mergeMap((item) =>
        service.getCotacoes(item.ativos).pipe(
            map(cotacoes=>{
                const mapCotacoes = new Map(cotacoes.map(cotacao=>[cotacao.simbolo, cotacao]));
                const ativos = item.ativos.map(ativo=>{
                    ativo = {...ativo} as Ativo;
                    ativo.cotacao = mapCotacoes.get(ativo.sigla);
                    return ativo;
                });
                return {ativos, cotacoes};
            }),
            switchMap((update)=>
                of(
                    cotacaoActions.getCotacoes.getCotacoesSuccess({cotacoes: update.cotacoes}),
                    ativoActions.updateCotacoes({update: update.ativos.map(ativo=>({id: ativo.identity, changes: ativo}))})
                )
            ),
            catchError(error=> of(cotacaoActions.getCotacoes.getCotacoesFailure({error})))
        )
    )
), {functional: true})

export const setCotacaoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CotacaoService)
) => action$.pipe(
    ofType(cotacaoActions.setCotacao.setCotacaoExecute),
    mergeMap((item) =>
        service.setCotacao(item.cotacao.simbolo, item.cotacao.valor, item.cotacao.moeda).pipe(
            map(cotacao=> 
                cotacaoActions.setCotacao.setCotacaoSuccess({ cotacao }),
            ),
            catchError(error=> of(cotacaoActions.setCotacao.setCotacaoFailure({error})))
        )
    )
), {functional: true})