import type { CatalogoProyectoResumenDto } from '../../models/catalogo-proyecto-resumen.dto';
import { VinculacionAzureDto, VinculacionAzureSolicitudDto } from './vinculacion-azure.dto';

/** Representa el comando esperado para crear un borrador de proyecto. */
export interface CrearBorradorProyectoSolicitudDto {
  vinculacionAzure: VinculacionAzureSolicitudDto;
}

/** Describe un insumo asociado a la definición del proyecto. */
export interface InsumoProyectoDto {
  id: number;
  tipo: 'arquitectura' | 'figma';
  nombre: string;
  tipoContenido: string;
  tamanoBytes: number;
  hashSha256: string;
  estadoProcesamiento: 'pendiente' | 'procesando' | 'procesado' | 'fallido';
  codigoErrorProcesamiento: string | null;
  urlReferencia: string | null;
  fechaCreacion: string;
}

/** Refleja el borrador completo entregado por el backend. */
export interface BorradorProyectoDto {
  proyectoId: number;
  revision: number;
  pasoActual: number;
  nombre: string;
  responsable: string;
  descripcion: string;
  prioridadCatalogoId: number | null;
  prioridadCodigo: string | null;
  estadoCatalogoId: number | null;
  estadoCodigo: string | null;
  fechaObjetivo: string | null;
  tipoSolucionJson: string;
  necesidadJson: string;
  objetivosJson: string;
  alcanceJson: string;
  rolesJson: string;
  equipoJson: string;
  diagramFlujoJson: string;
  fechaUltimoGuardado: string;
  azure: VinculacionAzureDto | null;
  insumos: readonly InsumoProyectoDto[];
}

/** Representa el borrador devuelto después de confirmar Azure. */
export type CrearBorradorProyectoRespuestaDto = BorradorProyectoDto;

/** Representa la fotografía completa requerida para actualizar un borrador. */
export interface ActualizarBorradorProyectoSolicitudDto {
  proyectoId: number;
  revisionEsperada: number;
  pasoActual: number;
  nombre: string;
  responsable: string;
  descripcion: string;
  prioridadCatalogoId: number | null;
  estadoCatalogoId: number | null;
  fechaObjetivo: string | null;
  tipoSolucionJson: string;
  necesidadJson: string;
  objetivosJson: string;
  alcanceJson: string;
  rolesJson: string;
  equipoJson: string;
  diagramFlujoJson: string;
}

/** Representa el comando que convierte el borrador vigente en un proyecto guardado. */
export interface GuardarProyectoSolicitudDto {
  readonly proyectoId: number;
  readonly revisionEsperada: number;
}

/** Refleja la fotografía definitiva entregada después de guardar el proyecto. */
export interface GuardarProyectoRespuestaDto {
  readonly id: number;
  readonly nombre: string;
  readonly responsable: string;
  readonly descripcion: string;
  readonly prioridadCatalogoId: number;
  readonly prioridadCatalogo: CatalogoProyectoResumenDto;
  readonly estadoCatalogoId: number;
  readonly estadoCatalogo: CatalogoProyectoResumenDto;
  readonly fechaObjetivo: string;
  readonly numeroVersionActual: number;
  readonly tipoSolucionJson: string;
  readonly necesidadJson: string;
  readonly objetivosJson: string;
  readonly alcanceJson: string;
  readonly rolesJson: string;
  readonly equipoJson: string;
  readonly diagramFlujoJson: string;
}
