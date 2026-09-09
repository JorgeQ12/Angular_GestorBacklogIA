import {
  OrigenVersionPlanificacionDto,
  type VersionPlanificacionDto,
} from '../models/version-planificacion.dto';
import {
  OrigenVersionPlanificacion,
  type VersionPlanificacion,
} from '../models/version-planificacion.model';

/** Adapta el historial integral entregado por el backend. */
export function mapearVersionesPlanificacion(
  versiones: readonly VersionPlanificacionDto[],
): readonly VersionPlanificacion[] {
  return versiones.map(mapearVersionPlanificacion);
}

function mapearVersionPlanificacion(dto: VersionPlanificacionDto): VersionPlanificacion {
  return {
    id: dto.id,
    numero: dto.numeroVersion,
    fechaInicio: dto.fechaInicio,
    fechaCierre: dto.fechaCierre,
    origen: mapearOrigenVersion(dto.origen),
    esActual: dto.esActual,
  };
}

function mapearOrigenVersion(origen: OrigenVersionPlanificacionDto): OrigenVersionPlanificacion {
  switch (origen) {
    case OrigenVersionPlanificacionDto.Inicial:
      return OrigenVersionPlanificacion.Inicial;
    case OrigenVersionPlanificacionDto.GeneracionCaracteristicas:
      return OrigenVersionPlanificacion.GeneracionCaracteristicas;
    case OrigenVersionPlanificacionDto.GeneracionHistorias:
      return OrigenVersionPlanificacion.GeneracionHistorias;
    case OrigenVersionPlanificacionDto.GeneracionTareas:
      return OrigenVersionPlanificacion.GeneracionTareas;
    case OrigenVersionPlanificacionDto.GeneracionEpicas:
      return OrigenVersionPlanificacion.GeneracionEpicas;
    case OrigenVersionPlanificacionDto.ReemplazoManual:
      return OrigenVersionPlanificacion.ReemplazoManual;
    case OrigenVersionPlanificacionDto.SincronizacionAzure:
      return OrigenVersionPlanificacion.SincronizacionAzure;
    default:
      throw new Error(`Origen de versión de planificación no compatible: ${String(origen)}.`);
  }
}
