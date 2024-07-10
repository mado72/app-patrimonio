import { Moeda, UUID } from "./base.model";

export enum TipoConta {
    CORRENTE = "CORRENTE",
    INVESTIMENTO = "INVESTIMENTO",
    POUPANCA = "POUPANCA",
    CARTAO = "CARTAO"
}

export enum TipoContaStr {
    CORRENTE = "C/C",
    INVESTIMENTO = "INV.",
    POUPANCA = "POUP.",
    CARTAO = "CARTAO"
}
export interface IConta extends Conta {}

export class Conta {
    _id?: string;
    identity: string | UUID;
    conta!: string;
    saldo!: number;
    saldoReal?: number;
    tipo!: TipoConta;
    moeda!: Moeda;
    constructor(dados: IConta) {
        this._id = dados._id;
        this.identity = this._id || new UUID((<Conta>dados).identity);
        this.conta = dados.conta;
        this.saldo = dados.saldo;
        this.tipo = dados.tipo;
        this.moeda = dados.moeda;
    }
    
}