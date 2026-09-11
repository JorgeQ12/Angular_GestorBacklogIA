import type {
  ResultadoPublicacionAzurePlanificacionDto,
  SolicitudPublicacionAzurePlanificacionDto,
} from '../models/publicacion-azure-planificacion.dto';
import type { ResultadoPublicacionAzurePlanificacion } from '../models/publicacion-azure-planificacion.model';
import { TipoElementoPlanificacionDto } from '../models/planificacion-proyecto.dto';

const TIPOS_ITEM_TRABAJO = new Set<string>(Object.values(TipoElementoPlanificacionDto));

/** Construye el cuerpo mínimo aceptado por el endpoint de publicación. */
export function crearSolicitudPublicacionAzurePlanificacion(
  proyectoId: number,
): SolicitudPublicacionAzurePlanificacionDto {
  return { proyectoId };
}

/** Adapta la respuesta remota al resumen utilizado por la interfaz. */
export function mapearResultadoPublicacionAzurePlanificacion(
  dto: ResultadoPublicacionAzurePlanificacionDto,
): ResultadoPublicacionAzurePlanificacion {
  dto.workItems.forEach((workItem) => exigirTipoEntidad(workItem.tipoEntidad));

  return {
    organizacion: dto.organizacion,
    proyecto: dto.proyectoAzure,
    area: dto.areaPath,
    fechaInicio: dto.fechaInicioPublicacion,
    totalElementos: dto.totalWorkItems,
    totalEpicas: dto.totalEpicas,
    totalCaracteristicas: dto.totalCaracteristicas,
    totalHistorias: dto.totalHistoriasUsuario,
    totalTareas: dto.totalTareas,
  };
}

function exigirTipoEntidad(tipo: unknown): asserts tipo is TipoElementoPlanificacionDto {
  if (typeof tipo !== 'string' || !TIPOS_ITEM_TRABAJO.has(tipo)) {
    throw new Error(`Tipo de entidad publicada no compatible: ${String(tipo)}.`);
  }
}
