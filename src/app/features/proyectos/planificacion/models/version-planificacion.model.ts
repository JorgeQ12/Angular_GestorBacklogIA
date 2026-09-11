/** Identifica el proceso que creó una versión de la planificación. */
export enum OrigenVersionPlanificacion {
  Inicial = 'inicial',
  GeneracionCaracteristicas = 'generacionCaracteristicas',
  GeneracionHistorias = 'generacionHistorias',
  GeneracionTareas = 'generacionTareas',
  GeneracionEpicas = 'generacionEpicas',
  ReemplazoManual = 'reemplazoManual',
  SincronizacionAzure = 'sincronizacionAzure',
}

/** Describe una fotografía integral disponible para consulta. */
export interface VersionPlanificacion {
  readonly id: number;
  readonly numero: number;
  readonly fechaInicio: string;
  readonly fechaCierre: string | null;
  readonly origen: OrigenVersionPlanificacion;
  readonly esActual: boolean;
}
