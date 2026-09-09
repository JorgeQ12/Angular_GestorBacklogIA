/** Describe el resultado que necesita la interfaz después de sincronizar la épica principal. */
export interface ResultadoSincronizacionEpicaAzurePlanificacion {
  readonly epicaId: number;
  readonly azureWorkItemId: number;
  readonly revisionesImportadas: number;
  readonly revisionAzureActual: number;
  readonly fechaSincronizacion: string;
  readonly urlEpica: string;
}
