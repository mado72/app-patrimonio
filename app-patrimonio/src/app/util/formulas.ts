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
    items: T[], 
    quantidadeFn: ExtratorNum<T>, 
    valorInicialFn: ExtratorNum<T>, 
    objetivoFn: ExtratorNum<T>, 
    valorAtualFn: ExtratorNum<T>) {

    const mapCalc = new Map(items.map(item => {
        const v = {
            ...item,
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
        v.difObjetivo = (v.participacao - v.objetivo) / v.objetivo;
    })

    const dados = Array.from(mapCalc.entries()).map(entry=>({
        ...entry[0],
        ...entry[1]
    }))

    return {
        items: dados,
        total
    }
}
