import { createAction, props } from "@ngrx/store"
import { Ativo } from "../models/investimento.model"
import { Update } from "@ngrx/entity";

class AtivoActions {

    readonly getAtivos = createAction("[Ativos] get ativos");
    readonly getAtivosSuccess = createAction("[Ativos] get ativos sucesso", props<{ativos: Ativo[]}>());
    readonly getAtivosError = createAction("[Ativos] get ativos erro", props<{error: any}>());

    readonly addAtivo = createAction("[Ativo] adicionar", props<{ativo: Ativo}>())
    readonly addAtivoSuccess = createAction("[Ativo] adicionar sucesso", props<{ativo: Ativo}>())
    readonly addAtivoError = createAction("[Ativo] adicionar erro", props<{ativo: Ativo, error: any}>())

    readonly removeAtivo = createAction("[Ativo] removido", props<{ativo: Ativo}>())
    readonly removeAtivoSuccess = createAction("[Ativo] removido sucesso", props<{ativo: Ativo}>())
    readonly removeAtivoError = createAction("[Ativo] removido erro", props<{ativo: Ativo, error: any}>())

    readonly updateAtivo = createAction("[Ativo] alterado", props<{ativo: Ativo}>())
    readonly updateAtivoSuccess = createAction("[Ativo] alterado sucesso", props<{ativo: Ativo}>())
    readonly updateAtivoError = createAction("[Ativo] alterado erro", props<{ativo: Ativo, error: any}>())
    
    readonly updateCotacoes = createAction("[Ativo] updateCotacoes", props<{update: Update<Ativo>[]}>())
}

export const ativoActions = new AtivoActions();
