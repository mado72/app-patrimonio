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
    ofType(cotacaoActions.getCotacoes.getCotacoesExecute),
    mergeMap((item) =>
        service.getCotacoes(item.ativos).pipe(
            map(cotacoes=>cotacaoActions.getCotacoes.getCotacoesSuccess({cotacoes})),
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