/** Centraliza los segmentos canónicos usados por el enrutador. */
export const SEGMENTOS_RUTA = {
  autenticacion: 'autenticacion',
  contexto: 'contexto',
  creacion: 'creacion',
  iniciarSesion: 'iniciar-sesion',
  inicio: 'inicio',
  nuevo: 'nuevo',
  panel: 'panel',
  proyectos: 'proyectos',
} as const;

/** Centraliza los nombres usados por los parámetros de ruta. */
export const PARAMETROS_RUTA = {
  proyectoId: 'proyectoId',
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

/** Identifica la ruta relativa para iniciar un proyecto. */
export const RUTA_NUEVO_PROYECTO =
  `${RUTA_PANEL}/${SEGMENTOS_RUTA.proyectos}/${SEGMENTOS_RUTA.nuevo}` as const;

/** Proporciona la URL absoluta para iniciar un proyecto. */
export const URL_NUEVO_PROYECTO = `/${RUTA_NUEVO_PROYECTO}` as const;

/** Construye la URL de Contexto dentro de la creación de un proyecto. */
export function crearUrlContextoProyecto(proyectoId: number | string): string {
  return `/${RUTA_PANEL}/${SEGMENTOS_RUTA.proyectos}/${encodeURIComponent(
    String(proyectoId),
  )}/${SEGMENTOS_RUTA.creacion}/${SEGMENTOS_RUTA.contexto}`;
}
