import type { PaginadoDto } from '../../../../core/http/models/paginado.dto';
import { obtenerProgresoCreacionProyecto } from '../../mappers/progreso-creacion-proyecto.mapper';
import type { ResumenProyectoDto } from '../models/resumen-proyecto.dto';
import type { PaginaProyectos, ResumenProyecto } from '../models/resumen-proyecto.model';

/** Adapta el paginado remoto al contrato utilizado por la interfaz. */
export function mapearPaginaProyectos(dto: PaginadoDto<ResumenProyectoDto>): PaginaProyectos {
  return {
    proyectos: (dto.registros ?? []).map(mapearResumenProyecto),
    paginaActual: dto.paginaActual,
    paginaTamano: dto.paginaTamano,
    totalRegistros: dto.totalRegistros,
    totalPaginas: dto.paginas,
  };
}

/** Adapta un registro remoto sin exponer sus catálogos a la vista. */
export function mapearResumenProyecto(dto: ResumenProyectoDto): ResumenProyecto {
  return {
    id: dto.id,
    nombre: dto.nombre.trim() || 'Proyecto sin nombre',
    responsable: dto.responsable.trim() || 'Equipo por completar',
    estado: dto.estado.trim() || dto.estadoCatalogo?.nombre.trim() || 'Sin estado',
    prioridad: dto.prioridadCatalogo?.nombre.trim() || 'Sin prioridad',
    fechaObjetivo: dto.fechaObjetivo,
    tieneBacklog: dto.tieneBacklog,
    esBorrador: dto.esBorrador,
    progresoCreacion: dto.esBorrador ? obtenerProgresoCreacionProyecto(dto.pasoActual ?? 1) : null,
  };
}
