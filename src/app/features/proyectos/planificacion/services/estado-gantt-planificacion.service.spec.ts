import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import type { GanttPlanificacion } from '../models/gantt-planificacion.model';
import { TipoElementoPlanificacion, type PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import { EstadoGanttPlanificacionService } from './estado-gantt-planificacion.service';
import { GanttPlanificacionService } from './gantt-planificacion.service';

describe('EstadoGanttPlanificacionService', () => {
  const obtener = vi.fn();
  let servicio: EstadoGanttPlanificacionService;

  beforeEach(() => {
    obtener.mockReset();
    TestBed.configureTestingModule({
      providers: [
        EstadoGanttPlanificacionService,
        { provide: GanttPlanificacionService, useValue: { obtener } },
      ],
    });
    servicio = TestBed.inject(EstadoGanttPlanificacionService);
  });

  it('abre la vista, expone la carga y conserva el resultado recibido', () => {
    const respuesta = new Subject<GanttPlanificacion>();
    obtener.mockReturnValue(respuesta);

    servicio.abrir(PLANIFICACION);

    expect(servicio.abierto()).toBe(true);
    expect(servicio.cargando()).toBe(true);
    respuesta.next(GANTT);
    respuesta.complete();
    expect(servicio.datos()).toBe(GANTT);
    expect(servicio.cargando()).toBe(false);
    expect(servicio.error()).toBe(false);
  });

  it('no repite una fotografía ya cargada y renueva una versión diferente', () => {
    obtener.mockReturnValue(of(GANTT));
    servicio.abrir(PLANIFICACION);
    servicio.sincronizar(PLANIFICACION);
    servicio.sincronizar({ ...PLANIFICACION, versionId: 10, numeroVersion: 5 });

    expect(obtener).toHaveBeenCalledTimes(2);
  });

  it('permite reintentar una carga fallida sin abandonar la vista', () => {
    obtener.mockReturnValueOnce(throwError(() => new Error('fallo'))).mockReturnValueOnce(of(GANTT));

    servicio.abrir(PLANIFICACION);
    expect(servicio.error()).toBe(true);
    expect(servicio.abierto()).toBe(true);

    servicio.reintentar();
    expect(servicio.error()).toBe(false);
    expect(servicio.datos()).toBe(GANTT);
  });

  it('cancela la operación pendiente al volver al árbol', () => {
    const respuesta = new Subject<GanttPlanificacion>();
    obtener.mockReturnValue(respuesta);
    servicio.abrir(PLANIFICACION);

    servicio.cerrar();

    expect(respuesta.observed).toBe(false);
    expect(servicio.abierto()).toBe(false);
    expect(servicio.cargando()).toBe(false);
  });
});

const PLANIFICACION: PlanificacionProyecto = {
  proyectoId: 42,
  nombre: 'Proyecto',
  versionId: 9,
  numeroVersion: 4,
  esHistorica: false,
  resumen: { epicas: 1, caracteristicas: 0, historias: 0, tareas: 0, totalElementos: 1 },
  publicacionAzure: { puedePublicar: false, bloqueos: [] },
  elementos: [{
    clave: 'epica:1', id: 1, tipo: TipoElementoPlanificacion.Epica, titulo: 'Épica', detalle: null,
    terminosBusqueda: [], activo: true, numeroVersion: 1, vinculadaAzure: false,
    capacidades: { puedeConsultar: true, puedeEditar: false, puedeEliminar: false, puedeCrearHijo: false, puedeSincronizar: false, soloLectura: true },
    hijos: [],
  }],
};

const GANTT: GanttPlanificacion = {
  proyectoId: 42,
  nombreProyecto: 'Proyecto',
  versionId: 9,
  numeroVersion: 4,
  esHistorica: false,
  elementos: [],
};
