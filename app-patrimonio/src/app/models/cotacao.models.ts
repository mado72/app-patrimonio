import { Moeda } from "./base.model";

export type ICotacao = Omit<Cotacao, "converterPara" | "aplicar">;

export class Cotacao {
    _id?: string;
    simbolo: string;
    moeda: Moeda;
    valor: number;
    data: Date;

    constructor(cotacao: ICotacao) {
        this._id = cotacao._id;
        this.simbolo = cotacao.simbolo;
        this.moeda = cotacao.moeda;
        this.valor = cotacao.valor;
        this.data = new Date(cotacao.data);
    }

    converterPara(outra: ICotacao) {
        return new Cotacao({
            ...outra,
            valor: outra.valor * this.valor
        });
    }

    aplicar(n: number) {
        return n * this.valor;
    }
}