import {
  MotivoInactivacionElementoDto,
  TipoElementoPlanificacionDto,
} from '../models/planificacion-proyecto.dto';
import type {
  ActualizarElementoPlanificacionDto,
  CrearElementoPlanificacionDto,
  DetalleElementoPlanificacionDto,
  ResultadoEliminacionElementoPlanificacionDto,
} from '../models/elemento-planificacion.dto';
import type {
  CatalogosFormularioElementoPlanificacion,
  ContextoEditorElementoPlanificacion,
  DetalleElementoPlanificacion,
  ResultadoEliminacionElementoPlanificacion,
  TipoItemPlanificacion,
  ValoresFormularioElementoPlanificacion,
} from '../models/detalle-elemento-planificacion.model';
import {
  ModoEditorElementoPlanificacion,
  MotivoInactivacionElementoPlanificacion,
} from '../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';

const TIPO_CONSULTA: Readonly<Record<TipoItemPlanificacion, string>> = {
  [TipoElementoPlanificacion.Epica]: 'Epica',
  [TipoElementoPlanificacion.Caracteristica]: 'Caracteristica',
  [TipoElementoPlanificacion.Historia]: 'Historia',
  [TipoElementoPlanificacion.Tarea]: 'Tarea',
  [TipoElementoPlanificacion.ActividadRequisito]: 'ActividadRequisito',
  [TipoElementoPlanificacion.TareaRequisito]: 'TareaRequisito',
};

/** Convierte el tipo interno al valor aceptado por el parámetro Tipo del backend. */
export function serializarTipoElementoConsulta(tipo: TipoItemPlanificacion): string {
  return TIPO_CONSULTA[tipo];
}

/** Convierte cualquier tipo eliminable, incluido el contenedor de requisitos. */
export function serializarTipoElementoEliminacion(tipo: TipoElementoPlanificacion): string {
  return tipo === TipoElementoPlanificacion.ListaRequisitos
    ? 'ListaRequisitos'
    : serializarTipoElementoConsulta(tipo);
}

/** Adapta el resultado remoto de una eliminación lógica. */
export function mapearResultadoEliminacionElemento(
  dto: ResultadoEliminacionElementoPlanificacionDto,
): ResultadoEliminacionElementoPlanificacion {
  return {
    elementoId: dto.itemTrabajoId,
    totalInactivados: dto.totalInactivados,
  };
}

/** Adapta el detalle remoto a una fotografía uniforme para el formulario. */
export function mapearDetalleElementoPlanificacion(
  dto: DetalleElementoPlanificacionDto,
): DetalleElementoPlanificacion {
  const tipo = mapearTipoPersistible(dto.tipo);
  const base: DetalleElementoPlanificacion = {
    tipo,
    id: dto.id,
    proyectoId: dto.proyectoId,
    urlAzure: null,
    activo: dto.activo,
    numeroVersion: dto.numeroVersionActual,
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    estimacionHoras: dto.estimacionHoras,
    fechaInicio: normalizarFecha(dto.fechaInicio),
    fechaFinal: normalizarFecha(dto.fechaFinal),
    fechaCreacion: dto.fechaCreacion,
    fechaInactivacion: dto.fechaInactivacion,
    motivoInactivacion: mapearMotivoInactivacion(dto.motivoInactivacion),
    capacidades: {
      puedeEditar: dto.capacidades.puedeEditar,
      puedeVerHistorial: dto.capacidades.puedeVerHistorial,
      puedeSincronizar: dto.capacidades.puedeSincronizar,
      soloLectura: dto.soloLectura || dto.capacidades.soloLectura,
    },
    alcance: '',
    riesgos: '',
    criteriosExito: '',
    prioridadCatalogoId: null,
    riesgoCatalogoId: null,
    objetivo: '',
    criteriosAceptacion: '',
    dependencias: '',
    actividadCatalogoId: null,
    complejidad: 3,
    prioridad: 4,
    discusion: '',
    responsable: '',
    requisito: '',
  };

  switch (dto.tipo) {
    case TipoElementoPlanificacionDto.Epica:
      return {
        ...base,
        urlAzure: dto.urlAzure,
        alcance: dto.alcance ?? '',
        riesgos: dto.riesgos ?? '',
        criteriosExito: dto.criteriosExito ?? '',
        prioridadCatalogoId: dto.prioridadCatalogoId,
        riesgoCatalogoId: dto.riesgoCatalogoId,
      };
    case TipoElementoPlanificacionDto.Caracteristica:
      return { ...base, alcance: dto.alcance };
    case TipoElementoPlanificacionDto.Historia:
      return {
        ...base,
        objetivo: dto.objetivo,
        alcance: dto.alcance,
        criteriosAceptacion: dto.criteriosAceptacion,
      };
    case TipoElementoPlanificacionDto.Tarea:
      return {
        ...base,
        dependencias: dto.dependencias,
        actividadCatalogoId: dto.actividadCatalogoId,
        complejidad: dto.complejidad,
      };
    case TipoElementoPlanificacionDto.ActividadRequisito:
      return {
        ...base,
        actividadCatalogoId: dto.actividadCatalogoId,
        prioridad: dto.prioridad,
        discusion: dto.discusion ?? '',
        responsable: dto.responsable ?? '',
      };
    case TipoElementoPlanificacionDto.TareaRequisito:
      return {
        ...base,
        requisito: dto.requisito ?? '',
        responsable: dto.responsable ?? '',
      };
  }
}

function mapearMotivoInactivacion(
  motivo: MotivoInactivacionElementoDto | null,
): MotivoInactivacionElementoPlanificacion | null {
  switch (motivo) {
    case null:
      return null;
    case MotivoInactivacionElementoDto.Eliminacion:
      return MotivoInactivacionElementoPlanificacion.Eliminacion;
    case MotivoInactivacionElementoDto.GeneracionIa:
      return MotivoInactivacionElementoPlanificacion.GeneracionIa;
    case MotivoInactivacionElementoDto.Legado:
      return MotivoInactivacionElementoPlanificacion.Legado;
    default:
      throw new Error(`Motivo de inactivación no compatible: ${String(motivo)}.`);
  }
}

/** Produce valores iniciales coherentes para creación o a partir del detalle consultado. */
export function crearValoresFormularioElemento(
  tipo: TipoItemPlanificacion,
  catalogos: CatalogosFormularioElementoPlanificacion,
  detalle: DetalleElementoPlanificacion | null,
): ValoresFormularioElementoPlanificacion {
  if (detalle) {
    return {
      titulo: detalle.titulo,
      descripcion: detalle.descripcion,
      alcance: detalle.alcance,
      riesgos: detalle.riesgos,
      criteriosExito: detalle.criteriosExito,
      prioridadCatalogoId: detalle.prioridadCatalogoId,
      riesgoCatalogoId: detalle.riesgoCatalogoId,
      objetivo: detalle.objetivo,
      criteriosAceptacion: detalle.criteriosAceptacion,
      dependencias: detalle.dependencias,
      actividadCatalogoId: detalle.actividadCatalogoId,
      complejidad: detalle.complejidad,
      prioridad: detalle.prioridad,
      discusion: detalle.discusion,
      responsable: detalle.responsable,
      requisito: detalle.requisito,
      estimacionHoras: detalle.estimacionHoras,
      fechaInicio: detalle.fechaInicio,
      fechaFinal: detalle.fechaFinal,
    };
  }

  const hoy = obtenerFechaLocalActual();
  const esRequisito =
    tipo === TipoElementoPlanificacion.ActividadRequisito ||
    tipo === TipoElementoPlanificacion.TareaRequisito;
  const actividadInicial =
    tipo === TipoElementoPlanificacion.ActividadRequisito
      ? catalogos.actividadesRequisito[0]?.id
      : catalogos.actividadesTarea[0]?.id;

  return {
    titulo: '',
    descripcion: '',
    alcance: '',
    riesgos: '',
    criteriosExito: '',
    prioridadCatalogoId: null,
    riesgoCatalogoId: null,
    objetivo: '',
    criteriosAceptacion: '',
    dependencias: '',
    actividadCatalogoId: actividadInicial ?? null,
    complejidad: 3,
    prioridad: 4,
    discusion: '',
    responsable: '',
    requisito: '',
    estimacionHoras: esRequisito ? null : 8,
    fechaInicio: esRequisito ? '' : hoy,
    fechaFinal: esRequisito ? '' : hoy,
  };
}

/** Construye el comando de creación a partir del contexto estable del árbol. */
export function crearSolicitudElemento(
  contexto: ContextoEditorElementoPlanificacion,
  valores: ValoresFormularioElementoPlanificacion,
): CrearElementoPlanificacionDto {
  if (contexto.modo !== ModoEditorElementoPlanificacion.Creacion || contexto.padreId === null) {
    throw new Error('El contexto no permite crear un elemento de planificación.');
  }
  const base = mapearValoresComunes(valores);
  switch (contexto.tipo) {
    case TipoElementoPlanificacion.Epica:
      return {
        tipo: TipoElementoPlanificacionDto.Epica,
        proyectoId: contexto.proyectoId,
        alcance: textoOpcional(valores.alcance),
        riesgos: textoOpcional(valores.riesgos),
        criteriosExito: textoOpcional(valores.criteriosExito),
        prioridadCatalogoId: valores.prioridadCatalogoId,
        riesgoCatalogoId: valores.riesgoCatalogoId,
        ...base,
      };
    case TipoElementoPlanificacion.Caracteristica:
      return {
        tipo: TipoElementoPlanificacionDto.Caracteristica,
        proyectoId: contexto.proyectoId,
        epicaId: contexto.padreId,
        alcance: valores.alcance.trim(),
        ...base,
      };
    case TipoElementoPlanificacion.Historia:
      return {
        tipo: TipoElementoPlanificacionDto.Historia,
        caracteristicaId: contexto.padreId,
        objetivo: valores.objetivo.trim(),
        alcance: valores.alcance.trim(),
        criteriosAceptacion: valores.criteriosAceptacion.trim(),
        ...base,
      };
    case TipoElementoPlanificacion.Tarea:
      return {
        tipo: TipoElementoPlanificacionDto.Tarea,
        historiaUsuarioId: contexto.padreId,
        dependencias: valores.dependencias.trim(),
        actividadCatalogoId: exigirNumero(valores.actividadCatalogoId),
        complejidad: valores.complejidad,
        ...base,
      };
    case TipoElementoPlanificacion.ActividadRequisito:
      return {
        tipo: TipoElementoPlanificacionDto.ActividadRequisito,
        listaRequisitosId: contexto.padreId,
        actividadCatalogoId: exigirNumero(valores.actividadCatalogoId),
        prioridad: valores.prioridad,
        discusion: textoOpcional(valores.discusion),
        responsable: textoOpcional(valores.responsable),
        ...base,
      };
    case TipoElementoPlanificacion.TareaRequisito:
      return {
        tipo: TipoElementoPlanificacionDto.TareaRequisito,
        actividadRequisitoId: contexto.padreId,
        requisito: textoOpcional(valores.requisito),
        responsable: textoOpcional(valores.responsable),
        ...base,
      };
  }
}

/** Construye el comando concurrente de actualización desde el detalle vigente. */
export function crearActualizacionElemento(
  detalle: DetalleElementoPlanificacion,
  valores: ValoresFormularioElementoPlanificacion,
): ActualizarElementoPlanificacionDto {
  const base = {
    itemTrabajoId: detalle.id,
    numeroVersionEsperada: detalle.numeroVersion,
    ...mapearValoresComunes(valores),
  };
  switch (detalle.tipo) {
    case TipoElementoPlanificacion.Epica:
      return {
        tipo: TipoElementoPlanificacionDto.Epica,
        alcance: textoOpcional(valores.alcance),
        riesgos: textoOpcional(valores.riesgos),
        criteriosExito: textoOpcional(valores.criteriosExito),
        prioridadCatalogoId: valores.prioridadCatalogoId,
        riesgoCatalogoId: valores.riesgoCatalogoId,
        ...base,
      };
    case TipoElementoPlanificacion.Caracteristica:
      return {
        tipo: TipoElementoPlanificacionDto.Caracteristica,
        alcance: valores.alcance.trim(),
        ...base,
      };
    case TipoElementoPlanificacion.Historia:
      return {
        tipo: TipoElementoPlanificacionDto.Historia,
        objetivo: valores.objetivo.trim(),
        alcance: valores.alcance.trim(),
        criteriosAceptacion: valores.criteriosAceptacion.trim(),
        ...base,
      };
    case TipoElementoPlanificacion.Tarea:
      return {
        tipo: TipoElementoPlanificacionDto.Tarea,
        dependencias: valores.dependencias.trim(),
        actividadCatalogoId: exigirNumero(valores.actividadCatalogoId),
        complejidad: valores.complejidad,
        ...base,
      };
    case TipoElementoPlanificacion.ActividadRequisito:
      return {
        tipo: TipoElementoPlanificacionDto.ActividadRequisito,
        actividadCatalogoId: exigirNumero(valores.actividadCatalogoId),
        prioridad: valores.prioridad,
        discusion: textoOpcional(valores.discusion),
        responsable: textoOpcional(valores.responsable),
        ...base,
      };
    case TipoElementoPlanificacion.TareaRequisito:
      return {
        tipo: TipoElementoPlanificacionDto.TareaRequisito,
        requisito: textoOpcional(valores.requisito),
        responsable: textoOpcional(valores.responsable),
        ...base,
      };
  }
}

function mapearTipoPersistible(tipo: DetalleElementoPlanificacionDto['tipo']): TipoItemPlanificacion {
  switch (tipo) {
    case TipoElementoPlanificacionDto.Epica:
      return TipoElementoPlanificacion.Epica;
    case TipoElementoPlanificacionDto.Caracteristica:
      return TipoElementoPlanificacion.Caracteristica;
    case TipoElementoPlanificacionDto.Historia:
      return TipoElementoPlanificacion.Historia;
    case TipoElementoPlanificacionDto.Tarea:
      return TipoElementoPlanificacion.Tarea;
    case TipoElementoPlanificacionDto.ActividadRequisito:
      return TipoElementoPlanificacion.ActividadRequisito;
    case TipoElementoPlanificacionDto.TareaRequisito:
      return TipoElementoPlanificacion.TareaRequisito;
  }
}

function mapearValoresComunes(valores: ValoresFormularioElementoPlanificacion) {
  return {
    titulo: valores.titulo.trim(),
    descripcion: valores.descripcion.trim(),
    estimacionHoras: valores.estimacionHoras,
    fechaInicio: valores.fechaInicio || null,
    fechaFinal: valores.fechaFinal || null,
  };
}

function textoOpcional(valor: string): string | null {
  return valor.trim() || null;
}

function exigirNumero(valor: number | null): number {
  if (valor === null) throw new Error('El catálogo requerido no fue seleccionado.');
  return valor;
}

function normalizarFecha(valor: string): string {
  const fecha = valor.slice(0, 10);
  return fecha >= '1900-01-01' ? fecha : '';
}

function obtenerFechaLocalActual(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}
