import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { routes } from './app.routes';
import * as ativosEffects from './store/ativo.effects';
import { ativoReducer } from './store/ativo.reducers';
import * as carteiraEffects from './store/carteira.effects';
import { carteiraReducer } from './store/carteira.reducers';
import * as cotacaoEffects from './store/cotacao.effects';
import { cotacaoReducer } from './store/cotacao.reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    provideStore({"carteira": carteiraReducer, "ativo": ativoReducer, "cotacao": cotacaoReducer}),
    provideEffects(carteiraEffects, ativosEffects, cotacaoEffects)
]
};
