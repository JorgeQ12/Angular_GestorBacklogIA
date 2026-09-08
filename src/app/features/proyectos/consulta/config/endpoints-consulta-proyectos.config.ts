import { environment } from '../../../../../environments/environment';

const RUTA_PROYECTOS = '/Proyecto';

/** Centraliza las operaciones remotas utilizadas por la consulta de proyectos. */
export const ENDPOINTS_CONSULTA_PROYECTOS = {
  obtenerProyectos: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ObtenerProyectos`,
} as const;
