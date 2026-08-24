import { environment } from '../../../../environments/environment';

const RUTA_BASE_AUTENTICACION = '/automatizacion/api/v1';

/** Centraliza los endpoints de Kong que participan en la sesión del frontend. */
export const ENDPOINTS_AUTENTICACION = {
  iniciarSesion: `${environment.kongUrl}${RUTA_BASE_AUTENTICACION}/login`,
  sesionActual: `${environment.kongUrl}${RUTA_BASE_AUTENTICACION}/me`,
  cerrarSesion: `${environment.kongUrl}${RUTA_BASE_AUTENTICACION}/logout`,
} as const;

/** Identifica la ventana utilizada para completar el acceso externo. */
export const NOMBRE_VENTANA_AUTENTICACION = 'interia-autenticacion';
