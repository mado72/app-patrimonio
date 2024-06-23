import { createReducer, on } from "@ngrx/store";
import { DataLoadCarteira, LoadStatus } from "../models/app.models";
import { carteiraActions } from "./carteira.actions";

const initialState : DataLoadCarteira  = {
    status: LoadStatus.Empty,
    items: []
}
export const carteiraReducer = createReducer(
    initialState,
    on(carteiraActions.getCarteiras, (state) => ({
        ...state, 
        error: '',
        status: LoadStatus.Loading
    })),
    on(carteiraActions.getCarteirasSuccess, (state, payload)=>({
        items: [...payload.carteiras], 
        status: LoadStatus.Loaded
    })),
    on(carteiraActions.getCarteirasError, (state, payload)=> ({
        items: [],
        error: payload.error,
        status: LoadStatus.Error
    })),
    
    on(carteiraActions.addCarteira, (state)=>({
        ...state, 
        status: LoadStatus.Adding
    })),
    on(carteiraActions.addCarteiraSuccess, (state, payload)=>({
        items: [...state.items, payload.carteira],
        status: LoadStatus.Added
    })),
    on(carteiraActions.addCarteiraError, (state, payload)=>({
        items: [],
        status: LoadStatus.Error,
        error: payload.error
    })),


    on(carteiraActions.removeCarteira, (state)=>({
        ...state, 
        status: LoadStatus.Deleting
    })),
    on(carteiraActions.removeCarteiraSuccess, (state, payload)=>({
        items: state.items.filter(item=>item.identity !== payload.carteira.identity),
        status: LoadStatus.Deleted
    })),
    on(carteiraActions.removeCarteiraError, (state, payload)=>({
        ...state,
        status: LoadStatus.Error,
        error: payload.error
    })),

    on(carteiraActions.updateCarteira, (state)=>({
        ...state, 
        status: LoadStatus.Updating
    })),
    on(carteiraActions.updateCarteiraSuccess, (state, payload)=>({
        items: state.items.map(item=>item.identity == payload.carteira.identity? payload.carteira : item),
        status: LoadStatus.Updated
    })),
    on(carteiraActions.updateCarteiraError, (state, payload)=>({
        ...state,
        status: LoadStatus.Error,
        error: payload.error
    }))
)
