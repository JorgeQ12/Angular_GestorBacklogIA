/** Orígenes serializados por el backend para las versiones de la planificación. */
export enum OrigenVersionPlanificacionDto {
  Inicial = 'inicial',
  GeneracionCaracteristicas = 'generacionCaracteristicas',
  GeneracionHistorias = 'generacionHistorias',
  GeneracionTareas = 'generacionTareas',
  GeneracionEpicas = 'generacionEpicas',
  ReemplazoManual = 'reemplazoManual',
  SincronizacionAzure = 'sincronizacionAzure',
}

/** Refleja una versión disponible devuelta por ObtenerVersionesBacklog. */
export interface VersionPlanificacionDto {
  readonly id: number;
  readonly numeroVersion: number;
  readonly fechaInicio: string;
  readonly fechaCierre: string | null;
  readonly origen: OrigenVersionPlanificacionDto;
  readonly esActual: boolean;
}
