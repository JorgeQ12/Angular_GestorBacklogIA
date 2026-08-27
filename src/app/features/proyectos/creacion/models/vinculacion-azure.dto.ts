/** Representa los datos exigidos por Azure para validar el punto de partida. */
export interface VinculacionAzureSolicitudDto {
  boardUrl: string;
  epicaAzureId: number;
  teamId: string | null;
}

/** Describe un integrante recuperado desde el equipo de Azure. */
export interface MiembroEquipoAzureDto {
  id: string;
  nombre: string;
  correo: string | null;
  esAdministrador: boolean;
}

/** Describe una revisión histórica de la épica vinculada. */
export interface RevisionEpicaAzureDto {
  revision: number;
  titulo: string;
  descripcion: string;
  estado: string | null;
  areaPath: string | null;
  iterationPath: string | null;
  autorCambio: string | null;
  fechaCambio: string;
  camposJson: string;
}

/** Refleja la vinculación con Azure proporcionada por el backend. */
export interface VinculacionAzureDto {
  organizacion: string;
  proyectoAzureId: string;
  proyectoAzureNombre: string;
  teamId: string;
  teamNombre: string;
  boardUrl: string;
  areaPath: string | null;
  iterationPath: string | null;
  epicaAzureId: number;
  tipoWorkItemEpica: string;
  urlEpica: string;
  miembros: readonly MiembroEquipoAzureDto[];
  revisiones: readonly RevisionEpicaAzureDto[];
}

/** Refleja la respuesta de la validación previa en Azure. */
export type ValidarVinculacionAzureRespuestaDto = VinculacionAzureDto;

/** Refleja la membresía renovada desde el Team vinculado en Azure. */
export interface SincronizarEquipoAzureRespuestaDto {
  teamId: string;
  teamNombre: string;
  miembros: readonly MiembroEquipoAzureDto[];
  grupos: readonly MiembroEquipoAzureDto[];
  fechaSincronizacion: string;
}
