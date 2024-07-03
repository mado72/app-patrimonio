import { createReducer, on } from "@ngrx/store";
import { InvestimentoModelState, StateStatus, ativosAdapter, carteirasAdapter, cotacoesAdapter as cotacaoAdapter, investimentoInitialState } from "../models/app.models";
import { Carteira, CarteiraAtivo } from "../models/investimento.model";
import { carteiraActions } from "./carteira.actions";
import { ativoActions } from "./ativo.actions";
import { cotacaoActions } from "./cotacao.actions";
import { investimentoActions } from "./investimento.actions";

export const investimentoReducer = createReducer(
    investimentoInitialState,

    // ----------------------------------------------------- investimentoActions

    on(investimentoActions.obterAlocacoes.getItems, (state) => 
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Pending,
                error: undefined
            },
            ativos: {...state.ativos, status: StateStatus.Pending, error: undefined},
            cotacoes: {...state.cotacoes, status: StateStatus.Pending, error: undefined}
        })
    ),
    on(investimentoActions.obterAlocacoes.getItemsSuccess, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.setAll(payload.alocacoes.carteiras, {...state.carteiras, status: StateStatus.Executed}),
            ativos: ativosAdapter.setAll(payload.alocacoes.ativos, {...state.ativos, status: StateStatus.Executed}),
            cotacoes: cotacaoAdapter.setAll(payload.alocacoes.cotacoes, {...state.cotacoes, status: StateStatus.Executed}),
        })
    ),
    on(investimentoActions.obterAlocacoes.getItemsFailure, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.getInitialState({status: StateStatus.Error, error: payload.error}),
            ativos: ativosAdapter.getInitialState({status: StateStatus.Error, error: payload.error}),
            cotacoes: cotacaoAdapter.getInitialState({status: StateStatus.Error, error: payload.error})
        })
    ),

    // ----------------------------------------------------- carteiraActions

    on(carteiraActions.getCarteiras, (state) => 
        ({
            ...state, 
            carteiras: {...state.carteiras, error: undefined, status: StateStatus.Pending}
        })
    ),
    on(carteiraActions.getCarteirasSuccess, (state, payload)=> 
        ({
            ...state,
            carteiras: carteirasAdapter.setAll(payload.carteiras, {
                ...state.carteiras,
                status: StateStatus.Executed
            }),
        })
    ),
    on(carteiraActions.getCarteirasError, (state, payload)=> 
        ({
            ...state,
            carteiras: carteirasAdapter.getInitialState({status: StateStatus.Error, error: payload.error}),
        })
    ),
    
    on(carteiraActions.addCarteira, (state, payload)=>
        ({
            ...state,
            carteiras: carteirasAdapter.addOne(payload.carteira, {...state.carteiras, status: StateStatus.Pending, error: undefined})
        })
    ),
    on(carteiraActions.addCarteiraSuccess, (state, payload)=>
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Executed
            }
        })
    ),
    on(carteiraActions.addCarteiraError, (state, payload)=>
        ({
            ...state,
            carteiras: carteirasAdapter.removeOne(payload.carteira.identity.toString(), {...state.carteiras, status: StateStatus.Error, error: payload.error})
        })
    ),
    
    on(carteiraActions.removeCarteira, (state, payload)=>
        ({
            ...state,
            carteiras: carteirasAdapter.removeOne(payload.carteira.identity.toString(), {...state.carteiras, status: StateStatus.Pending, error: undefined})
        })
    ),
    on(carteiraActions.removeCarteiraSuccess, (state, payload)=>
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Executed
            }
        })
    ),
    on(carteiraActions.removeCarteiraError, (state, payload)=>
        ({
            ...state,
            carteiras: carteirasAdapter.addOne(payload.carteira, {...state.carteiras, status: StateStatus.Error, error: payload.error})
        })
    ),
    
    on(carteiraActions.updateCarteira, (state, payload)=>
        ({
            ...state,
            carteiras: carteirasAdapter.updateOne({
                id: payload.carteira.identity.toString(),
                changes: payload.carteira
            }, {...state.carteiras, status: StateStatus.Pending, error: undefined})
        })
    ),
    on(carteiraActions.updateCarteiraSuccess, (state, payload)=>
        ({
            ...state,
            carteiras: {
               ...state.carteiras,
                status: StateStatus.Executed
            }
        })),
    on(carteiraActions.updateCarteiraError, (state, payload)=>
        ({
            ...state,
            carteiras: {...state.carteiras, status: StateStatus.Error, error: payload.error}
        })
    ),

    on(carteiraActions.getCarteiraAtivos, (state) => 
        ({
            ...state,
            error: undefined,
            status: StateStatus.Pending
        })
    ),
    on(carteiraActions.getCarteiraAtivosSuccess, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.mapOne({
                id: payload.carteira.identity.toString(),
                map: carteira => new Carteira(carteira, payload.ativos),
            }, {
                ...state.carteiras,
                status: StateStatus.Executed
            })
        })
    ),
    on(carteiraActions.getCarteiraAtivosError, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.mapOne({
                id: payload.carteira.identity.toString(),
                map: carteira => new Carteira(carteira, []),
            }, {...state.carteiras, error: payload.error, status: StateStatus.Error})
        })    
    ),

    on(carteiraActions.addCarteiraAtivo, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.mapOne({
                id: payload.carteira.identity.toString(),
                map: carteira => {
                    carteira = {...carteira} as Carteira,
                    carteira.ativos = [...carteira.ativos, payload.ativo];
                    return carteira;
                },
            }, {...state.carteiras, error: undefined, status: StateStatus.Pending})
        })
    ),
    on(carteiraActions.addCarteiraAtivoSuccess, (state, payload) => 
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Executed
            }
        })
    ),
    on(carteiraActions.addCarteiraAtivoError, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.mapOne({
                id: payload.carteira.identity.toString(),
                map: carteira => {
                    carteira = {...carteira} as Carteira,
                    carteira.ativos = [...carteira.ativos].filter(ativo=>ativo.ativoId != payload.ativo.ativoId);
                    return carteira;
                }
            }, {...state.carteiras, error: payload.error, status: StateStatus.Error})
        })
    ),

    on(carteiraActions.removeCarteiraAtivo, (state) => 
        ({
            ...state,
            error: undefined,
            status: StateStatus.Pending
        })
    ),
    on(carteiraActions.removeCarteiraAtivoSuccess, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.mapOne({
                id: payload.carteira.identity.toString(),
                map: carteira => new Carteira(carteira, [...carteira.ativos].filter(item=>item.ativoId != payload.ativo.ativoId)),
            }, {...state.carteiras, error: undefined, status: StateStatus.Executed})
        })
    ),
    on(carteiraActions.removeCarteiraAtivoError, (state, payload) => 
        ({
            ...state,
            carteiras: 
                carteirasAdapter.mapOne({
                        id: payload.carteira.identity.toString(),
                        map: carteira => new Carteira(carteira, [...carteira.ativos, payload.ativo]),
                    }, {...state.carteiras, error: payload.error, status: StateStatus.Error}),
        })
    ),

    on(carteiraActions.getCarteirasAtivo.getItens, (state, payload) =>
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Pending,
                error: undefined,
                ativoId: payload.ativo.identity.toString()
            }
        })
    ),
    on(carteiraActions.getCarteirasAtivo.getItensSuccess, (state, payload) =>
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Executed,
                error: undefined,
                ativoId: undefined
            }
        })
    ),
    on(carteiraActions.getCarteirasAtivo.getItensFailure, (state, payload) =>
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Error,
                error: payload.error,
                ativoId: undefined
            }
        })
    ),

    on(carteiraActions.removeAtivoDeCarteiras.removeItens, (state, payload) => 
        ({
            ...state,
            carteiras: carteirasAdapter.updateMany(
                Object.values(state.carteiras.entities)
                    .filter((carteira):carteira is Carteira=>!!carteira && carteira.ativos.some(ativo=>ativo.ativoId))
                    .map(carteira=> 
                        ({
                            id: carteira.identity.toString(),
                            changes: {
                                ativos: [...carteira.ativos
                                    .filter(ativo=>ativo.ativoId !== payload.ativoId)
                                    .filter((ativo): ativo is CarteiraAtivo=> !!ativo)]
                            }
                        })
                    ),
                {...state.carteiras, status: StateStatus.Pending, error: undefined}
            )
        })
    ),
    on(carteiraActions.removeAtivoDeCarteiras.removeItensSuccess, (state, payload) => 
        ({
            ...state,
            cateiras: {
                ...state.carteiras,
                status: StateStatus.Executed,
                error: undefined
            }
        })
    ),
    on(carteiraActions.removeAtivoDeCarteiras.removeItensFailure, (state, payload) => 
        ({
            ...state,
            carteiras: {
                ...state.carteiras,
                status: StateStatus.Error,
                error: payload.error
            }
        })
    ),


    // ------------------------------------------------------------ ativoActions
    on(ativoActions.getAtivos, (state) =>
        ({
            ...state,
            error: undefined,
            status: StateStatus.Pending
        })
    ),
    on(ativoActions.getAtivosSuccess, (state, payload): InvestimentoModelState =>
        ({
            ...state,
            ativos : ativosAdapter.setAll(payload.ativos, {
                ...state.ativos,
                status: StateStatus.Executed
            }),
        })
    ),
    on(ativoActions.getAtivosError, (state, payload) =>
        ({
            ...state,
            ativos : ativosAdapter.getInitialState({status: StateStatus.Error, error: payload.error})
        })
    ),

    on(ativoActions.addAtivo, (state, payload) =>
        ({
            ...state,
            ativos: ativosAdapter.addOne(payload.ativo, {
                ...state.ativos, 
                status: StateStatus.Pending, 
                error: undefined
            })
        })
    ),
    on(ativoActions.addAtivoSuccess, (state, payload) => 
        ({
            ...state,
            ativos: {
                ...state.ativos,
                status: StateStatus.Executed,
                error: undefined
            }
        })
    ),
    on(ativoActions.addAtivoError, (state, payload) => 
        ({
            ...state,
            ativos: ativosAdapter.removeOne(payload.ativo.identity.toString(), 
                    {...state.ativos, status: StateStatus.Error, error: payload.error })
        })
    ),

    on(ativoActions.removeAtivo, (state, payload) =>
        ({
            ...state,
            ativos: ativosAdapter.removeOne(payload.ativo.identity.toString(), {...state.ativos, status: StateStatus.Pending, error: undefined})
        })
    ),
    on(ativoActions.removeAtivoSuccess, (state, payload) =>
        ({
            ...state,
            ativos: {
                ...state.ativos,
                status: StateStatus.Executed,
                error: undefined
            }
        })
    ),
    on(ativoActions.removeAtivoError, (state, payload) =>
        ({
            ...state,
            ativos: ativosAdapter.addOne(payload.ativo, {...state.ativos, status: StateStatus.Error, error: payload.error})
        })
    ),

    on(ativoActions.updateAtivo, (state, payload) => 
        ({
            ...state,
            ativos: ativosAdapter.updateOne({
                id: payload.ativo.identity.toString(),
                changes: payload.ativo
            }, {...state.ativos, status: StateStatus.Pending, error: undefined})
        })
    ),
    on(ativoActions.updateAtivoSuccess, (state, payload) =>
        ({
            ...state,
            ativos: {
               ...state.ativos,
                status: StateStatus.Executed,
                error: undefined
            }
        })
    ),
    on(ativoActions.updateAtivoError, (state, payload) =>
        ({
            ...state,
            ativos: {...state.ativos, status: StateStatus.Error, error: payload.error}
        })
    ),

    on(ativoActions.updateCotacoes, (state, payload)=>
        ({
            ...state,
            ativos: ativosAdapter.updateMany(payload.update, {
                ...state.ativos,
                status: StateStatus.Pending,
                error: undefined
            })
        })
    ),

    on(ativoActions.reloadAtivos, (state, payload)=> ({
        ...state,
        ativos: ativosAdapter.updateMany(payload.ativos.map(ativo=>({
            id: ativo.identity.toString(),
            changes: {...ativo }
        })), {...state.ativos, status: StateStatus.Executed, error: undefined})
    })),


    // -------------------------------------------------------- cotacaoActions

    on(cotacaoActions.getCotacoes.getCotacoesExecute, (state, payload) => 
        ({
            ...state,
            cotacoes: {
                ...state.cotacoes,
                status: StateStatus.Pending,
                error: undefined
            }
        })
    ),

    on(cotacaoActions.getCotacoes.getCotacoesSuccess, (state, payload) => 
        ({
            ...state,
            cotacoes: cotacaoAdapter.updateMany(
                payload.cotacoes.map(cotacao=>({
                    id: cotacao.simbolo,
                    changes: {...cotacao }
                })), 
                {
                    ...state.cotacoes,
                    status: StateStatus.Executed,
                    error: undefined
                }) 
        })
    ),
    on(cotacaoActions.getCotacoes.getCotacoesFailure, (state, payload) =>
        ({
            ...state,
            cotacoes: cotacaoAdapter.setAll([], {
                ...state.cotacoes,
                status: StateStatus.Error,
                error: payload.error
            })
        })
    ),

    on(cotacaoActions.setCotacao.setCotacaoExecute, (state, payload)=>
        ({
            ...state,
            cotacoes: cotacaoAdapter.mapOne({
                id: payload.cotacao.simbolo,
                map: cotacao=> payload.cotacao
            }, {
                ...state.cotacoes,
                status: StateStatus.Pending,
                error: undefined
            })
        })
    ),
    on(cotacaoActions.setCotacao.setCotacaoSuccess, (state, payload)=>
        ({
            ...state,
            cotacoes: {
                ...state.cotacoes,
                status: StateStatus.Executed,
                error: undefined
            }
        })
    ),
    on(cotacaoActions.setCotacao.setCotacaoFailure, (state, payload)=>
        ({
            ...state,
            cotacoes: {
                ...state.cotacoes,
                status: StateStatus.Error,
                error: payload.error
            }
        })
    )

)
// rascunho
// const entities = {} as Dictionary<Carteira>;
// const payload : {
//     ativoId: string;
//     itens: {
//         carteiraId: string;
//         carteiraAtivoSigla: string;
//     }[];
// } = {ativoId: '', itens: []}

