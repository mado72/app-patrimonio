import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DataLoadAtivo, DataLoadCarteira, DataLoadCotacao } from "../models/app.models";

const carteiraFeatureSelector = createFeatureSelector<DataLoadCarteira>("Carteira");
const ativoFeatureSelector = createFeatureSelector<DataLoadAtivo>("Ativo");
const cotacaoFeatureSelector = createFeatureSelector<DataLoadCotacao>("Cotacao");

export const getCarteirasState = createSelector(
    carteiraFeatureSelector,
    (state: DataLoadCarteira) => state
)

export const getAtivosState = createSelector(
    ativoFeatureSelector,
    (state: DataLoadAtivo) => state
)

export const getCotacoesState = createSelector(
    cotacaoFeatureSelector,
    (state: DataLoadCotacao) => state
)

