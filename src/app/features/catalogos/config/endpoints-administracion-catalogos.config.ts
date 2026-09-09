import { environment } from '../../../../environments/environment';
import { ENDPOINTS_CATALOGOS } from '../../../core/catalogos/config/endpoints-catalogos.config';
const BASE = `${environment.apiBaseUrl}/Catalogo`;
/** Operaciones administrativas verificadas contra los endpoints del backend. */
export const ENDPOINTS_ADMINISTRACION_CATALOGOS = {
  obtenerTipos: `${BASE}/ObtenerCatalogosTipo`,
  obtenerValores: ENDPOINTS_CATALOGOS.obtenerValores,
  crearTipo: `${BASE}/CrearCatalogoTipo`,
  actualizarTipo: `${BASE}/ActualizarCatalogoTipo`,
  inactivarTipo: `${BASE}/InactivarCatalogoTipo`,
  crearValor: `${BASE}/CrearCatalogoValor`,
  actualizarValor: `${BASE}/ActualizarCatalogoValor`,
  inactivarValor: `${BASE}/InactivarCatalogoValor`,
} as const;
