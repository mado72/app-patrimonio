import { createFeatureSelector, createSelector } from "@ngrx/store";
import { InvestimentoModelState, ativosAdapter, carteirasAdapter, cotacoesAdapter } from "../models/app.models";
import { Ativo } from "../models/investimento.model";

const selectInvestimentoModelState = createFeatureSelector<InvestimentoModelState>('investimentos');

const selectAtivosState = createSelector(selectInvestimentoModelState, ({ativos}) => ativos);
const selectCarteirasState = createSelector(selectInvestimentoModelState, ({carteiras}) => carteiras);
const selectCotacoesState = createSelector(selectInvestimentoModelState, ({cotacoes}) => cotacoes);

const ativosStateSelectors = ativosAdapter.getSelectors(selectAtivosState);    
const carteirasStateSelectors = carteirasAdapter.getSelectors(selectCarteirasState);
const cotacoesStateSelectors = cotacoesAdapter.getSelectors(selectCotacoesState);

export const ativosSelectors = {...ativosStateSelectors,

    status : createSelector(
        selectAtivosState,
        (state) => state.status
    ),
    
    errors : createSelector(
        selectAtivosState,
        (state) => state.error
    ),

    ativosIdentitiesIn : (identities: string[]) => createSelector(
        ativosStateSelectors.selectEntities,
        (entities) => identities.map(identity=>entities[identity])
    ),

    ativosIdIn : (id: string[]) => createSelector(
        ativosStateSelectors.selectEntities,
        (entities) => Object.values(entities).filter(ativo=>ativo?._id && id.includes(ativo?._id))
    )

}

export const carteirasSelectors = {...carteirasStateSelectors,

    status : createSelector(
        selectCarteirasState,
        (state) => state.status
    ),

    errors : createSelector(
        selectCarteirasState,
        (state) => state.error
    ),

    selectByTermoNome : (termo: RegExp) => createSelector(
        carteirasSelectors.selectAll,
        (carteiras) => carteiras.filter(carteira=>carteira && carteira.nome.match(termo))
    ),
    
    selectByAtivo : (ativo: Ativo) => createSelector(
        carteirasSelectors.selectAll,
        (carteiras) => carteiras.filter(carteira=>carteira 
            && carteira.ativos.some(a=>a.ativoId === ativo._id))
    )
}

export const cotacoesSelectors = {...cotacoesStateSelectors,
    
    status : createSelector(
        selectCotacoesState,
        (state) => state.status
    ),

    errors : createSelector(
        selectCotacoesState,
        (state) => state.error
    )
}
