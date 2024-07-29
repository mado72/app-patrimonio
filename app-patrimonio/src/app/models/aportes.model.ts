import { Dictionary } from "./base.model";
import { Cotacao } from "./cotacao.models";

export type ParticipacaoTypeFn = (valor: number) => number;


export type AporteDB = {
    _id?: string,
    idCarteira: string,
    idAtivo: string,
    data: string,
    quantidade: number,
    valorUnitario: number,
    total: number
}

export type Alocacao = {
    idCarteira: string;
    classe: string;
    carteira: string;
    financeiro: number;
    planejado: number;
    percentual?: number;
}

export type Alocacoes = {
    alocacoes: Required<Alocacao>[];
    totais: Required<Alocacao>;
}

export interface IAporteAtivo extends AporteAtivoData {}

class AporteAtivoData {
    ativoId: string;
    quantidade: number;
    sigla: string;
    novaQuantidade: number;
    cotacao: Cotacao;
    objetivo: number;

    constructor (data: IAporteAtivo) {
        this.ativoId = data.ativoId;
        this.quantidade = data.quantidade;
        this.sigla = data.sigla;
        this.novaQuantidade = data.novaQuantidade;
        this.cotacao = data.cotacao;
        this.objetivo = data.objetivo;
    }
}

export class AporteAtivo extends AporteAtivoData{
    private _participacaoFn: ParticipacaoTypeFn;

    constructor(aporte: IAporteAtivo, participacaoFn: ParticipacaoTypeFn) {
        super(aporte);
        this._participacaoFn = participacaoFn;
    }

    get financeiro() {
        return this.cotacao.aplicar(this.novaQuantidade);
    }
    
    set financeiro(valor: number) {
        this.novaQuantidade = 1 / this.cotacao.aplicar(valor);
    }

    get novo() {
        return this._participacaoFn(this.financeiro);
    }

    get dif() {
        if (!this.objetivo) return 0;
        return (this.novo - this.objetivo) / this.objetivo;
    }

    get qtdCompra(): number {
        return Math.round((this.novaQuantidade - this.quantidade) * 1000000) / 1000000;
    }

    get total(): number {
        return this.cotacao.aplicar(this.qtdCompra);
    }

}

export class AporteCarteira implements Alocacao {
    idCarteira: string;
    classe: string;
    carteira: string;
    financeiro: number;
    planejado: number;
    percentual?: number;
    aporte: number = 0;
    readonly participacaoFn: ParticipacaoTypeFn;
    private _items: Dictionary<AporteAtivo> = {};

    constructor(alocacao: Alocacao, participacaoFn: ParticipacaoTypeFn) {
        this.participacaoFn = participacaoFn;
        this.idCarteira = alocacao.idCarteira;
        this.classe = alocacao.classe;
        this.carteira = alocacao.carteira;
        this.financeiro = alocacao.financeiro;
        this.planejado = alocacao.planejado;
        this.percentual = alocacao.percentual;
    }

    addItem(item: AporteAtivoData) {
        this._items[item.ativoId] = new AporteAtivo(item, (v)=>v/this.total);
    }

    get items() {
        type t = typeof this._items;
        return this._items as {
            +readonly [P in keyof t]: t[P];
        }
    }

    get total() {
        return this.financeiro + (this.aporte || 0);
    }

    get novo() {
        return this.participacaoFn(this.total);
    }

    get dif() {
        if (!this.planejado) return 0;
        return (this.novo - this.planejado) / this.planejado;
    }
}

export class Totalizador {
    rebalanceamentos: AporteCarteira[] = [];

    get financeiro(): number {
        return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + rebalanceamento.financeiro, 0)
    }

    get total(): number {
        return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + rebalanceamento.total, 0)
    }

    get planejado(): number {
        return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + rebalanceamento.planejado, 0)
    }

    get percentual(): number {
        return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + (rebalanceamento.percentual || 0), 0)
    }

    get aporte(): number {
        return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + (rebalanceamento.aporte || 0), 0)
    }
}

export class AporteTotais {
    aportes: AporteAtivo[];
    constructor(aportes: AporteAtivo[]) {
        this.aportes = aportes;
    }

    get financeiro () {
        return this.aportes.reduce((acc, aporte) => acc + aporte.financeiro, 0)
    };
    get objetivo () {
        return this.aportes.reduce((acc, aporte) => acc + aporte.objetivo, 0)
    }
    get novo () {
        return this.aportes.reduce((acc, aporte) => acc + aporte.novo, 0);
    } 
};

export type AportesCarteira = Dictionary<AporteTotais>;