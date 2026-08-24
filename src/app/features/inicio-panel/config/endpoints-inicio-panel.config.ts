import { environment } from '../../../../environments/environment';

const RUTA_PROYECTOS = '/Proyecto';

/** Centraliza los endpoints que proporcionan información al inicio del panel. */
export const ENDPOINTS_INICIO_PANEL = {
  resumenAdministrativo: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ObtenerResumenAdministrativo`,
} as const;
