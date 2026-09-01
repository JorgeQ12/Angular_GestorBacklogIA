import type { CatalogoProyectoResumenDto } from '../../models/catalogo-proyecto-resumen.dto';

/** Refleja el resumen de Azure entregado por ObtenerProyecto. */
export interface VinculacionAzureProyectoResumenDto {
  readonly organizacion: string;
  readonly proyectoAzureNombre: string;
  readonly teamNombre: string;
  readonly boardUrl: string;
  readonly epicaAzureId: number;
  readonly urlEpica: string;
  readonly tituloEpica: string;
}

/** Refleja la fotografía vigente entregada por ObtenerProyecto. */
export interface ProyectoInformacionDto {
  readonly id: number;
  readonly versionActualId: number;
  readonly nombre: string;
  readonly responsable: string;
  readonly descripcion: string;
  readonly prioridadCatalogoId: number;
  readonly prioridadCatalogo: CatalogoProyectoResumenDto;
  readonly estadoCatalogoId: number;
  readonly estadoCatalogo: CatalogoProyectoResumenDto;
  readonly fechaObjetivo: string | null;
  readonly numeroVersionActual: number;
  readonly tipoSolucionJson: string;
  readonly necesidadJson: string;
  readonly objetivosJson: string;
  readonly alcanceJson: string;
  readonly rolesJson: string;
  readonly equipoJson: string;
  readonly diagramFlujoJson: string;
  readonly azure: VinculacionAzureProyectoResumenDto | null;
}

/** Refleja una opción del historial entregado por ObtenerVersionesProyecto. */
export interface VersionProyectoResumenDto {
  readonly id: number;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
  readonly esActual: boolean;
}

/** Refleja una fotografía histórica entregada por ObtenerVersionProyecto. */
export interface VersionProyectoDto {
  readonly id: number;
  readonly proyectoId: number;
  readonly numeroVersion: number;
  readonly fechaCreacion: string;
  readonly esActual: boolean;
  readonly nombre: string;
  readonly responsable: string;
  readonly descripcion: string;
  readonly prioridadCatalogoId: number;
  readonly prioridadCatalogo: CatalogoProyectoResumenDto;
  readonly estadoCatalogoId: number;
  readonly estadoCatalogo: CatalogoProyectoResumenDto;
  readonly fechaObjetivo: string | null;
  readonly tipoSolucionJson: string;
  readonly necesidadJson: string;
  readonly objetivosJson: string;
  readonly alcanceJson: string;
  readonly rolesJson: string;
  readonly equipoJson: string;
  readonly diagramFlujoJson: string;
  readonly insumosJson: string;
}

/** Refleja el comando integral requerido por ActualizarProyecto. */
export interface ActualizarProyectoSolicitudDto {
  readonly id: number;
  readonly versionActualIdEsperada: number;
  readonly nombre: string;
  readonly responsable: string;
  readonly descripcion: string;
  readonly prioridadCatalogoId: number;
  readonly estadoCatalogoId: number;
  readonly fechaObjetivo: string | null;
  readonly tipoSolucionJson: string;
  readonly necesidadJson: string;
  readonly objetivosJson: string;
  readonly alcanceJson: string;
  readonly rolesJson: string;
  readonly equipoJson: string;
  readonly diagramFlujoJson: string;
}

/** Refleja la nueva fotografía vigente; Azure permanece asociado al proyecto. */
export type ActualizarProyectoRespuestaDto = Omit<ProyectoInformacionDto, 'azure'>;
