import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
  type PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';
import { EstadoEliminacionRequisitosPlanificacionService } from './estado-eliminacion-requisitos-planificacion.service';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';

describe('EstadoEliminacionRequisitosPlanificacionService', () => {
  const planificacion = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const api = { eliminar: vi.fn() };
  const mensajes = {
    confirmarDestructiva: vi.fn(),
    exito: vi.fn(),
  };
  const notificador = { comunicar: vi.fn() };
  let servicio: EstadoEliminacionRequisitosPlanificacionService;

  beforeEach(() => {
    vi.clearAllMocks();
    planificacion.set(PLANIFICACION);
    api.eliminar.mockReturnValue(of({ elementoId: 501, totalInactivados: 2 }));
    mensajes.confirmarDestructiva.mockResolvedValue(true);
    mensajes.exito.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        EstadoEliminacionRequisitosPlanificacionService,
        { provide: ElementoPlanificacionService, useValue: api },
        {
          provide: EstadoPlanificacionProyectoService,
          useValue: { planificacion: planificacion.asReadonly() },
        },
        { provide: MensajesService, useValue: mensajes },
        { provide: NotificadorErroresApiService, useValue: notificador },
      ],
    });
    servicio = TestBed.inject(EstadoEliminacionRequisitosPlanificacionService);
  });

  it('confirma y elimina la actividad con su versión vigente', async () => {
    const actualizarArbol = vi.fn();

    await servicio.eliminar(ACTIVIDAD, actualizarArbol);

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar actividad',
      'La actividad y sus tareas de requisitos dejarán de estar vigentes. El historial se conservará.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(
      TipoElementoPlanificacion.ActividadRequisito,
      501,
      4,
    );
    expect(actualizarArbol).toHaveBeenCalledOnce();
    expect(mensajes.exito).toHaveBeenCalledWith(
      'Actividad eliminada',
      'La actividad quedó disponible como histórica de solo lectura.',
    );
    expect(servicio.eliminando()).toBe(false);
  });

  it('elimina una característica y conserva sus descendientes como históricos', async () => {
    const caracteristica: ElementoPlanificacion = {
      ...TAREA,
      clave: 'caracteristica:601',
      id: 601,
      tipo: TipoElementoPlanificacion.Caracteristica,
      titulo: 'Cobertura funcional',
    };

    await servicio.eliminar(caracteristica, vi.fn());

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar característica',
      'La característica y todos sus elementos descendientes dejarán de estar vigentes. Sus versiones se conservarán.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.Caracteristica, 601, 3);
  });

  it('no elimina cuando el usuario cancela la confirmación', async () => {
    mensajes.confirmarDestructiva.mockResolvedValueOnce(false);

    await servicio.eliminar(TAREA, vi.fn());

    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('respeta una capacidad de eliminación denegada por el backend', async () => {
    await servicio.eliminar(
      {
        ...TAREA,
        capacidades: { ...TAREA.capacidades, puedeEliminar: false },
      },
      vi.fn(),
    );

    expect(mensajes.confirmarDestructiva).not.toHaveBeenCalled();
    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('actualiza el árbol y comunica un conflicto de versión', async () => {
    const actualizarArbol = vi.fn();
    const error = new HttpErrorResponse({ status: 409 });
    api.eliminar.mockReturnValueOnce(throwError(() => error));

    await servicio.eliminar(TAREA, actualizarArbol);

    expect(actualizarArbol).toHaveBeenCalledOnce();
    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ titulo: 'No fue posible eliminar el elemento' }),
    );
    expect(servicio.eliminando()).toBe(false);
  });
  it('confirma y elimina la lista de requisitos con todos sus descendientes', async () => {
    const lista: ElementoPlanificacion = {
      ...TAREA,
      clave: 'lista-requisitos:700',
      id: 700,
      tipo: TipoElementoPlanificacion.ListaRequisitos,
      titulo: 'Lista de requisitos',
      capacidades: { ...TAREA.capacidades, puedeEliminar: true },
    };

    await servicio.eliminar(lista, vi.fn());

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar lista de requisitos',
      'La lista, sus actividades y sus tareas dejarán de estar vigentes. El historial se conservará.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.ListaRequisitos, 700, 3);
  });
});

const CAPACIDADES = {
  puedeConsultar: true,
  puedeEditar: true,
  puedeEliminar: true,
  puedeCrearHijo: false,
  puedeSincronizar: false,
  soloLectura: false,
} as const;

const ACTIVIDAD: ElementoPlanificacion = {
  clave: 'actividad-requisito:501',
  id: 501,
  tipo: TipoElementoPlanificacion.ActividadRequisito,
  titulo: 'Analizar cobertura',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 4,
  vinculadaAzure: false,
  capacidades: { ...CAPACIDADES, puedeCrearHijo: true },
  hijos: [],
};

const TAREA: ElementoPlanificacion = {
  clave: 'tarea-requisito:502',
  id: 502,
  tipo: TipoElementoPlanificacion.TareaRequisito,
  titulo: 'Validar cobertura',
  detalle: null,
  terminosBusqueda: [],
  activo: true,
  numeroVersion: 3,
  vinculadaAzure: false,
  capacidades: CAPACIDADES,
  hijos: [],
};

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Sistema de envíos',
  versionId: 81,
  numeroVersion: 4,
  esHistorica: false,
  resumen: { epicas: 1, caracteristicas: 1, historias: 0, tareas: 0, totalElementos: 4 },
  publicacionAzure: { puedePublicar: false, bloqueos: [] },
  elementos: [ACTIVIDAD],
};
