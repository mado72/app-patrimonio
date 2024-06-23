import { createReducer, on } from "@ngrx/store";
import { DataLoadAtivo, LoadStatus } from "../models/app.models";
import { ativoActions } from "./ativo.actions";


const initialState: DataLoadAtivo = {
    items: [],
    status: LoadStatus.Empty,
    error: undefined
}

export const ativoReducer = createReducer(
    initialState,
    on(ativoActions.getAtivos, (state) => ({
        ...state,
        error: undefined,
        status: LoadStatus.Loading
    })),
    on(ativoActions.getAtivosSuccess, (state, payload) => ({
        ...state,
        items: [...payload.ativos],
        status: LoadStatus.Loaded
    })),
    on(ativoActions.getAtivosError, (state, payload) => ({
        ...state,
        items: [],
        error: payload.error,
        status: LoadStatus.Error
    })),

    on(ativoActions.addAtivo, (state, payload) => ({
        ...state,
        items: [...state.items, payload.ativo],
        status: LoadStatus.Adding,
        error: undefined,
    })),
    on(ativoActions.addAtivoSuccess, (state, payload) => ({
        ...state,
        items: [...state.items],
        status: LoadStatus.Added,
    })),
    on(ativoActions.addAtivoError, (state, payload) => ({
        ...state,
        items: [...state.items].filter(item=>item.identity !== payload.ativo.identity),
        error: payload.error,
        status: LoadStatus.Error
    })),

    
    on(ativoActions.removeAtivo, (state, payload) => ({
        ...state,
        items: state.items.filter(item => item.identity !== payload.ativo.identity),
        error: undefined,
        status: LoadStatus.Deleting
    })),
    on(ativoActions.removeAtivoSuccess, (state, payload) => ({
        ...state,
        status: LoadStatus.Deleted
    })),
    on(ativoActions.removeAtivoError, (state, payload) => ({
        ...state,
        items: [...state.items, payload.ativo],
        status: LoadStatus.Error,
        error: payload.error
    })),

    on(ativoActions.updateAtivo, (state, payload) => ({
        ...state,
        items: state.items.map(item => item.identity == payload.ativo.identity ? payload.ativo : item),
        error: undefined,
        status: LoadStatus.Updating
    })),
    on(ativoActions.updateAtivoSuccess, (state, payload) => ({
        ...state,
        status: LoadStatus.Updated
    })),
    on(ativoActions.updateAtivoError, (state, payload) => ({
        ...state,
        status: LoadStatus.Error,
        error: payload.error
    }))
)
