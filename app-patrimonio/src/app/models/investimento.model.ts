import { Observable } from "rxjs";
import { Moeda } from "./base.model";
import { Cotacao } from "./cotacao.models";
import { StateStatus } from "./app.models";

export type TipoInvestimento = 'Carteira' | 'Acao' | 'Fundo' | 'Moeda'

export type CotacaoFn = () => Observable<number>;

export type IInvestimento = Omit<Investimento, "identity">;

export type InvestimentoIdentity = Pick<Investimento, "identity">;

abstract class Investimento {
    _id?: string;
    identity: string;
    nome: string;
    tipo: TipoInvestimento;
    moeda: Moeda;

    constructor(investimento: IInvestimento | Investimento) {
        this._id = investimento._id;
        this.identity = this._id || (<Investimento>investimento).identity || crypto.randomUUID();
        this.nome = investimento.nome;
        this.tipo = investimento.tipo;
        this.moeda = investimento.moeda;
    }

    abstract get valor(): number;
}

export function valorMoedaInvestimento(inv: Investimento, cotacao: Cotacao) {
    return inv.valor * cotacao.valor;
}

export type IAtivo = Omit<Ativo, "identity"> & {
    valor: number;
};

export class Ativo extends Investimento {

    private _valor!: number;

    sigla: string;

    siglaYahoo?: string;

    cotacao?: Cotacao;

    constructor(ativo: IAtivo) {
        super(ativo);
        this._valor = ativo.valor;
        this.sigla = ativo.sigla;
        this.siglaYahoo = ativo.siglaYahoo;
    }

    get valor() {
        return this._valor;
    }

    set valor(v: number) {
        this._valor = v;
    }

}

export function valorAtivoEm(ativo: IAtivo, outraCotacao: Cotacao) {
    if (!ativo.cotacao) {
        throw `Cotação não definida para o ativo ${ativo.sigla}`
    }
    return ativo.valor * ativo.cotacao.converterPara(outraCotacao)
}


export type ICarteira = Omit<Carteira, "identity" | "valor">;

export interface CarteiraAtivo {
    ativoId: string;
    quantidade: number;
    objetivo: number;
    vlInicial: number;
    vlAtual?: number;
    ativo?: Ativo;
}

export class Carteira extends Investimento {

    ativos: CarteiraAtivo[];

    constructor(carteira: ICarteira | Carteira, ativos?: CarteiraAtivo[]) {
        super({ ...carteira, valor: 0 });
        this.ativos = ativos || carteira.ativos;
    }

    get valor() {
        if (!this.ativos) {
            return 0;
        }
        return this.ativos.reduce((acc, ativo) => acc += ativo?.vlAtual || 0, 0);
    }
}

export type YahooQuote = {
    "_id"?: string,
    "simbolo": string,
    "data": string,
    "dataColeta": Date,
    "maxima": number,
    "minima": number,
    "moeda": string,
    "preco": number,
    "variacao": number,
    "nome": string,
    "curto": string,
    "dividendo": number,
    "dividendoTaxa": number,
    "horaMercado": Date
}

export function createCarteira(): Carteira {
    return new Carteira({
        ativos: [],
        nome: '',
        moeda: Moeda.BRL,
        tipo: 'Carteira'
    })
}

export function createAtivo(): Ativo {
    return new Ativo({
        sigla: '',
        nome: '',
        moeda: Moeda.BRL,
        valor: 0,
        tipo: 'Acao'
    })
}
