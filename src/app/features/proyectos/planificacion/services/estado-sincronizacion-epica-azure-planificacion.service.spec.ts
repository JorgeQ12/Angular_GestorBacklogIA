import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  TipoElementoPlanificacion,
  type PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { EstadoSincronizacionEpicaAzurePlanificacionService } from './estado-sincronizacion-epica-azure-planificacion.service';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

describe('EstadoSincronizacionEpicaAzurePlanificacionService', () => {
  const planificacion = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const api = { sincronizarEpicaPrincipal: vi.fn() };
  const estadoPlanificacion = { planificacion: planificacion.asReadonly() };
  const mensajes = { exito: vi.fn() };
  const notificador = { comunicar: vi.fn() };
  let servicio: EstadoSincronizacionEpicaAzurePlanificacionService;

  beforeEach(() => {
    vi.clearAllMocks();
    planificacion.set(PLANIFICACION);
    api.sincronizarEpicaPrincipal.mockReturnValue(of(RESULTADO));
    mensajes.exito.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        EstadoSincronizacionEpicaAzurePlanificacionService,
        { provide: PlanificacionProyectoService, useValue: api },
        { provide: EstadoPlanificacionProyectoService, useValue: estadoPlanificacion },
        { provide: MensajesService, useValue: mensajes },
        { provide: NotificadorErroresApiService, useValue: notificador },
      ],
    });
    servicio = TestBed.inject(EstadoSincronizacionEpicaAzurePlanificacionService);
  });

  it('sincroniza la épica autorizada y comunica las revisiones importadas', () => {
    const completado = vi.fn();

    servicio.sincronizar(42, completado);

    expect(api.sincronizarEpicaPrincipal).toHaveBeenCalledWith(42);
    expect(completado).toHaveBeenCalledWith(RESULTADO);
    expect(mensajes.exito).toHaveBeenCalledWith(
      'Épica sincronizada',
      'Se importaron 3 revisiones nuevas.',
    );
    expect(servicio.sincronizando()).toBe(false);
  });

  it('distingue una épica que ya estaba actualizada', () => {
    api.sincronizarEpicaPrincipal.mockReturnValueOnce(
      of({ ...RESULTADO, revisionesImportadas: 0 }),
    );

    servicio.sincronizar(42, vi.fn());

    expect(mensajes.exito).toHaveBeenCalledWith(
      'Épica sincronizada',
      'La épica ya se encontraba actualizada con Azure DevOps.',
    );
  });

  it('no sincroniza cuando el backend no autorizó ninguna épica vigente', () => {
    planificacion.set({
      ...PLANIFICACION,
      elementos: [
        {
          ...PLANIFICACION.elementos[0],
          capacidades: {
            ...PLANIFICACION.elementos[0].capacidades,
            puedeSincronizar: false,
          },
        },
      ],
    });

    servicio.sincronizar(42, vi.fn());

    expect(api.sincronizarEpicaPrincipal).not.toHaveBeenCalled();
  });

  it('comunica el error funcional y libera la operación', () => {
    const error = new Error('fallo');
    api.sincronizarEpicaPrincipal.mockReturnValueOnce(throwError(() => error));

    servicio.sincronizar(42, vi.fn());

    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ titulo: 'No fue posible sincronizar la épica' }),
    );
    expect(servicio.sincronizando()).toBe(false);
  });
});

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Sistema de envíos',
  versionId: 81,
  numeroVersion: 4,
  esHistorica: false,
  resumen: {
    epicas: 1,
    caracteristicas: 0,
    historias: 0,
    tareas: 0,
    totalElementos: 1,
  },
  publicacionAzure: { puedePublicar: false, bloqueos: [] },
  elementos: [
    {
      clave: 'epica:15',
      id: 15,
      tipo: TipoElementoPlanificacion.Epica,
      titulo: 'Épica principal',
      detalle: null,
      terminosBusqueda: [],
      activo: true,
      numeroVersion: 4,
      vinculadaAzure: true,
      capacidades: {
        puedeConsultar: true,
        puedeEditar: false,
        puedeEliminar: false,
        puedeCrearHijo: true,
        puedeSincronizar: true,
        soloLectura: true,
      },
      hijos: [],
    },
  ],
};

const RESULTADO = {
  epicaId: 15,
  azureWorkItemId: 1204,
  revisionesImportadas: 3,
  revisionAzureActual: 9,
  fechaSincronizacion: '2026-09-04T15:00:00Z',
  urlEpica: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/1204',
} as const;
