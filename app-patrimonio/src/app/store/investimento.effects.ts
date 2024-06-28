import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, mergeMap, of, switchMap } from "rxjs";
import { InvestimentoService } from "../services/investimento.service";
import { ativoActions } from "./ativo.actions";
import { carteiraActions } from "./carteira.actions";
import { cotacaoActions } from "./cotacao.actions";
import { investimentoActions } from "./investimento.actions";

export const obterAlocacoesEffects = createEffect((
    action$ = inject(Actions),
    service = inject(InvestimentoService)
) => action$.pipe(
    ofType(investimentoActions.obterAlocacoes),
    mergeMap(()=>
        service.obterAlocacoes().pipe(
            switchMap((alocacoes) => of(
                ativoActions.getAtivosSuccess({ativos: alocacoes.ativos}),
                carteiraActions.getCarteirasSuccess({carteiras: alocacoes.carteiras}),
                cotacaoActions.getCotacoes.getCotacoesSuccess({cotacoes: alocacoes.cotacoes})
            )),
            catchError((error) => of(investimentoActions.obterAlocacoesFailure({ error })))
        )
    )
), {functional: true});

