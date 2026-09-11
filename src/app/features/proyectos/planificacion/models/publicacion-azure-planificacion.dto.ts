import type { TipoElementoPlanificacionDto } from './planificacion-proyecto.dto';

/** Cuerpo contractual requerido para publicar la planificación en Azure DevOps. */
export interface SolicitudPublicacionAzurePlanificacionDto {
  readonly proyectoId: number;
  readonly fechaInicioPublicacion?: string | null;
  readonly areaPath?: string | null;
}

/** Refleja un work item creado o actualizado durante la publicación. */
export interface WorkItemPublicadoAzureDto {
  readonly tipoEntidad: TipoElementoPlanificacionDto;
  readonly entidadId: number;
  readonly versionId: number;
  readonly titulo: string;
  readonly tipoWorkItemAzure: string;
  readonly azureWorkItemId: number;
  readonly azureRevision: number;
  readonly url: string;
  readonly fechaInicio: string;
  readonly fechaFinal: string;
}

/** Refleja la respuesta contractual de la publicación en Azure DevOps. */
export interface ResultadoPublicacionAzurePlanificacionDto {
  readonly organizacion: string;
  readonly proyectoAzure: string;
  readonly areaPath: string;
  readonly fechaInicioPublicacion: string;
  readonly tipoHistoriaUsuarioAzure: string;
  readonly totalWorkItems: number;
  readonly totalCaracteristicas: number;
  readonly totalHistoriasUsuario: number;
  readonly totalTareas: number;
  readonly workItems: readonly WorkItemPublicadoAzureDto[];
  readonly totalEpicas: number;
}
