import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { credencialesKongInterceptor } from './credenciales-kong.interceptor';

describe('credencialesKongInterceptor', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credencialesKongInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('incluye credenciales en las solicitudes dirigidas a Kong', () => {
    const http = TestBed.inject(HttpClient);

    http.get(`${environment.kongUrl}/automatizacion/api/v1/me`).subscribe();

    const solicitud = httpTesting.expectOne(`${environment.kongUrl}/automatizacion/api/v1/me`);
    expect(solicitud.request.withCredentials).toBe(true);
    solicitud.flush({});
  });

  it('no modifica solicitudes destinadas a otros orígenes', () => {
    const http = TestBed.inject(HttpClient);
    const urlExterna = 'https://api.example.com/datos';

    http.get(urlExterna).subscribe();

    const solicitud = httpTesting.expectOne(urlExterna);
    expect(solicitud.request.withCredentials).toBe(false);
    solicitud.flush({});
  });
});
