import { inject, Injectable } from '@angular/core';
import { DataStatus, Dictionary, StateBehavior } from '../models/base.model';
import { Conta } from '../models/conta.model';
import { catchError, concatMap, forkJoin, interval, map, mergeMap, of, Subscription, switchMap, take, takeWhile, tap } from 'rxjs';
import { ContaService } from '../services/conta.service';

@Injectable({
  providedIn: 'root'
})
export class PatrimonioStateService {

  private contaState$ = new StateBehavior<Conta>("Conta");

  private contaService = inject(ContaService);

  constructor() { }

  notificar() {
    this.contaState$.state$.next(this.contaState$.state$.value);
  }

  get conta$() {
    return this.contaState$.entities.pipe(
      map(dictionary => Object.values(dictionary))
    )
  }

  get contaError$() {
    return this.contaState$.error;
  }

  get contaStatus$() {
    return this.contaState$.status;
  }

  limparErrosConta() {
    this.contaState$.clearError()
  }

  obterContas() {
    this.contaState$.setState({ ...this.contaState$.state$.value, status: DataStatus.Processing });

    this.contaService.obterContas()
      .subscribe({
        next: contas => this.contaState$.setState(
          {
            ...this.contaState$.state$.value,
            entities: contas.reduce((acc, a) => {
              acc[a.identity.toString()] = a;
              return acc;
            }, {} as Dictionary<Conta>),
            status: DataStatus.Executed
          }
        ),
        error: error => this.contaState$.setState(
          { ...this.contaState$.state$.value, error, status: DataStatus.Error }
        )
      });
  }

}
