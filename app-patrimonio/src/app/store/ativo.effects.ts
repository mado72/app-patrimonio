import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of, switchAll, switchMap } from "rxjs";
import { Carteira, CarteiraAtivo } from "../models/investimento.model";
import { AtivoService } from "../services/ativo.service";
import { ativoActions } from "./ativo.actions";
import { carteiraActions } from "./carteira.actions";
import { carteirasSelectors } from "./investimento.selectors";

export const getAtivosEffects = createEffect((
    action$ = inject(Actions),
    service = inject(AtivoService)
) => action$.pipe(
    ofType(ativoActions.getAtivos),
    switchMap(() => service.getAtivos().pipe(
        map(ativos => ativoActions.getAtivosSuccess({ ativos })),
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
    mergeMap((payload) => 
        service.removeAtivo(payload.ativo).pipe(
            switchMap(ativo=>
                of(
                    carteiraActions.removeAtivoDeCarteiras.removeItens({ ativoId: payload.ativo.identity }),
                    ativoActions.removeAtivoSuccess({ ativo: payload.ativo})
                )
            ),
            map(()=>ativoActions.removeAtivoSuccess({ativo: payload.ativo})),
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

