import { createReducer, on } from "@ngrx/store";
import { AppData } from "../models/app.models";
import { addAtivoCarteira, addCarteira, getAtivosCarteira, getCarteiras, removeCarteira, updateCarteira } from "./carteira.actions";
import { Carteira } from "../models/investimento.model";
import { addAtivo, getAtivos, removeAtivo, updateAtivo } from "./ativo.actions";

export const initialState: AppData = {
    carteiras: [],
    ativos: [],
    cotacoes: []
};

export const investimentoReducer = createReducer(
    initialState,
    on(getCarteiras, (state, item) => {
        state.carteiras = item.carteiras;
        return {...state, item};
    }),
    on(addCarteira, (state, item)=>{
        return {...state, carteiras: [...state.carteiras, item.carteira]}
    }),
    on(removeCarteira, (state, item)=>{
        return {...state, carteiras: state.carteiras.filter(carteira => carteira != item.carteira)}
    }),
    on(updateCarteira, (state, item)=>{
        return {...state, carteiras: state.carteiras.map(carteira => carteira.identity == item.carteira.identity? item.carteira : carteira)}
    }),
    on(getAtivosCarteira, (state, item)=>{
        // FIXME não deveria adicionar ativos
        return {...state, 
            ativos: item.ativos, 
            carteiras: state.carteiras
                .map(carteira => carteira.identity == item.carteira.identity? 
                    {...carteira, ativos: item.ativos} as Carteira: carteira)
        }
    }),
    on(addAtivoCarteira, (state, item)=>{
        return {...state, 
            ativos: [...state.ativos, item.ativo], 
            carteiras: state.carteiras
                .map(carteira => carteira.identity == item.carteira.identity? 
                    {...carteira, ativos: [...carteira.ativos, item.ativo]} as Carteira: carteira)
        }
    }),
    on(removeCarteira, (state, item)=>{
        return {...state, carteiras: state.carteiras.filter(carteira => carteira.identity!= item.carteira.identity)}
    }),
    on(getAtivos, (state, item) => {
        if (!!item.ativos && item.ativos.length > 0) {
            return {...state, ativos: [...item.ativos]}
        }
        return {...state};
    }),
    on(addAtivo, (state, item) => {
        return {...state, ativos: [...state.ativos, item.ativo]}
    }),
    on(removeAtivo, (state, item) => {
        return {...state, ativos: state.ativos.filter(ativo => ativo.identity!= item.ativo.identity)}
    }),
    on(updateAtivo, (state, item)=>{
        return {...state, ativos: state.ativos.map(ativo => ativo.identity == item.ativo.identity? item.ativo : ativo)}
    })
);