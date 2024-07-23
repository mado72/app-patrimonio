import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortifolioComponent } from './portifolio.component';
import { InvestimentoStateService } from '../../../state/investimento-state.service';
import { Ativo, Carteira, CarteiraAtivo, ICarteira, ICarteiraAtivo, TipoInvestimento } from '../../../models/investimento.model';
import { Observable, identity, of } from 'rxjs';
import { Cotacao } from '../../../models/cotacao.models';
import { Moeda } from '../../../models/base.model';
import { ModalService } from '../../../services/modal.service';


describe('PortifolioComponent', () => {
  let component: PortifolioComponent;
  let fixture: ComponentFixture<PortifolioComponent>;
  const investimentoStateServiceStub: Partial<InvestimentoStateService> = {
    ativo$: of(ATIVOS),
    atualizarCarteira: (carteira: Carteira) => {}
  }
  const modalServiceStub: Partial<ModalService> = {
    openCarteiraAtivoModalComponent : (ativos, carteiraAtivos) => {
      return of({
        comando: 'salvar',
        dados: carteiraAtivos as CarteiraAtivo,
      })
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortifolioComponent],
      providers: [
        { provide: InvestimentoStateService, useValue: investimentoStateServiceStub },
        { provide: ModalService, useValue: modalServiceStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortifolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve atualizar carteira quando editar um ativo', () => {
    let update = {} as ICarteira;
    const carteiraAtivoUpdated : ICarteiraAtivo = {
      ativoId: ATIVOS[0].identity.toString(),
      quantidade: 100,
      objetivo: .2,
      vlInicial: 100,
      vlAtual: 120
    };
    let investimentoStateService = TestBed.inject(InvestimentoStateService);
    let modalService = TestBed.inject(ModalService);
    
    spyOn(investimentoStateService, 'atualizarCarteira').and.callFake(carteira=>update = carteira);
    spyOn(modalService, 'openCarteiraAtivoModalComponent').and.callFake(()=>of({
      comando:'salvar',
      dados: CARTEIRA_ATIVO
    }));

    component.editarCarteiraAtivo({carteira: CARTEIRA, carteiraAtivo: CARTEIRA_ATIVO});
    expect(update._id).toEqual(ATIVOS[0]._id);
  })
});

const ATIVOS : Ativo[] = [
  {
    sigla: 'AAPL',
    siglaYahoo: 'AAPL',
    cotacao: {
      data: new Date(),
      preco: 123.45
    } as Cotacao,
    setor: 'Computacao',
    nome: 'APPL',
    tipo: TipoInvestimento.Acao,
    moeda: Moeda.BRL,
    valor: 0
  },
  {
    sigla: 'GOOGL',
    siglaYahoo: 'GOOGL',
    cotacao: {
      data: new Date(),
      preco: 890.12
    } as Cotacao,
    setor: 'Computacao',
    nome: 'GOOGL',
    tipo: TipoInvestimento.Acao,
    moeda: Moeda.BRL,
    valor: 0
  }
].map(i=>new Ativo(i))


const CARTEIRA: Carteira = new Carteira({
  ativos: [{
    ativoId: ATIVOS[0].identity.toString(),
    quantidade: 100,
    objetivo: 1000,
    vlInicial: 10000,
    ativo: ATIVOS[0]
  }],
  nome: 'carteira',
  classe: TipoInvestimento.Acao,
  moeda: Moeda.BRL,
  objetivo: 1
});

const CARTEIRA_ATIVO : CarteiraAtivo = {
  ativoId: ATIVOS[0].identity.toString(),
  quantidade: 1,
  objetivo: .5,
  vlInicial: 100,
}