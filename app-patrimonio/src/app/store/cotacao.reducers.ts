import { EntityState } from "@ngrx/entity";
import { LoadStatus } from "../models/app.models";
import { CotacaoEntityState } from "../models/investimento.model";
import { createReducer, on } from "@ngrx/store";
import { cotacaoActions } from "./cotacao.actions";
import { cotacaoAdapter } from "./investimento.adapters";
import { Cotacao } from "../models/cotacao.models";

export const initialStateCotacao: CotacaoEntityState = {
    entities: {},
    ids: [],
    status: LoadStatus.Empty,
    error: undefined
}


export const cotacaoReducer = createReducer(
    initialStateCotacao,

    on(cotacaoActions.getCotacoes.getCotacoesExecute, (state, payload) => 
        ({
            ...state,
            status: LoadStatus.Loading,
            error: undefined
        })
    ),
    on(cotacaoActions.getCotacoes.getCotacoesSuccess, (state, payload) =>
        cotacaoAdapter.setAll(
            payload.cotacoes, 
        {   ...state,
            status: LoadStatus.Loaded
        })
    ),
    on(cotacaoActions.getCotacoes.getCotacoesFailure, (state, payload) =>
        cotacaoAdapter.setAll([], {
            ...state,
            status: LoadStatus.Error,
            error: payload.error
        })
    ),

    on(cotacaoActions.setCotacao.setCotacaoExecute, (state, payload)=>
        cotacaoAdapter.mapOne({
            id: payload.cotacao.simbolo,
            map: cotacao=> payload.cotacao
        }, {
            ...state,
            status: LoadStatus.Updating,
            error: undefined
        })
    ),
    on(cotacaoActions.setCotacao.setCotacaoSuccess, (state, payload)=>
        ({
            ...state,
            status: LoadStatus.Updated
        })
    ),
    on(cotacaoActions.setCotacao.setCotacaoFailure, (state, payload)=>
        ({
            ...state,
            status: LoadStatus.Error,
            error: payload.error
        })
    )
)