import { TestBed } from '@angular/core/testing';
import { ConsolidacaoService } from './consolidacao.service';
import { InvestimentoStateService } from '../state/investimento-state.service';
import { of } from 'rxjs';
import { Moeda } from '../models/base.model';
import { Alocacao, Alocacoes } from '../models/aportes.model';

describe('ConsolidacaoService', () => {
  let service: ConsolidacaoService;
  let investimentoStateService: InvestimentoStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: InvestimentoStateService, useValue: { calcularTotaisTodasCarteiras: jest.fn(), converteParaMoeda: jest.fn() } }
      ]
    });
    service = TestBed.inject(ConsolidacaoService);
    investimentoStateService = TestBed.inject(InvestimentoStateService);
  });

  it('should calculate percentual of financeiro correctly', (done) => {
    const mockConsolidados = [
      { identity: 1, classe: 'A', moeda: Moeda.USD, nome: 'Carteira 1', vlTotal: 100, objetivo: 0.50 },
      { identity: 2, classe: 'B', moeda: Moeda.BRL, nome: 'Carteira 2', vlTotal: 200, objetivo: 1.00 }
    ];

    const mockAlocacoes: Alocacao[] = [
      { idCarteira: '1', classe: 'A (USD)', carteira: 'Carteira 1', financeiro: 100, planejado: 0.50 },
      { idCarteira: '2', classe: 'B (EUR)', carteira: 'Carteira 2', financeiro: 200, planejado: 1.00 }
    ];

    const mockTotais: Required<Alocacao> = { carteira: 'Total', financeiro: 300, planejado: 150, idCarteira: '1', classe: 'A (USD)', percentual: 0.5};

    const mockAlocacoesComPercentual: Required<Alocacao>[] = [
      { idCarteira: '1', classe: 'A (USD)', carteira: 'Carteira 1', financeiro: 100, planejado: 50, percentual: 0.3333 },
      { idCarteira: '2', classe: 'B (EUR)', carteira: 'Carteira 2', financeiro: 200, planejado: 100, percentual: 0.6667 }
    ];

    const mockResultado: Alocacoes = { alocacoes: mockAlocacoesComPercentual, totais: mockTotais };

    (investimentoStateService.calcularTotaisTodasCarteiras as jest.Mock).mockReturnValue(of(mockConsolidados));

    service.consolidarAlocacoes().subscribe(result => {
      expect(result).toEqual(mockResultado);
      done();
    });
  });
});