/** Valores serializados por el backend para identificar cada elemento de planificación. */
export enum TipoElementoPlanificacionDto {
  Epica = 'epica',
  Caracteristica = 'caracteristica',
  Historia = 'historia',
  Tarea = 'tarea',
  ListaRequisitos = 'listarequisitos',
  ActividadRequisito = 'actividadrequisito',
  TareaRequisito = 'tarearequisito',
}

/** Motivos serializados por el backend para elementos inactivos. */
export enum MotivoInactivacionElementoDto {
  Eliminacion = 'eliminacion',
  GeneracionIa = 'generarConIA',
  Legado = 'legado',
}

/** Orígenes serializados por el backend para las épicas. */
export enum OrigenEpicaDto {
  AzureDevOps = 'azureDevOps',
  Manual = 'manual',
  InteligenciaArtificial = 'inteligenciaArtificial',
  Legado = 'legado',
}

/** Motivos que impiden publicar la planificación en Azure DevOps. */
export enum MotivoBloqueoPublicacionAzureDto {
  VersionHistorica = 'versionHistorica',
  SinCaracteristicas = 'sinCaracteristicas',
  CaracteristicasSinHistorias = 'caracteristicasSinHistorias',
  HistoriasSinTareas = 'historiasSinTareas',
}

/** Refleja las acciones autorizadas por el backend para un elemento. */
export interface CapacidadesElementoPlanificacionDto {
  readonly puedeEditar: boolean;
  readonly puedeEliminar: boolean;
  readonly puedeVerHistorial: boolean;
  readonly puedeCrearHijo: boolean;
  readonly puedeGenerarHijos: boolean;
  readonly puedeSincronizar: boolean;
  readonly puedeAbrirEnAzure: boolean;
  readonly soloLectura: boolean;
}

/** Refleja una tarea incluida en una historia de usuario. */
export interface TareaPlanificacionDto {
  readonly id: number;
  readonly tipo: TipoElementoPlanificacionDto.Tarea;
  readonly titulo: string;
  readonly activo: boolean;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
  readonly fechaInactivacion: string | null;
  readonly motivoInactivacion: MotivoInactivacionElementoDto | null;
  readonly capacidades: CapacidadesElementoPlanificacionDto | null;
}

/** Refleja una historia y sus tareas. */
export interface HistoriaPlanificacionDto {
  readonly id: number;
  readonly tipo: TipoElementoPlanificacionDto.Historia;
  readonly titulo: string;
  readonly activo: boolean;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
  readonly fechaInactivacion: string | null;
  readonly motivoInactivacion: MotivoInactivacionElementoDto | null;
  readonly tareas: readonly TareaPlanificacionDto[];
  readonly capacidades: CapacidadesElementoPlanificacionDto | null;
}

/** Refleja las capacidades de una lista de requisitos. */
export interface CapacidadesListaRequisitosDto {
  readonly puedeEditar: boolean;
  readonly puedeEliminar: boolean;
  readonly puedeCrearActividad: boolean;
}

/** Refleja las capacidades de una actividad de requisito. */
export interface CapacidadesActividadRequisitoDto {
  readonly puedeEditar: boolean;
  readonly puedeEliminar: boolean;
  readonly puedeCrearTareaRequisito: boolean;
}

/** Refleja las capacidades de una tarea de requisito. */
export interface CapacidadesTareaRequisitoDto {
  readonly puedeEditar: boolean;
  readonly puedeEliminar: boolean;
}

/** Refleja una tarea asociada a una actividad de requisito. */
export interface TareaRequisitoDto {
  readonly idTareaRequisito: number;
  readonly actividadRequisitoId: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly requisito: string | null;
  readonly responsable: string | null;
  readonly fechaInicio: string | null;
  readonly fechaFinImplementacion: string | null;
  readonly numeroVersion: number;
  readonly activo: boolean;
  readonly capacidades: CapacidadesTareaRequisitoDto;
}

/** Refleja una actividad perteneciente a una lista de requisitos. */
export interface ActividadRequisitoDto {
  readonly idActividadRequisito: number;
  readonly actividadCatalogoId: number;
  readonly nombreActividad: string;
  readonly orden: number;
  readonly prioridad: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly discusion: string | null;
  readonly responsable: string | null;
  readonly fechaInicio: string | null;
  readonly fechaFinalizacion: string | null;
  readonly numeroVersion: number;
  readonly activo: boolean;
  readonly cantidadTareasRequisitos: number;
  readonly capacidades: CapacidadesActividadRequisitoDto;
  readonly tareasRequisitos: readonly TareaRequisitoDto[];
}

/** Refleja la lista de requisitos perteneciente a una característica. */
export interface ListaRequisitosDto {
  readonly idListaRequisitos: number;
  readonly caracteristicaId: number;
  readonly nombre: string;
  readonly numeroVersion: number;
  readonly activo: boolean;
  readonly cantidadActividades: number;
  readonly capacidades: CapacidadesListaRequisitosDto;
  readonly actividades: readonly ActividadRequisitoDto[];
}

/** Refleja una característica con sus historias y requisitos. */
export interface CaracteristicaPlanificacionDto {
  readonly id: number;
  readonly tipo: TipoElementoPlanificacionDto.Caracteristica;
  readonly titulo: string;
  readonly activo: boolean;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
  readonly fechaInactivacion: string | null;
  readonly motivoInactivacion: MotivoInactivacionElementoDto | null;
  readonly historias: readonly HistoriaPlanificacionDto[];
  readonly listaRequisitos: ListaRequisitosDto | null;
  readonly capacidades: CapacidadesElementoPlanificacionDto | null;
}

/** Refleja una épica con la jerarquía entregada por ObtenerBacklog. */
export interface EpicaPlanificacionDto {
  readonly id: number;
  readonly tipo: TipoElementoPlanificacionDto.Epica;
  readonly titulo: string;
  readonly activo: boolean;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
  readonly fechaInactivacion: string | null;
  readonly motivoInactivacion: MotivoInactivacionElementoDto | null;
  readonly origen: OrigenEpicaDto;
  readonly esPrincipal: boolean;
  readonly azureWorkItemId: number | null;
  readonly urlAzure: string | null;
  readonly capacidades: CapacidadesElementoPlanificacionDto;
  readonly caracteristicas: readonly CaracteristicaPlanificacionDto[];
}

/** Refleja el resumen cuantitativo entregado por ObtenerBacklog. */
export interface ResumenPlanificacionProyectoDto {
  readonly totalCaracteristicas: number;
  readonly totalHistorias: number;
  readonly totalTareas: number;
  readonly totalEpicas: number;
}

/** Refleja un bloqueo de publicación entregado por el backend. */
export interface BloqueoPublicacionAzureDto {
  readonly motivo: MotivoBloqueoPublicacionAzureDto;
  readonly cantidad: number;
}

/** Refleja la disponibilidad de publicación calculada por el backend. */
export interface DisponibilidadPublicacionAzureDto {
  readonly puedePublicar: boolean;
  readonly bloqueos: readonly BloqueoPublicacionAzureDto[];
}

/** Refleja la respuesta completa de ObtenerBacklog. */
export interface PlanificacionProyectoDto {
  readonly proyectoId: number;
  readonly nombreProyecto: string;
  readonly versionBacklogId: number;
  readonly numeroVersion: number;
  readonly esHistorica: boolean;
  readonly resumen: ResumenPlanificacionProyectoDto;
  readonly publicacionAzure: DisponibilidadPublicacionAzureDto;
  readonly epicas?: readonly EpicaPlanificacionDto[] | null;
}
