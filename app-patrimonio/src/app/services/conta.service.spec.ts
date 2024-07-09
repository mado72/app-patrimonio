import { TestBed } from '@angular/core/testing';

import { ContaService } from './conta.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ContaService', () => {
  let service: ContaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ContaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
