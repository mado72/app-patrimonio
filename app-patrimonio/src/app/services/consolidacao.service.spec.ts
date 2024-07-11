import { TestBed } from '@angular/core/testing';

import { ConsolidacaoService } from './consolidacao.service';

describe('ConsolidacaoService', () => {
  let service: ConsolidacaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsolidacaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
