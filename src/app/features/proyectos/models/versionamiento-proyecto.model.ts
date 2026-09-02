/** Describe una versión disponible para la consulta integral del proyecto. */
export interface VersionProyectoResumen {
  readonly id: number;
  readonly numero: number;
  readonly fechaCreacion: string;
  readonly esActual: boolean;
}

/** Configura el selector transversal que se presenta en el encabezado de un paso. */
export interface VersionamientoPasoProyecto {
  readonly versiones: readonly VersionProyectoResumen[];
  readonly versionSeleccionadaId: number;
  readonly deshabilitado: boolean;
}
