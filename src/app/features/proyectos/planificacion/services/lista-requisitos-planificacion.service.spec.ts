import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ListaRequisitosPlanificacionService } from './lista-requisitos-planificacion.service';

describe('ListaRequisitosPlanificacionService', () => {
  let servicio: ListaRequisitosPlanificacionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ListaRequisitosPlanificacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta y ordena los requisitos del proyecto', async () => {
    const respuesta = firstValueFrom(servicio.obtener(42));
    const solicitud = http.expectOne((request) =>
      request.url.endsWith('/Requisito/ObtenerListaRequisitos'),
    );
    expect(solicitud.request.params.get('proyectoId')).toBe('42');
    solicitud.flush(resultado({ requisitos: [requisitoDto(2, 2), requisitoDto(1, 1)] }));

    await expectAsync(respuesta).toBeResolvedTo([
      jasmine.objectContaining({ id: 1, orden: 1 }),
      jasmine.objectContaining({ id: 2, orden: 2 }),
    ]);
  });

  it('crea un requisito con el contrato del backend', async () => {
    const cuerpo = {
      area: 'Arquitectura',
      seccion: 'Integración',
      tipoRequisito: 'Funcional',
      nombre: 'Trazabilidad',
      descripcion: 'Registrar trazabilidad.',
      transversal: true,
      responsable: 'Arquitecto',
      nombreResponsable: 'Ana',
      validador: 'Líder',
      aplica: true,
      cumple: false,
      agrupador: 'Diseño',
    };
    const respuesta = firstValueFrom(servicio.crear(42, cuerpo));
    const solicitud = http.expectOne((request) =>
      request.url.endsWith('/Requisito/CrearRequisito/42'),
    );
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({ proyectoId: 42, ...cuerpo });
    solicitud.flush(resultado(requisitoDto(9, 3)));

    await expectAsync(respuesta).toBeResolvedTo(
      jasmine.objectContaining({ id: 9, codigo: 'REQ-9' }),
    );
  });

  it('actualiza las decisiones editables del requisito', async () => {
    const cuerpo = {
      cumple: true,
      aplica: true,
      transversal: false,
      nombreResponsable: 'Ana',
    };
    const respuesta = firstValueFrom(servicio.actualizar(42, 9, cuerpo));
    const solicitud = http.expectOne((request) =>
      request.url.endsWith('/Requisito/ActualizarCumplimiento/42/9'),
    );
    expect(solicitud.request.method).toBe('PUT');
    expect(solicitud.request.body).toEqual({ proyectoId: 42, requisitoId: 9, ...cuerpo });
    solicitud.flush(resultado(null));

    await expectAsync(respuesta).toBeResolvedTo(undefined);
  });

  it('propaga un error funcional al actualizar aunque la respuesta HTTP sea exitosa', async () => {
    const respuesta = firstValueFrom(
      servicio.actualizar(42, 9, {
        cumple: true,
        aplica: true,
        transversal: false,
        nombreResponsable: null,
      }),
    );
    const solicitud = http.expectOne((request) =>
      request.url.endsWith('/Requisito/ActualizarCumplimiento/42/9'),
    );
    solicitud.flush({
      ...resultado(null),
      exitoso: false,
      errores: ['El requisito no pertenece al proyecto.'],
    });

    await expectAsync(respuesta).toBeRejectedWithError('El requisito no pertenece al proyecto.');
  });
});

function requisitoDto(id: number, orden: number) {
  return {
    idRequisito: id,
    codigo: `REQ-${id}`,
    area: 'Arquitectura',
    seccion: 'Integración',
    nombre: 'Trazabilidad',
    descripcion: 'Descripción',
    transversal: false,
    aplica: true,
    responsable: 'Arquitecto',
    nombreResponsable: null,
    validador: 'Líder',
    tipoRequisito: 'Funcional',
    agrupador: 'Diseño',
    orden,
    cumple: false,
  };
}

function resultado<T>(datos: T): ResultadoApi<T> {
  return {
    exitoso: true,
    tipo: 1,
    datos,
    mensaje: '',
    codigoError: null,
    errores: null,
  };
}
