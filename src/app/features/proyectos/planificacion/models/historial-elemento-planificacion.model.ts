import { TipoElementoPlanificacion } from './planificacion-proyecto.model';

/** Identifica las vistas disponibles dentro del diálogo consultivo. */
export enum PestanaElementoPlanificacion {
  Detalle = 'detalle',
  Historial = 'historial',
}

/** Tipos cuyo detalle histórico está respaldado por ObtenerVersionWorkItem. */
export type TipoElementoVersionable =
  | TipoElementoPlanificacion.Epica
  | TipoElementoPlanificacion.Caracteristica
  | TipoElementoPlanificacion.Historia
  | TipoElementoPlanificacion.Tarea;

export interface VersionElementoResumen {
  readonly versionId: number;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
}

export interface HistorialElementoPlanificacion {
  readonly registros: readonly VersionElementoResumen[];
  readonly siguienteCursor: number | null;
  readonly hayMas: boolean;
}

interface VersionElementoBase {
  readonly tipo: TipoElementoVersionable;
  readonly versionId: number;
  readonly elementoId: number;
  readonly numeroVersion: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly estimacionHoras: number;
  readonly fechaInicio: string;
  readonly fechaFinal: string;
  readonly fechaCreacion: string;
}

export interface VersionEpica extends VersionElementoBase {
  readonly tipo: TipoElementoPlanificacion.Epica;
  readonly alcance: string;
  readonly riesgos: string;
  readonly criteriosExito: string;
  readonly prioridadCatalogoId: number | null;
  readonly riesgoCatalogoId: number | null;
}

export interface VersionCaracteristica extends VersionElementoBase {
  readonly tipo: TipoElementoPlanificacion.Caracteristica;
  readonly alcance: string;
}

export interface VersionHistoria extends VersionElementoBase {
  readonly tipo: TipoElementoPlanificacion.Historia;
  readonly objetivo: string;
  readonly alcance: string;
  readonly criteriosAceptacion: string;
}

export interface VersionTarea extends VersionElementoBase {
  readonly tipo: TipoElementoPlanificacion.Tarea;
  readonly dependencias: string;
  readonly actividadCatalogoId: number;
  readonly complejidad: number;
}

/** Contiene el contenido inmutable de una versión anterior. */
export type VersionElementoPlanificacion =
  | VersionEpica
  | VersionCaracteristica
  | VersionHistoria
  | VersionTarea;

/** Restringe la consulta histórica a los tipos soportados por el contrato vigente. */
export function esTipoElementoVersionable(
  tipo: TipoElementoPlanificacion,
): tipo is TipoElementoVersionable {
  return (
    tipo === TipoElementoPlanificacion.Epica ||
    tipo === TipoElementoPlanificacion.Caracteristica ||
    tipo === TipoElementoPlanificacion.Historia ||
    tipo === TipoElementoPlanificacion.Tarea
  );
}
