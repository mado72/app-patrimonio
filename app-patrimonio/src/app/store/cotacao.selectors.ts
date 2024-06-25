import { ActionReducerMap, createFeatureSelector, createSelector } from "@ngrx/store";
import { Cotacao } from "../models/cotacao.models";
import * as fromCotacoes from './cotacao.reducers';
import { CotacaoEntityState } from "./investimento.adapters";

const selectEntities = (state: CotacaoEntityState) => state.entities;
const selectAll = (state: CotacaoEntityState) => Object.values(state.entities) as Cotacao[];

export interface CotacaoState {
    cotacoes: CotacaoEntityState
}

export const cotacaoReducers: ActionReducerMap<CotacaoState> = {
    cotacoes: fromCotacoes.cotacaoReducer
}

export const selectCotacaoState = createFeatureSelector<CotacaoEntityState>('cotacao');

export const selectCotacaoEntities = createSelector(
    selectCotacaoState,
    selectEntities
)

export const selectCotacoesAll = createSelector(
    selectCotacaoState,
    selectAll
)

export const selectCurrentCotacao = (sigla: string) => createSelector(
    selectCotacaoEntities,
    (entities) => entities[sigla]
)

export const selectCotacaoStatus = createSelector(
    selectCotacaoState,
    (state) => state.status
)