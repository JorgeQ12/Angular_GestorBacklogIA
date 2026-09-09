import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CatalogosService } from '../../../../core/catalogos/services/catalogos.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  ModoEditorElementoPlanificacion,
  type DetalleElementoPlanificacion,
  type ValoresFormularioElementoPlanificacion,
} from '../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';
import { EstadoEditorElementoPlanificacionService } from './estado-editor-elemento-planificacion.service';

describe('EstadoEditorElementoPlanificacionService', () => {
  const api = {
    obtener: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
  };
  const catalogosApi = { obtenerOpciones: vi.fn() };
  const notificador = { comunicar: vi.fn() };
  const mensajes = { exito: vi.fn() };
  let estado: EstadoEditorElementoPlanificacionService;

  beforeEach(() => {
    vi.clearAllMocks();
    api.obtener.mockReturnValue(of(DETALLE_TAREA));
    api.crear.mockReturnValue(of(DETALLE_TAREA));
    api.actualizar.mockReturnValue(of(DETALLE_TAREA));
    catalogosApi.obtenerOpciones.mockReturnValue(
      of([{ id: 19, nombre: 'Desarrollo', descripcion: '' }]),
    );
    mensajes.exito.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        EstadoEditorElementoPlanificacionService,
        { provide: ElementoPlanificacionService, useValue: api },
        { provide: CatalogosService, useValue: catalogosApi },
        { provide: NotificadorErroresApiService, useValue: notificador },
        { provide: MensajesService, useValue: mensajes },
      ],
    });
    estado = TestBed.inject(EstadoEditorElementoPlanificacionService);
  });

  it('consulta una tarea y permite pasar a edición con la fotografía ya cargada', () => {
    estado.abrirConsulta(15, TipoElementoPlanificacion.Tarea, 783);

    expect(api.obtener).toHaveBeenCalledWith(TipoElementoPlanificacion.Tarea, 783, null);
    expect(catalogosApi.obtenerOpciones).toHaveBeenCalledWith('ActividadTarea');
    expect(estado.detalle()).toEqual(DETALLE_TAREA);
    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Consulta);

    estado.iniciarEdicion();

    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Edicion);
  });

  it('consulta el detalle histórico y bloquea el paso a edición', () => {
    estado.abrirConsulta(15, TipoElementoPlanificacion.Tarea, 783, 80);

    expect(api.obtener).toHaveBeenCalledWith(TipoElementoPlanificacion.Tarea, 783, 80);
    expect(estado.contexto()?.versionPlanificacionId).toBe(80);
    expect(estado.puedeEditar()).toBe(false);

    estado.iniciarEdicion();

    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Consulta);
  });

  it('crea la tarea, cierra el diálogo y solicita renovar el árbol', () => {
    const completado = vi.fn();
    estado.abrirCreacion(15, TipoElementoPlanificacion.Tarea, 736);

    expect(estado.valoresFormulario()?.actividadCatalogoId).toBe(19);
    estado.guardar(VALORES, completado);

    expect(api.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'tarea',
        historiaUsuarioId: 736,
        titulo: 'Implementar servicio',
        actividadCatalogoId: 19,
      }),
    );
    expect(completado).toHaveBeenCalledOnce();
    expect(estado.abierto()).toBe(false);
    expect(mensajes.exito).toHaveBeenCalledWith(
      'Elemento creado',
      'La tarea fue creada correctamente.',
    );
  });

  it('degrada a consulta una edición que el detalle declara de solo lectura', () => {
    api.obtener.mockReturnValue(
      of({
        ...DETALLE_TAREA,
        capacidades: {
          puedeEditar: true,
          puedeVerHistorial: true,
          puedeSincronizar: false,
          soloLectura: true,
        },
      }),
    );

    estado.abrirEdicion(15, TipoElementoPlanificacion.Tarea, 783);

    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Consulta);
    expect(estado.puedeEditar()).toBe(false);
  });

  it('mantiene una épica autorizada en modo edición', () => {
    api.obtener.mockReturnValue(
      of({
        ...DETALLE_TAREA,
        tipo: TipoElementoPlanificacion.Epica,
      }),
    );

    estado.abrirEdicion(15, TipoElementoPlanificacion.Epica, 1);

    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Edicion);
    expect(estado.puedeEditar()).toBe(true);
  });

  it('mantiene un elemento eliminado en consulta aunque sus capacidades sean inconsistentes', () => {
    api.obtener.mockReturnValue(
      of({
        ...DETALLE_TAREA,
        activo: false,
        fechaInactivacion: '2026-09-04T10:00:00',
      }),
    );

    estado.abrirEdicion(15, TipoElementoPlanificacion.Tarea, 783);

    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Consulta);
    expect(estado.puedeEditar()).toBe(false);
  });

  it('conserva abierto el formulario de una actividad ante un conflicto 409', () => {
    const actividad: DetalleElementoPlanificacion = {
      ...DETALLE_TAREA,
      tipo: TipoElementoPlanificacion.ActividadRequisito,
      id: 501,
      actividadCatalogoId: 25,
      prioridad: 2,
    };
    const error = new HttpErrorResponse({ status: 409 });
    api.obtener.mockReturnValueOnce(of(actividad));
    api.actualizar.mockReturnValueOnce(throwError(() => error));
    const completado = vi.fn();

    estado.abrirEdicion(15, TipoElementoPlanificacion.ActividadRequisito, 501);
    estado.guardar(
      { ...VALORES, titulo: 'Cambio pendiente', actividadCatalogoId: 25, prioridad: 2 },
      completado,
    );

    expect(api.actualizar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'actividadrequisito',
        itemTrabajoId: 501,
        numeroVersionEsperada: 2,
        titulo: 'Cambio pendiente',
      }),
    );
    expect(estado.abierto()).toBe(true);
    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Edicion);
    expect(completado).not.toHaveBeenCalled();
    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        mensajesPorEstado: expect.objectContaining({ 409: expect.any(Object) }),
      }),
    );
  });
});

const DETALLE_TAREA: DetalleElementoPlanificacion = {
  tipo: TipoElementoPlanificacion.Tarea,
  id: 783,
  proyectoId: 15,
  activo: true,
  numeroVersion: 2,
  titulo: 'Implementar servicio',
  descripcion: 'Construir el servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-03',
  fechaFinal: '2026-09-05',
  fechaCreacion: '2026-08-20T10:00:00',
  fechaInactivacion: null,
  motivoInactivacion: null,
  urlAzure: null,
  capacidades: {
    puedeEditar: true,
    puedeVerHistorial: true,
    puedeSincronizar: false,
    soloLectura: false,
  },
  alcance: '',
  riesgos: '',
  criteriosExito: '',
  prioridadCatalogoId: null,
  riesgoCatalogoId: null,
  objetivo: '',
  criteriosAceptacion: '',
  dependencias: '',
  actividadCatalogoId: 19,
  complejidad: 3,
  prioridad: 4,
  discusion: '',
  responsable: '',
  requisito: '',
};

const VALORES: ValoresFormularioElementoPlanificacion = {
  titulo: 'Implementar servicio',
  descripcion: 'Construir el servicio.',
  alcance: '',
  riesgos: '',
  criteriosExito: '',
  prioridadCatalogoId: null,
  riesgoCatalogoId: null,
  objetivo: '',
  criteriosAceptacion: '',
  dependencias: '',
  actividadCatalogoId: 19,
  complejidad: 3,
  prioridad: 4,
  discusion: '',
  responsable: '',
  requisito: '',
  estimacionHoras: 8,
  fechaInicio: '2026-09-03',
  fechaFinal: '2026-09-05',
};
