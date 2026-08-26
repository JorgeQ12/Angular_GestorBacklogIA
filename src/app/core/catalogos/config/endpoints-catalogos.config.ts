import { environment } from '../../../../environments/environment';

const RUTA_CATALOGOS = '/Catalogo';

/** Centraliza las operaciones de consulta disponibles para los catálogos. */
export const ENDPOINTS_CATALOGOS = {
  obtenerValores: `${environment.apiBaseUrl}${RUTA_CATALOGOS}/ObtenerCatalogosValor`,
} as const;
