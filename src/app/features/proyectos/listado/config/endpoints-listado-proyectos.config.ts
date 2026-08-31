import { environment } from '../../../../../environments/environment';

const RUTA_PROYECTOS = '/Proyecto';

/** Centraliza las operaciones remotas utilizadas por el listado de proyectos. */
export const ENDPOINTS_LISTADO_PROYECTOS = {
  obtenerProyectos: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ObtenerProyectos`,
} as const;
