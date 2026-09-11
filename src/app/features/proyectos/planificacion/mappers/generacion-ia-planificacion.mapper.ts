import {
  NivelGeneracionIaPlanificacionDto,
  type ResultadoGeneracionIaPlanificacionDto,
  type SolicitudGeneracionIaPlanificacionDto,
} from '../models/generacion-ia-planificacion.dto';
import {
  NivelGeneracionIaPlanificacion,
  type ResultadoGeneracionIaPlanificacion,
} from '../models/generacion-ia-planificacion.model';

/** Construye el contrato exacto que recibe la generación de elementos mediante IA. */
export function crearSolicitudGeneracionIaPlanificacion(
  proyectoId: number,
  nivel: NivelGeneracionIaPlanificacion,
): SolicitudGeneracionIaPlanificacionDto {
  return { proyectoId, nivel: mapearNivelADto(nivel) };
}

/** Adapta el resultado remoto a la identidad utilizada por planificación. */
export function mapearResultadoGeneracionIaPlanificacion(
  dto: ResultadoGeneracionIaPlanificacionDto,
): ResultadoGeneracionIaPlanificacion {
  return {
    proyectoId: dto.proyectoId,
    nivel: mapearNivelDesdeDto(dto.nivel),
    totalCreados: dto.totalCreados,
    mensaje: dto.mensaje,
  };
}

function mapearNivelADto(
  nivel: NivelGeneracionIaPlanificacion,
): NivelGeneracionIaPlanificacionDto {
  switch (nivel) {
    case NivelGeneracionIaPlanificacion.Epicas:
      return NivelGeneracionIaPlanificacionDto.Epicas;
    case NivelGeneracionIaPlanificacion.Caracteristicas:
      return NivelGeneracionIaPlanificacionDto.Caracteristicas;
    case NivelGeneracionIaPlanificacion.Historias:
      return NivelGeneracionIaPlanificacionDto.Historias;
    case NivelGeneracionIaPlanificacion.Tareas:
      return NivelGeneracionIaPlanificacionDto.Tareas;
  }
}

function mapearNivelDesdeDto(
  nivel: NivelGeneracionIaPlanificacionDto,
): NivelGeneracionIaPlanificacion {
  switch (nivel) {
    case NivelGeneracionIaPlanificacionDto.Epicas:
      return NivelGeneracionIaPlanificacion.Epicas;
    case NivelGeneracionIaPlanificacionDto.Caracteristicas:
      return NivelGeneracionIaPlanificacion.Caracteristicas;
    case NivelGeneracionIaPlanificacionDto.Historias:
      return NivelGeneracionIaPlanificacion.Historias;
    case NivelGeneracionIaPlanificacionDto.Tareas:
      return NivelGeneracionIaPlanificacion.Tareas;
    default:
      throw new Error(`Nivel de generación mediante IA no compatible: ${String(nivel)}.`);
  }
}
