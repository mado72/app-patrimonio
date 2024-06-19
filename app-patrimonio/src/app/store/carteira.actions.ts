import { createAction, props } from "@ngrx/store";
import { Ativo, Carteira } from "../models/investimento.model";

export const getCarteiras = createAction("[Carteira] obterCarteiras", props<{carteiras: Carteira[]}>())
export const addCarteira = createAction("[Carteira] adicionada", props<{carteira: Carteira}>())
export const removeCarteira = createAction("[Carteira] removida", props<{carteira: Carteira}>())
export const updateCarteira = createAction("[Carteira] alterada", props<{carteira: Carteira}>())

export const getAtivosCarteira = createAction("[AtivosCarteira] consultado ativos da carteira", props<{ativos: Ativo[], carteira: Carteira}>())
export const addAtivoCarteira = createAction("[Ativo] adicionado na carteira", props<{ativo: Ativo, carteira: Carteira}>())
export const removeAtivoCarteira = createAction("[Ativo] removido da carteira", props<{ativo: Ativo, carteira: Carteira}>())
