import { environment } from '../../../../../environments/environment';

const RUTA_AZURE_DEVOPS = '/AzureDevOps';
const RUTA_PROYECTOS = '/Proyecto';

/** Centraliza las operaciones remotas utilizadas durante la creación de proyectos. */
export const ENDPOINTS_CREACION_PROYECTO = {
  validarVinculacionAzure: `${environment.apiBaseUrl}${RUTA_AZURE_DEVOPS}/ValidarVinculacionAzure`,
  crearBorrador: `${environment.apiBaseUrl}${RUTA_PROYECTOS}/CrearBorrador`,
} as const;
