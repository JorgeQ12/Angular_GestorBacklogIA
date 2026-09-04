import { environment } from '../../../../../environments/environment';

const RUTA_AZURE_DEVOPS = '/AzureDevOps';
const RUTA_GENERACION_IA = '/GeneracionIA';
const RUTA_PROYECTOS = '/Proyecto';

/** Centraliza las operaciones remotas utilizadas durante la creación de proyectos. */
export const ENDPOINTS_CREACION_PROYECTO = {
  validarVinculacionAzure: `${environment.apiBaseUrl}${RUTA_AZURE_DEVOPS}/ValidarVinculacionAzure`,
  sincronizarEquipoAzure: `${environment.apiBaseUrl}${RUTA_AZURE_DEVOPS}/SincronizarEquipoAzure`,
  crearBorrador: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/CrearBorrador`,
  obtenerBorrador: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ObtenerBorrador`,
  actualizarBorrador: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/ActualizarBorrador`,
  guardarProyecto: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/GuardarProyecto`,
  generarDiagramaFlujoIA: `${environment.apiBaseUrl}${RUTA_GENERACION_IA}/GenerarDiagramaFlujoIA`,
} as const;
