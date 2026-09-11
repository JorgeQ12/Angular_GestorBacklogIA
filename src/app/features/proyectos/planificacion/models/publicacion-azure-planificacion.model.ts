/** Resume el resultado que la interfaz necesita después de publicar en Azure DevOps. */
export interface ResultadoPublicacionAzurePlanificacion {
  readonly organizacion: string;
  readonly proyecto: string;
  readonly area: string;
  readonly fechaInicio: string;
  readonly totalElementos: number;
  readonly totalEpicas: number;
  readonly totalCaracteristicas: number;
  readonly totalHistorias: number;
  readonly totalTareas: number;
}
