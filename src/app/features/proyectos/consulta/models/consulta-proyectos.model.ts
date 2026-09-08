import { EstadoCatalogoProyecto } from '../../models/estado-catalogo-proyecto.model';

/** Describe los criterios visibles del portafolio. */
export interface FiltrosProyectos {
  readonly nombre: string;
  readonly responsable: string;
  readonly estado: EstadoCatalogoProyecto | null;
}

/** Describe una consulta paginada del portafolio. */
export interface ConsultaProyectos extends FiltrosProyectos {
  readonly pagina: number;
  readonly paginaTamano: number;
}

/** Describe una solicitud de navegación entre páginas de la consulta. */
export interface CambioPaginaProyectos {
  readonly pagina: number;
}

/** Proporciona los filtros iniciales de la consulta. */
export const FILTROS_PROYECTOS_VACIOS: FiltrosProyectos = {
  nombre: '',
  responsable: '',
  estado: null,
};
