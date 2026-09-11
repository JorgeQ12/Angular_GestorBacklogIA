import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiBaseUrl}/Usuario`;

/** Centraliza las operaciones verificadas contra el API administrativo de usuarios. */
export const ENDPOINTS_USUARIOS = {
  obtenerUsuarios: `${BASE}/ObtenerUsuarios`,
  crearUsuario: `${BASE}/CrearUsuario`,
  actualizarUsuario: `${BASE}/ActualizarUsuario`,
  inactivarUsuario: `${BASE}/InactivarUsuario`,
} as const;
