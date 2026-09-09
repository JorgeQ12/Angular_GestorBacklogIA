import type {
  ResultadoPublicacionAzurePlanificacionDto,
  SolicitudPublicacionAzurePlanificacionDto,
} from '../models/publicacion-azure-planificacion.dto';
import type { ResultadoPublicacionAzurePlanificacion } from '../models/publicacion-azure-planificacion.model';

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
