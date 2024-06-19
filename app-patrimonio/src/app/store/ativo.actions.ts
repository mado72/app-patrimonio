import { createAction, props } from "@ngrx/store"
import { Ativo } from "../models/investimento.model"

export const getAtivos = createAction("[Carteira] adicionada", props<{ativos: Ativo[]}>())
export const addAtivo = createAction("[Ativo] adicionado", props<{ativo: Ativo}>())
export const removeAtivo = createAction("[Ativo] removido", props<{ativo: Ativo}>())
export const updateAtivo = createAction("[Ativo] alterado", props<{ativo: Ativo}>())
