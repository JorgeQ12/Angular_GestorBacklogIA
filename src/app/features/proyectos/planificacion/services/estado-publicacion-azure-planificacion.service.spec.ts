import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import type { PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { EstadoPublicacionAzurePlanificacionService } from './estado-publicacion-azure-planificacion.service';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

describe('EstadoPublicacionAzurePlanificacionService', () => {
  const planificacion = signal<PlanificacionProyecto | null>(PLANIFICACION);
  const api = { publicarEnAzure: vi.fn() };
  const estadoPlanificacion = { planificacion: planificacion.asReadonly() };
  const mensajes = { confirmar: vi.fn(), exito: vi.fn() };
  const notificador = { comunicar: vi.fn() };
  let servicio: EstadoPublicacionAzurePlanificacionService;

  beforeEach(() => {
    vi.clearAllMocks();
    planificacion.set(PLANIFICACION);
    mensajes.confirmar.mockResolvedValue(true);
    mensajes.exito.mockResolvedValue(undefined);
    api.publicarEnAzure.mockReturnValue(of(RESULTADO_PUBLICACION));
    TestBed.configureTestingModule({
      providers: [
        EstadoPublicacionAzurePlanificacionService,
        { provide: PlanificacionProyectoService, useValue: api },
        { provide: EstadoPlanificacionProyectoService, useValue: estadoPlanificacion },
        { provide: MensajesService, useValue: mensajes },
        { provide: NotificadorErroresApiService, useValue: notificador },
      ],
    });
    servicio = TestBed.inject(EstadoPublicacionAzurePlanificacionService);
  });

  it('confirma, publica y comunica el total enviado', async () => {
    await servicio.publicar(42);

    expect(mensajes.confirmar).toHaveBeenCalledWith(
      'Publicar en Azure DevOps',
      expect.stringContaining('work items vigentes'),
      'Publicar',
    );
    expect(api.publicarEnAzure).toHaveBeenCalledWith(42);
    expect(mensajes.exito).toHaveBeenCalledWith(
      'Publicación completada',
      'Se publicaron 11 work items.',
    );
    expect(servicio.publicando()).toBe(false);
  });

  it('no consulta el backend cuando el usuario cancela', async () => {
    mensajes.confirmar.mockResolvedValueOnce(false);

    await servicio.publicar(42);

    expect(api.publicarEnAzure).not.toHaveBeenCalled();
    expect(servicio.publicando()).toBe(false);
  });

  it('respeta el bloqueo calculado por el backend', async () => {
    planificacion.set({
      ...PLANIFICACION,
      publicacionAzure: { puedePublicar: false, bloqueos: [] },
    });

    await servicio.publicar(42);

    expect(mensajes.confirmar).not.toHaveBeenCalled();
    expect(api.publicarEnAzure).not.toHaveBeenCalled();
  });

  it('no publica una versión histórica aunque su disponibilidad fuera inconsistente', async () => {
    planificacion.set({ ...PLANIFICACION, esHistorica: true });

    await servicio.publicar(42);

    expect(mensajes.confirmar).not.toHaveBeenCalled();
    expect(api.publicarEnAzure).not.toHaveBeenCalled();
  });

  it('comunica el error de publicación y libera la operación', async () => {
    const error = new Error('fallo');
    api.publicarEnAzure.mockReturnValueOnce(throwError(() => error));

    await servicio.publicar(42);

    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ titulo: 'No fue posible publicar en Azure DevOps' }),
    );
    expect(servicio.publicando()).toBe(false);
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

const RESULTADO_PUBLICACION = {
  organizacion: 'Inter Rapidísimo',
  proyecto: 'Gestor IA',
  area: 'Gestor IA\\Producto',
  fechaInicio: '2026-09-04T14:00:00Z',
  totalElementos: 11,
  totalEpicas: 1,
  totalCaracteristicas: 2,
  totalHistorias: 3,
  totalTareas: 5,
} as const;
