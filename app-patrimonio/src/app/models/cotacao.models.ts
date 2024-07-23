import { Moeda } from "./base.model";

export type ICotacao = Omit<Cotacao, "converterPara" | "aplicar">;

export class Cotacao {
    _id?: string;
    simbolo: string;
    moeda: Moeda;
    preco: number;
    data: Date;
    manual: boolean;

    constructor(cotacao: ICotacao) {
        this._id = cotacao._id;
        this.simbolo = cotacao.simbolo;
        this.moeda = cotacao.moeda;
        this.preco = cotacao.preco;
        this.manual = cotacao.manual;
        this.data = new Date(cotacao.data);
    }

    converterPara(outra: ICotacao) {
        return new Cotacao({
            ...outra,
            preco: outra.preco * this.preco
        });
    }

    aplicar(n: number) {
        return n * this.preco;
    }
}