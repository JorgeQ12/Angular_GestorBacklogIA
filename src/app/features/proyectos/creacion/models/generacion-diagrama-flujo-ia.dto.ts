import type { FlujoProyecto } from '../../secciones/flujo/models/flujo-proyecto.model';

/** Representa el comando mínimo requerido para generar el flujo desde el contexto guardado. */
export interface GenerarDiagramaFlujoIASolicitudDto {
  readonly proyectoId: number;
}

/** Refleja el contrato canónico que el backend prepara para el editor de Flujo. */
export type GenerarDiagramaFlujoIARespuestaDto = FlujoProyecto;
