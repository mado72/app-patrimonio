import { TestBed } from '@angular/core/testing';

import { InvestimentoStateService } from './investimento-state.service';

describe('InvestimentoStateService', () => {
  let service: InvestimentoStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestimentoStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
