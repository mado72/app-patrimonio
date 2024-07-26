import { Observable } from "rxjs";
import { Moeda, UUID } from "./base.model";
import { Cotacao } from "./cotacao.models";

export enum TipoInvestimento {
    Referencia = 'Referencia',
    Carteira = 'Carteira',
    Acao = 'Acao',
    RF = 'RF',
    PosFixada = 'PosFixada',
    FII = 'FII',
    ETF = 'ETF',
    Moeda = 'Moeda',
    Cripto = 'Cripto'
}

export enum MetodoCotacao {
    manual = 'manual',
    yahoo = 'yahoo',
    referencia = 'referencia', 
    tesouro = 'tesouro',
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
    FII: 'Fundo Imobiliário',
    ETF: 'ETF',
    Moeda: 'Moeda',
    Cripto: 'Cripto'
}

export type CotacaoFn = () => Observable<number>;

export type IInvestimento = Omit<Investimento, "identity">;

export type InvestimentoIdentity = Pick<Investimento, "identity">;

abstract class Investimento {
    _id?: string;
    identity: string | UUID;
    nome: string;
    moeda: Moeda;

    constructor(investimento: IInvestimento | Investimento) {
        this._id = investimento._id;
        this.identity = this._id || new UUID((<Investimento>investimento).identity);
        this.nome = investimento.nome;
        this.moeda = investimento.moeda;
    }

}

export type IAtivo = Omit<Ativo, "identity">;

export class Ativo extends Investimento {

    sigla: string;

    siglaYahoo?: string;

    cotacao?: Cotacao;

    setor: string;

    tipo?: TipoInvestimento;

    metodo: MetodoCotacao;

    referencia?: {
        id: string;
        tipo: TipoInvestimento;
    };

    constructor(ativo: IAtivo, cotacao?: Cotacao) {
        super(ativo);
        this.sigla = ativo.sigla;
        this.setor = ativo.setor;
        this.siglaYahoo = ativo.siglaYahoo;
        this.tipo = ativo.tipo;
        this.referencia = ativo.referencia;
        this.metodo = ativo.metodo;
        this.cotacao = cotacao;
    }

}

export class AtivoRefCarteira extends Ativo {

    carteira: Carteira;

    constructor(ativo: IAtivo, carteira: Carteira) {
        super(ativo);
        this.carteira = carteira;
    }

}

export class AtivoRefCotacao extends Ativo {
    
    constructor(ativo: IAtivo, cotacao: Cotacao) {
        super(ativo);
        this.cotacao = cotacao;
    }

}


export type ICarteira = Omit<Carteira, "identity" | "valor" | "vlInicial">;

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

    classe: TipoInvestimento;

    constructor(carteira: ICarteira | Carteira, ativos?: CarteiraAtivo[]) {
        super({ ...carteira });
        this.ativos = ativos || carteira.ativos;
        this.objetivo = carteira.objetivo;
        this.classe = carteira.classe;
    }

    get vlInicial() {
        if (!this.ativos) {
            return 0;
        }
        return this.ativos.reduce((acc, ativo) => acc += ativo.vlInicial, 0);
    }

    get valor() {
        if (!this.ativos) {
            return 0;
        }
        return this.ativos.reduce((acc, ativo) => acc += (ativo.ativo?.cotacao?.preco || NaN) * ativo.quantidade || ativo.vlAtual || NaN, 0);
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
    "horaMercado": Date,
    "manual": boolean
}

export function createCarteira(): Carteira {
    return new Carteira({
        ativos: [],
        nome: '',
        moeda: Moeda.BRL,
        classe: TipoInvestimento.Acao,
        objetivo: 0
    })
}

export function createAtivo(): Ativo {
    return new Ativo({
        sigla: '',
        nome: '',
        setor: '',
        metodo: MetodoCotacao.yahoo,
        moeda: Moeda.BRL
    })
}

export enum TipoProvento {
    Dividendo = "Dividendo",
    JCP = "JCP",
    Aluguel = "Aluguel",
    Taxa = "Taxa",
    Bonus = "Bonus",
    Outros = "Outros"
}

export type Provento = {
    _id?: string,
    idAtivo: string,
    idConta: string,
    data: string,
    tipo: TipoProvento,
    total: number
}

export type Retirada = {
    _id?: string,
    data: string,
    valor: number
}
