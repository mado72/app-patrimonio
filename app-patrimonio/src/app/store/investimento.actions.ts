import { createAction, createActionGroup, createReducer, props } from "@ngrx/store";
import { InvestimentoData, investimentoInitialState } from "../models/app.models";

class InvestimentoActions {

    readonly obterAlocacoes = createAction("[Investimento] obterAlocacoes");
    readonly obterAlocacoesSuccess = createAction("[Investimento] obterAlocacoes success", props<{alocacoes: InvestimentoData}>());
    readonly obterAlocacoesFailure = createAction("[Investimento] obterAlocacoes failure", props<{error: any}>());

}

export const investimentoActions = new InvestimentoActions();

export const investimentoReducers = createReducer(
    investimentoInitialState
)
