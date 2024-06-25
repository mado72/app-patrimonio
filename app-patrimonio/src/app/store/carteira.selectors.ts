import { ActionReducerMap, createFeatureSelector, createSelector } from "@ngrx/store";
import { Carteira, CarteiraEntityState } from "../models/investimento.model";
import * as fromCarteira from './carteira.reducers';
import { selectCarteiraIdentity } from "./investimento.adapters";

const selectEntities = (state: CarteiraEntityState) => state.entities;
const selectAll = (state: CarteiraEntityState) => Object.values(state.entities) as Carteira[];

export interface CarteiraState {
    carteiras: CarteiraEntityState;
}

export const carteiraReducers: ActionReducerMap<CarteiraState> = {
    carteiras: fromCarteira.carteiraReducer
}

export const selectCarteiraState = createFeatureSelector<CarteiraEntityState>('carteira');

export const selectCarteiraEntities = createSelector(
    selectCarteiraState,
    selectEntities
);

export const selectCarteirasAll = createSelector(
    selectCarteiraState,
    selectAll
);

export const selectCurrentCarteira = (identity: string) => createSelector(
    selectCarteiraEntities,
    (entities) => entities[identity]
)


export const selectCarteiraStatus = createSelector(
    selectCarteiraState,
    (state) => state.status
)
