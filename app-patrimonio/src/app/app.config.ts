import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import * as ativosEffects from './store/ativo.effects';
import { ativoReducer } from './store/ativo.reducers';
import * as carteiraEffects from './store/carteira.effects';
import { carteiraReducer } from './store/carteira.reducers';
import * as cotacaoEffects from './store/cotacao.effects';
import { cotacaoReducer } from './store/cotacao.reducers';
import { errorInterceptor } from './interceptors/handle-error.interceptor';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])),
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideRouter(routes),
    provideStore({ "carteira": carteiraReducer, "ativo": ativoReducer, "cotacao": cotacaoReducer }),
    provideEffects(carteiraEffects, ativosEffects, cotacaoEffects),
    provideStoreDevtools({}),
    provideToastr()
  ]
};
