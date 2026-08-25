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

/** Refleja el borrador completo creado por el backend. */
export interface CrearBorradorProyectoRespuestaDto {
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
