import { ActionReducerMap, createFeatureSelector, createSelector } from "@ngrx/store";
import { Ativo, AtivoEntityState } from "../models/investimento.model";
import * as fromAtivo from './ativo.reducers';
import { selectAtivoIdentity } from "./investimento.adapters";

const selectEntities = (state: AtivoEntityState) => state.entities;
const selectAll = (state: AtivoEntityState) => Object.values(state.entities) as Ativo[];

export interface AtivoState {
    ativos: AtivoEntityState;
}

export const ativoReducers: ActionReducerMap<AtivoState> = {
    ativos: fromAtivo.ativoReducer,
}

const selectAtivoState = createFeatureSelector<AtivoEntityState>('ativo');

export const selectAtivoEntities = createSelector(
    selectAtivoState,
    selectEntities
)

export const selectAtivoAll = createSelector(
    selectAtivoState,
    selectAll
)

export const selectCurrentAtivo = createSelector(
    selectAtivoEntities,
    selectAtivoIdentity,
    (entities, ativoIdentity) => ativoIdentity && entities[ativoIdentity]
)

export const selectAtivoId = createSelector(
    selectAtivoEntities,
    (ativo: Ativo) => ativo._id,
    (entities, id) => id && Object.values(entities).find(ativo=>ativo?._id == id)
)

export const selectAtivoStatus = createSelector(
    selectAtivoState,
    (state) => state.status
)

export const selectAtivoErrors = createSelector(
    selectAtivoState,
    (state) => state.error
)
