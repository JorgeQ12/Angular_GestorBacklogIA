import { environment } from '../../../../../environments/environment';

const RUTA_PROYECTOS = '/Proyecto';

/** Centraliza las operaciones remotas del caso de uso Información. */
export const ENDPOINTS_INFORMACION_PROYECTO = {
  obtenerProyecto: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ObtenerProyecto`,
  obtenerVersiones: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ObtenerVersionesProyecto`,
  obtenerVersion: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ObtenerVersionProyecto`,
  actualizarProyecto: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ActualizarProyecto`,
} as const;
