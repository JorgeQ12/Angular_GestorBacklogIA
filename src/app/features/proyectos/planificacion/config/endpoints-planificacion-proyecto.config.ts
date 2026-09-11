import { environment } from '../../../../../environments/environment';

const RUTA_PLANIFICACION = '/Backlog';
const RUTA_AZURE_DEVOPS = '/AzureDevOps';
const RUTA_GENERACION_IA = '/GeneracionIA';
const RUTA_REQUISITOS = '/Requisito';

/** Centraliza las operaciones remotas de la planificación del proyecto. */
export const ENDPOINTS_PLANIFICACION_PROYECTO = {
  obtenerPlanificacion: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerBacklog`,
  obtenerVersiones: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerVersionesBacklog`,
  obtenerElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerWorkItem`,
  crearElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/CrearWorkItem`,
  actualizarElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ActualizarWorkItem`,
  eliminarElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/EliminarWorkItem`,
  generarElementosConIa: `${environment.apiBaseUrl}${RUTA_GENERACION_IA}/GenerarItemsTrabajoIA`,
  obtenerHistorialElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerHistorialWorkItem`,
  obtenerVersionElemento: `${environment.apiBaseUrl}${RUTA_PLANIFICACION}/ObtenerVersionWorkItem`,
  publicarEnAzure: `${environment.apiBaseUrl}${RUTA_AZURE_DEVOPS}/PublicarProyectoAzureDevOps`,
  sincronizarEpicaPrincipal: `${environment.apiBaseUrl}${RUTA_AZURE_DEVOPS}/SincronizarEpicaAzure`,
  obtenerListaRequisitos: `${environment.apiBaseUrl}${RUTA_REQUISITOS}/ObtenerListaRequisitos`,
  obtenerCatalogoRequisitos: `${environment.apiBaseUrl}${RUTA_REQUISITOS}/ObtenerCatalogoRequisitos`,
  crearRequisito: (proyectoId: number) => {
    const idProyecto = encodeURIComponent(proyectoId);
    return `${environment.apiBaseUrl}${RUTA_REQUISITOS}/CrearRequisito/${idProyecto}`;
  },
  actualizarCumplimientoRequisito: (proyectoId: number, requisitoId: number) => {
    const idProyecto = encodeURIComponent(proyectoId);
    const idRequisito = encodeURIComponent(requisitoId);
    return `${environment.apiBaseUrl}${RUTA_REQUISITOS}/ActualizarCumplimiento/${idProyecto}/${idRequisito}`;
  },
} as const;
