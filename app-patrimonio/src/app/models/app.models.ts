import { Cotacao } from "./cotacao.models";
import { Ativo, Carteira } from "./investimento.model";

export enum LoadStatus {
    Loading  = "Loading",
    Loaded  = "Loaded",
    Adding  = "Adding",
    Added  = "Added",
    Updating  = "Updating",
    Updated  = "Updated",
    Deleting  = "Deleting",
    Deleted  = "Deleted",
    Error  = "Error",
    Empty  = "Empty"
}

export interface DataLoad<T> {
    items: T[];
    status: LoadStatus;
    error?: any;
}

export interface InvestimentoData {
    carteiras: DataLoad<Carteira>;
    ativos: DataLoad<Ativo>;
    cotacoes: DataLoad<Cotacao>;
}

export interface DataLoadCarteira extends DataLoad<Carteira> {}
export interface DataLoadAtivo extends DataLoad<Ativo> {}
export interface DataLoadCotacao extends DataLoad<Cotacao>{}
