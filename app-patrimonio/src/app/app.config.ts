import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withDebugTracing, withPreloading } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import localePt from '@angular/common/locales/pt';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/handle-error.interceptor';
import * as ativosEffects from './store/ativo.effects';
import * as carteiraEffects from './store/carteira.effects';
import { investimentoReducer } from './store/investimento.reducers';
import * as cotacaoEffects from './store/cotacao.effects';
import * as investimentoEffects from './store/investimento.effects';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])),
      {provide: LOCALE_ID, useValue: 'pt' },
      // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideRouter(routes,
      withPreloading(PreloadAllModules),
      withDebugTracing()
    ),
    provideStore({ "investimentos": investimentoReducer }),
    provideEffects(carteiraEffects, ativosEffects, cotacaoEffects, investimentoEffects),
    provideStoreDevtools({
      trace: true,
      traceLimit: 100
    }),
    provideToastr({
      easeTime: 600,
      progressBar: true,
      positionClass: 'toast-bottom-right',
      closeButton: true,
      newestOnTop: true,
    }),
    provideAnimations(),
  ]
};
