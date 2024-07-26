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

/**
 * Consolida valores de uma lista de itens, calculando indicadores de valorização e participação.
 *
 * @template T - O tipo dos itens na lista.
 *
 * @param {object} params - Os parâmetros necessários para o cálculo.
 * @param {T[]} params.items - A lista de itens para consolidar.
 * @param {ExtratorNum<T>} params.quantidadeFn - Uma função para extrair a quantidade de um item.
 * @param {ExtratorNum<T>} params.valorInicialFn - Uma função para extrair o valor inicial de um item.
 * @param {ExtratorNum<T>} params.objetivoFn - Uma função para extrair o objetivo de um item.
 * @param {ExtratorNum<T>} params.valorAtualFn - Uma função para extrair o valor atual de um item.
 * @param {Extrator<T, Cotacao | undefined>} params.cotacaoFn - Uma função para extrair a cotação de um item.
 *
 * @returns {ConsolidadoTotal<T>} - Os valores consolidados e os indicadores calculados.
 */
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

  // Calcula os valores consolidados e os indicadores e mapeia o resultado para cada item
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

  // Calcula os valores totais e os indicadores do total
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

  // Calcula os valores totais e os indicadores dos itens
  Array.from(mapCalc.values()).forEach(v => {
    v.valorizacaoPerc = v.valorizacao / v.vlInicial;
    v.participacao = v.vlFinal / total.vlTotal;
    v.difObjetivo = v.objetivo > 0 ? (v.participacao - v.objetivo) / v.objetivo : v.participacao ? 1 : 0;
  })

  // Converte os valores para um formato amigável para o usuário, copiando as propriedades do item e do resultado dos cálculos
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

/**
 * Calcula os valores totais para uma determinada carteira de investimentos.
 *
 * @param {object} params - Os parâmetros necessários para o cálculo.
 * @param {Carteira} params.carteira - A carteira de investimentos para a qual calcular os valores totais.
 * @param {CarteiraAtivo2CotacaoFn} params.cotacaoAtivo - Uma função para recuperar a cotação para uma determinada carteira e ativo.
 * @param {Map<string | undefined, Carteira>} params.mapCarteira - Um mapa de carteiras de investimentos, usado para resolver referências de ativos.
 * @param {Map<string, Cotacao>} params.mapCotacao - Um mapa de cotações, usado para recuperar a cotação para ativos.
 *
 * @returns {CalcularTotaisReturnType} - Os valores totais calculados para a carteira de investimentos.
 */
export function calcularTotais({ carteira, cotacaoAtivo, mapCarteira, mapCotacao }: {
  carteira: Carteira, cotacaoAtivo: CarteiraAtivo2CotacaoFn,
  mapCarteira: Map<string | undefined, Carteira>, mapCotacao: Map<string, Cotacao>
}) {

  const ativos = carteira.ativos.map(item => ({ ...item, ...item.ativo as AuxAtivo }));

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
          carteiraRef: mapCarteira.get(ativo.ativo?.referencia?.id),
          cotacaoAtivo: mapCotacao.get((ativo.ativo?.siglaYahoo || ativo.ativo?.sigla) as string)
        })
    }
  );

  return consolidado;
}

/**
 * Calcula o valor de um investimento com base na cotação e outros parâmetros fornecidos.
 *
 * @param {object} params - Os parâmetros necessários para o cálculo.
 * @param {CarteiraAtivo & AuxAtivo} params.ativo - O investimento para o qual o valor está sendo calculado.
 * @param {Cotacao} params.cotacaoMoeda - A cotação da moeda do investimento.
 * @param {Carteira} [params.carteiraRef] - A carteira de referência caso o investimento seja uma referência a outra carteira.
 * @param {Cotacao} [params.cotacaoAtivo] - A cotação do ativo de referência (se aplicável).
 *
 * @returns {number} - O valor calculado do investimento com base nos parâmetros fornecidos.
 */
function calcularValorCotacao({ ativo, cotacaoMoeda, carteiraRef: carteira, cotacaoAtivo }:
  { ativo: CarteiraAtivo & AuxAtivo; cotacaoMoeda: Cotacao; carteiraRef?: Carteira; cotacaoAtivo?: Cotacao; }) {

  const valorAtivoCalculado = () => calculaValorAtivo(ativo, carteira, cotacaoAtivo);

  return cotacaoMoeda.aplicar(valorAtivoCalculado())

}

/**
 * Calcula o valor de um investimento com base na cotação e outros parâmetros fornecidos.
 *
 * @param {object} params - Os parâmetros necessários para o cálculo.
 * @param {CarteiraAtivo & AuxAtivo} params.ativo - O investimento para o qual o valor está sendo calculado.
 * @param {Carteira | undefined} params.carteira - A carteira de referência caso o investimento seja uma referência a outra carteira.
 * @param {Cotacao | undefined} params.cotacaoAtivo - A cotação do ativo de referência (se aplicável).
 *
 * @returns {number} - O valor calculado do investimento com base nos parâmetros fornecidos.
 */
function calculaValorAtivo(ativo: CarteiraAtivo & AuxAtivo, carteira: Carteira | undefined, cotacaoAtivo: Cotacao | undefined) {
  if (ativo.ativo?.tipo === TipoInvestimento.Referencia) {
    // Se o ativo for referência a uma carteira, utiliza a moeda e a totalização da carteira para definir o valor da cotação.
    if (ativo.ativo.referencia?.tipo == TipoInvestimento.Carteira && carteira) {
      // A carteira possui a mesma moeda do ativo, portanto o valor é o da carteira
      if (carteira.moeda === ativo.moeda) {
        return carteira.valor;
      }

      // A carteira possui uma moeda diferente do ativo, portanto o valor é o da carteira convertido para a moeda do ativo
      else if (cotacaoAtivo) {
        return cotacaoAtivo.preco * carteira.valor;
      }
    }
    // Se o ativo for referência a uma moeda, utiliza a cotação do ativo de referência para definir o valor da cotação.
    if (ativo.ativo.referencia?.tipo == TipoInvestimento.Moeda && cotacaoAtivo) {
      return cotacaoAtivo.preco;
    }
  }
  // Se não há referência ou se a referência não é um investimento, utiliza a cotação da moeda do ativo para definir o valor da cotação.
  ativo.cotacao = cotacaoAtivo;
  return (ativo.cotacao ? ativo.cotacao?.aplicar(ativo.quantidade) : ativo.vlAtual) || NaN;
}

