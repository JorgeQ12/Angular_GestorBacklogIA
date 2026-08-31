import { LONGITUD_MINIMA_BUSQUEDA_LISTADO_PROYECTOS } from '../config/filtros-listado-proyectos.config';
import type { FiltrosListadoProyectos } from '../models/consulta-listado-proyectos.model';
import type { ValoresFormularioFiltrosListadoProyectos } from '../models/formulario-filtros-listado-proyectos.model';

/** Convierte los valores editables en criterios válidos para la consulta. */
export function mapearValoresFormularioFiltrosListadoProyectos(
  valor: ValoresFormularioFiltrosListadoProyectos,
): FiltrosListadoProyectos {
  return {
    nombre: normalizarTerminoBusquedaListadoProyectos(valor.busqueda),
    responsable: '',
    estado: valor.estado,
  };
}

/** Normaliza un término externo y descarta búsquedas demasiado ambiguas. */
export function normalizarTerminoBusquedaListadoProyectos(valor: string | null): string {
  const termino = valor?.trim() ?? '';
  return termino.length >= LONGITUD_MINIMA_BUSQUEDA_LISTADO_PROYECTOS ? termino : '';
}

/** Compara la fotografía completa de dos filtros del listado. */
export function sonFiltrosListadoProyectosIguales(
  anterior: FiltrosListadoProyectos,
  actual: FiltrosListadoProyectos,
): boolean {
  return (
    anterior.nombre === actual.nombre &&
    anterior.responsable === actual.responsable &&
    anterior.estado === actual.estado
  );
}
