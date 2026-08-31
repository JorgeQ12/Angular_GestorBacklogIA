import { type ParamMap } from '@angular/router';

/** Centraliza los segmentos canónicos usados por el enrutador. */
export const SEGMENTOS_RUTA = {
  autenticacion: 'autenticacion',
  creacion: 'creacion',
  iniciarSesion: 'iniciar-sesion',
  inicio: 'inicio',
  panel: 'panel',
  proyectos: 'proyectos',
} as const;

/** Centraliza los nombres usados por los parámetros de ruta. */
export const PARAMETROS_RUTA = {
  estadoProyecto: 'estado',
  nombreProyecto: 'nombre',
  pagina: 'pagina',
  proyectoId: 'proyectoId',
  responsableProyecto: 'responsable',
} as const;

/** Obtiene un identificador de proyecto válido desde un mapa de parámetros. */
export function obtenerProyectoIdRuta(parametros: ParamMap): number | null {
  const proyectoId = Number(parametros.get(PARAMETROS_RUTA.proyectoId));
  return Number.isInteger(proyectoId) && proyectoId > 0 ? proyectoId : null;
}

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

/** Identifica la ruta relativa de entrada al dominio de Proyectos. */
export const RUTA_PROYECTOS = `${RUTA_PANEL}/${SEGMENTOS_RUTA.proyectos}` as const;

/** Proporciona la URL absoluta del listado de proyectos. */
export const URL_PROYECTOS = `/${RUTA_PROYECTOS}` as const;

/** Identifica la única ruta relativa del recorrido de creación. */
export const RUTA_CREACION_PROYECTO = `${RUTA_PROYECTOS}/${SEGMENTOS_RUTA.creacion}` as const;

/** Proporciona la URL absoluta para iniciar un proyecto. */
export const URL_CREACION_PROYECTO = `/${RUTA_CREACION_PROYECTO}` as const;

/** Construye la URL de creación que permite reanudar un borrador. */
export function crearUrlCreacionProyecto(proyectoId: number | string): string {
  return `${URL_CREACION_PROYECTO}?${PARAMETROS_RUTA.proyectoId}=${encodeURIComponent(
    String(proyectoId),
  )}`;
}
