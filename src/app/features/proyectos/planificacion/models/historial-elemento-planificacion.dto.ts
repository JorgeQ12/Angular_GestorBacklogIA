import { OrigenEpicaDto, TipoElementoPlanificacionDto } from './planificacion-proyecto.dto';

/** Resume una versión anterior dentro de la página de historial. */
export interface VersionElementoResumenDto {
  readonly versionId: number;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
  readonly esActual: boolean;
}

/** Refleja la página cursorizada entregada por ObtenerHistorialWorkItem. */
export interface HistorialElementoPlanificacionDto {
  readonly registros: readonly VersionElementoResumenDto[];
  readonly siguienteCursor: number | null;
  readonly hayMas: boolean;
}

interface VersionElementoBaseDto {
  readonly versionId: number;
  readonly itemTrabajoId: number;
  readonly numeroVersion: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly estimacionHoras: number;
  readonly fechaInicio: string;
  readonly fechaFinal: string;
  readonly fechaCreacion: string;
  readonly esActual: boolean;
}

/** Refleja una versión histórica de épica entregada por el backend. */
export interface VersionEpicaDto extends VersionElementoBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Epica;
  readonly origen: OrigenEpicaDto;
  readonly alcance: string | null;
  readonly riesgos: string | null;
  readonly criteriosExito: string | null;
  readonly prioridadCatalogoId: number | null;
  readonly riesgoCatalogoId: number | null;
  readonly estadoExterno: string | null;
  readonly areaPath: string | null;
  readonly iterationPath: string | null;
  readonly azureRevision: number | null;
  readonly autorCambio: string | null;
  readonly fechaEfectiva: string | null;
}

/** Refleja una versión histórica de característica entregada por el backend. */
export interface VersionCaracteristicaDto extends VersionElementoBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Caracteristica;
  readonly alcance: string;
}

/** Refleja una versión histórica de historia entregada por el backend. */
export interface VersionHistoriaDto extends VersionElementoBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Historia;
  readonly objetivo: string;
  readonly alcance: string;
  readonly criteriosAceptacion: string;
}

/** Refleja una versión histórica de tarea entregada por el backend. */
export interface VersionTareaDto extends VersionElementoBaseDto {
  readonly tipo: TipoElementoPlanificacionDto.Tarea;
  readonly dependencias: string;
  readonly actividadCatalogoId: number;
  readonly complejidad: number;
}

/** Refleja las cuatro variantes históricas admitidas actualmente por el backend. */
export type VersionElementoPlanificacionDto =
  VersionEpicaDto | VersionCaracteristicaDto | VersionHistoriaDto | VersionTareaDto;
