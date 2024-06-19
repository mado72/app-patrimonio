import { createAction, props } from "@ngrx/store";
import { Ativo } from "../models/investimento.model";
import { Cotacao } from "../models/cotacao.models";

export const updateAtivoCotacao = createAction("[Cotacao] cotação atualizada no ativo", props<{ativo: Ativo, cotacao: Cotacao}>());
