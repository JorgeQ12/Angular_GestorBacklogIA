/** Identifica cada categoría renderizable dentro del árbol de planificación. */
export enum TipoElementoPlanificacion {
  Epica = 'epica',
  Caracteristica = 'caracteristica',
  ListaRequisitos = 'lista-requisitos',
  ActividadRequisito = 'actividad-requisito',
  TareaRequisito = 'tarea-requisito',
  Historia = 'historia',
  Tarea = 'tarea',
}

/** Expone las operaciones vigentes que el backend autoriza sobre un elemento del árbol. */
export interface CapacidadesElementoPlanificacion {
  readonly puedeConsultar: boolean;
  readonly puedeEditar: boolean;
  readonly puedeEliminar: boolean;
  readonly puedeCrearHijo: boolean;
  readonly puedeSincronizar: boolean;
  readonly soloLectura: boolean;
}

/** Contiene la información común que necesita un elemento del árbol. */
export interface ElementoPlanificacion {
  readonly clave: string;
  readonly id: number;
  readonly tipo: TipoElementoPlanificacion;
  readonly titulo: string;
  readonly detalle: string | null;
  readonly terminosBusqueda: readonly string[];
  readonly activo: boolean;
  readonly numeroVersion: number;
  readonly vinculadaAzure: boolean;
  readonly capacidades: CapacidadesElementoPlanificacion;
  readonly hijos: readonly ElementoPlanificacion[];
}

/** Resume los elementos que integran la planificación de un proyecto. */
export interface ResumenPlanificacionProyecto {
  readonly epicas: number;
  readonly caracteristicas: number;
  readonly historias: number;
  readonly tareas: number;
  readonly totalElementos: number;
}

/** Identifica la condición funcional que debe resolverse antes de publicar en Azure DevOps. */
export enum MotivoBloqueoPublicacionAzure {
  VersionHistorica = 'versionHistorica',
  SinCaracteristicas = 'sinCaracteristicas',
  CaracteristicasSinHistorias = 'caracteristicasSinHistorias',
  HistoriasSinTareas = 'historiasSinTareas',
}

/** Describe una condición que impide publicar la planificación vigente. */
export interface BloqueoPublicacionAzure {
  readonly motivo: MotivoBloqueoPublicacionAzure;
  readonly cantidad: number;
}

/** Expone la decisión de publicación calculada por el backend. */
export interface DisponibilidadPublicacionAzure {
  readonly puedePublicar: boolean;
  readonly bloqueos: readonly BloqueoPublicacionAzure[];
}

/** Contiene la identidad y el resumen necesarios para componer la página de planificación. */
export interface PlanificacionProyecto {
  readonly proyectoId: number;
  readonly nombre: string;
  readonly versionId: number;
  readonly numeroVersion: number;
  readonly esHistorica: boolean;
  readonly resumen: ResumenPlanificacionProyecto;
  readonly publicacionAzure: DisponibilidadPublicacionAzure;
  readonly elementos: readonly ElementoPlanificacion[];
}
