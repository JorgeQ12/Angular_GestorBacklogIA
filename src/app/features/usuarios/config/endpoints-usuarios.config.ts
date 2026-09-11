import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiBaseUrl}/Usuario`;

/** Operaciones verificadas contra los endpoints de usuarios del backend. */
export const ENDPOINTS_USUARIOS = {
  obtenerUsuarios: `${BASE}/ObtenerUsuarios`,
  crearUsuario: `${BASE}/CrearUsuario`,
  actualizarUsuario: `${BASE}/ActualizarUsuario`,
  inactivarUsuario: `${BASE}/InactivarUsuario`,
} as const;
