/** Centraliza los segmentos canónicos usados por el enrutador. */
export const SEGMENTOS_RUTA = {
  autenticacion: 'autenticacion',
  iniciarSesion: 'iniciar-sesion',
  inicio: 'inicio',
  panel: 'panel',
} as const;

/** Identifica la ruta relativa del inicio de sesión. */
export const RUTA_INICIO_SESION =
  `${SEGMENTOS_RUTA.autenticacion}/${SEGMENTOS_RUTA.iniciarSesion}` as const;

/** Proporciona la URL absoluta del inicio de sesión. */
export const URL_INICIO_SESION = `/${RUTA_INICIO_SESION}` as const;

/** Identifica la ruta relativa del panel principal. */
export const RUTA_PANEL = SEGMENTOS_RUTA.panel;

/** Proporciona la URL absoluta del panel principal. */
export const URL_PANEL = `/${RUTA_PANEL}` as const;

/** Identifica la ruta relativa del inicio del panel. */
export const RUTA_INICIO_PANEL = `${RUTA_PANEL}/${SEGMENTOS_RUTA.inicio}` as const;

/** Proporciona la URL absoluta del inicio del panel. */
export const URL_INICIO_PANEL = `/${RUTA_INICIO_PANEL}` as const;
