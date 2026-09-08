import { LONGITUD_MINIMA_BUSQUEDA_PROYECTOS } from '../config/filtros-proyectos.config';
import type { FiltrosProyectos } from '../models/consulta-proyectos.model';
import type { ValoresFormularioFiltrosProyectos } from '../models/formulario-filtros-proyectos.model';

/** Convierte los valores editables en criterios válidos para la consulta. */
export function mapearValoresFormularioFiltrosProyectos(
  valor: ValoresFormularioFiltrosProyectos,
): FiltrosProyectos {
  return {
    nombre: normalizarTerminoBusquedaProyectos(valor.busqueda),
    responsable: '',
    estado: valor.estado,
  };
}

/** Normaliza un término externo y descarta búsquedas demasiado ambiguas. */
export function normalizarTerminoBusquedaProyectos(valor: string | null): string {
  const termino = valor?.trim() ?? '';
  return termino.length >= LONGITUD_MINIMA_BUSQUEDA_PROYECTOS ? termino : '';
}

/** Compara la fotografía completa de dos filtros de la consulta. */
export function sonFiltrosProyectosIguales(
  anterior: FiltrosProyectos,
  actual: FiltrosProyectos,
): boolean {
  return (
    anterior.nombre === actual.nombre &&
    anterior.responsable === actual.responsable &&
    anterior.estado === actual.estado
  );
}
