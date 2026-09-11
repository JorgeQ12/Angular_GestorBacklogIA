import {
  crearActualizacionElemento,
  crearSolicitudElemento,
  crearValoresFormularioElemento,
  mapearDetalleElementoPlanificacion,
  mapearResultadoEliminacionElemento,
  serializarTipoElemento,
} from './elemento-planificacion.mapper';
import type {
  DetalleEpicaDto,
  DetalleTareaDto,
} from '../models/elemento-planificacion.dto';
import {
  ModoEditorElementoPlanificacion,
  MotivoInactivacionElementoPlanificacion,
  type ValoresFormularioElementoPlanificacion,
} from '../models/detalle-elemento-planificacion.model';
import {
  MotivoInactivacionElementoDto,
  OrigenEpicaDto,
  TipoElementoPlanificacionDto,
} from '../models/planificacion-proyecto.dto';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';

describe('elementoPlanificacionMapper', () => {
  it('declara exactamente los nueve códigos técnicos del catálogo', () => {
    expect(Object.values(TipoElementoPlanificacionDto)).toEqual([
      'item_azure_epica',
      'item_azure_caracteristica',
      'item_azure_historia_usuario',
      'item_azure_tarea',
      'item_azure_lista_requisitos',
      'item_azure_actividad_requisito',
      'item_azure_tarea_requisito',
      'item_azure_actividad',
      'item_azure_requisito',
    ]);
  });

  it('serializa todos los tipos del árbol con el código técnico del catálogo', () => {
    expect([
      serializarTipoElemento(TipoElementoPlanificacion.Epica),
      serializarTipoElemento(TipoElementoPlanificacion.Caracteristica),
      serializarTipoElemento(TipoElementoPlanificacion.Historia),
      serializarTipoElemento(TipoElementoPlanificacion.Tarea),
      serializarTipoElemento(TipoElementoPlanificacion.ListaRequisitos),
      serializarTipoElemento(TipoElementoPlanificacion.ActividadRequisito),
      serializarTipoElemento(TipoElementoPlanificacion.TareaRequisito),
    ]).toEqual([
      TipoElementoPlanificacionDto.Epica,
      TipoElementoPlanificacionDto.Caracteristica,
      TipoElementoPlanificacionDto.Historia,
      TipoElementoPlanificacionDto.Tarea,
      TipoElementoPlanificacionDto.ListaRequisitos,
      TipoElementoPlanificacionDto.ActividadRequisito,
      TipoElementoPlanificacionDto.TareaRequisito,
    ]);
  });

  it('adapta el resultado de una eliminación lógica', () => {
    expect(
      mapearResultadoEliminacionElemento({ itemTrabajoId: 501, totalInactivados: 3 }),
    ).toEqual({ elementoId: 501, totalInactivados: 3 });
  });

  it('mapea el detalle discriminado de una tarea', () => {
    expect(mapearDetalleElementoPlanificacion(TAREA_DTO)).toMatchObject({
      tipo: TipoElementoPlanificacion.Tarea,
      id: 783,
      numeroVersion: 2,
      actividadCatalogoId: 19,
      complejidad: 4,
      fechaInicio: '2026-09-01',
      fechaFinal: '2026-09-05',
    });
  });

  it('conserva la fecha y el motivo de un elemento eliminado', () => {
    const detalle = mapearDetalleElementoPlanificacion({
      ...TAREA_DTO,
      activo: false,
      fechaInactivacion: '2026-09-04T10:00:00',
      motivoInactivacion: MotivoInactivacionElementoDto.GeneracionIa,
      soloLectura: true,
    });

    expect(detalle).toMatchObject({
      activo: false,
      fechaInactivacion: '2026-09-04T10:00:00',
      motivoInactivacion: MotivoInactivacionElementoPlanificacion.GeneracionIa,
    });
  });

  it('rechaza un motivo de inactivación desconocido', () => {
    expect(() =>
      mapearDetalleElementoPlanificacion({
        ...TAREA_DTO,
        motivoInactivacion: 'desconocido' as MotivoInactivacionElementoDto,
      }),
    ).toThrow('Motivo de inactivación no compatible');
  });

  it('conserva las capacidades autorizadas para una épica vinculada con Azure', () => {
    const epica: DetalleEpicaDto = {
      ...BASE_DETALLE,
      capacidades: { ...CAPACIDADES, puedeSincronizar: true },
      id: 430,
      tipo: TipoElementoPlanificacionDto.Epica,
      origen: OrigenEpicaDto.AzureDevOps,
      esPrincipal: true,
      alcance: null,
      riesgos: null,
      criteriosExito: null,
      prioridadCatalogoId: null,
      riesgoCatalogoId: null,
      azureWorkItemId: 91,
      urlAzure: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/91',
    };

    const detalle = mapearDetalleElementoPlanificacion(epica);

    expect(detalle.urlAzure).toBe(
      'https://dev.azure.com/organizacion/proyecto/_workitems/edit/91',
    );
    expect(detalle.capacidades).toEqual({
      puedeEditar: true,
      puedeVerHistorial: true,
      puedeSincronizar: true,
      soloLectura: false,
    });
  });

  it('conserva la estimación cero al hidratar el formulario de consulta', () => {
    const detalle = mapearDetalleElementoPlanificacion({
      ...TAREA_DTO,
      estimacionHoras: 0,
    });

    const valores = crearValoresFormularioElemento(
      TipoElementoPlanificacion.Tarea,
      {
        prioridades: [],
        riesgos: [],
        actividadesTarea: [],
        actividadesRequisito: [],
      },
      detalle,
    );

    expect(valores.estimacionHoras).toBe(0);
  });

  it('crea una tarea enlazándola con la historia seleccionada', () => {
    const solicitud = crearSolicitudElemento(
      {
        modo: ModoEditorElementoPlanificacion.Creacion,
        tipo: TipoElementoPlanificacion.Tarea,
        proyectoId: 15,
        versionPlanificacionId: null,
        padreId: 736,
        elementoId: null,
      },
      VALORES,
    );

    expect(solicitud).toEqual({
      tipo: TipoElementoPlanificacionDto.Tarea,
      historiaUsuarioId: 736,
      titulo: 'Implementar servicio',
      descripcion: 'Construir el servicio.',
      estimacionHoras: 8,
      fechaInicio: '2026-09-03',
      fechaFinal: '2026-09-05',
      dependencias: 'API disponible',
      actividadCatalogoId: 19,
      complejidad: 4,
    });
  });

  it('actualiza usando la identidad y versión vigente sin enviar el padre', () => {
    const detalle = mapearDetalleElementoPlanificacion(TAREA_DTO);
    const solicitud = crearActualizacionElemento(detalle, VALORES);

    expect(solicitud).toMatchObject({
      tipo: TipoElementoPlanificacionDto.Tarea,
      itemTrabajoId: 783,
      numeroVersionEsperada: 2,
      titulo: 'Implementar servicio',
      actividadCatalogoId: 19,
    });
    expect(solicitud).not.toHaveProperty('historiaUsuarioId');
  });
});

const CAPACIDADES = {
  puedeEditar: true,
  puedeEliminar: true,
  puedeVerHistorial: true,
  puedeCrearHijo: false,
  puedeGenerarHijos: false,
  puedeSincronizar: false,
  puedeAbrirEnAzure: false,
  soloLectura: false,
};

const BASE_DETALLE = {
  id: 783,
  proyectoId: 15,
  activo: true,
  numeroVersionActual: 2,
  titulo: 'Implementar servicio',
  descripcion: 'Construir el servicio.',
  estimacionHoras: 8,
  fechaInicio: '2026-09-01T00:00:00',
  fechaFinal: '2026-09-05T00:00:00',
  fechaCreacion: '2026-08-20T10:00:00',
  fechaInactivacion: null,
  motivoInactivacion: null,
  soloLectura: false,
  capacidades: CAPACIDADES,
};

const TAREA_DTO: DetalleTareaDto = {
  ...BASE_DETALLE,
  tipo: TipoElementoPlanificacionDto.Tarea,
  historiaUsuarioId: 736,
  dependencias: 'API disponible',
  actividadCatalogoId: 19,
  complejidad: 4,
};

const VALORES: ValoresFormularioElementoPlanificacion = {
  titulo: '  Implementar servicio  ',
  descripcion: '  Construir el servicio.  ',
  alcance: '',
  riesgos: '',
  criteriosExito: '',
  prioridadCatalogoId: null,
  riesgoCatalogoId: null,
  objetivo: '',
  criteriosAceptacion: '',
  dependencias: '  API disponible  ',
  actividadCatalogoId: 19,
  complejidad: 4,
  prioridad: 4,
  discusion: '',
  responsable: '',
  requisito: '',
  estimacionHoras: 8,
  fechaInicio: '2026-09-03',
  fechaFinal: '2026-09-05',
};
