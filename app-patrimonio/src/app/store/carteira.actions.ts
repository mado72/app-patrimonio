import { createAction, props } from "@ngrx/store";
import { Ativo, Carteira } from "../models/investimento.model";

class CarteiraActions {
    readonly getCarteiras = createAction("[Carteira] obterCarteiras")
    readonly getCarteirasSuccess = createAction("[Carteira] obterCarteiras sucesso", props<{carteiras: Carteira[]}>());
    readonly getCarteirasError = createAction("[Carteira] obterCarteiras erro", props<{error: any}>());
    
    readonly addCarteira = createAction("[Carteira] adicionada", props<{carteira: Carteira}>())
    readonly addCarteiraSuccess = createAction("[Carteira] adicionada sucesso", props<{carteira: Carteira}>())
    readonly addCarteiraError = createAction("[Carteira] adicionada erro", props<{error: any}>())
    
    readonly removeCarteira = createAction("[Carteira] remove carteira", props<{carteira: Carteira}>())
    readonly removeCarteiraSuccess = createAction("[Carteira] removida sucesso", props<{carteira: Carteira}>())
    readonly removeCarteiraError = createAction("[Carteira] removida erro", props<{error: any}>())
    
    readonly updateCarteira = createAction("[Carteira] alterada", props<{carteira: Carteira}>())
    readonly updateCarteiraSuccess = createAction("[Carteira] alterada sucesso", props<{carteira: Carteira}>())
    readonly updateCarteiraError = createAction("[Carteira] alterada erro", props<{error: any}>())
    
    readonly getAtivosCarteira = createAction("[AtivosCarteira] ativos da carteira", props<{carteira: Carteira}>())
    readonly getAtivosCarteiraSuccess = createAction("[AtivosCarteira] ativos da carteira sucesso", props<{ativos: Ativo[], carteira: Carteira}>())
    readonly getAtivosCarteiraError = createAction("[AtivosCarteira] ativos da carteira erro", props<{error: any}>())

    readonly addAtivoCarteira = createAction("[Ativo] adiciona ativo na carteira", props<{ativo: Ativo, carteira: Carteira}>())
    readonly addAtivoCarteiraSuccess = createAction("[Ativo] adiciona ativo na carteira sucesso", props<{ativo: Ativo, carteira: Carteira}>())
    readonly addAtivoCarteiraError = createAction("[Ativo] adiciona ativo na carteira erro", props<{error: any}>())

    readonly removeAtivoCarteira = createAction("[Ativo] remove ativo da carteira", props<{ativo: Ativo, carteira: Carteira}>())
    readonly removeAtivoCarteiraSuccess = createAction("[Ativo] remove ativo da carteira sucesso", props<{ativo: Ativo, carteira: Carteira}>())
    readonly removeAtivoCarteiraError = createAction("[Ativo] remove ativo da carteira erro", props<{error: any}>())
}

export const carteiraActions = new CarteiraActions();

