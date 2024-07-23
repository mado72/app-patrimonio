import { Cotacao } from "../models/cotacao.models";
import { Ativo, Carteira, CarteiraAtivo, TipoInvestimento } from "../models/investimento.model";

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


type CarteiraAtivo2CotacaoFn = (carteira: Carteira, ativo: CarteiraAtivo) => Cotacao;

export type AuxAtivo = Pick<Ativo, "identity" | "nome" | "sigla" | "moeda" | "cotacao">;

export type CarteiraAtivoItem = AuxAtivo & Omit<CarteiraAtivo, "ativo">;

export type CalcularTotaisReturnType = ReturnType<typeof calcularTotais>;

export function calcularTotais({ carteira, cotacaoAtivo, mapCarteira, mapCotacao }: {
  carteira: Carteira, cotacaoAtivo: CarteiraAtivo2CotacaoFn,
  mapCarteira: Map<string | undefined, Carteira>, mapCotacao: Map<string, Cotacao>
}) {

  const ativos = carteira.ativos.map(item => ({...item, ...item.ativo as AuxAtivo}));

  const consolidado = consolidaValores<CarteiraAtivo & AuxAtivo>(
    {
      items: ativos,
      quantidadeFn: (ativo) => ativo.quantidade,
      valorInicialFn: (ativo) => cotacaoAtivo(carteira, ativo).aplicar(ativo.vlInicial),
      objetivoFn: (ativo) => ativo.objetivo,
      cotacaoFn: (ativo) => ativo.ativo?.cotacao && cotacaoAtivo(carteira, ativo).converterPara(ativo.ativo?.cotacao),
      valorAtualFn: (ativo) => calcularValorCotacao(
        {
          ativo,
          cotacaoMoeda: cotacaoAtivo(carteira, ativo),
          valor: ativo.vlAtual,
          carteiraRef: mapCarteira.get(ativo.ativo?.referencia?.id),
          cotacaoAtivo: mapCotacao.get(ativo.ativo?.siglaYahoo as string)
        })
    }
  );

  return consolidado;
}

function calcularValorCotacao({ ativo, cotacaoMoeda, valor, carteiraRef: carteira, cotacaoAtivo }:
  { ativo: CarteiraAtivo & AuxAtivo; cotacaoMoeda: Cotacao; valor?: number; carteiraRef?: Carteira; cotacaoAtivo?: Cotacao; }) {

    const valorCalculado = () => {
      if (ativo.ativo?.tipo === TipoInvestimento.Referencia) {
        if (ativo.ativo.referencia?.tipo == TipoInvestimento.Carteira && carteira) {
          if (carteira.moeda === ativo.moeda) {
            return carteira.valor;
          }
          else if (cotacaoAtivo) {
            return cotacaoAtivo.preco * carteira.valor;
          }
        }
        if (ativo.ativo.referencia?.tipo == TipoInvestimento.Moeda && cotacaoAtivo) {
          return cotacaoAtivo.preco;
        }
      }
      ativo.cotacao = cotacaoAtivo;
      return (ativo.cotacao ? ativo.cotacao?.aplicar(ativo.quantidade) : valor) || NaN;
    };

    return cotacaoMoeda.aplicar(valorCalculado())

}
