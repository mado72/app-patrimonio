import { createAction, props } from "@ngrx/store";
import { Carteira, CarteiraAtivo } from "../models/investimento.model";

class CarteiraActions {
    readonly getCarteiras = createAction("[Carteira] obterCarteiras")
    readonly getCarteirasSuccess = createAction("[Carteira] obterCarteiras sucesso", props<{carteiras: Carteira[]}>());
    readonly getCarteirasError = createAction("[Carteira] obterCarteiras erro", props<{error: any}>());
    
    readonly addCarteira = createAction("[Carteira] adicionada", props<{carteira: Carteira}>())
    readonly addCarteiraSuccess = createAction("[Carteira] adicionada sucesso", props<{carteira: Carteira}>())
    readonly addCarteiraError = createAction("[Carteira] adicionada erro", props<{error: any, carteira: Carteira}>())
    
    readonly removeCarteira = createAction("[Carteira] remove carteira", props<{carteira: Carteira}>())
    readonly removeCarteiraSuccess = createAction("[Carteira] removida sucesso", props<{carteira: Carteira}>())
    readonly removeCarteiraError = createAction("[Carteira] removida erro", props<{error: any, carteira: Carteira}>())
    
    readonly updateCarteira = createAction("[Carteira] alterada", props<{carteira: Carteira}>())
    readonly updateCarteiraSuccess = createAction("[Carteira] alterada sucesso", props<{carteira: Carteira}>())
    readonly updateCarteiraError = createAction("[Carteira] alterada erro", props<{error: any, carteira: Carteira}>())
    
    readonly getCarteiraAtivos = createAction("[CarteiraAtivos] ativos", props<{carteira: Carteira}>())
    readonly getCarteiraAtivosSuccess = createAction("[CarteiraAtivos] ativos sucesso", props<{carteira: Carteira, ativos: CarteiraAtivo[]}>())
    readonly getCarteiraAtivosError = createAction("[CarteiraAtivos] ativos erro", props<{error: any, carteira: Carteira, ativo: CarteiraAtivo}>())

    readonly addCarteiraAtivo = createAction("[CarteiraAtivo] adiciona ativo", props<{carteira: Carteira, ativo: CarteiraAtivo}>())
    readonly addCarteiraAtivoSuccess = createAction("[CarteiraAtivo] adiciona ativo sucesso", props<{carteira: Carteira, ativo: CarteiraAtivo}>())
    readonly addCarteiraAtivoError = createAction("[CarteiraAtivo] adiciona ativo erro", props<{error: any, carteira: Carteira, ativo: CarteiraAtivo}>())

    readonly removeCarteiraAtivo = createAction("[CarteiraAtivo] remove ativo", props<{carteira: Carteira, ativo: CarteiraAtivo}>())
    readonly removeCarteiraAtivoSuccess = createAction("[CarteiraAtivo] remove ativo sucesso", props<{carteira: Carteira, ativo: CarteiraAtivo}>())
    readonly removeCarteiraAtivoError = createAction("[CarteiraAtivo] remove ativo erro", props<{error: any, carteira: Carteira, ativo: CarteiraAtivo}>())
}

export const carteiraActions = new CarteiraActions();

