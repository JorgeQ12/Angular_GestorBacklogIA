import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NivelGeneracionIaPlanificacion } from '../models/generacion-ia-planificacion.model';
import type { PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import { EstadoGeneracionIaPlanificacionService } from './estado-generacion-ia-planificacion.service';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

describe('EstadoGeneracionIaPlanificacionService', () => {
  const planificacion = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const api = { generarConIa: jasmine.createSpy('generarConIa') };
  const estadoPlanificacion = {
    planificacion: planificacion.asReadonly(),
    cargar: jasmine.createSpy('cargar'),
  };
  const mensajes = {
    confirmar: jasmine.createSpy('confirmar'),
    exito: jasmine.createSpy('exito'),
  };
  const notificador = { comunicar: jasmine.createSpy('comunicar') };
  let servicio: EstadoGeneracionIaPlanificacionService;

  beforeEach(() => {
    api.generarConIa.calls.reset();
    estadoPlanificacion.cargar.calls.reset();
    mensajes.confirmar.calls.reset();
    mensajes.exito.calls.reset();
    notificador.comunicar.calls.reset();
    planificacion.set(PLANIFICACION);
    mensajes.confirmar.and.returnValue(Promise.resolve(true));
    mensajes.exito.and.returnValue(Promise.resolve(undefined));
    api.generarConIa.and.returnValue(
      of({
        proyectoId: 42,
        nivel: NivelGeneracionIaPlanificacion.Caracteristicas,
        totalCreados: 6,
        mensaje: 'Generación completada.',
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        EstadoGeneracionIaPlanificacionService,
        { provide: PlanificacionProyectoService, useValue: api },
        { provide: EstadoPlanificacionProyectoService, useValue: estadoPlanificacion },
        { provide: MensajesService, useValue: mensajes },
        { provide: NotificadorErroresApiService, useValue: notificador },
      ],
    });
    servicio = TestBed.inject(EstadoGeneracionIaPlanificacionService);
  });

  it('confirma, genera y renueva la planificación', async () => {
    servicio.alternarPanel();

    await servicio.generar(42, NivelGeneracionIaPlanificacion.Caracteristicas);

    expect(mensajes.confirmar).toHaveBeenCalledWith(
      'Generar características',
      jasmine.stringContaining('versión histórica'),
      'Generar',
    );
    expect(api.generarConIa).toHaveBeenCalledWith(
      42,
      NivelGeneracionIaPlanificacion.Caracteristicas,
    );
    expect(estadoPlanificacion.cargar).toHaveBeenCalledWith(42);
    expect(mensajes.exito).toHaveBeenCalledWith(
      'Planificación actualizada',
      'Se generaron 6 características correctamente.',
    );
    expect(servicio.panelAbierto()).toBe(false);
    expect(servicio.procesando()).toBe(false);
  });

  it('no consulta el backend cuando el usuario cancela', async () => {
    mensajes.confirmar.and.returnValue(Promise.resolve(false));

    await servicio.generar(42, NivelGeneracionIaPlanificacion.Epicas);

    expect(api.generarConIa).not.toHaveBeenCalled();
    expect(servicio.procesando()).toBe(false);
  });

  it('comunica el error y conserva abierto el asistente para reintentar', async () => {
    const error = new Error('fallo');
    api.generarConIa.and.returnValue(throwError(() => error));
    servicio.alternarPanel();

    await servicio.generar(42, NivelGeneracionIaPlanificacion.Tareas);

    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      jasmine.objectContaining({ titulo: 'No fue posible generar la planificación' }),
    );
    expect(servicio.panelAbierto()).toBe(true);
    expect(servicio.procesando()).toBe(false);
  });

  it('no abre el asistente ni genera sobre una versión histórica', async () => {
    planificacion.set({ ...PLANIFICACION, esHistorica: true });

    servicio.alternarPanel();
    await servicio.generar(42, NivelGeneracionIaPlanificacion.Epicas);

    expect(servicio.panelAbierto()).toBe(false);
    expect(mensajes.confirmar).not.toHaveBeenCalled();
    expect(api.generarConIa).not.toHaveBeenCalled();
  });

  it('ignora una confirmación pendiente cuando cambia el proyecto', async () => {
    let resolverConfirmacion: ((confirmado: boolean) => void) | undefined;
    mensajes.confirmar.and.returnValue(
      new Promise<boolean>((resolver) => {
        resolverConfirmacion = resolver;
      }),
    );
    const generacion = servicio.generar(42, NivelGeneracionIaPlanificacion.Epicas);

    servicio.restablecer();
    resolverConfirmacion?.(true);
    await generacion;

    expect(api.generarConIa).not.toHaveBeenCalled();
    expect(servicio.procesando()).toBe(false);
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
