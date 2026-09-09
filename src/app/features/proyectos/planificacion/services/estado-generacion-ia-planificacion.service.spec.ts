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
  const api = { generarConIa: vi.fn() };
  const estadoPlanificacion = {
    planificacion: planificacion.asReadonly(),
    cargar: vi.fn(),
  };
  const mensajes = {
    confirmar: vi.fn(),
    exito: vi.fn(),
  };
  const notificador = { comunicar: vi.fn() };
  let servicio: EstadoGeneracionIaPlanificacionService;

  beforeEach(() => {
    vi.clearAllMocks();
    planificacion.set(PLANIFICACION);
    mensajes.confirmar.mockResolvedValue(true);
    mensajes.exito.mockResolvedValue(undefined);
    api.generarConIa.mockReturnValue(
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
      expect.stringContaining('versión histórica'),
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
    mensajes.confirmar.mockResolvedValueOnce(false);

    await servicio.generar(42, NivelGeneracionIaPlanificacion.Epicas);

    expect(api.generarConIa).not.toHaveBeenCalled();
    expect(servicio.procesando()).toBe(false);
  });

  it('comunica el error y conserva abierto el asistente para reintentar', async () => {
    const error = new Error('fallo');
    api.generarConIa.mockReturnValueOnce(throwError(() => error));
    servicio.alternarPanel();

    await servicio.generar(42, NivelGeneracionIaPlanificacion.Tareas);

    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ titulo: 'No fue posible generar la planificación' }),
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
    mensajes.confirmar.mockReturnValueOnce(
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
