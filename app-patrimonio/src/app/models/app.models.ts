import { Comparer, EntityState, IdSelector, createEntityAdapter } from "@ngrx/entity";
import { Cotacao } from "./cotacao.models";
import { Ativo, Carteira } from "./investimento.model";

export interface InvestimentoData {
    carteiras: Carteira[];
    ativos: Ativo[];
    cotacoes: Cotacao[];
}

export interface AppData extends InvestimentoData {}

export enum StateStatus {
    Pending  = "Pending",
    Executed  = "Executed",
    Error  = "Error",
    Idle  = "Idle"
}

export interface DataState<T> extends EntityState<T> {
    status: StateStatus;
    error?: any;
}

const selectIdentityId: IdSelector<Carteira | Ativo> = (entity: Carteira | Ativo) => entity.identity.toString();
const sortNomeCompare: Comparer<Carteira | Ativo> = 
    (e1: Carteira | Ativo, e2: Carteira | Ativo) => e1.nome.localeCompare(e2.nome);

export const carteirasAdapter = createEntityAdapter<Carteira>(
    {selectId: selectIdentityId, sortComparer: sortNomeCompare});

export const ativosAdapter = createEntityAdapter<Ativo>(
    {selectId: selectIdentityId, sortComparer: sortNomeCompare});

export const cotacoesAdapter = createEntityAdapter<Cotacao>({
    selectId: (c: Cotacao) => c.simbolo,
    sortComparer: (c1: Cotacao, c2: Cotacao) => c1.simbolo.localeCompare(c2.simbolo)
});

export interface InvestimentoModelState {
    carteiras: DataStateCarteira & {ativoId?: string};
    ativos: DataStateAtivo;
    cotacoes: DataStateCotacao;
}

export const investimentoInitialState : InvestimentoModelState = {
    ativos: ativosAdapter.getInitialState({status: StateStatus.Idle, error: undefined}),
    carteiras: carteirasAdapter.getInitialState({status: StateStatus.Idle, error: undefined, ativoId: undefined}),
    cotacoes: cotacoesAdapter.getInitialState({status: StateStatus.Idle, error: undefined})
}

export interface DataStateCarteira extends DataState<Carteira> {}
export interface DataStateAtivo extends DataState<Ativo> {}
export interface DataStateCotacao extends DataState<Cotacao>{}
