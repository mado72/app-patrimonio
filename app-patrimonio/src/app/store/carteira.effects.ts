import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CarteiraService } from "../services/carteira.service";
import { inject } from "@angular/core";
import { carteiraActions } from "./carteira.actions";
import { catchError, map, mergeMap, of, tap } from "rxjs";


export const getCarteiraEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CarteiraService)
) => action$.pipe(
    ofType(carteiraActions.getCarteiras),
    mergeMap(() =>
        service.getCarteiras().pipe(
            map(carteiras => carteiraActions.getCarteirasSuccess({carteiras})),
            catchError(error => of(carteiraActions.getCarteirasError(error)))
        )
    )
), { functional: true})

export const addCarteiraEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CarteiraService)
) => action$.pipe(
    ofType(carteiraActions.addCarteira),
    mergeMap((item) =>
        service.addCarteira(item.carteira).pipe(
            map(carteira => carteiraActions.addCarteiraSuccess({carteira})),
            catchError(error => of(carteiraActions.addCarteiraError(error)))
        )
    )
), { functional: true})

export const removeCarteiraEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CarteiraService)
) => action$.pipe(
    ofType(carteiraActions.removeCarteira),
    mergeMap((item) =>
        service.removeCarteira(item.carteira).pipe(
            map(carteira => carteiraActions.removeCarteiraSuccess({carteira})),
            catchError(error => of(carteiraActions.removeCarteiraError(error)))
        )
    )
), { functional: true})

export const updateCarteiraEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CarteiraService)
) => action$.pipe(
    ofType(carteiraActions.removeCarteira),
    mergeMap((item) =>
        service.removeCarteira(item.carteira).pipe(
            map(carteira => carteiraActions.updateCarteiraSuccess({carteira})),
            catchError(error => of(carteiraActions.updateCarteiraError(error)))
        )
    )
), { functional: true})

export const getCarteiraAtivoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CarteiraService)
) => action$.pipe(
    ofType(carteiraActions.getCarteiraAtivos),
    mergeMap((item)=>
        service.loadCarteiraAtivos(item.carteira).pipe(
            map(carteira => carteiraActions.getCarteiraAtivosSuccess({carteira, ativos: carteira.ativos})),
            catchError(error => of(carteiraActions.updateCarteiraError({error, carteira: item.carteira})))
        )
    )
), {functional: true})

export const addCarteiraAtivoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CarteiraService)
) => action$.pipe(
    ofType(carteiraActions.addCarteiraAtivo),
    mergeMap((item)=>
        service.updateCarteira(item.carteira).pipe(
            map(carteira => carteiraActions.addCarteiraAtivoSuccess({carteira, ativo: item.ativo})),
            catchError(error => of(carteiraActions.addCarteiraAtivoError({error, carteira: item.carteira, ativo: item.ativo})))
        )
    )
), {functional: true})

export const removeCarteiraAtivoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(CarteiraService)
) => action$.pipe(
    ofType(carteiraActions.removeCarteiraAtivo),
    mergeMap((item)=>
        service.updateCarteira(item.carteira).pipe(
            map(carteira => carteiraActions.removeCarteiraAtivoSuccess({carteira, ativo: item.ativo})),
            catchError(error => of(carteiraActions.removeCarteiraAtivoError({error, carteira: item.carteira, ativo: item.ativo})))
        )
    )
), {functional: true})
