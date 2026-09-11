import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_PLANIFICACION_PROYECTO } from '../config/endpoints-planificacion-proyecto.config';
import type {
  ActualizarElementoPlanificacionDto,
  CrearElementoPlanificacionDto,
  DetalleTareaDto,
} from '../models/elemento-planificacion.dto';
import type {
  HistorialElementoPlanificacionDto,
  VersionTareaDto,
} from '../models/historial-elemento-planificacion.dto';
import {
  MotivoInactivacionElementoDto,
  TipoElementoPlanificacionDto,
} from '../models/planificacion-proyecto.dto';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';

describe('ElementoPlanificacionService', () => {
  let servicio: ElementoPlanificacionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ElementoPlanificacionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta el detalle con el tipo y la identidad contractuales', async () => {
    const respuesta = firstValueFrom(
      servicio.obtener(TipoElementoPlanificacion.Tarea, 783),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerElemento,
    );

    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('Tipo')).toBe(TipoElementoPlanificacionDto.Tarea);
    expect(solicitud.request.params.get('ItemTrabajoId')).toBe('783');
    expect(solicitud.request.params.has('VersionBacklogId')).toBe(false);
    solicitud.flush(crearResultado(TAREA_DTO));

    await expect(respuesta).resolves.toMatchObject({
      id: 783,
      tipo: TipoElementoPlanificacion.Tarea,
      numeroVersion: 2,
    });
  });

  it('consulta el detalle perteneciente a una versión histórica de la planificación', async () => {
    const respuesta = firstValueFrom(
      servicio.obtener(TipoElementoPlanificacion.Tarea, 783, 80),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerElemento,
    );

    expect(solicitud.request.params.get('Tipo')).toBe(TipoElementoPlanificacionDto.Tarea);
    expect(solicitud.request.params.get('ItemTrabajoId')).toBe('783');
    expect(solicitud.request.params.get('VersionBacklogId')).toBe('80');
    solicitud.flush(crearResultado({ ...TAREA_DTO, soloLectura: true }));

    await expect(respuesta).resolves.toMatchObject({ id: 783 });
  });

  it('envía el comando discriminado al crear', async () => {
    const comando: CrearElementoPlanificacionDto = {
      tipo: TipoElementoPlanificacionDto.Tarea,
      historiaUsuarioId: 736,
      titulo: 'Implementar servicio',
      descripcion: 'Construir el servicio.',
      estimacionHoras: 8,
      fechaInicio: '2026-09-03',
      fechaFinal: '2026-09-05',
      dependencias: '',
      actividadCatalogoId: 19,
      complejidad: 3,
    };
    const respuesta = firstValueFrom(servicio.crear(comando));
    const solicitud = httpTesting.expectOne(ENDPOINTS_PLANIFICACION_PROYECTO.crearElemento);

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual(comando);
    solicitud.flush(crearResultado(TAREA_DTO));

    await expect(respuesta).resolves.toMatchObject({ id: 783 });
  });

  it('envía la versión esperada al actualizar', async () => {
    const comando: ActualizarElementoPlanificacionDto = {
      tipo: TipoElementoPlanificacionDto.Tarea,
      itemTrabajoId: 783,
      numeroVersionEsperada: 2,
      titulo: 'Implementar servicio actualizado',
      descripcion: 'Construir el servicio.',
      estimacionHoras: 8,
      fechaInicio: '2026-09-03',
      fechaFinal: '2026-09-05',
      dependencias: '',
      actividadCatalogoId: 19,
      complejidad: 3,
    };
    const respuesta = firstValueFrom(servicio.actualizar(comando));
    const solicitud = httpTesting.expectOne(ENDPOINTS_PLANIFICACION_PROYECTO.actualizarElemento);

    expect(solicitud.request.method).toBe('PUT');
    expect(solicitud.request.body).toEqual(comando);
    solicitud.flush(crearResultado(TAREA_DTO));

    await expect(respuesta).resolves.toMatchObject({ id: 783 });
  });

  it('elimina una actividad de requisito con tipo, identidad y versión en query', async () => {
    const respuesta = firstValueFrom(
      servicio.eliminar(TipoElementoPlanificacion.ActividadRequisito, 501, 4),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.eliminarElemento,
    );

    expect(solicitud.request.method).toBe('DELETE');
    expect(solicitud.request.params.get('Tipo')).toBe(
      TipoElementoPlanificacionDto.ActividadRequisito,
    );
    expect(solicitud.request.params.get('ItemTrabajoId')).toBe('501');
    expect(solicitud.request.params.get('NumeroVersionEsperada')).toBe('4');
    solicitud.flush(
      crearResultadoGenerico({ itemTrabajoId: 501, totalInactivados: 3 }),
    );

    await expect(respuesta).resolves.toEqual({ elementoId: 501, totalInactivados: 3 });
  });

  it('consulta una página histórica sin enviar cursor cuando no existe', async () => {
    const respuesta = firstValueFrom(
      servicio.obtenerHistorial(TipoElementoPlanificacion.Tarea, 783),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerHistorialElemento,
    );

    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('Tipo')).toBe(TipoElementoPlanificacionDto.Tarea);
    expect(solicitud.request.params.get('ItemTrabajoId')).toBe('783');
    expect(solicitud.request.params.get('TamanoPagina')).toBe('20');
    expect(solicitud.request.params.has('Cursor')).toBe(false);
    solicitud.flush(crearResultadoGenerico(HISTORIAL_DTO));

    await expect(respuesta).resolves.toEqual({
      registros: [
        { versionId: 91, numeroVersion: 3, fechaCreacion: '2026-09-02T10:00:00' },
      ],
      siguienteCursor: 3,
      hayMas: true,
    });
  });

  it('consulta el contenido de una versión con sus tres identidades', async () => {
    const respuesta = firstValueFrom(
      servicio.obtenerVersion(TipoElementoPlanificacion.Tarea, 783, 91),
    );
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerVersionElemento,
    );

    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('Tipo')).toBe(TipoElementoPlanificacionDto.Tarea);
    expect(solicitud.request.params.get('ItemTrabajoId')).toBe('783');
    expect(solicitud.request.params.get('VersionId')).toBe('91');
    solicitud.flush(crearResultadoGenerico(VERSION_TAREA_DTO));

    await expect(respuesta).resolves.toMatchObject({
      tipo: TipoElementoPlanificacion.Tarea,
      elementoId: 783,
      versionId: 91,
      numeroVersion: 3,
    });
  });
  it('serializa la eliminación del contenedor de requisitos', async () => {
    const respuesta = firstValueFrom(servicio.eliminar(TipoElementoPlanificacion.ListaRequisitos, 700, 2));
    const solicitud = httpTesting.expectOne(request => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.eliminarElemento);
    expect(solicitud.request.params.get('Tipo')).toBe(
      TipoElementoPlanificacionDto.ListaRequisitos,
    );
    expect(solicitud.request.params.get('ItemTrabajoId')).toBe('700');
    expect(solicitud.request.params.get('NumeroVersionEsperada')).toBe('2');
    solicitud.flush(crearResultadoGenerico({ itemTrabajoId: 700, totalInactivados: 5 }));
    await expect(respuesta).resolves.toEqual({ elementoId: 700, totalInactivados: 5 });
  });
});

function crearResultado(datos: DetalleTareaDto): ResultadoApi<DetalleTareaDto> {
  return {
    exitoso: true,
    tipo: 1,
    datos,
    mensaje: null,
    codigoError: null,
    errores: null,
  };
}

function crearResultadoGenerico<T>(datos: T): ResultadoApi<T> {
  return {
    exitoso: true,
    tipo: 1,
    datos,
    mensaje: null,
    codigoError: null,
    errores: null,
  };
}

const TAREA_DTO: DetalleTareaDto = {
  id: 783,
  proyectoId: 15,
  activo: true,
  numeroVersionActual: 2,
  titulo: 'Implementar servicio',
  descripcion: 'Construir el servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-01T00:00:00',
  fechaFinal: '2026-09-05T00:00:00',
  fechaCreacion: '2026-08-20T10:00:00',
  fechaInactivacion: null,
  motivoInactivacion: null,
  soloLectura: false,
  capacidades: {
    puedeEditar: true,
    puedeEliminar: true,
    puedeVerHistorial: true,
    puedeCrearHijo: false,
    puedeGenerarHijos: false,
    puedeSincronizar: false,
    puedeAbrirEnAzure: false,
    soloLectura: false,
  },
  tipo: TipoElementoPlanificacionDto.Tarea,
  historiaUsuarioId: 736,
  dependencias: '',
  actividadCatalogoId: 19,
  complejidad: 3,
};

const HISTORIAL_DTO: HistorialElementoPlanificacionDto = {
  registros: [
    {
      versionId: 91,
      numeroVersion: 3,
      fechaCreacion: '2026-09-02T10:00:00',
      esActual: false,
    },
  ],
  siguienteCursor: 3,
  hayMas: true,
};

const VERSION_TAREA_DTO: VersionTareaDto = {
  tipo: TipoElementoPlanificacionDto.Tarea,
  versionId: 91,
  itemTrabajoId: 783,
  numeroVersion: 3,
  titulo: 'Implementar servicio',
  descripcion: 'Versión anterior del servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-01T00:00:00',
  fechaFinal: '2026-09-05T00:00:00',
  fechaCreacion: '2026-09-02T10:00:00',
  esActual: false,
  dependencias: 'API disponible',
  actividadCatalogoId: 19,
  complejidad: 3,
};
