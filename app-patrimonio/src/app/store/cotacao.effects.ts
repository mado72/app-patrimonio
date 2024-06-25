import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CotacaoService } from "../services/cotacao.service";
import { cotacaoActions } from "./cotacao.actions";
import { catchError, map, mergeMap, of, switchMap, tap } from "rxjs";
import { Cotacao } from "../models/cotacao.models";
import { ativoActions } from "./ativo.actions";

export const getCotacoesEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CotacaoService)
) => action$.pipe(
    ofType(cotacaoActions.getCotacoes.execute),
    mergeMap((item) =>
        service.getCotacoes(item.ativos).pipe(
            switchMap(ativos=> 
                of(
                    cotacaoActions.getCotacoes.getCotacoesSuccess({
                        cotacoes: ativos.filter(ativo=>ativo.cotacao).map(ativo=>ativo.cotacao as Cotacao)
                    }),
                    ativoActions.updateCotacoes({ativos})
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
    ofType(cotacaoActions.setCotacao.execute),
    mergeMap((item) =>
        service.setCotacao(item.cotacao.simbolo, item.cotacao.valor, item.cotacao.moeda).pipe(
            map(cotacao=> 
                cotacaoActions.setCotacao.setCotacaoSuccess({ cotacao }),
            ),
            catchError(error=> of(cotacaoActions.setCotacao.setCotacaoFailure({error})))
        )
    )
), {functional: true})