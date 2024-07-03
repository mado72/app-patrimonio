import { Observable } from "rxjs";
import { Moeda } from "./base.model";
import { Cotacao } from "./cotacao.models";
import { StateStatus } from "./app.models";

export enum TipoInvestimento {
    Referencia = 'Referencia',
    Carteira = 'Carteira',
    Acao = 'Acao',
    RF = 'RF',
    PosFixada = 'PosFixada',
    FundoImobiliario = 'FundoImobiliario',
    ETF = 'ETF',
    Moeda = 'Moeda' 
}

type TipoInvestimentoPropertiesAsString = {
    [key in keyof typeof TipoInvestimento]: string;
};

export const TipoInvestimentoStr : TipoInvestimentoPropertiesAsString = {
    Referencia: 'Referência',
    Carteira: 'Carteira',
    Acao: 'Ação',
    RF: 'RF',
    PosFixada: 'Pós Fixada',
    FundoImobiliario: 'Fundo Imobiliário',
    ETF: 'ETF',
    Moeda: 'Moeda' 
}

export type CotacaoFn = () => Observable<number>;

export type IInvestimento = Omit<Investimento, "identity">;

export type InvestimentoIdentity = Pick<Investimento, "identity">;

export class UUID {
    value: string;
    constructor(value?: string | UUID) {
        this.value = value?.toString() || crypto.randomUUID();
    }
    toString() {
        return this.value;
    }
}

abstract class Investimento {
    _id?: string;
    identity: string | UUID;
    nome: string;
    tipo: TipoInvestimento;
    moeda: Moeda;

    constructor(investimento: IInvestimento | Investimento) {
        this._id = investimento._id;
        this.identity = this._id || new UUID((<Investimento>investimento).identity);
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

    setor: string;

    referencia?: {
        id: string,
        tipo: TipoInvestimento
    };

    constructor(ativo: IAtivo) {
        super(ativo);
        this._valor = ativo.valor;
        this.sigla = ativo.sigla;
        this.setor = ativo.setor;
        this.siglaYahoo = ativo.siglaYahoo;
        this.referencia = ativo.referencia;
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

export type ICarteiraAtivo = Omit<CarteiraAtivo, "ativo">;

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

    objetivo: number;

    constructor(carteira: ICarteira | Carteira, ativos?: CarteiraAtivo[]) {
        super({ ...carteira, valor: 0 });
        this.ativos = ativos || carteira.ativos;
        this.objetivo = carteira.objetivo;
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
        tipo: TipoInvestimento.Carteira,
        objetivo: 0
    })
}

export function createAtivo(): Ativo {
    return new Ativo({
        sigla: '',
        nome: '',
        setor: '',
        moeda: Moeda.BRL,
        valor: 0,
        tipo: TipoInvestimento.Acao
    })
}
