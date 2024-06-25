import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AtivoService } from "../services/ativo.service";
import { ativoActions } from "./ativo.actions";
import { catchError, map, mergeAll, of, switchMap } from "rxjs";
import { cotacaoActions } from "./cotacao.actions";
import { CotacaoService } from "../services/cotacao.service";

export const getAtivosEffects = createEffect((
    action$ = inject(Actions),
    service = {ativoService: inject(AtivoService), cotacaoService: inject(CotacaoService)}
) => action$.pipe(
    ofType(ativoActions.getAtivos),
    switchMap(() => service.ativoService.getAtivos().pipe(
        switchMap((ativos)=>{
            return service.cotacaoService.getCotacoes(ativos).pipe(
                map((cotacoes)=>{
                    const mapCotacoes = new Map(cotacoes.map(cotacao=>[cotacao.simbolo, cotacao]));
                    ativos.forEach(ativo=>{
                        ativo.cotacao = mapCotacoes.get(ativo.sigla);
                    })
                    return ativos;
                })
            )
        }),
        map(ativos=>ativoActions.getAtivosSuccess({ ativos })),
        catchError(error => of(ativoActions.getAtivosError({ error })))
    ))
), { functional: true})

export const addAtivoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(AtivoService)
) => action$.pipe(
    ofType(ativoActions.addAtivo),
    switchMap((payload) => service.addAtivo(payload.ativo).pipe(
        map(ativo => ativoActions.addAtivoSuccess({ ativo })),
        catchError(error => of(ativoActions.addAtivoError({ativo: payload.ativo, error}))),
    ))
), { functional: true})

export const removeAtivoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(AtivoService)
) => action$.pipe(
    ofType(ativoActions.removeAtivo),
    switchMap((payload) => service.removeAtivo(payload.ativo).pipe(
        map(ativo => ativoActions.removeAtivoSuccess({ ativo })),
        catchError(error => of(ativoActions.removeAtivoError({ ativo: payload.ativo, error })))
    ))
), { functional: true})

export const updateAtivoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(AtivoService)
) => action$.pipe(
    ofType(ativoActions.updateAtivo),
    switchMap((payload) => service.updateAtivo(payload.ativo).pipe(
        map(ativo => ativoActions.updateAtivoSuccess({ ativo })),
        catchError(error => of(ativoActions.updateAtivoError({ ativo: payload.ativo, error })))
    ))
), { functional: true})

