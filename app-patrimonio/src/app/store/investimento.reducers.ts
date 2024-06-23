import { InvestimentoData, LoadStatus } from "../models/app.models";


export const initialState: InvestimentoData = {
    carteiras: {
        status: LoadStatus.Empty,
        items: []
    },
    ativos: {
        status: LoadStatus.Empty,
        items: []
    },
    cotacoes: {
        status: LoadStatus.Empty,
        items: []
    }
}
