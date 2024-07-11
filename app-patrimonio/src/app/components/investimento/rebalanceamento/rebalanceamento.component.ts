import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { Alocacao, Alocacoes, ConsolidacaoService } from '../../../services/consolidacao.service';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule, DecimalPipe, JsonPipe, PercentPipe } from '@angular/common';

interface Totais extends Required<Omit<Rebalanceamento, "totais">> {}

class Rebalanceamento implements Alocacao {
  id: string;
  classe: string;
  carteira: string;
  financeiro: number;
  planejado: number;
  percentual?: number;
  private _aporte: number;
  totalizador: Totalizador;

  constructor(alocacao: Alocacao, totalizador: Totalizador) {
    this.id = alocacao.id;
    this.classe = alocacao.classe;
    this.carteira = alocacao.carteira;
    this.financeiro = alocacao.financeiro;
    this.planejado = alocacao.planejado;
    this.percentual = alocacao.percentual;
    this.totalizador = totalizador;
    this._aporte = 0;
  }

  get aporte() {
    return this._aporte;
  }

  set aporte(val: number) {
    this._aporte = val;
  }

  get total() {
    return this.financeiro + (this.aporte || 0);
  }

  get novo() {
    return this.total / this.totalizador.total;
  }

  get dif() {
    if (! this.planejado) return 0;
    return (this.novo - this.planejado) / this.planejado;
  }
}

class Totalizador {
  rebalanceamentos: Rebalanceamento[] = [];

  get financeiro(): number {
    return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + rebalanceamento.financeiro, 0)
  }

  get total(): number {
    return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + rebalanceamento.total, 0)
  }

  get planejado(): number {
    return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + rebalanceamento.planejado, 0)
  }

  get percentual(): number {
    return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + (rebalanceamento.percentual || 0), 0)
  }

  get aporte(): number {
    return this.rebalanceamentos.reduce((acc, rebalanceamento) => acc + (rebalanceamento.aporte || 0), 0)
  }
}

@Component({
  selector: 'app-rebalanceamento',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    JsonPipe
  ],
  templateUrl: './rebalanceamento.component.html',
  styleUrl: './rebalanceamento.component.scss'
})
export class RebalanceamentoComponent {

  private consolidacaoService = inject(ConsolidacaoService)

  num = 123;
  readonly totais = new Totalizador();

  constructor() { 
    this.consolidacaoService.consolidarAlocacoes().pipe(
      map(consolidacoes => this.converter(consolidacoes))
    ).subscribe(consolidado=>this.totais.rebalanceamentos = consolidado)  
  }  

  private converter(consolidacoes: Alocacoes) {
    const rebalanceamentos: Rebalanceamento[] = 
      consolidacoes.alocacoes.map(consolidacao => new Rebalanceamento(consolidacao, this.totais));
    

    return rebalanceamentos;
  }

}
