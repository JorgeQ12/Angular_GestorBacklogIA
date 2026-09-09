import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  TipoElementoPlanificacion,
  type PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';
import { OrigenVersionPlanificacion } from '../models/version-planificacion.model';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

describe('EstadoPlanificacionProyectoService', () => {
  const api = { obtenerPlanificacion: vi.fn(), obtenerVersiones: vi.fn() };
  let servicio: EstadoPlanificacionProyectoService;

  beforeEach(() => {
    vi.clearAllMocks();
    api.obtenerPlanificacion.mockReturnValue(of(PLANIFICACION));
    api.obtenerVersiones.mockReturnValue(of(VERSIONES));
    TestBed.configureTestingModule({
      providers: [
        EstadoPlanificacionProyectoService,
        { provide: PlanificacionProyectoService, useValue: api },
      ],
    });
    servicio = TestBed.inject(EstadoPlanificacionProyectoService);
  });

  it('expone la planificación confirmada por el backend', () => {
    servicio.cargar(42);

    expect(api.obtenerPlanificacion).toHaveBeenCalledWith(42, null, false);
    expect(api.obtenerVersiones).toHaveBeenCalledWith(42);
    expect(servicio.planificacion()).toEqual(PLANIFICACION);
    expect(servicio.planificacionActual()).toEqual(PLANIFICACION);
    expect(servicio.versiones()).toEqual(VERSIONES);
    expect(servicio.errorCarga()).toBe(false);
  });

  it('distingue una falla de carga de una respuesta disponible', () => {
    api.obtenerPlanificacion.mockReturnValueOnce(throwError(() => new Error('fallo')));

    servicio.cargar(42);

    expect(servicio.planificacion()).toBeNull();
    expect(servicio.errorCarga()).toBe(true);
  });

  it('consulta y presenta una fotografía histórica disponible', () => {
    servicio.cargar(42);
    api.obtenerPlanificacion.mockReturnValueOnce(of(PLANIFICACION_HISTORICA));

    servicio.presentarVersion(80);

    expect(api.obtenerPlanificacion).toHaveBeenLastCalledWith(42, 80);
    expect(servicio.planificacion()).toEqual(PLANIFICACION_HISTORICA);
    expect(servicio.planificacionActual()).toEqual(PLANIFICACION);
    expect(servicio.seleccionando()).toBe(false);
  });

  it('recupera la fotografía vigente sin ejecutar otra consulta', () => {
    servicio.cargar(42);
    api.obtenerPlanificacion.mockClear();

    servicio.presentarVersion(81);

    expect(api.obtenerPlanificacion).not.toHaveBeenCalled();
    expect(servicio.planificacion()).toEqual(PLANIFICACION);
  });

  it('distingue una versión inexistente de una planificación vacía', () => {
    servicio.cargar(42);

    servicio.presentarVersion(999);

    expect(servicio.planificacion()).toBeNull();
    expect(servicio.errorCarga()).toBe(true);
  });

  it('recarga la versión vigente incluyendo los elementos eliminados', () => {
    servicio.cargar(42);
    api.obtenerPlanificacion.mockReturnValueOnce(of(PLANIFICACION_CON_ELIMINADOS));

    servicio.actualizarInclusionEliminados(true);

    expect(api.obtenerPlanificacion).toHaveBeenLastCalledWith(42, null, true);
    expect(servicio.incluirEliminados()).toBe(true);
    expect(servicio.planificacion()).toEqual(PLANIFICACION_CON_ELIMINADOS);
  });

  it('retira el filtro al consultar una versión histórica', () => {
    servicio.cargar(42);
    api.obtenerPlanificacion.mockReturnValueOnce(of(PLANIFICACION_CON_ELIMINADOS));
    servicio.actualizarInclusionEliminados(true);
    api.obtenerPlanificacion.mockReturnValueOnce(of(PLANIFICACION_HISTORICA));

    servicio.presentarVersion(80);

    expect(servicio.incluirEliminados()).toBe(false);
    expect(api.obtenerPlanificacion).toHaveBeenLastCalledWith(42, 80);
    expect(servicio.planificacion()).toEqual(PLANIFICACION_HISTORICA);
  });

  it('recupera la versión vigente sin eliminados al volver desde el histórico', () => {
    servicio.cargar(42);
    api.obtenerPlanificacion.mockReturnValueOnce(of(PLANIFICACION_CON_ELIMINADOS));
    servicio.actualizarInclusionEliminados(true);
    api.obtenerPlanificacion.mockReturnValueOnce(of(PLANIFICACION_HISTORICA));
    servicio.presentarVersion(80);
    api.obtenerPlanificacion.mockReturnValueOnce(of(PLANIFICACION));

    servicio.presentarVersion(81);

    expect(api.obtenerPlanificacion).toHaveBeenLastCalledWith(42, null, false);
    expect(servicio.planificacion()).toEqual(PLANIFICACION);
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
    caracteristicas: 2,
    historias: 3,
    tareas: 5,
    totalElementos: 11,
  },
  publicacionAzure: { puedePublicar: true, bloqueos: [] },
  elementos: [],
};

const PLANIFICACION_HISTORICA: PlanificacionProyecto = {
  ...PLANIFICACION,
  versionId: 80,
  numeroVersion: 3,
  esHistorica: true,
};

const PLANIFICACION_CON_ELIMINADOS: PlanificacionProyecto = {
  ...PLANIFICACION,
  elementos: [
    {
      clave: 'tarea:99',
      id: 99,
      tipo: TipoElementoPlanificacion.Tarea,
      titulo: 'Tarea eliminada',
      detalle: null,
      terminosBusqueda: [],
      activo: false,
      numeroVersion: 2,
      vinculadaAzure: false,
      capacidades: {
        puedeConsultar: true,
        puedeEditar: false,
        puedeEliminar: false,
        puedeCrearHijo: false,
        puedeSincronizar: false,
        soloLectura: true,
      },
      hijos: [],
    },
  ],
};

const VERSIONES = [
  {
    id: 81,
    numero: 4,
    fechaInicio: '2026-09-03T10:00:00',
    fechaCierre: null,
    origen: OrigenVersionPlanificacion.GeneracionHistorias,
    esActual: true,
  },
  {
    id: 80,
    numero: 3,
    fechaInicio: '2026-09-02T08:00:00',
    fechaCierre: '2026-09-03T10:00:00',
    origen: OrigenVersionPlanificacion.Inicial,
    esActual: false,
  },
] as const;
