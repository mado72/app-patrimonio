import { Observable, map } from "rxjs";
import { Moeda } from "./base.model"
import { Cotacao } from "./cotacao.models";
import { DataLoad } from "./app.models";

export type TipoInvestimento = 'Carteira' | 'Acao' | 'Fundo' | 'Moeda'

export type CotacaoFn = () => Observable <number>;


export type IInvestimento = Omit<Investimento, "identity" >;

export type IAtivo = Omit<Ativo, "identity" | "valorMoeda"> & {
    valor: number;
};

abstract class Investimento implements IInvestimento {
    _id?: string;
    identity: string;
    nome: string;
    tipo: TipoInvestimento;
    moeda: Moeda;

    constructor(investimento: Omit<IInvestimento, "valorMoeda">) {
        this.identity = crypto.randomUUID();
        this.nome = investimento.nome;
        this.tipo = investimento.tipo;
        this.moeda = investimento.moeda;
    }
    
    valorMoeda (cotacaoFn: CotacaoFn) {
        return cotacaoFn().pipe(
            map(cotacao => this.valor * cotacao)
        );
    }
    
    abstract get valor(): number;
    
}

export class Ativo extends Investimento {
    
    private _valor!: number;
    
    constructor(ativo: IAtivo) {
        super(ativo);
        this._valor = ativo.valor;
    }

    get valor() {
        return this._valor;
    }

    set valor(v: number) {
        this._valor = v;
    }
}

export type ICarteira = Omit<Carteira, "identity" | "valorMoeda" | "valor">;

export class Carteira extends Investimento {

    ativos: Ativo[];
    
    constructor(carteira: ICarteira) {
        super({...carteira, valor: 0});
        this.ativos = carteira.ativos;
    }

    get valor() {
        return this.ativos.reduce((acc,ativo)=>acc += ativo.valor,0);
    }
}

export class AtivoCotacao {
    ativo: Ativo;
    cotacao: Cotacao;

    constructor(ativo: Ativo, cotacao: Cotacao) {
        this.ativo = ativo;
        this.cotacao = cotacao;
    }

    valorEm(outraCotacao: Observable<Cotacao>) {
        return this.ativo.valorMoeda(() => 
            outraCotacao.pipe(
                map(outraCotacao => this.cotacao.converterPara(outraCotacao))
            )
        );
    }
}

export interface LoadCarteira extends DataLoad<Carteira> {};
export interface LoadAtivo extends DataLoad<Ativo> {};