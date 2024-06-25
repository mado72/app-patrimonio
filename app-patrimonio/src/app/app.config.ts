import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { carteiraReducer } from './store/carteira.reducers';
import { ativoReducer } from './store/ativo.reducers';
import  * as carteiraEffects  from './store/carteira.effects';
import  * as ativosEffects  from './store/ativo.effects';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    provideStore({"carteira": carteiraReducer, "ativo": ativoReducer}),
    provideEffects(carteiraEffects, ativosEffects)
]
};
