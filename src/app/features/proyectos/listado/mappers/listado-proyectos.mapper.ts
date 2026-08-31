import type { PaginadoDto } from '../../../../core/http/models/paginado.dto';
import { obtenerProgresoCreacionProyecto } from '../../mappers/progreso-creacion-proyecto.mapper';
import type { ProyectoListadoDto } from '../models/proyecto-listado.dto';
import type { PaginaListadoProyectos, ProyectoListado } from '../models/proyecto-listado.model';

/** Adapta el paginado remoto al contrato utilizado por la interfaz. */
export function mapearPaginaListadoProyectos(
  dto: PaginadoDto<ProyectoListadoDto>,
): PaginaListadoProyectos {
  return {
    proyectos: (dto.registros ?? []).map(mapearProyectoListado),
    paginaActual: dto.paginaActual,
    paginaTamano: dto.paginaTamano,
    totalRegistros: dto.totalRegistros,
    totalPaginas: dto.paginas,
  };
}

/** Adapta un registro remoto sin exponer sus catálogos a la vista. */
export function mapearProyectoListado(dto: ProyectoListadoDto): ProyectoListado {
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
