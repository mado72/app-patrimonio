import { TestBed } from '@angular/core/testing';

import { PatrimonioStateService } from './patrimonio-state.service';

describe('PatrimonioStateService', () => {
  let service: PatrimonioStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatrimonioStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
