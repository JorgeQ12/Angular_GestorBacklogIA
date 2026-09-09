import type {
  HistorialElementoPlanificacionDto,
  VersionElementoPlanificacionDto,
} from '../models/historial-elemento-planificacion.dto';
import type {
  HistorialElementoPlanificacion,
  VersionElementoPlanificacion,
} from '../models/historial-elemento-planificacion.model';
import { TipoElementoPlanificacionDto } from '../models/planificacion-proyecto.dto';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';

/** Adapta la página cursorizada sin trasladar el contrato HTTP a la interfaz. */
export function mapearHistorialElementoPlanificacion(
  dto: HistorialElementoPlanificacionDto,
): HistorialElementoPlanificacion {
  return {
    registros: dto.registros.map((version) => ({
      versionId: version.versionId,
      numeroVersion: version.numeroVersion,
      fechaCreacion: version.fechaCreacion,
    })),
    siguienteCursor: dto.siguienteCursor,
    hayMas: dto.hayMas,
  };
}

/** Convierte exhaustivamente el contenido de una versión anterior. */
export function mapearVersionElementoPlanificacion(
  dto: VersionElementoPlanificacionDto,
): VersionElementoPlanificacion {
  const base = {
    versionId: dto.versionId,
    elementoId: dto.itemTrabajoId,
    numeroVersion: dto.numeroVersion,
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    estimacionHoras: dto.estimacionHoras,
    fechaInicio: dto.fechaInicio,
    fechaFinal: dto.fechaFinal,
    fechaCreacion: dto.fechaCreacion,
  };

  switch (dto.tipo) {
    case TipoElementoPlanificacionDto.Epica:
      return {
        ...base,
        tipo: TipoElementoPlanificacion.Epica,
        alcance: dto.alcance ?? '',
        riesgos: dto.riesgos ?? '',
        criteriosExito: dto.criteriosExito ?? '',
        prioridadCatalogoId: dto.prioridadCatalogoId,
        riesgoCatalogoId: dto.riesgoCatalogoId,
      };
    case TipoElementoPlanificacionDto.Caracteristica:
      return { ...base, tipo: TipoElementoPlanificacion.Caracteristica, alcance: dto.alcance };
    case TipoElementoPlanificacionDto.Historia:
      return {
        ...base,
        tipo: TipoElementoPlanificacion.Historia,
        objetivo: dto.objetivo,
        alcance: dto.alcance,
        criteriosAceptacion: dto.criteriosAceptacion,
      };
    case TipoElementoPlanificacionDto.Tarea:
      return {
        ...base,
        tipo: TipoElementoPlanificacion.Tarea,
        dependencias: dto.dependencias,
        actividadCatalogoId: dto.actividadCatalogoId,
        complejidad: dto.complejidad,
      };
  }

  throw new Error(
    `Tipo histórico de elemento no compatible: ${String((dto as { tipo: unknown }).tipo)}.`,
  );
}
