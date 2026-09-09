import type { ParamMap } from '@angular/router';
import { PARAMETROS_RUTA } from '../../../../core/navegacion/rutas';
import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';
import { TAMANO_PAGINA_PROYECTOS } from '../config/filtros-proyectos.config';
import type { ConsultaProyectos } from '../models/consulta-proyectos.model';
import { normalizarTerminoBusquedaProyectos } from './filtros-proyectos.mapper';

/** Convierte los query params vigentes en una consulta válida del portafolio. */
export function mapearParametrosConsultaProyectos(parametros: ParamMap): ConsultaProyectos {
  return {
    nombre: normalizarTerminoBusquedaProyectos(parametros.get(PARAMETROS_RUTA.nombreProyecto)),
    responsable: normalizarTerminoBusquedaProyectos(
      parametros.get(PARAMETROS_RUTA.responsableProyecto),
    ),
    estado: obtenerEstadoCatalogoProyecto(parametros.get(PARAMETROS_RUTA.estadoProyecto)),
    pagina: obtenerPagina(parametros.get(PARAMETROS_RUTA.pagina)),
    paginaTamano: TAMANO_PAGINA_PROYECTOS,
  };
}

/** Valida un estado externo antes de incorporarlo al modelo del dominio. */
export function obtenerEstadoCatalogoProyecto(valor: string | null): EstadoCatalogoProyecto | null {
  return Object.values(EstadoCatalogoProyecto).find((estado) => estado === valor) ?? null;
}

function obtenerPagina(valor: string | null): number {
  const pagina = Number(valor);
  return Number.isInteger(pagina) && pagina > 0 ? pagina : 1;
}
