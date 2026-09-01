import { aplicarActualizacionSeccionProyecto } from '../../mappers/actualizacion-seccion-proyecto.mapper';
import type { ActualizacionSeccionProyecto } from '../../models/actualizacion-seccion-proyecto.model';
import { deserializarAlcanceProyecto } from '../../secciones/alcance/mappers/alcance-proyecto.mapper';
import { deserializarEquipoProyecto } from '../../secciones/equipo/mappers/equipo-proyecto.mapper';
import { deserializarFlujoProyecto } from '../../secciones/flujo/mappers/flujo-proyecto.mapper';
import { deserializarNecesidadProyecto } from '../../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { deserializarObjetivosProyecto } from '../../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { deserializarRolesProyecto } from '../../secciones/roles/mappers/roles-proyecto.mapper';
import { deserializarTipoSolucionProyecto } from '../../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';
import type {
  ActualizarProyectoSolicitudDto,
  ProyectoInformacionDto,
  VersionProyectoDto,
  VersionProyectoResumenDto,
} from '../models/informacion-proyecto.dto';
import type { VinculacionAzureProyectoResumen } from '../../models/vinculacion-azure-proyecto.model';
import type { VersionProyectoResumen } from '../../models/versionamiento-proyecto.model';
import type { InformacionProyecto } from '../models/informacion-proyecto.model';

/** Convierte la respuesta vigente en una fotografía íntegra del dominio. */
export function mapearInformacionProyecto(dto: ProyectoInformacionDto): InformacionProyecto {
  return construirInformacion(
    dto,
    dto.id,
    dto.versionActualId,
    dto.numeroVersionActual,
    null,
    true,
    dto.azure,
  );
}

/** Convierte una versión histórica y conserva la referencia inmutable de Azure. */
export function mapearVersionProyecto(
  dto: VersionProyectoDto,
  azure: VinculacionAzureProyectoResumen | null,
): InformacionProyecto {
  return construirInformacion(
    dto,
    dto.proyectoId,
    dto.id,
    dto.numeroVersion,
    dto.fechaCreacion,
    dto.esActual,
    azure,
  );
}

/** Convierte el historial remoto en opciones del selector global. */
export function mapearVersionesProyecto(
  versiones: readonly VersionProyectoResumenDto[],
): readonly VersionProyectoResumen[] {
  return versiones.map((version) => ({
    id: version.id,
    numero: version.numeroVersion,
    fechaCreacion: version.fechaCreacion,
    esActual: version.esActual,
  }));
}

/** Reemplaza una sección y construye el comando integral con concurrencia optimista. */
export function mapearActualizacionProyecto(
  proyecto: InformacionProyecto,
  actualizacion: ActualizacionSeccionProyecto,
): ActualizarProyectoSolicitudDto {
  const contenido = aplicarActualizacionSeccionProyecto(proyecto, actualizacion);
  return {
    id: proyecto.id,
    versionActualIdEsperada: proyecto.versionId,
    nombre: contenido.contexto.nombre,
    responsable: contenido.contexto.responsable,
    descripcion: contenido.contexto.descripcion,
    prioridadCatalogoId: contenido.contexto.prioridadCatalogoId ?? 0,
    estadoCatalogoId: proyecto.estadoCatalogoId,
    fechaObjetivo: contenido.contexto.fechaObjetivo || null,
    tipoSolucionJson: contenido.tipoSolucionJson,
    necesidadJson: contenido.necesidadJson,
    objetivosJson: contenido.objetivosJson,
    alcanceJson: contenido.alcanceJson,
    rolesJson: contenido.rolesJson,
    equipoJson: contenido.equipoJson,
    diagramFlujoJson: contenido.diagramFlujoJson,
  };
}

function construirInformacion(
  dto: Omit<ProyectoInformacionDto, 'versionActualId' | 'numeroVersionActual' | 'azure'>,
  proyectoId: number,
  versionId: number,
  numeroVersion: number,
  fechaVersion: string | null,
  esVersionActual: boolean,
  azure: VinculacionAzureProyectoResumen | null,
): InformacionProyecto {
  const tipoSolucion = deserializarTipoSolucionProyecto(dto.tipoSolucionJson);
  const necesidad = deserializarNecesidadProyecto(dto.necesidadJson);
  const objetivos = deserializarObjetivosProyecto(dto.objetivosJson);
  const alcance = deserializarAlcanceProyecto(dto.alcanceJson);
  const roles = deserializarRolesProyecto(dto.rolesJson);
  const equipo = deserializarEquipoProyecto(dto.equipoJson);
  const flujo = deserializarFlujoProyecto(dto.diagramFlujoJson, proyectoId);
  if (!tipoSolucion || !necesidad || !objetivos || !alcance || !roles || !equipo || !flujo) {
    throw new Error('La versión contiene una sección con un formato no compatible.');
  }

  return {
    id: proyectoId,
    versionId,
    numeroVersion,
    fechaVersion,
    esVersionActual,
    contexto: {
      nombre: dto.nombre,
      responsable: dto.responsable,
      descripcion: dto.descripcion,
      prioridadCatalogoId: dto.prioridadCatalogoId,
      fechaObjetivo: dto.fechaObjetivo ?? '',
    },
    estadoCatalogoId: dto.estadoCatalogoId,
    estado: dto.estadoCatalogo.nombre,
    prioridad: dto.prioridadCatalogo.nombre,
    azure,
    tipoSolucion,
    necesidad,
    objetivos,
    alcance,
    roles,
    equipo,
    flujo,
    tipoSolucionJson: dto.tipoSolucionJson,
    necesidadJson: dto.necesidadJson,
    objetivosJson: dto.objetivosJson,
    alcanceJson: dto.alcanceJson,
    rolesJson: dto.rolesJson,
    equipoJson: dto.equipoJson,
    diagramFlujoJson: dto.diagramFlujoJson,
  };
}
