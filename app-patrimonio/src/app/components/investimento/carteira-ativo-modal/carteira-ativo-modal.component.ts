import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModalModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, catchError, debounceTime, delay, distinctUntilChanged, map, of, skipWhile, switchMap, tap } from 'rxjs';
import { Ativo, CarteiraAtivo, createAtivo } from '../../../models/investimento.model';

@Component({
  selector: 'app-carteira-ativo-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    NgbTypeaheadModule
  ],
  templateUrl: './carteira-ativo-modal.component.html',
  styleUrl: './carteira-ativo-modal.component.scss'
})
/**
 * @description
 * Componente para lidar com o formulário de um item da carteira.
 *
 * @class CarteiraAtivoFormComponent
 */
export class CarteiraAtivoModalComponent {

  @Input() ativos: Ativo[] = [];

  @Output() onTermoChanged = new EventEmitter<string>();

  /**
   * @description
   * Propriedade de entrada que recebe os dados iniciais do item da carteira.
   *
   * @type {ICarteiraAtivo}
   * @memberof CarteiraAtivoFormComponent
   */
  private _carteiraAtivo!: CarteiraAtivo;

  get carteiraAtivo(): CarteiraAtivo {
    return this._carteiraAtivo;
  }

  @Input()
  set carteiraAtivo(value: CarteiraAtivo) {
    this._carteiraAtivo = {...value};
  }

  /**
   * @description
   * EventEmitter que emite os dados do item da carteira salvo.
   *
   * @type {EventEmitter<ICarteiraAtivo>}
   * @memberof CarteiraAtivoFormComponent
   */
  @Output() onSalvar = new EventEmitter<CarteiraAtivo>();

  /**
   * @description
   * EventEmitter que emite os dados do item da carteira excluído.
   *
   * @type {EventEmitter<ICarteiraAtivo>}
   * @memberof CarteiraAtivoFormComponent
   */
  @Output() onExcluir = new EventEmitter<CarteiraAtivo>();

  /**
   * @description
   * EventEmitter que emite a operação cancelada.
   *
   * @type {EventEmitter}
   * @memberof CarteiraAtivoFormComponent
   */
  @Output() onCancelar = new EventEmitter();

  /**
   * @description
   * Construtor que inicializa o componente com um objeto de item da carteira vazio.
   *
   * @memberof CarteiraAtivoFormComponent
   */
  constructor() {}

  buscando = false;
  buscaFalhou = false;

  buscarAtivo: OperatorFunction<string, readonly Ativo[]> = ($text: Observable<string>) => 
    $text.pipe(
      skipWhile((termo)=>termo.length < 3),
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.buscando = true),

      switchMap((termo)=>of(termo)
        .pipe(
          tap((termo) => {
            this.buscaFalhou = false;
            this.onTermoChanged.emit(termo);
          }),
          delay(200),
          // map(_=>this.ativos.map(ativo=>ativo.nome)),
          map(_=>this.ativos),
          catchError(()=>{
            this.buscando = false;
            this.buscaFalhou = true;
            return of([]);
          }),
          tap(()=>this.buscando = false)
        ))
    )

  formatar = (value: any) => value._id? value.nome : value;

  selecionarAtivo(event: any) {
    this._carteiraAtivo.ativo = event.item as Ativo;
    this._carteiraAtivo.ativoId = this._carteiraAtivo.ativo._id as string;
    console.log(`carteiraAtivo atualizado`, this._carteiraAtivo);
    return event;
  }

  get objetivoPerc() {
    return this.carteiraAtivo.objetivo * 100;
  }

  set objetivoPerc(value: number) {
    this.carteiraAtivo.objetivo = value * 0.01;
  }

  /**
   * @description
   * Método que emite os dados do item da carteira salvo quando o formulário é enviado.
   *
   * @memberof CarteiraAtivoFormComponent
   */
  submitClick(): void {
    if (! this.carteiraAtivo.ativo) throw 'Ativo não selecionado';
    this.onSalvar.emit(this.carteiraAtivo);
  }

  /**
   * @description
   * Método que emite a operação cancelada quando o formulário é cancelado.
   *
   * @memberof CarteiraAtivoFormComponent
   */
  cancelarClick(): void {
    this.onCancelar.emit();
  }

  /**
   * @description
   * Método que emite os dados do item da carteira excluído quando o formulário é excluído.
   *
   * @memberof CarteiraAtivoFormComponent
   */
  excluirClick(): void {
    this.onExcluir.emit(this.carteiraAtivo);
  }

  static createCarteiraAtivo(): CarteiraAtivo {
    return {
      ativoId: '',
      quantidade: 0,
      vlAtual: 0,
      vlInicial: 0,
      objetivo: 0,
    };

  }

}
