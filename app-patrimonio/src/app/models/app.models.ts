import { Cotacao } from "./cotacao.models";
import { Ativo, Carteira } from "./investimento.model";

export class AppData {
    carteiras: Carteira[] = [];
    ativos: Ativo[] = []
    cotacoes: Cotacao[] = [];
}