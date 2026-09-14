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
  const api = { eliminar: jasmine.createSpy('eliminar') };
  const mensajes = {
    confirmarDestructiva: jasmine.createSpy('confirmarDestructiva'),
    exito: jasmine.createSpy('exito'),
  };
  const notificador = { comunicar: jasmine.createSpy('comunicar') };
  let servicio: EstadoEliminacionRequisitosPlanificacionService;

  beforeEach(() => {
    api.eliminar.calls.reset();
    mensajes.confirmarDestructiva.calls.reset();
    mensajes.exito.calls.reset();
    notificador.comunicar.calls.reset();
    planificacion.set(PLANIFICACION);
    api.eliminar.and.returnValue(of({ elementoId: 501, totalInactivados: 2 }));
    mensajes.confirmarDestructiva.and.returnValue(Promise.resolve(true));
    mensajes.exito.and.returnValue(Promise.resolve(undefined));
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
    const actualizarArbol = jasmine.createSpy('actualizarArbol');

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
    expect(actualizarArbol).toHaveBeenCalledTimes(1);
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

    await servicio.eliminar(caracteristica, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar característica',
      'La característica y todos sus elementos descendientes dejarán de estar vigentes. Sus versiones se conservarán.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.Caracteristica, 601, 3);
  });

  it('no elimina cuando el usuario cancela la confirmación', async () => {
    mensajes.confirmarDestructiva.and.returnValue(Promise.resolve(false));

    await servicio.eliminar(TAREA, jasmine.createSpy('actualizarArbol'));

    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('respeta una capacidad de eliminación denegada por el backend', async () => {
    await servicio.eliminar(
      {
        ...TAREA,
        capacidades: { ...TAREA.capacidades, puedeEliminar: false },
      },
      jasmine.createSpy('actualizarArbol'),
    );

    expect(mensajes.confirmarDestructiva).not.toHaveBeenCalled();
    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('actualiza el árbol y comunica un conflicto de versión', async () => {
    const actualizarArbol = jasmine.createSpy('actualizarArbol');
    const error = new HttpErrorResponse({ status: 409 });
    api.eliminar.and.returnValue(throwError(() => error));

    await servicio.eliminar(TAREA, actualizarArbol);

    expect(actualizarArbol).toHaveBeenCalledTimes(1);
    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      jasmine.objectContaining({ titulo: 'No fue posible eliminar el elemento' }),
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

    await servicio.eliminar(lista, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar lista de requisitos',
      'La lista, sus actividades y sus tareas dejarán de estar vigentes. El historial se conservará.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.ListaRequisitos, 700, 3);
  });

  it('confirma y elimina una épica con el mensaje de descendientes históricos', async () => {
    const epica: ElementoPlanificacion = {
      ...TAREA,
      clave: 'epica:800',
      id: 800,
      tipo: TipoElementoPlanificacion.Epica,
      titulo: 'Épica principal',
    };

    await servicio.eliminar(epica, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar épica',
      'La épica local y todos sus elementos descendientes dejarán de estar vigentes. Sus versiones se conservarán.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.Epica, 800, 3);
  });

  it('confirma y elimina una historia de usuario con su mensaje específico', async () => {
    const historia: ElementoPlanificacion = {
      ...TAREA,
      clave: 'historia:801',
      id: 801,
      tipo: TipoElementoPlanificacion.Historia,
      titulo: 'Registrar entrega',
    };

    await servicio.eliminar(historia, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar historia de usuario',
      'La historia de usuario y sus tareas dejarán de estar vigentes. Sus versiones se conservarán.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.Historia, 801, 3);
  });

  it('confirma y elimina una tarea de requisitos con su mensaje específico', async () => {
    await servicio.eliminar(TAREA, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar tarea de requisitos',
      'La tarea dejará de estar vigente, pero sus versiones se conservarán.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.TareaRequisito, 502, 3);
  });

  it('confirma y elimina una tarea con su mensaje específico', async () => {
    const tarea: ElementoPlanificacion = {
      ...TAREA,
      clave: 'tarea:802',
      id: 802,
      tipo: TipoElementoPlanificacion.Tarea,
      titulo: 'Crear formulario',
    };

    await servicio.eliminar(tarea, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).toHaveBeenCalledWith(
      'Eliminar tarea',
      'La tarea dejará de estar vigente, pero sus versiones se conservarán.',
    );
    expect(api.eliminar).toHaveBeenCalledWith(TipoElementoPlanificacion.Tarea, 802, 3);
  });

  it('omite la eliminación cuando el elemento ya está inactivo', async () => {
    await servicio.eliminar({ ...TAREA, activo: false }, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).not.toHaveBeenCalled();
    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('omite la eliminación cuando el elemento es de solo lectura', async () => {
    await servicio.eliminar(
      { ...TAREA, capacidades: { ...TAREA.capacidades, soloLectura: true } },
      jasmine.createSpy('actualizarArbol'),
    );

    expect(mensajes.confirmarDestructiva).not.toHaveBeenCalled();
    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('omite la eliminación cuando no hay planificación cargada', async () => {
    planificacion.set(null);

    await servicio.eliminar(TAREA, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).not.toHaveBeenCalled();
    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('omite la eliminación cuando la planificación es histórica', async () => {
    planificacion.set({ ...PLANIFICACION, esHistorica: true });

    await servicio.eliminar(TAREA, jasmine.createSpy('actualizarArbol'));

    expect(mensajes.confirmarDestructiva).not.toHaveBeenCalled();
    expect(api.eliminar).not.toHaveBeenCalled();
  });

  it('no actualiza el árbol ante un error distinto de conflicto de versión', async () => {
    const actualizarArbol = jasmine.createSpy('actualizarArbol');
    const error = new HttpErrorResponse({ status: 500 });
    api.eliminar.and.returnValue(throwError(() => error));

    await servicio.eliminar(TAREA, actualizarArbol);

    expect(actualizarArbol).not.toHaveBeenCalled();
    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      jasmine.objectContaining({ titulo: 'No fue posible eliminar el elemento' }),
    );
    expect(servicio.eliminando()).toBe(false);
  });

  it('restablece el estado cancelando la operación en curso', () => {
    servicio.restablecer();

    expect(servicio.eliminando()).toBe(false);
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
