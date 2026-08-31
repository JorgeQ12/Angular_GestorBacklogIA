import type { OpcionSelector } from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';

/** Define la cantidad estable de registros solicitados por página. */
export const TAMANO_PAGINA_LISTADO_PROYECTOS = 10;

/** Proporciona las alternativas admitidas por el filtro de estado. */
export const OPCIONES_ESTADO_LISTADO_PROYECTOS = Object.values(EstadoCatalogoProyecto).map(
  (estado) => ({ valor: estado, etiqueta: estado }),
) satisfies readonly OpcionSelector[];

/** Traduce el estado legible al enum entero expuesto por el endpoint. */
export const VALOR_API_ESTADO_PROYECTO = {
  [EstadoCatalogoProyecto.Nuevo]: 0,
  [EstadoCatalogoProyecto.Activo]: 1,
  [EstadoCatalogoProyecto.Finalizado]: 2,
  [EstadoCatalogoProyecto.Cerrado]: 3,
} as const satisfies Readonly<Record<EstadoCatalogoProyecto, number>>;
