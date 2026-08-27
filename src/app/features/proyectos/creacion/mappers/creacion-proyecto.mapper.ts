import {
  ActualizarBorradorProyectoSolicitudDto,
  BorradorProyectoDto,
  CrearBorradorProyectoRespuestaDto,
} from '../models/borrador-proyecto.dto';
import {
  BorradorProyecto,
  BorradorProyectoCreado,
  CambiosBorradorProyecto,
} from '../models/borrador-proyecto.model';
import {
  SincronizarEquipoAzureRespuestaDto,
  ValidarVinculacionAzureRespuestaDto,
  VinculacionAzureDto,
  VinculacionAzureSolicitudDto,
} from '../models/vinculacion-azure.dto';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../models/vinculacion-azure.model';
import { OrigenEquipoAzureProyecto } from '../../secciones/equipo/models/equipo-proyecto.model';

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

/** Adapta la membresía de Azure al origen neutral utilizado por Equipo. */
export function mapearOrigenEquipoAzure(
  dto: VinculacionAzureDto | SincronizarEquipoAzureRespuestaDto,
): OrigenEquipoAzureProyecto {
  return {
    idEquipo: dto.teamId,
    nombreEquipo: dto.teamNombre,
    integrantes: dto.miembros.map((miembro) => ({
      idAzure: miembro.id,
      nombre: miembro.nombre,
      correo: miembro.correo,
      esAdministradorAzure: miembro.esAdministrador,
    })),
    fechaSincronizacion: 'fechaSincronizacion' in dto ? dto.fechaSincronizacion : null,
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

/** Adapta la fotografía remota al estado editable del recorrido. */
export function mapearBorradorProyecto(dto: BorradorProyectoDto): BorradorProyecto {
  return {
    id: dto.proyectoId,
    revision: dto.revision,
    pasoActual: dto.pasoActual,
    contexto: {
      nombre: dto.nombre,
      responsable: dto.responsable,
      descripcion: dto.descripcion,
      prioridadCatalogoId: dto.prioridadCatalogoId,
      fechaObjetivo: dto.fechaObjetivo?.slice(0, 10) ?? '',
    },
    equipoAzure: dto.azure ? mapearOrigenEquipoAzure(dto.azure) : null,
    estadoCatalogoId: dto.estadoCatalogoId,
    tipoSolucionJson: dto.tipoSolucionJson,
    necesidadJson: dto.necesidadJson,
    objetivosJson: dto.objetivosJson,
    alcanceJson: dto.alcanceJson,
    rolesJson: dto.rolesJson,
    equipoJson: dto.equipoJson,
    diagramFlujoJson: dto.diagramFlujoJson,
    fechaUltimoGuardado: dto.fechaUltimoGuardado,
  };
}

/** Combina los reemplazos de sección con la fotografía vigente del borrador. */
export function mapearActualizacionBorrador(
  borrador: BorradorProyecto,
  cambios: CambiosBorradorProyecto,
  pasoActual: number,
): ActualizarBorradorProyectoSolicitudDto {
  const contexto = cambios.contexto ?? borrador.contexto;
  return {
    proyectoId: borrador.id,
    revisionEsperada: borrador.revision,
    pasoActual,
    nombre: contexto.nombre,
    responsable: contexto.responsable,
    descripcion: contexto.descripcion,
    prioridadCatalogoId: contexto.prioridadCatalogoId,
    estadoCatalogoId: borrador.estadoCatalogoId,
    fechaObjetivo: contexto.fechaObjetivo,
    tipoSolucionJson: cambios.tipoSolucionJson ?? borrador.tipoSolucionJson,
    necesidadJson: cambios.necesidadJson ?? borrador.necesidadJson,
    objetivosJson: cambios.objetivosJson ?? borrador.objetivosJson,
    alcanceJson: cambios.alcanceJson ?? borrador.alcanceJson,
    rolesJson: cambios.rolesJson ?? borrador.rolesJson,
    equipoJson: cambios.equipoJson ?? borrador.equipoJson,
    diagramFlujoJson: borrador.diagramFlujoJson,
  };
}
