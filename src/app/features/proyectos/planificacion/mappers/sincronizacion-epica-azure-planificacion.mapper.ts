import type { ResultadoSincronizacionEpicaAzurePlanificacionDto } from '../models/sincronizacion-epica-azure-planificacion.dto';
import type { ResultadoSincronizacionEpicaAzurePlanificacion } from '../models/sincronizacion-epica-azure-planificacion.model';

/** Adapta la respuesta de Azure DevOps sin exponer el DTO a la página. */
export function mapearResultadoSincronizacionEpicaAzurePlanificacion(
  dto: ResultadoSincronizacionEpicaAzurePlanificacionDto,
): ResultadoSincronizacionEpicaAzurePlanificacion {
  return {
    epicaId: dto.epicaId,
    azureWorkItemId: dto.azureWorkItemId,
    revisionesImportadas: dto.revisionesImportadas,
    revisionAzureActual: dto.azureRevisionActual,
    fechaSincronizacion: dto.fechaSincronizacion,
    urlEpica: dto.urlEpica,
  };
}
