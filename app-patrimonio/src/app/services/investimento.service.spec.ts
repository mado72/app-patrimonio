import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { InvestimentoService } from './investimento.service';
import { environment } from '../../environments/environment';
import { AporteDB } from '../models/aportes.model';

describe('InvestimentoService', () => {
  let service: InvestimentoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvestimentoService, provideHttpClientTesting()]
    });
    service = TestBed.inject(InvestimentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should throw an error when the HTTP request fails (network error)', () => {
    const errorResponse = { status: 0, statusText: 'Network Error' };
    service.obterAportes({}).subscribe(
      () => fail('Expected an error, but got none'),
      (error) => expect(error.message).toContain('Network Error')
    );

    const request = httpMock.expectOne(`${environment.apiUrl}/aporte`);
    request.error(new ErrorEvent('Network error'), errorResponse);
  });

  it('should throw an error when the HTTP request fails (server error)', () => {
    const errorResponse = { status: 500, statusText: 'Internal Server Error' };
    service.obterAportes({}).subscribe(
      () => fail('Expected an error, but got none'),
      (error) => expect(error.message).toContain('Internal Server Error')
    );

    const request = httpMock.expectOne(`${environment.apiUrl}/aporte`);
    request.error(new ErrorEvent('Error'), errorResponse);
  });

  it('should throw an error when the HTTP request fails (timeout)', () => {
    const errorResponse = { name: 'TimeoutError' };
    service.obterAportes({}).subscribe(
      () => fail('Expected an error, but got none'),
      (error) => expect(error.name).toBe('TimeoutError')
    );

    const request = httpMock.expectOne(`${environment.apiUrl}/aporte`);
    request.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should throw an error when the HTTP request fails (unknown error)', () => {
    const errorResponse = { message: 'Unknown error' };
    service.obterAportes({}).subscribe(
      () => fail('Expected an error, but got none'),
      (error) => expect(error.message).toBe('Unknown error')
    );

    const request = httpMock.expectOne(`${environment.apiUrl}/aporte`);
    request.error(new ErrorEvent('Error'));
  });

  it('should handle the HTTP request successfully', () => {
    const mockAportes: AporteDB[] = [{ _id: '1', idCarteira: '123', data: '2022-01-01', total: 100, idAtivo: '1', quantidade: 1, valorUnitario: 1 }];
    service.obterAportes({}).subscribe((response) => {
      expect(response).toEqual(mockAportes);
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/aporte`);
    expect(request.request.method).toBe('GET');
    request.flush(mockAportes);
  });
});