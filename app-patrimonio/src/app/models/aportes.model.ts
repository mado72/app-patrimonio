export class Rebalanceamento implements Alocacao {
    id: string;
    classe: string;
    carteira: string;
    financeiro: number;
    planejado: number;
    percentual?: number;
    private _aporte: number;
    totalizador: Totalizador;

    constructor(alocacao: Alocacao, totalizador: Totalizador) {
        this.id = alocacao.id;
        this.classe = alocacao.classe;
        this.carteira = alocacao.carteira;
        this.financeiro = alocacao.financeiro;
        this.planejado = alocacao.planejado;
        this.percentual = alocacao.percentual;
        this.totalizador = totalizador;
        this._aporte = 0;
    }

    get aporte() {
        return this._aporte;
    }

    set aporte(val: number) {
        this._aporte = val;
    }

    get total() {
        return this.financeiro + (this.aporte || 0);
    }

    get novo() {
        return this.total / this.totalizador.total;
    }

    get dif() {
        if (!this.planejado) return 0;
        return (this.novo - this.planejado) / this.planejado;
    }
}

export class Totalizador {
    rebalanceamentos: Rebalanceamento[] = [];

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

export type Alocacao = {
    id: string;
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

