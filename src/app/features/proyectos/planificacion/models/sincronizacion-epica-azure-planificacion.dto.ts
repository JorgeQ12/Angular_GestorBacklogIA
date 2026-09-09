/** Refleja la respuesta contractual de sincronizar la épica principal desde Azure DevOps. */
export interface ResultadoSincronizacionEpicaAzurePlanificacionDto {
  readonly epicaId: number;
  readonly azureWorkItemId: number;
  readonly revisionesImportadas: number;
  readonly azureRevisionActual: number;
  readonly fechaSincronizacion: string;
  readonly urlEpica: string;
}
