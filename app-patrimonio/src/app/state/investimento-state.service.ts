import { inject, Injectable, OnDestroy } from '@angular/core';
import { catchError, concatMap, forkJoin, interval, map, mergeMap, Observable, of, Subscription, switchMap, take, takeWhile, tap } from 'rxjs';
import { clearDictionary, DataStatus, Dictionary, Immutable, Moeda, State, StateBehavior } from '../models/base.model';
import { Cotacao } from '../models/cotacao.models';
import { Ativo, Carteira, ICarteira, TipoInvestimento } from '../models/investimento.model';
import { AtivoService, FilterAtivos } from '../services/ativo.service';
import { CarteiraService } from '../services/carteira.service';
import { CotacaoService } from '../services/cotacao.service';
import { calcularTotais, CalcularTotaisReturnType } from '../util/formulas';

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
export class InvestimentoStateService implements OnDestroy{

  private ativoState$ = new StateBehavior<Ativo>("Ativo");

  private carteiraState$ = new CarteiraStateBehavior();

  private cotacaoState$ = new CotacaoStateBehavior(); // new StateBehavior<Cotacao>("Cotacao");

  private ativoService = inject(AtivoService);

  private carteiraService = inject(CarteiraService);

  private cotacaoService = inject(CotacaoService);
  
  private timerSubscription?: Subscription;


  constructor() { 
    this.timerSubscription = interval(15_000).pipe(
      tap(() => console.log(`\n\n@@@ Listeners: carteira ${this.carteiraState$.countListerners()}, ativo: ${this.ativoState$.countListerners()}, cotacao: ${this.cotacaoState$.countListerners()}`))
    ).subscribe();
  }

  calcularTotaisTodasCarteiras() {
    return this.carteira$.pipe(
      mergeMap(carteiras => 
        forkJoin(carteiras
          .filter(carteira=>carteira.objetivo>0)
          .map(carteira => {
            return this.calcularTotaisCarteira(carteira).pipe(
              map(calculado => ({ ...carteira, ...calculado.total, ativos: undefined }))
            );
          }))
      )
    )
  }

  calcularTotaisCarteira(carteira: Carteira) {

    const ob = new Observable<CalcularTotaisReturnType>(subscriber=>{
      const mapCarteira = new Map<string, Carteira>(Object.values(this.carteiraState$.state$.value.entities)
        .map((carteira: Carteira) => [carteira.identity.toString(), carteira]));
      const mapCotacao = new Map<string, Cotacao>(Object.values(this.cotacaoState$.state$.value.entities)
        .map((cotacao: Cotacao) => [cotacao.simbolo, new Cotacao(cotacao)]));

      const consolidado = calcularTotais({
        carteira,
        cotacaoAtivo: (carteira, ativo) => this.obterCotacaoMoeda(ativo.ativo?.moeda || carteira.moeda, carteira.moeda),
        mapCarteira,
        mapCotacao
      });

      subscriber.next(consolidado);
      subscriber.complete();
    })

    return ob;

  }

  ngOnDestroy(): void {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = undefined;
      }
  }

  notificar() {
    this.ativoState$.state$.next(this.ativoState$.state$.value)
    this.carteiraState$.state$.next(this.carteiraState$.state$.value)
    this.cotacaoState$.state$.next(this.cotacaoState$.state$.value)
  }

  get ativo$() {
    return this.ativoState$.entities.pipe(
      map(dictionary => Object.values(dictionary))
    )
  }

  get ativoStateAsObservable() {
    return this.ativoState$.asObservable();
  }

  get ativoError$() {
    return this.ativoState$.error;
  }

  get ativoStatus$() {
    return this.ativoState$.status;
  }

  get carteira$() {
    return this.carteiraState$.entities.pipe(
      map(dictionary => Object.values(dictionary))
    );
  }

  get carteiraStateAsObservable() {
    return this.carteiraState$.asObservable();
  }

  get carteiraEntities$() {
    return this.carteiraState$.entities.pipe(
      map(dictionary=> dictionary as Immutable<Dictionary<Carteira>>)
    )
  }

  getCarteira(id: string) {
    return this.carteiraState$.state$.value.entities[id];
  }

  get carteiraError$() {
    return this.carteiraState$.error;
  }

  get carteiraStatus$() {
    return this.carteiraState$.status;
  }

  get cotacao$() {
    return this.cotacaoState$.entities.pipe(
      map(dictionary => Object.values(dictionary))
    );
  }

  get cotacaoStateAsObservable() {
    return this.cotacaoState$.asObservable();
  }

  get cotacaoError$() {
    return this.cotacaoState$.error;
  }

  get cotacaoStatus$() {
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
    this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Processing });

    return forkJoin({
      carteiras: this.carteiraService.getCarteiras({}),
      ativosCotacoes: this.ativoService.getAtivos({}).pipe(
        concatMap(ativos => {
          return this.cotacaoService.getCotacoes(ativos).pipe(
            map(cotacoes => {
              const moedas = Array.from(Object.keys(Moeda));

              const dictionaryCotacoes = clearDictionary(this.cotacaoState$.state$.value.entities);
              cotacoes.forEach(entity => dictionaryCotacoes[entity.simbolo] = entity);

              this.ativoState$.setState({
                ...this.ativoState$.state$.value,
                entities: this.mapearAtivosCotacoes(ativos, Object.values(dictionaryCotacoes)),
                status: DataStatus.Executed
              });

              moedas.flatMap(moedaInicial=>moedas.filter(moeda=> moeda !== moedaInicial)
                  .map(moeda=>({sigla: `${moedaInicial}${moeda}`, de: moedaInicial, para: moeda})))
                  .map(item=>({...item, ativo: ativos.find(ativo=>ativo.sigla === item.sigla)}))
                  .filter(item=> !!item.ativo?.cotacao)
                  .map(item=>({...item, cotacao: item.ativo?.cotacao}))
                  .forEach(item => {
                    const cotacaoDePara = new Cotacao({
                      simbolo: item.sigla,
                      moeda: item.para as Moeda,
                      preco: item.cotacao?.preco || NaN,
                      manual: item.cotacao?.manual || true,
                      data: new Date()
                    });
                    const cotacaoParaDe = new Cotacao({
                      simbolo: `${item.para}${item.de}`,
                      data: cotacaoDePara.data,
                      moeda: item.de as Moeda,
                      manual: item.cotacao?.manual || true,
                      preco: 1/cotacaoDePara.preco
                    })
                    dictionaryCotacoes[cotacaoDePara.simbolo] = cotacaoDePara;
                    dictionaryCotacoes[cotacaoParaDe.simbolo] = cotacaoParaDe;
                  })
              

              this.cotacaoState$.setState({
                ...this.cotacaoState$.state$.value,
                entities: { ...dictionaryCotacoes },
                status: DataStatus.Executed
              })
              
              return {ativos, cotacoes}
            }),
            catchError(error => {
              this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Error, error });
              throw error;
            })
          )
        })
      )
    }).pipe(
      tap(result => {
        const carteiras = result.carteiras.sort((a, b) => a.nome.localeCompare(b.nome));
        this.carteiraState$.state$.value.entities = this.mapearCarteirasAtivos(carteiras, result.ativosCotacoes.ativos);
        this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Executed });
        return {
          carteiras,
          ativos: result.ativosCotacoes.ativos,
          cotacoes: result.ativosCotacoes.cotacoes
        }
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

      ativo.cotacao = mapCotacoes.get(ativo.siglaYahoo || ativo.sigla);
    });
    return dictionary;
  }

  adicionarAtivo(ativo: Ativo): void {
    this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Processing });

    const cotacao = ativo.cotacao;

    this.ativoService.addAtivo(ativo).subscribe({
      next: ativo => {
        const dictionary = this.ativoState$.state$.value.entities;
        dictionary[ativo.identity.toString()] = ativo;
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Executed, entities: dictionary });

        this.atualizarCotacaoManual(ativo, cotacao as Cotacao)
      },
      error: error => {
        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Error, error });
      }
    })
  }

  atualizarAtivo(ativo: Ativo): void {
    this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Processing });

    const cotacao = ativo.cotacao;

    this.ativoService.updateAtivo(ativo).subscribe({
      next: () => {
        const dictionary = { ...this.ativoState$.state$.value.entities };
        ativo = new Ativo(ativo, cotacao);
        dictionary[ativo._id as string] = ativo;

        this.ativoState$.setState({ ...this.ativoState$.state$.value, status: DataStatus.Executed, entities: dictionary });

        this.atualizarCotacaoManual(ativo, cotacao as Cotacao);

        const carteiraDic = {...this.carteiraState$.state$.value.entities};
        Object.keys(carteiraDic).forEach(identity=>{
          const carteira = carteiraDic[identity];
          let carteiraAtivo = carteira.ativos.find(a => a.ativoId === ativo._id)
          if (carteiraAtivo !== undefined) {
            carteiraAtivo = {...carteiraAtivo, ativo};
            carteira.ativos = [...carteira.ativos.map(a=>a.ativoId === carteiraAtivo?.ativoId ? carteiraAtivo: a)]
          }
        })
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
        const item = dictionary[ativo.identity.toString()];
        if (!!item) {
          delete dictionary[item.identity.toString()];
        }
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

  ocultarCarteira(carteira: Carteira): void {
    this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Processing });

    const dictionary = { ...this.carteiraState$.state$.value.entities };
    delete dictionary[carteira.identity.toString()];
    this.carteiraState$.setState({ ...this.carteiraState$.state$.value, status: DataStatus.Executed, entities: dictionary });
  }

  atualizarCotacaoManual(ativo: Ativo, cotacao: Cotacao) {
    if (ativo.tipo === TipoInvestimento.Referencia) return;
    if (!cotacao.manual) return;

    this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Processing });
    this.cotacaoService.setCotacao(cotacao.simbolo, cotacao.preco, cotacao.moeda).subscribe(cotacao=> {
      const dictionary = {...this.cotacaoState$.state$.value.entities};
      dictionary[cotacao.simbolo] = cotacao;

      this.cotacaoState$.setState({
        ...this.cotacaoState$.state$.value, 
        entities: dictionary,
        status: DataStatus.Executed});

      Object.values(this.ativoState$.state$.value.entities)
        .filter(ativo=>ativo.sigla === cotacao.simbolo || ativo.siglaYahoo === cotacao.simbolo)
        .forEach(ativo=>ativo.cotacao = cotacao)
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

  carregarCotacoesBatch() {
    return this.cotacaoService.atualizarCotacoesBatch().pipe(
      switchMap(key => interval(1000).pipe(
        tap(console.debug),
        mergeMap(_ => this.cotacaoService.obterInfoCotacoesBatch(key).pipe(
          map(info=>{
            console.debug(info);
            return info;
          })
        ))
      )),
      takeWhile((info)=>{
        return info.status === 'processando' && (info.total > info.processados + info.erros);
      }),
      tap((info)=>{
        console.debug(`Concluiu`, info)
      }),
      catchError(error=>{
        this.cotacaoState$.setState({ ...this.cotacaoState$.state$.value, status: DataStatus.Error, error });
        throw error;
      })
    );
  }

  obterCotacaoMoeda(de: Moeda, para: Moeda) {
    if (de === para) return new Cotacao({
      simbolo: `${de}${para}`,
      moeda: para,
      preco: 1,
      manual: true,
      data: new Date()
    });
    
    return this.cotacaoState$.state$.value.entities[`${de}${para}`];
  }

  converteParaMoeda(de: Moeda, para: Moeda, valor: number) {
    if (de === para) return valor;
    let cotacao = this.obterCotacaoMoeda(de, para);
    if (cotacao) {
      return cotacao.aplicar(valor);
    }
    cotacao = this.obterCotacaoMoeda(para, de);
    if (cotacao) {
      return 1 / cotacao.aplicar(valor);
    }
    throw new Error(`Cotação não encontrada para ${de} -> ${para}`);
  }


}
