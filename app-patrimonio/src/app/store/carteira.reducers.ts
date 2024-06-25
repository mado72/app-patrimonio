import { EntityState } from "@ngrx/entity";
import { createReducer, on } from "@ngrx/store";
import { LoadStatus } from "../models/app.models";
import { Moeda } from "../models/base.model";
import { Carteira, CarteiraAtivo, CarteiraEntityState } from "../models/investimento.model";
import { carteiraActions } from "./carteira.actions";
import { carteiraAdapter, carteiraAtivoAdapter } from "./investimento.adapters";

export const initialStateCarteira: CarteiraEntityState = {
    entities: {},
    ids: [],
    original: undefined,
    status: LoadStatus.Empty,
    carteiraIdentity: null,
    error: undefined
}

export const initialStateCarteiraAtivo: EntityState<CarteiraAtivo> = carteiraAtivoAdapter.getInitialState();

export const carteiraReducer = createReducer(
    initialStateCarteira,
    on(carteiraActions.getCarteiras, (state) => 
        ({
        ...state, 
        error: undefined,
        status: LoadStatus.Loading
        })
    ),
    on(carteiraActions.getCarteirasSuccess, (state, payload)=>
        carteiraAdapter.setAll(payload.carteiras, state)
    ),
    on(carteiraActions.getCarteirasError, (state, payload)=> 
        ({...carteiraAdapter.getInitialState(), status: LoadStatus.Error, error: payload, carteiraIdentity: null})
    ),
    
    on(carteiraActions.addCarteira, (state, payload)=>
        carteiraAdapter.addOne(payload.carteira, {...state, status: LoadStatus.Adding, error: undefined})
    ),
    on(carteiraActions.addCarteiraSuccess, (state, payload)=>({
        ...state,
        status: LoadStatus.Added
    })),
    on(carteiraActions.addCarteiraError, (state, payload)=>
        carteiraAdapter.removeOne(payload.carteira.identity, {...state, status: LoadStatus.Error, error: payload.error})
    ),
    
    on(carteiraActions.removeCarteira, (state, payload)=>
        carteiraAdapter.removeOne(payload.carteira.identity, {...state, status: LoadStatus.Deleting, error: undefined})
    ),
    on(carteiraActions.removeCarteiraSuccess, (state, payload)=>
        ({
            ...state,
            status: LoadStatus.Deleted 
        })
    ),
    on(carteiraActions.removeCarteiraError, (state, payload)=>
        carteiraAdapter.addOne(payload.carteira, {...state, status: LoadStatus.Error, error: payload.error})
    ),

    on(carteiraActions.updateCarteira, (state, payload)=>
        carteiraAdapter.updateOne({
            id: payload.carteira.identity,
            changes: payload.carteira
        }, {...state, status: LoadStatus.Updating, error: undefined})
    ),
    on(carteiraActions.updateCarteiraSuccess, (state, payload)=>
        ({
            ...state,
            status: LoadStatus.Updated
        })),
    on(carteiraActions.updateCarteiraError, (state, payload)=>
        carteiraAdapter.updateOne({
            id: payload.carteira.identity,
            changes: state.original || payload.carteira
        }, {...state, status: LoadStatus.Error, error: payload.error})
    ),

    on(carteiraActions.getCarteiraAtivos, (state) => 
        ({
            ...state,
            error: undefined,
            status: LoadStatus.Loading
        })
    ),
    on(carteiraActions.getCarteiraAtivosSuccess, (state, payload) => 
        carteiraAdapter.mapOne({
            id: state.carteiraIdentity as string,
            map: carteira => new Carteira(carteira, payload.ativos),
        }, state)
    ),
    on(carteiraActions.getCarteiraAtivosError, (state, payload) => 
        carteiraAdapter.mapOne({
            id: state.carteiraIdentity as string,
            map: carteira => new Carteira(carteira, []),
        }, {...state, error: payload.error, status: LoadStatus.Error}),
            
    ),

    on(carteiraActions.addCarteiraAtivo, (state, payload) => 
        carteiraAdapter.mapOne({
            id: payload.carteira.identity,
            map: carteira => {
                carteira = {...carteira} as Carteira,
                carteira.ativos = [...carteira.ativos, payload.ativo];
                return carteira;
            },
        }, {...state, error: undefined, status: LoadStatus.Adding}),
    ),
    on(carteiraActions.addCarteiraAtivoSuccess, (state, payload) => 
        ({
            ...state,
            status: LoadStatus.Added
        })
    ),
    on(carteiraActions.addCarteiraAtivoError, (state, payload) => 
        carteiraAdapter.mapOne({
            id: state.carteiraIdentity as string,
            map: carteira => {
                carteira = {...carteira} as Carteira,
                carteira.ativos = [...carteira.ativos].filter(ativo=>ativo.ativoId != payload.ativo.ativoId);
                return carteira;
            }
        }, {...state, error: payload.error, status: LoadStatus.Error}),
    ),

    on(carteiraActions.removeCarteiraAtivo, (state) => 
        ({
            ...state,
            error: undefined,
            status: LoadStatus.Deleting
        })
    ),
    on(carteiraActions.removeCarteiraAtivoSuccess, (state, payload) => 
        carteiraAdapter.mapOne({
            id: payload.carteira.identity,
            map: carteira => new Carteira(carteira, [...carteira.ativos].filter(item=>item.ativoId != payload.ativo.ativoId)),
        }, {...state, error: undefined, status: LoadStatus.Deleted})
    ),
    on(carteiraActions.removeCarteiraAtivoError, (state, payload) => 
        carteiraAdapter.mapOne({
                id: payload.carteira.identity,
                map: carteira => new Carteira(carteira, [...carteira.ativos, payload.ativo]),
            }, {...state, error: payload.error, status: LoadStatus.Error}),
    ),

)

let carteiraId = 0;
export function createCarteira(): Carteira {
    carteiraId++;
    return new Carteira({
        ativos: [],
        moeda: Moeda.BRL,
        nome: `Carteira ${carteiraId}`,
        tipo: 'Carteira',
        _id: crypto.randomUUID()
    })
}
