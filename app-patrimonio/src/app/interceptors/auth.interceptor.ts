import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   authService: AuthService = inject(AuthService);

//   constructor() {}

//   intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//   }
// }

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  console.log('auth interceptor...');
  const authToken = authService.getAuthToken();

  // Clonar a requisição original e substituir o cabeçalho de autorização
  const authReq = req.clone({
    headers: new HttpHeaders({
      'Authorization': `Bearer ${authToken}`,
      'Content-Type' : 'application/json',
     })
  });
  // req.headers.set('Authorization', `Bearer ${authToken}`)

  // Enviar a requisição clonada com o cabeçalho de autorização
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log(error.status)
      console.log(error.message)
      if (error.status === 401) {
      }
      return throwError(()=>error);
    })
  );

};
