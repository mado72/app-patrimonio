import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, map, mergeMap, of, take, tap } from 'rxjs';
import { Moeda } from '../models/base.model';
import { Cotacao } from '../models/cotacao.models';
import { Ativo, Carteira, ICarteira, TipoInvestimento } from '../models/investimento.model';
import { AtivoService, FilterAtivos } from '../services/ativo.service';
import { CarteiraService } from '../services/carteira.service';
import { CotacaoService } from '../services/cotacao.service';

export enum DataStatus {
  Idle = "Idle",
  Processing = "Processing",
  Executed = "Executed",
  Error = "Error"
}

class Dictionary<T> {
  [id: string]: T;
}

function clearDictionary<T>(dictionary: Dictionary<T>): Dictionary<T> {
  Object.keys(dictionary).forEach(key => delete dictionary[key]);
  return dictionary;
}

class State<T> {
  entities = new Dictionary<T>();
  status = DataStatus.Idle;
  error: any;
}

class StateBehavior<T> {

  state$ = new BehaviorSubject(new State<T>());
  error = this.state$.pipe(map(s => s.error));
  entities = this.state$.pipe(map(s => s.entities));
  status = this.state$.pipe(map(s => s.status));
  nome!: string;

  constructor(nome: string) {
    this.nome = nome;
  }

  asObservable() {
    return this.state$.asObservable();
  }

  setState(state: State<T>) {
    const value = { ...this.state$.value, ...state };
    this.state$.next(value);
  }

  clearError() {
    const error = this.state$.value.error;
    if (error) {
      const state = { ...this.state$.value, status: DataStatus.Idle, error: null };
      this.setState(state);
    }
  }

}

class CarteiraStateBehavior extends StateBehavior<Carteira> {
  constructor() {
    super("Carteira");
  }
  override setState(state: State<Carteira>): void {
    console.log(`setState (${this.nome}):`, this.state$.value, state);
    super.setState(state);
  }
}
class CotacaoStateBehavior extends StateBehavior<Cotacao> {
  constructor() {
    super("Cotacao");
  }
}

@Injectable({
  providedIn: 'root'
})
export class InvestimentoStateService {

  private ativoState$ = new StateBehavior<Ativo>("Ativo");

  private carteiraState$ = new CarteiraStateBehavior();

  private cotacaoState$ = new CotacaoStateBehavior(); // new StateBehavior<Cotacao>("Cotacao");

  private ativoService = inject(AtivoService);

  private carteiraService = inject(CarteiraService);

  private cotacaoService = inject(CotacaoService);

  constructor() { }

  get ativo() {
    return this.ativoState$.entities.pipe(
      map(dictionary => Object.values(dictionary))
    )
  }

  get ativoStateAsObservable() {
    return this.ativoState$.asObservable();
  }

  get ativoError() {
    return this.ativoState$.error;
  }

  get ativoStatus() {
    return this.ativoState$.status;
  }

  get carteira() {
    return this.carteiraState$.entities.pipe(
      map(dictionary => Object.values(dictionary))
    );
  }

  get carteiraStateAsObservable() {
    return this.carteiraState$.asObservable();
  }

  get carteiraError() {
    return this.carteiraState$.error;
  }

  get carteiraStatus() {
    return this.carteiraState$.status;
  }

  get cotacao() {
    return this.cotacaoState$.entities.pipe(
      map(dictionary => Object.values(dictionary))
    );
  }

  get cotacaoStateAsObservable() {
    return this.cotacaoState$.asObservable();
  }

  get cotacaoError() {
    return this.cotacaoState$.error;
  }

  get cotacaoStatus() {
    return this.cotacaoState$.status;
  }

  limparErrosAtivos() {
    this.ativoState$.clearError();
  }

  limparErrosCarteiras() {
    this.carteiraState$.clearError();
  }

  limparErrosCotacoes() {
    this.cotacaoState$.clearError();
  }

  obterAlocacoes() {
    this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Processing });
    this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Processing });

    return forkJoin({
      carteiras: this.carteiraService.getCarteiras({}),
      ativos: this.ativoService.getAtivos({})
    }).pipe(
      mergeMap(result => {
        const carteiras = result.carteiras;
        const ativos = result.ativos;
        this.carteiraState$.state$.value.entities = this.mapearCarteirasAtivos(carteiras, ativos);
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Executed });

        this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Processing });
        return this.cotacaoService.getCotacoes(ativos).pipe(
          map(cotacoes => {
            const dictionaryCotacoes = clearDictionary(this.cotacaoState$.state$.value.entities);
            cotacoes.forEach(entity => dictionaryCotacoes[entity.simbolo] = entity);
            this.cotacaoState$.setState({
              ...this.cotacaoState$.state$.value,
              entities: { ...dictionaryCotacoes },
              status: DataStatus.Executed
            })
            this.ativoState$.setState({
              ...this.ativoState$.state$.value,
              entities: this.mapearAtivosCotacoes(ativos, Object.values(dictionaryCotacoes)),
              status: DataStatus.Executed
            });
          }),
          catchError(error => {
            this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Error, error });
            return of(null);
          }),
        )
      }),
      catchError(error => {
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Error, error });
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Error, error });
        return of(null);
      }),
    )
  }

  carregarAtivos(filter?: FilterAtivos) {

    this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Processing });

    this.ativoService.getAtivos(filter)
      .subscribe({
        next: ativos => {
          const cotacoes = this.cotacaoState$.state$.value.entities;

          const dictionary = this.mapearAtivosCotacoes(ativos, Object.values(cotacoes));

          this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Executed, entities: dictionary });
        },
        error: error => {
          this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Error, error });
        }
      });
  }

  private mapearAtivosCotacoes(ativos: Ativo[], cotacoes: Cotacao[]) {
    const dictionary = { ...this.ativoState$.state$.value.entities };

    const mapAtivos = new Map(ativos.map(ativo => [ativo.identity.toString(), ativo]));
    const mapCotacoes = new Map(cotacoes.map(cotacao => [cotacao.simbolo, cotacao]));

    Array.from(mapAtivos.keys()).forEach(key => {
      const ativo = mapAtivos.get(key) as Ativo;
      dictionary[key] = ativo;

      ativo.cotacao = mapCotacoes.get(ativo.sigla);
    });
    return dictionary;
  }

  adicionarAtivo(ativo: Ativo): void {
    this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Processing });

    this.ativoService.addAtivo(ativo).subscribe({
      next: ativo => {
        const dictionary = this.ativoState$.state$.value.entities;
        dictionary[ativo.identity.toString()] = ativo;
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Executed, entities: dictionary });
      },
      error: error => {
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Error, error });
      }
    })
  }

  atualizarAtivo(ativo: Ativo): void {
    this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Processing });

    this.ativoService.updateAtivo(ativo).subscribe({
      next: () => {
        const dictionary = { ...this.ativoState$.state$.value.entities };
        dictionary[ativo._id as string] = new Ativo(ativo);
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Executed });
      },
      error: error => {
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Error, error });
      }
    })
  }

  removerAtivo(ativo: Ativo): void {
    this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Processing });

    this.ativoService.removeAtivo(ativo).subscribe({
      next: () => {
        const dictionary = { ...this.ativoState$.state$.value.entities };
        delete dictionary[ativo.identity.toString()];
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Executed, entities: dictionary });
      },
      error: error => {
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Error, error });
      }
    })
  }

  carregarCarteiras({ moeda, classe, ativo }: { moeda?: Moeda, classe?: TipoInvestimento, ativo?: Ativo }) {

    this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Processing });

    this.carteiraService.getCarteiras({ moeda, classe, ativo })
      .subscribe({
        next: carteiras => {
          const ativos = this.ativoState$.state$.value.entities;

          const dictionary = this.mapearCarteirasAtivos(carteiras, Object.values(ativos));

          this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Executed, entities: dictionary });
        },
        error: error => {
          this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Error, error });
        }
      });
  }

  private mapearCarteirasAtivos(carteiras: Carteira[], ativos: Ativo[]) {
    const dictionary = { ...this.carteiraState$.state$.value.entities };

    const mapCarteira = new Map(
      carteiras.map(carteira => {
        carteira = new Carteira(carteira);
        return [carteira.identity.toString(), carteira];
      }));
    
    const mapAtivos = new Map(ativos.map(ativo => [ativo.identity, ativo]));

    Array.from(mapCarteira.keys()).forEach(key => {
      const carteira = mapCarteira.get(key) as Carteira;
      dictionary[key] = carteira;

      carteira.ativos.forEach(item => {
        item.ativo = mapAtivos.get(item.ativoId);
      });
    });
    return dictionary;
  }

  adicionarCarteira(carteira: Carteira): void {
    this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Processing });

    this.carteiraService.addCarteira(carteira).subscribe({
      next: carteira => {
        const dictionary = this.carteiraState$.state$.value.entities;
        dictionary[carteira.identity.toString()] = carteira;
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Executed, entities: dictionary });
      },
      error: error => {
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Error, error });
      }
    })
  }

  atualizarCarteira(carteira: ICarteira): void {
    this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Processing });

    this.carteiraService.updateCarteira(carteira).subscribe({
      next: () => {
        const dictionary = {...this.carteiraState$.state$.value.entities};
        dictionary[carteira._id as string] = carteira = new Carteira(carteira);

        this.ativoState$.entities.pipe(
          take(1),
          tap(ativosDic => {
            carteira.ativos.forEach(item=>{
              const ativo = ativosDic[item.ativoId]; 
              console.log(`Atualizando carteiraAtivo.ativo. item.ativo?._id: ${item.ativo?._id}, item.ativoId: ${item.ativoId}, : ativo?._id: ${ativo?._id || ''}`)
              item.ativo = ativo;
            })

            this.ativoState$.setState({...this.ativoState$.state$.value, status: DataStatus.Executed, error: undefined });
            this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Executed, entities: dictionary, error: undefined });
          }),
          catchError((error) => {
            this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Error, error });
            return of(null);
          })
        ).subscribe();
      },
      error: error => {
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Error, error });
      }
    })
  }

  removerCarteira(carteira: Carteira): void {
    this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Processing });

    this.carteiraService.removeCarteira(carteira).subscribe({
      next: () => {
        const dictionary = { ...this.carteiraState$.state$.value.entities };
        delete dictionary[carteira.identity.toString()];
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Executed, entities: dictionary });
      },
      error: error => {
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Error, error });
      }
    })
  }

  carregarCotacoes(ativos: Ativo[]): void {
    this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Processing });
    this.cotacaoService.getCotacoes(ativos).subscribe(cotacoes => {
      const dictionary = this.cotacaoState$.state$.value.entities;

      cotacoes = cotacoes.map(cotacao => {
        cotacao = new Cotacao(cotacao);
        dictionary[cotacao.simbolo] = cotacao;
        return cotacao;
      });

      ativos.forEach(ativo => {
        const cotacao = cotacoes.find(c => c.simbolo === ativo.siglaYahoo);
        if (cotacao) {
          ativo.cotacao = cotacao;
        }
      });
      this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Executed, entities: dictionary });
    })
  }

  carregarCotacoesBatch(): void {
    this.cotacaoService.atualizarCotacoesBatch().subscribe(
      {
        next: () => {
          this.carregarCotacoes(Object.values(this.ativoState$.state$.value.entities));
        },
        error: (error) => {
          this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Error, error });
        }
      }
    )
  }

}
