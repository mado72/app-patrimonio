import { createAction, createActionGroup, props } from "@ngrx/store";
import { Cotacao } from "../models/cotacao.models";
import { Ativo } from "../models/investimento.model";

export const updateAtivoCotacao = createAction("[Cotacao] cotação atualizada no ativo", props<{ativo: Ativo, cotacao: Cotacao}>());

class CotacaoActions {
    readonly getCotacoes = createActionGroup({
        source: '[Cotacao]',
        events: {
            execute: props<{ativos: Ativo[]}>(),
            getCotacoesSuccess: props<{cotacoes: Cotacao[]}>(),
            getCotacoesFailure: props<{error: any}>(),
        }
    })

    readonly setCotacao = createActionGroup({
        source: '[Cotacao]',
        events: {
            execute: props<{cotacao: Cotacao}>(),
            setCotacaoSuccess: props<{cotacao: Cotacao}>(),
            setCotacaoFailure: props<{error: any}>()
        }
    })
}


export const cotacaoActions = new CotacaoActions();