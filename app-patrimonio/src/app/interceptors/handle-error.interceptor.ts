import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
// import { AlertService } from '../services/alert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError( (httpError: HttpErrorResponse) =>{
      console.error(httpError.error);
      // this.alertService.alert({
      //   tipo: 'http',
      //   mensagem: httpError.error?.message || httpError.message,
      //   titulo: 'Erro na requisição'
      // })
      console.error(`Erro HTTP: ${httpError.error?.message || httpError.message}`);
      throw httpError.error?.message || httpError.message;
    })
  );
}
