import {
  MotivoBloqueoPublicacionAzureDto,
  OrigenEpicaDto,
  TipoElementoPlanificacionDto,
  type ActividadRequisitoDto,
  type CapacidadesElementoPlanificacionDto,
  type CaracteristicaPlanificacionDto,
  type EpicaPlanificacionDto,
  type HistoriaPlanificacionDto,
  type ListaRequisitosDto,
  type PlanificacionProyectoDto,
  type TareaPlanificacionDto,
  type TareaRequisitoDto,
} from '../models/planificacion-proyecto.dto';
import {
  MotivoBloqueoPublicacionAzure,
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
  type PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';

/** Adapta la respuesta del backend al resumen utilizado por la página de planificación. */
export function mapearPlanificacionProyecto(
  dto: PlanificacionProyectoDto,
): PlanificacionProyecto {
  const resumen = {
    epicas: dto.resumen.totalEpicas,
    caracteristicas: dto.resumen.totalCaracteristicas,
    historias: dto.resumen.totalHistorias,
    tareas: dto.resumen.totalTareas,
    totalElementos:
      dto.resumen.totalEpicas +
      dto.resumen.totalCaracteristicas +
      dto.resumen.totalHistorias +
      dto.resumen.totalTareas,
  };

  return {
    proyectoId: dto.proyectoId,
    nombre: dto.nombreProyecto,
    versionId: dto.versionBacklogId,
    numeroVersion: dto.numeroVersion,
    esHistorica: dto.esHistorica,
    resumen,
    publicacionAzure: {
      puedePublicar: dto.publicacionAzure.puedePublicar,
      bloqueos: dto.publicacionAzure.bloqueos.map((bloqueo) => ({
        motivo: mapearMotivoBloqueoPublicacionAzure(bloqueo.motivo),
        cantidad: bloqueo.cantidad,
      })),
    },
    elementos: (dto.epicas ?? []).map((epica) => mapearEpica(epica, dto.esHistorica)),
  };
}

function mapearMotivoBloqueoPublicacionAzure(
  motivo: MotivoBloqueoPublicacionAzureDto,
): MotivoBloqueoPublicacionAzure {
  switch (motivo) {
    case MotivoBloqueoPublicacionAzureDto.VersionHistorica:
      return MotivoBloqueoPublicacionAzure.VersionHistorica;
    case MotivoBloqueoPublicacionAzureDto.SinCaracteristicas:
      return MotivoBloqueoPublicacionAzure.SinCaracteristicas;
    case MotivoBloqueoPublicacionAzureDto.CaracteristicasSinHistorias:
      return MotivoBloqueoPublicacionAzure.CaracteristicasSinHistorias;
    case MotivoBloqueoPublicacionAzureDto.HistoriasSinTareas:
      return MotivoBloqueoPublicacionAzure.HistoriasSinTareas;
    default:
      throw new Error(`Motivo de bloqueo de publicación no compatible: ${String(motivo)}.`);
  }
}

function mapearEpica(dto: EpicaPlanificacionDto, esHistorica: boolean): ElementoPlanificacion {
  exigirTipo(dto.tipo, TipoElementoPlanificacionDto.Epica);
  const vinculadaAzure =
    dto.origen === OrigenEpicaDto.AzureDevOps ||
    dto.azureWorkItemId !== null ||
    Boolean(dto.urlAzure) ||
    dto.esPrincipal;
  const capacidades = mapearCapacidades(dto.capacidades);
  const puedeOperarVinculoAzure = vinculadaAzure && dto.activo && !esHistorica;
  return crearElemento(
    dto.id,
    TipoElementoPlanificacion.Epica,
    dto.titulo,
    dto.activo,
    dto.numeroVersion,
    {
      ...capacidades,
      puedeCrearHijo: capacidades.puedeCrearHijo || puedeOperarVinculoAzure,
      puedeSincronizar: capacidades.puedeSincronizar || puedeOperarVinculoAzure,
    },
    dto.caracteristicas.map(mapearCaracteristica),
    null,
    vinculadaAzure,
  );
}

function mapearCaracteristica(dto: CaracteristicaPlanificacionDto): ElementoPlanificacion {
  exigirTipo(dto.tipo, TipoElementoPlanificacionDto.Caracteristica);
  const requisitos = dto.listaRequisitos ? [mapearListaRequisitos(dto.listaRequisitos)] : [];
  return crearElemento(
    dto.id,
    TipoElementoPlanificacion.Caracteristica,
    dto.titulo,
    dto.activo,
    dto.numeroVersion,
    mapearCapacidades(dto.capacidades),
    [...requisitos, ...dto.historias.map(mapearHistoria)],
  );
}

function mapearListaRequisitos(dto: ListaRequisitosDto): ElementoPlanificacion {
  return crearElemento(
    dto.idListaRequisitos,
    TipoElementoPlanificacion.ListaRequisitos,
    dto.nombre,
    dto.activo,
    dto.numeroVersion,
    {
      puedeConsultar: dto.activo && dto.capacidades.puedeEditar,
      puedeEditar: dto.capacidades.puedeEditar,
      puedeEliminar: dto.capacidades.puedeEliminar,
      puedeCrearHijo: dto.capacidades.puedeCrearActividad,
      puedeSincronizar: false,
      soloLectura: !dto.capacidades.puedeEditar && !dto.capacidades.puedeEliminar && !dto.capacidades.puedeCrearActividad,
    },
    dto.actividades.map(mapearActividadRequisito),
  );
}

function mapearActividadRequisito(dto: ActividadRequisitoDto): ElementoPlanificacion {
  return crearElemento(
    dto.idActividadRequisito,
    TipoElementoPlanificacion.ActividadRequisito,
    dto.titulo || dto.nombreActividad,
    dto.activo,
    dto.numeroVersion,
    {
      puedeConsultar: true,
      puedeEditar: dto.capacidades.puedeEditar,
      puedeEliminar: dto.capacidades.puedeEliminar,
      puedeCrearHijo: dto.capacidades.puedeCrearTareaRequisito,
      puedeSincronizar: false,
      soloLectura: !dto.capacidades.puedeEditar,
    },
    dto.tareasRequisitos.map(mapearTareaRequisito),
    dto.titulo && dto.nombreActividad !== dto.titulo ? dto.nombreActividad : null,
  );
}

function mapearTareaRequisito(dto: TareaRequisitoDto): ElementoPlanificacion {
  return crearElemento(
    dto.idTareaRequisito,
    TipoElementoPlanificacion.TareaRequisito,
    dto.titulo,
    dto.activo,
    dto.numeroVersion,
    {
      puedeConsultar: true,
      puedeEditar: dto.capacidades.puedeEditar,
      puedeEliminar: dto.capacidades.puedeEliminar,
      puedeCrearHijo: false,
      puedeSincronizar: false,
      soloLectura: !dto.capacidades.puedeEditar,
    },
    [],
    null,
    false,
    dto.requisito ? [dto.requisito] : [],
  );
}

function mapearHistoria(dto: HistoriaPlanificacionDto): ElementoPlanificacion {
  exigirTipo(dto.tipo, TipoElementoPlanificacionDto.Historia);
  return crearElemento(
    dto.id,
    TipoElementoPlanificacion.Historia,
    dto.titulo,
    dto.activo,
    dto.numeroVersion,
    mapearCapacidades(dto.capacidades),
    dto.tareas.map(mapearTarea),
  );
}

function mapearTarea(dto: TareaPlanificacionDto): ElementoPlanificacion {
  exigirTipo(dto.tipo, TipoElementoPlanificacionDto.Tarea);
  return crearElemento(
    dto.id,
    TipoElementoPlanificacion.Tarea,
    dto.titulo,
    dto.activo,
    dto.numeroVersion,
    mapearCapacidades(dto.capacidades),
  );
}

function crearElemento(
  id: number,
  tipo: TipoElementoPlanificacion,
  titulo: string,
  activo: boolean,
  numeroVersion: number,
  capacidades: ElementoPlanificacion['capacidades'],
  hijos: readonly ElementoPlanificacion[] = [],
  detalle: string | null = null,
  vinculadaAzure = false,
  terminosBusqueda: readonly string[] = [],
): ElementoPlanificacion {
  return {
    clave: `${tipo}:${id}`,
    id,
    tipo,
    titulo,
    detalle,
    terminosBusqueda,
    activo,
    numeroVersion,
    vinculadaAzure,
    capacidades,
    hijos,
  };
}

function mapearCapacidades(
  dto: CapacidadesElementoPlanificacionDto | null,
): ElementoPlanificacion['capacidades'] {
  const soloLectura = dto?.soloLectura === true;
  return {
    puedeConsultar: true,
    puedeEditar: dto?.puedeEditar === true && !soloLectura,
    puedeEliminar: dto?.puedeEliminar === true && !soloLectura,
    puedeCrearHijo: dto?.puedeCrearHijo === true && !soloLectura,
    puedeSincronizar: dto?.puedeSincronizar === true,
    soloLectura,
  };
}

function exigirTipo(valor: unknown, esperado: TipoElementoPlanificacionDto): void {
  if (valor !== esperado) {
    throw new Error(`Tipo de elemento de planificación no compatible: ${String(valor)}.`);
  }
}
