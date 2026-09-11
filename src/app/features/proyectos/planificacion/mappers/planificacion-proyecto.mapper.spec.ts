import { mapearPlanificacionProyecto } from './planificacion-proyecto.mapper';
import {
  MotivoBloqueoPublicacionAzureDto,
  OrigenEpicaDto,
  TipoElementoPlanificacionDto,
  type CapacidadesElementoPlanificacionDto,
  type PlanificacionProyectoDto,
} from '../models/planificacion-proyecto.dto';
import {
  MotivoBloqueoPublicacionAzure,
  TipoElementoPlanificacion,
} from '../models/planificacion-proyecto.model';

describe('mapearPlanificacionProyecto', () => {
  it('adapta la identidad, la versión y los totales de la planificación', () => {
    expect(mapearPlanificacionProyecto(PLANIFICACION_DTO)).toEqual({
      proyectoId: 42,
      nombre: 'Sistema de envíos',
      versionId: 81,
      numeroVersion: 4,
      esHistorica: false,
      elementos: [],
      resumen: {
        epicas: 1,
        caracteristicas: 2,
        historias: 3,
        tareas: 5,
        totalElementos: 11,
      },
      publicacionAzure: {
        puedePublicar: false,
        bloqueos: [],
      },
    });
  });

  it('adapta los bloqueos de publicación entregados por el backend', () => {
    const resultado = mapearPlanificacionProyecto({
      ...PLANIFICACION_DTO,
      publicacionAzure: {
        puedePublicar: false,
        bloqueos: [
          {
            motivo: MotivoBloqueoPublicacionAzureDto.HistoriasSinTareas,
            cantidad: 3,
          },
        ],
      },
    });

    expect(resultado.publicacionAzure).toEqual({
      puedePublicar: false,
      bloqueos: [{ motivo: MotivoBloqueoPublicacionAzure.HistoriasSinTareas, cantidad: 3 }],
    });
  });

  it('construye la jerarquía aunque los nodos de requisitos no incluyan discriminador', () => {
    const resultado = mapearPlanificacionProyecto(PLANIFICACION_JERARQUICA_DTO);
    const epica = resultado.elementos[0];
    const caracteristica = epica.hijos[0];
    const [listaRequisitos, historia] = caracteristica.hijos;
    const actividad = listaRequisitos.hijos[0];

    expect(epica).toEqual(
      jasmine.objectContaining({
        clave: 'epica:1',
        tipo: TipoElementoPlanificacion.Epica,
        vinculadaAzure: true,
        capacidades: jasmine.objectContaining({
          puedeEditar: true,
          puedeEliminar: true,
          puedeCrearHijo: true,
          puedeSincronizar: true,
          soloLectura: false,
        }),
      }),
    );
    expect(caracteristica.tipo).toBe(TipoElementoPlanificacion.Caracteristica);
    expect(listaRequisitos.tipo).toBe(TipoElementoPlanificacion.ListaRequisitos);
    expect(listaRequisitos.capacidades).toEqual(
      jasmine.objectContaining({
        puedeConsultar: true,
        puedeEditar: true,
        puedeEliminar: true,
        puedeCrearHijo: true,
        soloLectura: false,
      }),
    );
    expect(actividad.tipo).toBe(TipoElementoPlanificacion.ActividadRequisito);
    expect(actividad.capacidades.puedeEliminar).toBe(true);
    expect(actividad.hijos[0].tipo).toBe(TipoElementoPlanificacion.TareaRequisito);
    expect(actividad.hijos[0].capacidades.puedeEliminar).toBe(true);
    expect(actividad.hijos[0].terminosBusqueda).toEqual(['Cobertura contractual']);
    expect(historia.tipo).toBe(TipoElementoPlanificacion.Historia);
    expect(historia.hijos[0].tipo).toBe(TipoElementoPlanificacion.Tarea);
  });
  it('mantiene creación y sincronización en una épica Azure vigente de solo lectura', () => {
    const epicaAzure = PLANIFICACION_JERARQUICA_DTO.epicas?.[0];
    if (!epicaAzure) throw new Error('La prueba requiere una épica Azure.');
    const capacidadesSoloLectura = {
      ...CAPACIDADES,
      puedeEditar: false,
      puedeEliminar: false,
      puedeCrearHijo: false,
      puedeSincronizar: false,
      soloLectura: true,
    };
    const dto = {
      ...PLANIFICACION_JERARQUICA_DTO,
      epicas: [{ ...epicaAzure, capacidades: capacidadesSoloLectura }],
    };

    const actual = mapearPlanificacionProyecto(dto).elementos[0];
    const historica = mapearPlanificacionProyecto({ ...dto, esHistorica: true }).elementos[0];

    expect(actual.capacidades).toEqual(
      jasmine.objectContaining({
        puedeEditar: false,
        puedeEliminar: false,
        puedeCrearHijo: true,
        puedeSincronizar: true,
        soloLectura: true,
      }),
    );
    expect(historica.capacidades).toEqual(
      jasmine.objectContaining({
        puedeCrearHijo: false,
        puedeSincronizar: false,
      }),
    );
  });
});

const PLANIFICACION_DTO: PlanificacionProyectoDto = {
  proyectoId: 42,
  nombreProyecto: 'Sistema de envíos',
  versionBacklogId: 81,
  numeroVersion: 4,
  esHistorica: false,
  resumen: {
    totalEpicas: 1,
    totalCaracteristicas: 2,
    totalHistorias: 3,
    totalTareas: 5,
  },
  publicacionAzure: { puedePublicar: false, bloqueos: [] },
  epicas: null,
};

const CAPACIDADES: CapacidadesElementoPlanificacionDto = {
  puedeEditar: true,
  puedeEliminar: true,
  puedeVerHistorial: true,
  puedeCrearHijo: true,
  puedeGenerarHijos: true,
  puedeSincronizar: false,
  puedeAbrirEnAzure: false,
  soloLectura: false,
};

const PLANIFICACION_JERARQUICA_DTO: PlanificacionProyectoDto = {
  ...PLANIFICACION_DTO,
  epicas: [
    {
      id: 1,
      tipo: TipoElementoPlanificacionDto.Epica,
      titulo: 'Épica principal',
      activo: true,
      numeroVersion: 1,
      fechaCreacion: '2026-09-01T08:00:00',
      fechaInactivacion: null,
      motivoInactivacion: null,
      origen: OrigenEpicaDto.AzureDevOps,
      esPrincipal: true,
      azureWorkItemId: 100,
      urlAzure: 'https://dev.azure.com/organizacion/proyecto/_workitems/edit/100',
      capacidades: { ...CAPACIDADES, puedeSincronizar: true },
      caracteristicas: [
        {
          id: 2,
          tipo: TipoElementoPlanificacionDto.Caracteristica,
          titulo: 'Registro de entregas',
          activo: true,
          numeroVersion: 1,
          fechaCreacion: '2026-09-01T08:00:00',
          fechaInactivacion: null,
          motivoInactivacion: null,
          capacidades: CAPACIDADES,
          listaRequisitos: {
            idListaRequisitos: 3,
            caracteristicaId: 2,
            nombre: 'Lista de requisitos',
            numeroVersion: 1,
            activo: true,
            cantidadActividades: 1,
            capacidades: {
              puedeEditar: true,
              puedeEliminar: true,
              puedeCrearActividad: true,
            },
            actividades: [
              {
                idActividadRequisito: 4,
                actividadCatalogoId: 20,
                nombreActividad: 'Análisis',
                orden: 1,
                prioridad: 1,
                titulo: 'Analizar cobertura',
                descripcion: '',
                discusion: null,
                responsable: null,
                fechaInicio: null,
                fechaFinalizacion: null,
                numeroVersion: 1,
                activo: true,
                cantidadTareasRequisitos: 1,
                capacidades: {
                  puedeEditar: true,
                  puedeEliminar: true,
                  puedeCrearTareaRequisito: true,
                },
                tareasRequisitos: [
                  {
                    idTareaRequisito: 5,
                    actividadRequisitoId: 4,
                    titulo: 'Validar cobertura',
                    descripcion: '',
                    requisito: 'Cobertura contractual',
                    responsable: null,
                    fechaInicio: null,
                    fechaFinImplementacion: null,
                    numeroVersion: 1,
                    activo: true,
                    capacidades: { puedeEditar: true, puedeEliminar: true },
                  },
                ],
              },
            ],
          },
          historias: [
            {
              id: 6,
              tipo: TipoElementoPlanificacionDto.Historia,
              titulo: 'Registrar una entrega',
              activo: true,
              numeroVersion: 1,
              fechaCreacion: '2026-09-01T08:00:00',
              fechaInactivacion: null,
              motivoInactivacion: null,
              capacidades: CAPACIDADES,
              tareas: [
                {
                  id: 7,
                  tipo: TipoElementoPlanificacionDto.Tarea,
                  titulo: 'Crear formulario',
                  activo: true,
                  numeroVersion: 1,
                  fechaCreacion: '2026-09-01T08:00:00',
                  fechaInactivacion: null,
                  motivoInactivacion: null,
                  capacidades: CAPACIDADES,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
