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
    expect(Object.values(TipoElementoPlanificacionDto) as string[]).toEqual([
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
    expect(mapearDetalleElementoPlanificacion(TAREA_DTO)).toEqual(
      jasmine.objectContaining({
        tipo: TipoElementoPlanificacion.Tarea,
        id: 783,
        numeroVersion: 2,
        actividadCatalogoId: 19,
        complejidad: 4,
        fechaInicio: '2026-09-01',
        fechaFinal: '2026-09-05',
      }),
    );
  });

  it('conserva la fecha y el motivo de un elemento eliminado', () => {
    const detalle = mapearDetalleElementoPlanificacion({
      ...TAREA_DTO,
      activo: false,
      fechaInactivacion: '2026-09-04T10:00:00',
      motivoInactivacion: MotivoInactivacionElementoDto.GeneracionIa,
      soloLectura: true,
    });

    expect(detalle).toEqual(
      jasmine.objectContaining({
        activo: false,
        fechaInactivacion: '2026-09-04T10:00:00',
        motivoInactivacion: MotivoInactivacionElementoPlanificacion.GeneracionIa,
      }),
    );
  });

  it('rechaza un motivo de inactivación desconocido', () => {
    expect(() =>
      mapearDetalleElementoPlanificacion({
        ...TAREA_DTO,
        motivoInactivacion: 'desconocido' as MotivoInactivacionElementoDto,
      }),
    ).toThrowError(/Motivo de inactivación no compatible/);
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

    expect(solicitud).toEqual(
      jasmine.objectContaining({
        tipo: TipoElementoPlanificacionDto.Tarea,
        itemTrabajoId: 783,
        numeroVersionEsperada: 2,
        titulo: 'Implementar servicio',
        actividadCatalogoId: 19,
      }),
    );
    expect('historiaUsuarioId' in solicitud).toBe(false);
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

import type {
  DetalleActividadRequisitoDto,
  DetalleCaracteristicaDto,
  DetalleHistoriaDto,
  DetalleTareaRequisitoDto,
} from '../models/elemento-planificacion.dto';
import type {
  CatalogosFormularioElementoPlanificacion,
  ContextoEditorElementoPlanificacion,
  DetalleElementoPlanificacion,
} from '../models/detalle-elemento-planificacion.model';

describe('elementoPlanificacionMapper - cobertura ampliada', () => {
  const CATALOGOS_VACIOS: CatalogosFormularioElementoPlanificacion = {
    prioridades: [],
    riesgos: [],
    actividadesTarea: [],
    actividadesRequisito: [],
  };

  function contextoCreacion(
    tipo: ContextoEditorElementoPlanificacion['tipo'],
    padreId: number | null = 100,
  ): ContextoEditorElementoPlanificacion {
    return {
      modo: ModoEditorElementoPlanificacion.Creacion,
      tipo,
      proyectoId: 15,
      versionPlanificacionId: null,
      padreId,
      elementoId: null,
    };
  }

  function valoresCon(
    overrides: Partial<ValoresFormularioElementoPlanificacion> = {},
  ): ValoresFormularioElementoPlanificacion {
    return { ...VALORES, ...overrides };
  }

  describe('mapearDetalleElementoPlanificacion - discriminación por tipo', () => {
    it('mapea una épica con textos nulos usando cadenas vacías', () => {
      const epica: DetalleEpicaDto = {
        ...BASE_DETALLE,
        id: 1,
        tipo: TipoElementoPlanificacionDto.Epica,
        origen: OrigenEpicaDto.Manual,
        esPrincipal: false,
        alcance: null,
        riesgos: null,
        criteriosExito: null,
        prioridadCatalogoId: null,
        riesgoCatalogoId: null,
        azureWorkItemId: null,
        urlAzure: null,
      };

      expect(mapearDetalleElementoPlanificacion(epica)).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacion.Epica,
          alcance: '',
          riesgos: '',
          criteriosExito: '',
          urlAzure: null,
        }),
      );
    });

    it('mapea una épica con todos sus textos presentes', () => {
      const epica: DetalleEpicaDto = {
        ...BASE_DETALLE,
        id: 2,
        tipo: TipoElementoPlanificacionDto.Epica,
        origen: OrigenEpicaDto.Manual,
        esPrincipal: false,
        alcance: 'Alcance',
        riesgos: 'Riesgos',
        criteriosExito: 'Éxito',
        prioridadCatalogoId: 3,
        riesgoCatalogoId: 4,
        azureWorkItemId: null,
        urlAzure: null,
      };

      expect(mapearDetalleElementoPlanificacion(epica)).toEqual(
        jasmine.objectContaining({
          alcance: 'Alcance',
          riesgos: 'Riesgos',
          criteriosExito: 'Éxito',
          prioridadCatalogoId: 3,
          riesgoCatalogoId: 4,
        }),
      );
    });

    it('mapea una característica conservando su alcance', () => {
      const caracteristica: DetalleCaracteristicaDto = {
        ...BASE_DETALLE,
        id: 3,
        tipo: TipoElementoPlanificacionDto.Caracteristica,
        alcance: 'Alcance de la característica',
      };

      expect(mapearDetalleElementoPlanificacion(caracteristica)).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacion.Caracteristica,
          alcance: 'Alcance de la característica',
        }),
      );
    });

    it('mapea una historia con objetivo, alcance y criterios', () => {
      const historia: DetalleHistoriaDto = {
        ...BASE_DETALLE,
        id: 4,
        tipo: TipoElementoPlanificacionDto.Historia,
        caracteristicaId: 33,
        objetivo: 'Objetivo',
        alcance: 'Alcance',
        criteriosAceptacion: 'Criterios',
      };

      expect(mapearDetalleElementoPlanificacion(historia)).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacion.Historia,
          objetivo: 'Objetivo',
          alcance: 'Alcance',
          criteriosAceptacion: 'Criterios',
        }),
      );
    });

    it('mapea una actividad de requisito con discusión y responsable presentes', () => {
      const actividad: DetalleActividadRequisitoDto = {
        ...BASE_DETALLE,
        id: 5,
        tipo: TipoElementoPlanificacionDto.ActividadRequisito,
        listaRequisitosId: 44,
        actividadCatalogoId: 21,
        prioridad: 2,
        discusion: 'Discusión',
        responsable: 'Ana',
      };

      expect(mapearDetalleElementoPlanificacion(actividad)).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacion.ActividadRequisito,
          actividadCatalogoId: 21,
          prioridad: 2,
          discusion: 'Discusión',
          responsable: 'Ana',
        }),
      );
    });

    it('mapea una actividad de requisito con discusión y responsable nulos', () => {
      const actividad: DetalleActividadRequisitoDto = {
        ...BASE_DETALLE,
        id: 6,
        tipo: TipoElementoPlanificacionDto.ActividadRequisito,
        listaRequisitosId: 44,
        actividadCatalogoId: 21,
        prioridad: 2,
        discusion: null,
        responsable: null,
      };

      expect(mapearDetalleElementoPlanificacion(actividad)).toEqual(
        jasmine.objectContaining({ discusion: '', responsable: '' }),
      );
    });

    it('mapea una tarea de requisito con requisito y responsable presentes', () => {
      const tareaReq: DetalleTareaRequisitoDto = {
        ...BASE_DETALLE,
        id: 7,
        tipo: TipoElementoPlanificacionDto.TareaRequisito,
        actividadRequisitoId: 55,
        requisito: 'Requisito',
        responsable: 'Beto',
      };

      expect(mapearDetalleElementoPlanificacion(tareaReq)).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacion.TareaRequisito,
          requisito: 'Requisito',
          responsable: 'Beto',
        }),
      );
    });

    it('mapea una tarea de requisito con requisito y responsable nulos', () => {
      const tareaReq: DetalleTareaRequisitoDto = {
        ...BASE_DETALLE,
        id: 8,
        tipo: TipoElementoPlanificacionDto.TareaRequisito,
        actividadRequisitoId: 55,
        requisito: null,
        responsable: null,
      };

      expect(mapearDetalleElementoPlanificacion(tareaReq)).toEqual(
        jasmine.objectContaining({ requisito: '', responsable: '' }),
      );
    });

    it('descarta una fecha anterior a 1900 al normalizarla', () => {
      const detalle = mapearDetalleElementoPlanificacion({
        ...TAREA_DTO,
        fechaInicio: '0001-01-01T00:00:00',
        fechaFinal: '1899-12-31T00:00:00',
      });

      expect(detalle.fechaInicio).toBe('');
      expect(detalle.fechaFinal).toBe('');
    });

    it('respeta soloLectura cuando lo imponen las capacidades', () => {
      const detalle = mapearDetalleElementoPlanificacion({
        ...TAREA_DTO,
        soloLectura: false,
        capacidades: { ...CAPACIDADES, soloLectura: true },
      });

      expect(detalle.capacidades.soloLectura).toBe(true);
    });
  });

  describe('mapearMotivoInactivacion', () => {
    it('normaliza el motivo de eliminación', () => {
      const detalle = mapearDetalleElementoPlanificacion({
        ...TAREA_DTO,
        motivoInactivacion: MotivoInactivacionElementoDto.Eliminacion,
      });

      expect(detalle.motivoInactivacion).toBe(
        MotivoInactivacionElementoPlanificacion.Eliminacion,
      );
    });

    it('normaliza el motivo legado', () => {
      const detalle = mapearDetalleElementoPlanificacion({
        ...TAREA_DTO,
        motivoInactivacion: MotivoInactivacionElementoDto.Legado,
      });

      expect(detalle.motivoInactivacion).toBe(MotivoInactivacionElementoPlanificacion.Legado);
    });
  });

  describe('crearValoresFormularioElemento - sin detalle', () => {
    it('inicializa una tarea con estimación y fechas del día actual', () => {
      const catalogos: CatalogosFormularioElementoPlanificacion = {
        ...CATALOGOS_VACIOS,
        actividadesTarea: [{ id: 71, nombre: 'Desarrollo', descripcion: '' }],
      };

      const valores = crearValoresFormularioElemento(
        TipoElementoPlanificacion.Tarea,
        catalogos,
        null,
      );

      expect(valores.estimacionHoras).toBe(8);
      expect(valores.actividadCatalogoId).toBe(71);
      expect(valores.fechaInicio).not.toBe('');
      expect(valores.fechaFinal).not.toBe('');
    });

    it('inicializa una actividad de requisito sin estimación ni fechas', () => {
      const catalogos: CatalogosFormularioElementoPlanificacion = {
        ...CATALOGOS_VACIOS,
        actividadesRequisito: [{ id: 91, nombre: 'Requisito', descripcion: '' }],
      };

      const valores = crearValoresFormularioElemento(
        TipoElementoPlanificacion.ActividadRequisito,
        catalogos,
        null,
      );

      expect(valores.estimacionHoras).toBeNull();
      expect(valores.fechaInicio).toBe('');
      expect(valores.fechaFinal).toBe('');
      expect(valores.actividadCatalogoId).toBe(91);
    });

    it('usa null como actividad inicial cuando el catálogo está vacío', () => {
      const valores = crearValoresFormularioElemento(
        TipoElementoPlanificacion.Tarea,
        CATALOGOS_VACIOS,
        null,
      );

      expect(valores.actividadCatalogoId).toBeNull();
    });

    it('trata una tarea de requisito como requisito al inicializar', () => {
      const valores = crearValoresFormularioElemento(
        TipoElementoPlanificacion.TareaRequisito,
        CATALOGOS_VACIOS,
        null,
      );

      expect(valores.estimacionHoras).toBeNull();
      expect(valores.actividadCatalogoId).toBeNull();
    });
  });

  describe('crearSolicitudElemento - por tipo', () => {
    it('rechaza contextos que no están en modo creación', () => {
      expect(() =>
        crearSolicitudElemento(
          { ...contextoCreacion(TipoElementoPlanificacion.Tarea), modo: ModoEditorElementoPlanificacion.Edicion },
          VALORES,
        ),
      ).toThrowError(/no permite crear/);
    });

    it('rechaza contextos sin identidad del padre', () => {
      expect(() =>
        crearSolicitudElemento(contextoCreacion(TipoElementoPlanificacion.Tarea, null), VALORES),
      ).toThrowError(/no permite crear/);
    });

    it('crea una épica con textos opcionales normalizados a null', () => {
      const solicitud = crearSolicitudElemento(
        contextoCreacion(TipoElementoPlanificacion.Epica),
        valoresCon({ alcance: '   ', riesgos: 'Riesgo', criteriosExito: '' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.Epica,
          proyectoId: 15,
          alcance: null,
          riesgos: 'Riesgo',
          criteriosExito: null,
        }),
      );
    });

    it('crea una característica enlazada a la épica padre', () => {
      const solicitud = crearSolicitudElemento(
        contextoCreacion(TipoElementoPlanificacion.Caracteristica, 200),
        valoresCon({ alcance: '  Alcance  ' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.Caracteristica,
          epicaId: 200,
          alcance: 'Alcance',
        }),
      );
    });

    it('crea una historia enlazada a la característica padre', () => {
      const solicitud = crearSolicitudElemento(
        contextoCreacion(TipoElementoPlanificacion.Historia, 300),
        valoresCon({ objetivo: '  Obj  ', alcance: '  Alc  ', criteriosAceptacion: '  Crit  ' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.Historia,
          caracteristicaId: 300,
          objetivo: 'Obj',
          alcance: 'Alc',
          criteriosAceptacion: 'Crit',
        }),
      );
    });

    it('crea una actividad de requisito con textos opcionales', () => {
      const solicitud = crearSolicitudElemento(
        contextoCreacion(TipoElementoPlanificacion.ActividadRequisito, 400),
        valoresCon({ actividadCatalogoId: 12, prioridad: 1, discusion: '', responsable: 'Ana' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.ActividadRequisito,
          listaRequisitosId: 400,
          actividadCatalogoId: 12,
          prioridad: 1,
          discusion: null,
          responsable: 'Ana',
        }),
      );
    });

    it('crea una tarea de requisito enlazada a la actividad padre', () => {
      const solicitud = crearSolicitudElemento(
        contextoCreacion(TipoElementoPlanificacion.TareaRequisito, 500),
        valoresCon({ requisito: 'Requisito', responsable: '' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.TareaRequisito,
          actividadRequisitoId: 500,
          requisito: 'Requisito',
          responsable: null,
        }),
      );
    });

    it('exige la actividad seleccionada al crear una tarea', () => {
      expect(() =>
        crearSolicitudElemento(
          contextoCreacion(TipoElementoPlanificacion.Tarea),
          valoresCon({ actividadCatalogoId: null }),
        ),
      ).toThrowError(/catálogo requerido no fue seleccionado/);
    });

    it('convierte una fecha vacía en null entre los valores comunes', () => {
      const solicitud = crearSolicitudElemento(
        contextoCreacion(TipoElementoPlanificacion.Tarea),
        valoresCon({ fechaInicio: '', fechaFinal: '' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({ fechaInicio: null, fechaFinal: null }),
      );
    });
  });

  describe('crearActualizacionElemento - por tipo', () => {
    function detalleTipo(tipo: DetalleElementoPlanificacion['tipo']): DetalleElementoPlanificacion {
      return { ...mapearDetalleElementoPlanificacion(TAREA_DTO), tipo };
    }

    it('actualiza una épica con textos opcionales', () => {
      const solicitud = crearActualizacionElemento(
        detalleTipo(TipoElementoPlanificacion.Epica),
        valoresCon({ alcance: 'Alc', riesgos: '', criteriosExito: 'Éxito' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.Epica,
          itemTrabajoId: 783,
          numeroVersionEsperada: 2,
          alcance: 'Alc',
          riesgos: null,
          criteriosExito: 'Éxito',
        }),
      );
    });

    it('actualiza una característica recortando su alcance', () => {
      const solicitud = crearActualizacionElemento(
        detalleTipo(TipoElementoPlanificacion.Caracteristica),
        valoresCon({ alcance: '  Alc  ' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.Caracteristica,
          alcance: 'Alc',
        }),
      );
    });

    it('actualiza una historia recortando sus textos', () => {
      const solicitud = crearActualizacionElemento(
        detalleTipo(TipoElementoPlanificacion.Historia),
        valoresCon({ objetivo: '  O  ', alcance: '  A  ', criteriosAceptacion: '  C  ' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.Historia,
          objetivo: 'O',
          alcance: 'A',
          criteriosAceptacion: 'C',
        }),
      );
    });

    it('actualiza una actividad de requisito con textos opcionales', () => {
      const solicitud = crearActualizacionElemento(
        detalleTipo(TipoElementoPlanificacion.ActividadRequisito),
        valoresCon({ actividadCatalogoId: 12, prioridad: 3, discusion: 'D', responsable: '' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.ActividadRequisito,
          actividadCatalogoId: 12,
          prioridad: 3,
          discusion: 'D',
          responsable: null,
        }),
      );
    });

    it('actualiza una tarea de requisito con textos opcionales', () => {
      const solicitud = crearActualizacionElemento(
        detalleTipo(TipoElementoPlanificacion.TareaRequisito),
        valoresCon({ requisito: '', responsable: 'Beto' }),
      );

      expect(solicitud).toEqual(
        jasmine.objectContaining({
          tipo: TipoElementoPlanificacionDto.TareaRequisito,
          requisito: null,
          responsable: 'Beto',
        }),
      );
    });

    it('exige la actividad seleccionada al actualizar una tarea', () => {
      expect(() =>
        crearActualizacionElemento(
          detalleTipo(TipoElementoPlanificacion.Tarea),
          valoresCon({ actividadCatalogoId: null }),
        ),
      ).toThrowError(/catálogo requerido no fue seleccionado/);
    });
  });
});
