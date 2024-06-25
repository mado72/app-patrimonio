import { createReducer, on } from "@ngrx/store";
import { LoadStatus } from "../models/app.models";
import { Ativo, AtivoEntityState } from "../models/investimento.model";
import { ativoActions } from "./ativo.actions";
import { Moeda } from "../models/base.model";
import { ativoAdapter } from "./investimento.adapters";

const ativoInitialState: AtivoEntityState = {
    entities: {},
    ids: [],
    original: undefined,
    status: LoadStatus.Empty,
    error: undefined
}

export const ativoReducer = createReducer(
    ativoInitialState,
    on(ativoActions.getAtivos, (state) =>
        ({
            ...state,
            error: undefined,
            status: LoadStatus.Loading
        })
    ),
    on(ativoActions.getAtivosSuccess, (state, payload) =>
        ativoAdapter.setAll(payload.ativos, {...state, status: LoadStatus.Loaded})
    ),
    on(ativoActions.getAtivosError, (state, payload) =>
        ({...ativoAdapter.getInitialState(), status: LoadStatus.Error, error: payload.error})
    ),

    on(ativoActions.addAtivo, (state, payload) =>
        ativoAdapter.addOne(payload.ativo, {...state, status: LoadStatus.Adding, error: undefined})
    ),
    on(ativoActions.addAtivoSuccess, (state, payload) => ({
        ...state,
        status: LoadStatus.Added,
    })),
    on(ativoActions.addAtivoError, (state, payload) =>
        ativoAdapter.removeOne(payload.ativo.identity, {...state, status: LoadStatus.Error, error: payload.error })
    ),

    on(ativoActions.removeAtivo, (state, payload) =>
        ativoAdapter.removeOne(payload.ativo.identity, {... state, status: LoadStatus.Deleting, error: undefined})
    ),
    on(ativoActions.removeAtivoSuccess, (state, payload) =>
        ({
            ...state,
            status: LoadStatus.Deleted 
        })
    ),
    on(ativoActions.removeAtivoError, (state, payload) =>
        ativoAdapter.addOne(payload.ativo, {...state, status: LoadStatus.Error, error: payload.error})
    ),

    on(ativoActions.updateAtivo, (state, payload) =>
        ativoAdapter.updateOne({
            id: payload.ativo.identity,
            changes: payload.ativo
        }, {...state, status: LoadStatus.Updating, error: undefined})
    ),
    on(ativoActions.updateAtivoSuccess, (state, payload) =>
        ({
            ...state,
            status: LoadStatus.Updated
        })
    ),
    on(ativoActions.updateAtivoError, (state, payload) =>
        ativoAdapter.updateOne({
            id: payload.ativo.identity,
            changes: state.original || payload.ativo
        }, {...state, status: LoadStatus.Error, error: payload.error})
    ),

    on(ativoActions.updateCotacoes, (state, payload)=>
        ativoAdapter.updateMany(payload.ativos.map(ativo=>({
            id: ativo.identity,
            changes: {...ativo}
        })), state)
    )
)

let ativoId = 0;
export function createAtivo() {
    ativoId++;
    return new Ativo({
        moeda: Moeda.BRL,
        nome: `Ativo ${ativoId}`,
        sigla: `A${ativoId}`,
        tipo: 'Acao',
        valor: 100 * Math.random()
    })
}

