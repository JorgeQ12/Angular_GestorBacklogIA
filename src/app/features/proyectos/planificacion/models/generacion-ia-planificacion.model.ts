/** Identifica los niveles que el backend puede regenerar mediante inteligencia artificial. */
export enum NivelGeneracionIaPlanificacion {
  Epicas = 'epicas',
  Caracteristicas = 'caracteristicas',
  Historias = 'historias',
  Tareas = 'tareas',
}

/** Resume el resultado confirmado de una generación mediante IA. */
export interface ResultadoGeneracionIaPlanificacion {
  readonly proyectoId: number;
  readonly nivel: NivelGeneracionIaPlanificacion;
  readonly totalCreados: number;
  readonly mensaje: string;
}
