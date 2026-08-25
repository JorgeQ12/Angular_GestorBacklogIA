import { CrearBorradorProyectoRespuestaDto } from '../models/borrador-proyecto.dto';
import { BorradorProyectoCreado } from '../models/borrador-proyecto.model';
import {
  ValidarVinculacionAzureRespuestaDto,
  VinculacionAzureSolicitudDto,
} from '../models/vinculacion-azure.dto';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../models/vinculacion-azure.model';

/** Traduce los nombres de la interfaz al contrato esperado por el backend. */
export function mapearSolicitudVinculacionAzure(
  datos: DatosVinculacionAzure,
): VinculacionAzureSolicitudDto {
  return {
    boardUrl: datos.urlBoard,
    epicaAzureId: datos.idEpica,
    teamId: datos.idEquipo,
  };
}

/** Adapta la validación de Azure al resultado presentado para confirmación. */
export function mapearResultadoVinculacionAzure(
  dto: ValidarVinculacionAzureRespuestaDto,
): ResultadoVinculacionAzure {
  return {
    organizacion: dto.organizacion,
    nombreProyecto: dto.proyectoAzureNombre,
    idEpica: dto.epicaAzureId,
    tituloEpica: dto.revisiones.at(-1)?.titulo || 'Sin título disponible',
    cantidadRevisiones: dto.revisiones.length,
    nombreEquipo: dto.teamNombre,
    cantidadMiembros: dto.miembros.length,
  };
}

/** Reduce la respuesta de creación al identificador requerido por el recorrido. */
export function mapearBorradorProyectoCreado(
  dto: CrearBorradorProyectoRespuestaDto,
): BorradorProyectoCreado {
  return {
    id: dto.proyectoId,
    revision: dto.revision,
    pasoActual: dto.pasoActual,
  };
}
