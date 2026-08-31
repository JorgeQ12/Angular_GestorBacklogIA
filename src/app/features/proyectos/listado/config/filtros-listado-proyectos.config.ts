import type { OpcionSelector } from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';

/** Define la cantidad estable de registros solicitados por página. */
export const TAMANO_PAGINA_LISTADO_PROYECTOS = 10;

/** Evita solicitudes por términos demasiado ambiguos. */
export const LONGITUD_MINIMA_BUSQUEDA_LISTADO_PROYECTOS = 3;

/** Evita una solicitud por cada pulsación mientras se escribe. */
export const ESPERA_BUSQUEDA_LISTADO_PROYECTOS_MILISEGUNDOS = 300;

/** Permite retirar el estado sin depender de una acción de limpieza separada. */
export const OPCIONES_FILTRO_ESTADO_LISTADO_PROYECTOS = [
  { valor: null, etiqueta: 'Todos los estados' },
  ...Object.values(EstadoCatalogoProyecto).map((estado) => ({ valor: estado, etiqueta: estado })),
] satisfies readonly OpcionSelector[];

/** Traduce el estado legible al enum entero expuesto por el endpoint. */
export const VALOR_API_ESTADO_PROYECTO = {
  [EstadoCatalogoProyecto.Nuevo]: 0,
  [EstadoCatalogoProyecto.Activo]: 1,
  [EstadoCatalogoProyecto.Finalizado]: 2,
  [EstadoCatalogoProyecto.Cerrado]: 3,
} as const satisfies Readonly<Record<EstadoCatalogoProyecto, number>>;
