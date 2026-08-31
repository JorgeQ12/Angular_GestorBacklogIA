import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';

/** Describe los criterios visibles del portafolio. */
export interface FiltrosListadoProyectos {
  readonly nombre: string;
  readonly responsable: string;
  readonly estado: EstadoCatalogoProyecto | null;
}

/** Describe una consulta paginada del portafolio. */
export interface ConsultaListadoProyectos extends FiltrosListadoProyectos {
  readonly pagina: number;
  readonly paginaTamano: number;
}

/** Describe una solicitud de navegación entre páginas del listado. */
export interface CambioPaginaListadoProyectos {
  readonly pagina: number;
}

/** Proporciona los filtros iniciales del listado. */
export const FILTROS_LISTADO_PROYECTOS_VACIOS: FiltrosListadoProyectos = {
  nombre: '',
  responsable: '',
  estado: null,
};
