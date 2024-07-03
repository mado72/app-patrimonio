import { createAction, createActionGroup, createReducer, props } from "@ngrx/store";
import { InvestimentoData, investimentoInitialState } from "../models/app.models";
import { Ativo, Carteira } from "../models/investimento.model";
import { Cotacao } from "../models/cotacao.models";

class InvestimentoActions {

    readonly obterAlocacoes = createActionGroup({
        source: "Investimento",
        events: {
            getItems: props<any>(),
            getItemsSuccess: props<{ alocacoes: InvestimentoData }>(),
            getItemsFailure: props<{ error: any }>()
        }
    })

    readonly obterAlocacao = createActionGroup({
        source: "Investimento",
        events: {
            getItem: props<{ carteiraId: string }>(),
            getItemSuccess: props<{ alocacao: {carteira: Carteira, ativos: Ativo[], cotacoes: Cotacao[]} }>(),
            getItemFailure: props<{ error: any, carteiraId: string }>()
        }
    })

}

export const investimentoActions = new InvestimentoActions();

export const investimentoReducers = createReducer(
    investimentoInitialState
)
