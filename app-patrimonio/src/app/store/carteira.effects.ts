import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CarteiraService } from "../services/carteira.service";
import { inject } from "@angular/core";
import { carteiraActions } from "./carteira.actions";
import { catchError, map, mergeMap, of } from "rxjs";


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
