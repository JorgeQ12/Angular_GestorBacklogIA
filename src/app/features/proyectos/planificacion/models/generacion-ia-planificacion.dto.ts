/** Valores serializados por el backend para seleccionar el nivel que generará la IA. */
export enum NivelGeneracionIaPlanificacionDto {
  Epicas = 'Epicas',
  Caracteristicas = 'Caracteristicas',
  Historias = 'Historias',
  Tareas = 'Tareas',
}

/** Refleja el cuerpo esperado por GenerarItemsTrabajoIA. */
export interface SolicitudGeneracionIaPlanificacionDto {
  readonly proyectoId: number;
  readonly nivel: NivelGeneracionIaPlanificacionDto;
}

/** Refleja los datos devueltos por GenerarItemsTrabajoIA. */
export interface ResultadoGeneracionIaPlanificacionDto {
  readonly proyectoId: number;
  readonly nivel: NivelGeneracionIaPlanificacionDto;
  readonly totalCreados: number;
  readonly mensaje: string;
}
