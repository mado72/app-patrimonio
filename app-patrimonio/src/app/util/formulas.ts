import { Cotacao } from "../models/cotacao.models";

export type Extrator<T, V> = (item: T) => V;
export type ExtratorNum<T> = Extrator<T, number>;

export type ConsolidadoTotal<T> = ReturnType<typeof consolidaValores<T>>;

export type ConsolidadoItem = {
    quantidade: number;
    vlInicial: number;
    vlFinal: number;
    valorizacao: number;
    valorizacaoPerc: number;
    objetivo: number;
    participacao: number;
    difObjetivo: number;
}

export function consolidaValores<T>(
    { items, quantidadeFn, valorInicialFn, objetivoFn, valorAtualFn, cotacaoFn }:
        {
            items: T[],
            quantidadeFn: ExtratorNum<T>,
            valorInicialFn: ExtratorNum<T>,
            objetivoFn: ExtratorNum<T>,
            valorAtualFn: ExtratorNum<T>,
            cotacaoFn: Extrator<T, Cotacao | undefined>
        }) {

    const mapCalc = new Map(items.map(item => {
        const v = {
            ...item,
            cotacao: cotacaoFn(item),
            quantidade: quantidadeFn(item),
            vlInicial: valorInicialFn(item),
            vlFinal: valorAtualFn(item) || 0,
            valorizacao: valorAtualFn(item) - valorInicialFn(item),
            valorizacaoPerc: NaN,
            objetivo: objetivoFn(item),
            participacao: NaN,
            difObjetivo: NaN
        };
        v.valorizacaoPerc = v.valorizacao / v.vlInicial;
        return [item, v];
    }))

    const total = Array.from(mapCalc.values()).reduce((acc, v) => {
        acc.vlInicial += v.vlInicial;
        acc.vlTotal += v.vlFinal;
        return acc;
    }, {
        vlInicial: 0,
        vlTotal: 0,
        valorizacao: 0,
        valorizacaoPerc: 0
    });

    total.valorizacao = total.vlTotal - total.vlInicial;
    total.valorizacaoPerc = total.valorizacao / total.vlInicial;

    Array.from(mapCalc.values()).forEach(v => {
        v.valorizacaoPerc = v.valorizacao / v.vlInicial;
        v.participacao = v.vlFinal / total.vlTotal;
        v.difObjetivo = v.objetivo > 0 ? (v.participacao - v.objetivo) / v.objetivo : v.participacao ? 1 : 0;
    })

    const dados = Array.from(mapCalc.entries()).map(entry => ({
        ...entry[0],
        ...entry[1]
    }))

    return {
        items: dados,
        total
    }
}
