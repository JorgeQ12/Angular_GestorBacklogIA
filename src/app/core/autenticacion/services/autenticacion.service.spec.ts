import { HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ENDPOINTS_AUTENTICACION } from '../config/autenticacion.config';
import { credencialesKongInterceptor } from '../interceptors/credenciales-kong.interceptor';
import { AutenticacionService } from './autenticacion.service';

describe('AutenticacionService', () => {
  let servicio: AutenticacionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credencialesKongInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    servicio = TestBed.inject(AutenticacionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('abre el flujo externo y espera a que el popup regrese al mismo origen', () => {
    jasmine.clock().install();
    const ubicacion = {
      href: 'about:blank',
      origin: window.location.origin,
    };
    const popup = {
      closed: false,
      close: jasmine.createSpy('close'),
      location: ubicacion,
    } as unknown as Window;
    const abrir = spyOn(window, 'open').and.returnValue(popup);
    let retornos = 0;

    servicio.iniciarSesionConMicrosoft().subscribe(() => retornos++);

    expect(abrir).toHaveBeenCalledWith(
      ENDPOINTS_AUTENTICACION.iniciarSesion,
      'interia-autenticacion',
      jasmine.stringContaining('popup=yes'),
    );
    jasmine.clock().tick(400);
    expect(retornos).toBe(0);

    ubicacion.href = `${window.location.origin}/`;
    jasmine.clock().tick(400);

    expect(retornos).toBe(1);
    expect(popup.close).toHaveBeenCalledTimes(1);
    jasmine.clock().uninstall();
  });

  it('confirma la sesión antes de aceptar el cierre automático del popup', () => {
    jasmine.clock().install();
    const popup = {
      closed: false,
      close: jasmine.createSpy('close'),
      location: { href: 'about:blank', origin: window.location.origin },
    } as unknown as Window;
    spyOn(window, 'open').and.returnValue(popup);
    let retornos = 0;
    let flujoFinalizado = false;

    servicio.iniciarSesionConMicrosoft().subscribe({
      next: () => retornos++,
      complete: () => (flujoFinalizado = true),
    });
    Object.defineProperty(popup, 'closed', { value: true });
    jasmine.clock().tick(400);
    jasmine.clock().uninstall();

    httpTesting.expectOne(ENDPOINTS_AUTENTICACION.sesionActual).flush('', {
      headers: new HttpHeaders({ 'X-User-Name': 'Jorge Quintero' }),
    });

    expect(retornos).toBe(1);
    expect(flujoFinalizado).toBe(true);
  });

  it('trata el cierre manual como cancelación cuando Kong no confirma sesión', () => {
    jasmine.clock().install();
    const popup = {
      closed: false,
      close: jasmine.createSpy('close'),
      location: { href: 'about:blank', origin: window.location.origin },
    } as unknown as Window;
    spyOn(window, 'open').and.returnValue(popup);
    let retornos = 0;
    let flujoFinalizado = false;

    servicio.iniciarSesionConMicrosoft().subscribe({
      next: () => retornos++,
      complete: () => (flujoFinalizado = true),
    });
    Object.defineProperty(popup, 'closed', { value: true });
    jasmine.clock().tick(400);
    jasmine.clock().uninstall();
    httpTesting.expectOne(ENDPOINTS_AUTENTICACION.sesionActual).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(retornos).toBe(0);
    expect(flujoFinalizado).toBe(true);
  });

  it('construye la sesión únicamente con el header confirmado por Kong', () => {
    let nombre: string | undefined;

    servicio.verificarSesion().subscribe((sesion) => {
      nombre = sesion.nombre;
    });

    const solicitud = httpTesting.expectOne(ENDPOINTS_AUTENTICACION.sesionActual);
    expect(solicitud.request.withCredentials).toBe(true);
    solicitud.flush('contenido ignorado', {
      headers: new HttpHeaders({ 'X-User-Name': 'Jorge Quintero' }),
    });

    expect(nombre).toBe('Jorge Quintero');
    expect(servicio.sesionActual()).toEqual({ nombre: 'Jorge Quintero' });
  });

  it('emite la sesión cuando un error 404 contiene el nombre en el header', () => {
    let sesionEmitida: { nombre: string } | undefined;
    let errorEmitido: unknown;

    servicio.verificarSesion().subscribe({
      next: (sesion) => (sesionEmitida = sesion),
      error: (error) => (errorEmitido = error),
    });

    httpTesting.expectOne(ENDPOINTS_AUTENTICACION.sesionActual).flush(null, {
      status: 404,
      statusText: 'Not Found',
      headers: new HttpHeaders({ 'X-User-Name': 'Jorge Quintero' }),
    });

    expect(sesionEmitida).toEqual({ nombre: 'Jorge Quintero' });
    expect(errorEmitido).toBeUndefined();
    expect(servicio.sesionActual()).toEqual({ nombre: 'Jorge Quintero' });
  });

  it('limpia la sesión cuando la respuesta no contiene el nombre de usuario', () => {
    servicio.verificarSesion().subscribe({ error: () => undefined });
    httpTesting.expectOne(ENDPOINTS_AUTENTICACION.sesionActual).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(servicio.sesionActual()).toBeNull();
  });
});
