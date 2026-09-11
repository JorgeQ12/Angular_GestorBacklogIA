import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { CodigoTipoCatalogoGestionProducto } from '../../../../core/catalogos/models/codigo-tipo-catalogo-gestion-producto.enum';
import { CatalogosService } from '../../../../core/catalogos/services/catalogos.service';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  ModoEditorElementoPlanificacion,
  type DetalleElementoPlanificacion,
  type ValoresFormularioElementoPlanificacion,
} from '../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacionDto } from '../models/planificacion-proyecto.dto';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';
import {
  EstadoEditorElementoPlanificacionService,
  obtenerNombreTipo,
} from './estado-editor-elemento-planificacion.service';

describe('EstadoEditorElementoPlanificacionService', () => {
  const api = {
    obtener: jasmine.createSpy('obtener'),
    crear: jasmine.createSpy('crear'),
    actualizar: jasmine.createSpy('actualizar'),
  };
  const catalogosApi = { obtenerOpciones: jasmine.createSpy('obtenerOpciones') };
  const notificador = { comunicar: jasmine.createSpy('comunicar') };
  const mensajes = { exito: jasmine.createSpy('exito') };
  let estado: EstadoEditorElementoPlanificacionService;

  beforeEach(() => {
    api.obtener.calls.reset();
    api.crear.calls.reset();
    api.actualizar.calls.reset();
    catalogosApi.obtenerOpciones.calls.reset();
    notificador.comunicar.calls.reset();
    mensajes.exito.calls.reset();
    api.obtener.and.returnValue(of(DETALLE_TAREA));
    api.crear.and.returnValue(of(DETALLE_TAREA));
    api.actualizar.and.returnValue(of(DETALLE_TAREA));
    catalogosApi.obtenerOpciones.and.returnValue(
      of([{ id: 19, nombre: 'Desarrollo', descripcion: '' }]),
    );
    mensajes.exito.and.returnValue(Promise.resolve(undefined));
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
    expect(catalogosApi.obtenerOpciones).toHaveBeenCalledWith(
      CodigoTipoCatalogoGestionProducto.ActividadTarea,
    );
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
    const completado = jasmine.createSpy('completado');
    estado.abrirCreacion(15, TipoElementoPlanificacion.Tarea, 736);

    expect(estado.valoresFormulario()?.actividadCatalogoId).toBe(19);
    estado.guardar(VALORES, completado);

    expect(api.crear).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tipo: TipoElementoPlanificacionDto.Tarea,
        historiaUsuarioId: 736,
        titulo: 'Implementar servicio',
        actividadCatalogoId: 19,
      }),
    );
    expect(completado).toHaveBeenCalledTimes(1);
    expect(estado.abierto()).toBe(false);
    expect(mensajes.exito).toHaveBeenCalledWith(
      'Elemento creado',
      'La tarea fue creada correctamente.',
    );
  });

  it('degrada a consulta una edición que el detalle declara de solo lectura', () => {
    api.obtener.and.returnValue(
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
    api.obtener.and.returnValue(
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
    api.obtener.and.returnValue(
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
    api.obtener.and.returnValue(of(actividad));
    api.actualizar.and.returnValue(throwError(() => error));
    const completado = jasmine.createSpy('completado');

    estado.abrirEdicion(15, TipoElementoPlanificacion.ActividadRequisito, 501);
    estado.guardar(
      { ...VALORES, titulo: 'Cambio pendiente', actividadCatalogoId: 25, prioridad: 2 },
      completado,
    );

    expect(api.actualizar).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tipo: TipoElementoPlanificacionDto.ActividadRequisito,
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
      jasmine.objectContaining({
        mensajesPorEstado: jasmine.objectContaining({ 409: jasmine.any(Object) }),
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

describe('EstadoEditorElementoPlanificacionService (cobertura adicional)', () => {
  const api = {
    obtener: jasmine.createSpy('obtener'),
    crear: jasmine.createSpy('crear'),
    actualizar: jasmine.createSpy('actualizar'),
  };
  const catalogosApi = { obtenerOpciones: jasmine.createSpy('obtenerOpciones') };
  const notificador = { comunicar: jasmine.createSpy('comunicar') };
  const mensajes = { exito: jasmine.createSpy('exito') };
  let estado: EstadoEditorElementoPlanificacionService;

  beforeEach(() => {
    api.obtener.calls.reset();
    api.crear.calls.reset();
    api.actualizar.calls.reset();
    catalogosApi.obtenerOpciones.calls.reset();
    notificador.comunicar.calls.reset();
    mensajes.exito.calls.reset();
    api.obtener.and.returnValue(of(DETALLE_EXTRA));
    api.crear.and.returnValue(of(DETALLE_EXTRA));
    api.actualizar.and.returnValue(of(DETALLE_EXTRA));
    catalogosApi.obtenerOpciones.and.returnValue(
      of([{ id: 19, nombre: 'Desarrollo', descripcion: '' }]),
    );
    mensajes.exito.and.returnValue(Promise.resolve(undefined));
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

  it('expone estados iniciales vacíos antes de abrir cualquier flujo', () => {
    expect(estado.abierto()).toBe(false);
    expect(estado.soloLectura()).toBe(false);
    expect(estado.puedeEditar()).toBe(false);
    expect(estado.detalle()).toBeNull();
    expect(estado.valoresFormulario()).toBeNull();
    expect(estado.catalogos()).toEqual({
      prioridades: [],
      riesgos: [],
      actividadesTarea: [],
      actividadesRequisito: [],
    });
  });

  it('carga catálogos de épica combinando prioridades y riesgos en creación', () => {
    estado.abrirCreacion(15, TipoElementoPlanificacion.Epica, 15);

    expect(catalogosApi.obtenerOpciones).toHaveBeenCalledTimes(2);
    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Creacion);
    expect(estado.catalogos().prioridades.length).toBe(1);
    expect(estado.catalogos().riesgos.length).toBe(1);
    expect(estado.cargando()).toBe(false);
  });

  it('carga el catálogo de actividad de requisito en creación', () => {
    estado.abrirCreacion(15, TipoElementoPlanificacion.ActividadRequisito, 30);

    expect(catalogosApi.obtenerOpciones).toHaveBeenCalledTimes(1);
    expect(estado.catalogos().actividadesRequisito.length).toBe(1);
  });

  it('no solicita catálogos para tipos sin opciones remotas', () => {
    estado.abrirCreacion(15, TipoElementoPlanificacion.Caracteristica, 1);

    expect(catalogosApi.obtenerOpciones).not.toHaveBeenCalled();
    expect(estado.catalogos()).toEqual({
      prioridades: [],
      riesgos: [],
      actividadesTarea: [],
      actividadesRequisito: [],
    });
  });

  it('cierra y notifica cuando la carga de catálogos de creación falla', () => {
    const error = new Error('sin catálogos');
    catalogosApi.obtenerOpciones.and.returnValue(throwError(() => error));

    estado.abrirCreacion(15, TipoElementoPlanificacion.Tarea, 736);

    expect(estado.abierto()).toBe(false);
    expect(estado.cargando()).toBe(false);
    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      jasmine.objectContaining({ titulo: 'No fue posible preparar el formulario' }),
    );
  });

  it('cierra y notifica cuando la consulta del detalle falla', () => {
    const error = new Error('sin detalle');
    api.obtener.and.returnValue(throwError(() => error));

    estado.abrirConsulta(15, TipoElementoPlanificacion.Tarea, 783);

    expect(estado.abierto()).toBe(false);
    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      jasmine.objectContaining({ titulo: 'No fue posible consultar el elemento' }),
    );
  });

  it('ignora iniciarEdicion cuando no hay contexto abierto', () => {
    estado.iniciarEdicion();

    expect(estado.contexto()).toBeNull();
  });

  it('no permite iniciar edición cuando el detalle no lo autoriza', () => {
    estado.abrirConsulta(15, TipoElementoPlanificacion.Tarea, 783, 80);

    estado.iniciarEdicion();

    expect(estado.contexto()?.modo).toBe(ModoEditorElementoPlanificacion.Consulta);
  });

  it('ignora guardar cuando no existe un flujo abierto', () => {
    const completado = jasmine.createSpy('completado');

    estado.guardar(VALORES_EXTRA, completado);

    expect(api.crear).not.toHaveBeenCalled();
    expect(api.actualizar).not.toHaveBeenCalled();
    expect(completado).not.toHaveBeenCalled();
  });

  it('no persiste cuando el flujo es de solo lectura', () => {
    estado.abrirConsulta(15, TipoElementoPlanificacion.Tarea, 783, 80);
    const completado = jasmine.createSpy('completado');

    estado.guardar(VALORES_EXTRA, completado);

    expect(api.actualizar).not.toHaveBeenCalled();
    expect(completado).not.toHaveBeenCalled();
  });

  it('notifica un error de creación conservando el diálogo abierto', () => {
    const error = new Error('creación fallida');
    api.crear.and.returnValue(throwError(() => error));
    const completado = jasmine.createSpy('completado');
    estado.abrirCreacion(15, TipoElementoPlanificacion.Tarea, 736);

    estado.guardar(VALORES_EXTRA, completado);

    expect(estado.abierto()).toBe(true);
    expect(completado).not.toHaveBeenCalled();
    expect(estado.guardando()).toBe(false);
    expect(notificador.comunicar).toHaveBeenCalledWith(
      error,
      jasmine.objectContaining({ titulo: 'No fue posible crear el elemento' }),
    );
  });

  it('actualiza una edición confirmada y avisa el éxito', () => {
    const completado = jasmine.createSpy('completado');
    estado.abrirEdicion(15, TipoElementoPlanificacion.Tarea, 783);

    estado.guardar(VALORES_EXTRA, completado);

    expect(api.actualizar).toHaveBeenCalledTimes(1);
    expect(completado).toHaveBeenCalledTimes(1);
    expect(estado.abierto()).toBe(false);
    expect(mensajes.exito).toHaveBeenCalledWith(
      'Cambios guardados',
      'La nueva versión del elemento fue guardada correctamente.',
    );
  });

  it('conserva el flujo abierto durante una persistencia en curso', () => {
    api.actualizar.and.returnValue(NEVER);
    const completado = jasmine.createSpy('completado');
    estado.abrirEdicion(15, TipoElementoPlanificacion.Tarea, 783);

    estado.guardar(VALORES_EXTRA, completado);
    expect(estado.guardando()).toBe(true);

    estado.guardar(VALORES_EXTRA, completado);
    expect(api.actualizar).toHaveBeenCalledTimes(1);

    estado.cerrar();
    expect(estado.abierto()).toBe(true);
  });

  it('incorpora los valores vigentes ausentes del catálogo remoto', () => {
    api.obtener.and.returnValue(
      of({
        ...DETALLE_EXTRA,
        tipo: TipoElementoPlanificacion.Epica,
        prioridadCatalogoId: 900,
        riesgoCatalogoId: 901,
      }),
    );

    estado.abrirConsulta(15, TipoElementoPlanificacion.Epica, 1);

    expect(estado.catalogos().prioridades.some((opcion) => opcion.id === 900)).toBe(true);
    expect(estado.catalogos().riesgos.some((opcion) => opcion.id === 901)).toBe(true);
  });

  it('no duplica una opción vigente que el catálogo ya contiene', () => {
    catalogosApi.obtenerOpciones.and.returnValue(
      of([{ id: 19, nombre: 'Desarrollo', descripcion: '' }]),
    );
    api.obtener.and.returnValue(of({ ...DETALLE_EXTRA, actividadCatalogoId: 19 }));

    estado.abrirConsulta(15, TipoElementoPlanificacion.Tarea, 783);

    expect(
      estado.catalogos().actividadesTarea.filter((opcion) => opcion.id === 19).length,
    ).toBe(1);
  });

  it('resuelve la etiqueta visible de cada tipo persistible', () => {
    expect(obtenerNombreTipo(TipoElementoPlanificacion.Epica)).toBe('Épica');
    expect(obtenerNombreTipo(TipoElementoPlanificacion.Caracteristica)).toBe('Característica');
    expect(obtenerNombreTipo(TipoElementoPlanificacion.Historia)).toBe('Historia de usuario');
    expect(obtenerNombreTipo(TipoElementoPlanificacion.Tarea)).toBe('Tarea');
    expect(obtenerNombreTipo(TipoElementoPlanificacion.ActividadRequisito)).toBe(
      'Actividad de requisito',
    );
    expect(obtenerNombreTipo(TipoElementoPlanificacion.TareaRequisito)).toBe(
      'Tarea de requisito',
    );
  });
});

const DETALLE_EXTRA: DetalleElementoPlanificacion = {
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

const VALORES_EXTRA: ValoresFormularioElementoPlanificacion = {
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
