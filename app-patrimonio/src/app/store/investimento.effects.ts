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
    ofType(investimentoActions.obterAlocacoes.getItems),
    mergeMap(()=>
        service.obterAlocacoes().pipe(
            switchMap((alocacoes) => of(
                investimentoActions.obterAlocacoes.getItemsSuccess({alocacoes}),
                ativoActions.getAtivosSuccess({ativos: alocacoes.ativos}),
                carteiraActions.getCarteirasSuccess({carteiras: alocacoes.carteiras}),
                cotacaoActions.getCotacoes.getCotacoesSuccess({cotacoes: alocacoes.cotacoes})
            )),
            catchError((error) => of(investimentoActions.obterAlocacoes.getItemsFailure({ error })))
        )
    )
), {functional: true});

export const obterAlocacaoEffects = createEffect((
    action$ = inject(Actions),
    service = inject(InvestimentoService)
) => action$.pipe(
    ofType(investimentoActions.obterAlocacao.getItem),
    mergeMap((item)=>
        service.obterAlocacao(item.carteiraId).pipe(
            switchMap((alocacao) => of(
                investimentoActions.obterAlocacao.getItemSuccess({alocacao}),
                ativoActions.reloadAtivos({ativos: alocacao.ativos}),
                carteiraActions.getCarteira.getCarteiraSuccess({carteira: alocacao.carteira, ativos: alocacao.carteira.ativos}),
                cotacaoActions.getCotacoes.getCotacoesSuccess({cotacoes: alocacao.cotacoes})
            )),
            catchError((error) => of(investimentoActions.obterAlocacoes.getItemsFailure({ error })))
        )
    )
), {functional: true});

