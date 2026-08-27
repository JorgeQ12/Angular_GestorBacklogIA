import { type ParamMap } from '@angular/router';

/** Centraliza los segmentos canónicos usados por el enrutador. */
export const SEGMENTOS_RUTA = {
  alcance: 'alcance',
  autenticacion: 'autenticacion',
  contexto: 'contexto',
  creacion: 'creacion',
  equipo: 'equipo',
  flujo: 'flujo',
  iniciarSesion: 'iniciar-sesion',
  inicio: 'inicio',
  necesidad: 'necesidad',
  nuevo: 'nuevo',
  objetivos: 'objetivos',
  panel: 'panel',
  proyectos: 'proyectos',
  roles: 'roles',
  tipoSolucion: 'tipo-solucion',
} as const;

/** Centraliza los nombres usados por los parámetros de ruta. */
export const PARAMETROS_RUTA = {
  proyectoId: 'proyectoId',
} as const;

/** Obtiene un identificador de proyecto válido desde los parámetros de ruta. */
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

/** Identifica la ruta relativa para iniciar un proyecto. */
export const RUTA_NUEVO_PROYECTO =
  `${RUTA_PANEL}/${SEGMENTOS_RUTA.proyectos}/${SEGMENTOS_RUTA.nuevo}` as const;

/** Proporciona la URL absoluta para iniciar un proyecto. */
export const URL_NUEVO_PROYECTO = `/${RUTA_NUEVO_PROYECTO}` as const;

/** Construye la URL base que delega la reanudación al enrutador de Proyectos. */
export function crearUrlCreacionProyecto(proyectoId: number | string): string {
  return `/${RUTA_PANEL}/${SEGMENTOS_RUTA.proyectos}/${encodeURIComponent(
    String(proyectoId),
  )}/${SEGMENTOS_RUTA.creacion}`;
}

/** Construye la URL de Contexto dentro de la creación de un proyecto. */
export function crearUrlContextoProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.contexto}`;
}

/** Construye la URL de Tipo de solución dentro de la creación de un proyecto. */
export function crearUrlTipoSolucionProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.tipoSolucion}`;
}

/** Construye la URL de Necesidad dentro de la creación de un proyecto. */
export function crearUrlNecesidadProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.necesidad}`;
}

/** Construye la URL de Objetivos dentro de la creación de un proyecto. */
export function crearUrlObjetivosProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.objetivos}`;
}

/** Construye la URL de Alcance dentro de la creación de un proyecto. */
export function crearUrlAlcanceProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.alcance}`;
}

/** Construye la URL de Roles dentro de la creación de un proyecto. */
export function crearUrlRolesProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.roles}`;
}

/** Construye la URL de Equipo dentro de la creación de un proyecto. */
export function crearUrlEquipoProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.equipo}`;
}

/** Construye la URL de Flujo de usuario dentro de la creación de un proyecto. */
export function crearUrlFlujoProyecto(proyectoId: number | string): string {
  return `${crearUrlCreacionProyecto(proyectoId)}/${SEGMENTOS_RUTA.flujo}`;
}
