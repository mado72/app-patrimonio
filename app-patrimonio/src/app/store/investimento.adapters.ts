import { EntityAdapter, createEntityAdapter } from "@ngrx/entity";
import { Ativo, Carteira, CarteiraAtivo, LoadDataEntityState } from "../models/investimento.model";
import { Cotacao } from "../models/cotacao.models";

export const selectAtivoIdentity = (ativo: Ativo) => ativo.identity;
export const selectCarteiraIdentity = (carteira: Carteira) => carteira.identity;
export const selectCotacaoSimbolo = (cotacao: Cotacao) => cotacao.simbolo;
export const selectCarteiraAtivoIdentity = (carteiraAtivo: CarteiraAtivo) => carteiraAtivo.ativoId;

export const ativoAdapter: EntityAdapter<Ativo> = createEntityAdapter<Ativo>({
    selectId: selectAtivoIdentity,
    sortComparer: (a: Ativo, b: Ativo) => a.nome.localeCompare(b.nome),
})

export const carteiraAtivoAdapter: EntityAdapter<CarteiraAtivo> = createEntityAdapter<CarteiraAtivo>({
    selectId: selectCarteiraAtivoIdentity,
    sortComparer: (a: CarteiraAtivo, b: CarteiraAtivo) => a.ativoId.localeCompare(b.ativoId),
});

export interface CarteiraEntityState extends LoadDataEntityState<Carteira> {}

export const carteiraAdapter: EntityAdapter<Carteira> = createEntityAdapter({
    selectId: selectCarteiraIdentity,
    sortComparer: (a: Carteira, b: Carteira) => a.nome.localeCompare(b.nome),
})

export interface CotacaoEntityState extends LoadDataEntityState<Cotacao>{}

export const cotacaoAdapter: EntityAdapter<Cotacao> = createEntityAdapter({
    selectId: selectCotacaoSimbolo,
    sortComparer: (a: Cotacao, b: Cotacao) => a.simbolo.localeCompare(b.simbolo)
})