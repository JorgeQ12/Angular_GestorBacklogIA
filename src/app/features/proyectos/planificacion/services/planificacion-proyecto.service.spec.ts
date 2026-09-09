import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_PLANIFICACION_PROYECTO } from '../config/endpoints-planificacion-proyecto.config';
import type { PlanificacionProyectoDto } from '../models/planificacion-proyecto.dto';
import { NivelGeneracionIaPlanificacionDto } from '../models/generacion-ia-planificacion.dto';
import { NivelGeneracionIaPlanificacion } from '../models/generacion-ia-planificacion.model';
import {
  OrigenVersionPlanificacionDto,
  type VersionPlanificacionDto,
} from '../models/version-planificacion.dto';
import { OrigenVersionPlanificacion } from '../models/version-planificacion.model';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

describe('PlanificacionProyectoService', () => {
  let servicio: PlanificacionProyectoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(PlanificacionProyectoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta la planificación vigente con los parámetros contractuales', async () => {
    const respuesta = firstValueFrom(servicio.obtenerPlanificacion(42));
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerPlanificacion,
    );

    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('ProyectoId')).toBe('42');
    expect(solicitud.request.params.get('IncluirEliminados')).toBe('false');
    expect(solicitud.request.params.has('VersionBacklogId')).toBe(false);
    solicitud.flush(crearResultado(PLANIFICACION_DTO));

    await expect(respuesta).resolves.toMatchObject({
      proyectoId: 42,
      nombre: 'Sistema de envíos',
      numeroVersion: 4,
      resumen: { totalElementos: 11 },
    });
  });

  it('rechaza una respuesta funcional fallida', async () => {
    const respuesta = firstValueFrom(servicio.obtenerPlanificacion(42));
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerPlanificacion,
    );
    solicitud.flush({
      exitoso: false,
      tipo: 5,
      datos: null,
      mensaje: 'No fue posible consultar la planificación.',
      codigoError: 'consulta_no_disponible',
      errores: null,
    } satisfies ResultadoApi<PlanificacionProyectoDto>);

    await expect(respuesta).rejects.toThrow('No fue posible consultar la planificación.');
  });

  it('consulta una versión histórica con su identificador contractual', async () => {
    const respuesta = firstValueFrom(servicio.obtenerPlanificacion(42, 80));
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerPlanificacion,
    );

    expect(solicitud.request.params.get('ProyectoId')).toBe('42');
    expect(solicitud.request.params.get('VersionBacklogId')).toBe('80');
    expect(solicitud.request.params.get('IncluirEliminados')).toBe('false');
    solicitud.flush(
      crearResultado({
        ...PLANIFICACION_DTO,
        versionBacklogId: 80,
        numeroVersion: 3,
        esHistorica: true,
      }),
    );

    await expect(respuesta).resolves.toMatchObject({ versionId: 80, esHistorica: true });
  });

  it('incluye elementos eliminados únicamente cuando la vista vigente lo solicita', async () => {
    const respuesta = firstValueFrom(servicio.obtenerPlanificacion(42, null, true));
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerPlanificacion,
    );

    expect(solicitud.request.params.get('ProyectoId')).toBe('42');
    expect(solicitud.request.params.get('IncluirEliminados')).toBe('true');
    expect(solicitud.request.params.has('VersionBacklogId')).toBe(false);
    solicitud.flush(crearResultado(PLANIFICACION_DTO));

    await expect(respuesta).resolves.toMatchObject({ proyectoId: 42 });
  });

  it('consulta y adapta las versiones integrales del proyecto', async () => {
    const respuesta = firstValueFrom(servicio.obtenerVersiones(42));
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.obtenerVersiones,
    );

    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('ProyectoId')).toBe('42');
    solicitud.flush(crearResultado(VERSIONES_DTO));

    await expect(respuesta).resolves.toEqual([
      expect.objectContaining({
        id: 81,
        numero: 4,
        origen: OrigenVersionPlanificacion.GeneracionHistorias,
        esActual: true,
      }),
    ]);
  });

  it('genera el nivel solicitado mediante el cuerpo contractual', async () => {
    const respuesta = firstValueFrom(
      servicio.generarConIa(42, NivelGeneracionIaPlanificacion.Historias),
    );
    const solicitud = httpTesting.expectOne(
      ENDPOINTS_PLANIFICACION_PROYECTO.generarElementosConIa,
    );

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.url).toMatch(/\/api\/GeneracionIA\/GenerarItemsTrabajoIA$/);
    expect(solicitud.request.body).toEqual({
      proyectoId: 42,
      nivel: NivelGeneracionIaPlanificacionDto.Historias,
    });
    solicitud.flush(
      crearResultado({
        proyectoId: 42,
        nivel: NivelGeneracionIaPlanificacionDto.Historias,
        totalCreados: 8,
        mensaje: 'Generación completada.',
      }),
    );

    await expect(respuesta).resolves.toEqual({
      proyectoId: 42,
      nivel: NivelGeneracionIaPlanificacion.Historias,
      totalCreados: 8,
      mensaje: 'Generación completada.',
    });
  });

  it('rechaza un resultado funcional fallido de la generación', async () => {
    const respuesta = firstValueFrom(
      servicio.generarConIa(42, NivelGeneracionIaPlanificacion.Tareas),
    );
    const solicitud = httpTesting.expectOne(
      ENDPOINTS_PLANIFICACION_PROYECTO.generarElementosConIa,
    );
    solicitud.flush({
      exitoso: false,
      tipo: 5,
      datos: null,
      mensaje: 'No existen historias para generar tareas.',
      codigoError: 'items_padre_no_encontrados',
      errores: null,
    } satisfies ResultadoApi<null>);

    await expect(respuesta).rejects.toThrow('No existen historias para generar tareas.');
  });

  it('publica la planificación en Azure DevOps con el contrato real', async () => {
    const respuesta = firstValueFrom(servicio.publicarEnAzure(42));
    const solicitud = httpTesting.expectOne(ENDPOINTS_PLANIFICACION_PROYECTO.publicarEnAzure);

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({ proyectoId: 42 });
    solicitud.flush(
      crearResultado({
        organizacion: 'Inter Rapidísimo',
        proyectoAzure: 'Gestor IA',
        areaPath: 'Gestor IA\\Producto',
        fechaInicioPublicacion: '2026-09-04T14:00:00Z',
        tipoHistoriaUsuarioAzure: 'User Story',
        totalWorkItems: 11,
        totalEpicas: 1,
        totalCaracteristicas: 2,
        totalHistoriasUsuario: 3,
        totalTareas: 5,
        workItems: [],
      }),
    );

    await expect(respuesta).resolves.toMatchObject({
      proyecto: 'Gestor IA',
      totalElementos: 11,
      totalHistorias: 3,
    });
  });

  it('sincroniza la épica principal mediante el parámetro contractual', async () => {
    const respuesta = firstValueFrom(servicio.sincronizarEpicaPrincipal(42));
    const solicitud = httpTesting.expectOne(
      (request) => request.url === ENDPOINTS_PLANIFICACION_PROYECTO.sincronizarEpicaPrincipal,
    );

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toBeNull();
    expect(solicitud.request.params.get('ProyectoId')).toBe('42');
    solicitud.flush(
      crearResultado({
        epicaId: 15,
        azureWorkItemId: 1204,
        revisionesImportadas: 3,
        azureRevisionActual: 9,
        fechaSincronizacion: '2026-09-04T15:00:00Z',
        urlEpica: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
      }),
    );

    await expect(respuesta).resolves.toMatchObject({
      epicaId: 15,
      revisionesImportadas: 3,
      revisionAzureActual: 9,
    });
  });
});

function crearResultado<T>(datos: T): ResultadoApi<T> {
  return {
    exitoso: true,
    tipo: 1,
    datos,
    mensaje: null,
    codigoError: null,
    errores: null,
  };
}

const PLANIFICACION_DTO: PlanificacionProyectoDto = {
  proyectoId: 42,
  nombreProyecto: 'Sistema de envíos',
  versionBacklogId: 81,
  numeroVersion: 4,
  esHistorica: false,
  resumen: {
    totalEpicas: 1,
    totalCaracteristicas: 2,
    totalHistorias: 3,
    totalTareas: 5,
  },
  publicacionAzure: { puedePublicar: false, bloqueos: [] },
  epicas: null,
};

const VERSIONES_DTO: readonly VersionPlanificacionDto[] = [
  {
    id: 81,
    numeroVersion: 4,
    fechaInicio: '2026-09-03T10:00:00',
    fechaCierre: null,
    origen: OrigenVersionPlanificacionDto.GeneracionHistorias,
    esActual: true,
  },
];
