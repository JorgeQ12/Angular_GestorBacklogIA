import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CargaGlobalService } from '../services/carga-global.service';
import { cargaGlobalInterceptor } from './carga-global.interceptor';

describe('cargaGlobalInterceptor', () => {
  let httpTesting: HttpTestingController;
  let cargaGlobal: CargaGlobalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cargaGlobalInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    cargaGlobal = TestBed.inject(CargaGlobalService);
  });

  afterEach(() => httpTesting.verify());

  it('mantiene visible el cargador durante una solicitud HTTP', () => {
    const http = TestBed.inject(HttpClient);
    http.get('/sesion').subscribe();

    expect(cargaGlobal.visible()).toBe(true);

    httpTesting.expectOne('/sesion').flush({});

    expect(cargaGlobal.visible()).toBe(false);
  });

  it('oculta el cargador cuando una solicitud HTTP falla', () => {
    const http = TestBed.inject(HttpClient);
    http.get('/sesion').subscribe({ error: () => undefined });

    httpTesting.expectOne('/sesion').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(cargaGlobal.visible()).toBe(false);
  });
});
