import { environment } from '../../../../../environments/environment';

const RUTA_PLANIFICACION = '/Backlog';
const RUTA_AZURE_DEVOPS = '/AzureDevOps';

/** Centraliza las operaciones remotas de la planificación del proyecto. */
export const ENDPOINTS_PLANIFICACION_PROYECTO = {
  obtenerPlanificacion: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerBacklog`,
  obtenerVersiones: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerVersionesBacklog`,
  obtenerElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerWorkItem`,
  crearElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/CrearWorkItem`,
  actualizarElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ActualizarWorkItem`,
  eliminarElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/EliminarWorkItem`,
  generarElementosConIa: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/GenerarItemsTrabajoIA`,
  obtenerHistorialElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerHistorialWorkItem`,
  obtenerVersionElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerVersionWorkItem`,
  publicarEnAzure: `${environment.apiBaseUrl}${RUTA_AZURE_DEVOPS}/PublicarProyectoAzureDevOps`,
  sincronizarEpicaPrincipal: `${environment.apiBaseUrl}${RUTA_AZURE_DEVOPS}/SincronizarEpicaAzure`,
} as const;
