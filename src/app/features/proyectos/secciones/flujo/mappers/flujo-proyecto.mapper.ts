import { ObjetoJson, deserializarObjetoJson } from '../../../../../shared/serializacion/json/lector-json';
import {
  FlowBlockType,
  ModuleNodeData,
  ProjectFlowConnection,
  ProjectFlowConnectionSide,
  ProjectFlowRole,
  ProjectWorkflow,
  ProjectWorkflowNode,
  isModulePermissionAction,
} from '../models/flujo-proyecto.model';

/** Crea el documento mínimo requerido por el editor de Flujo. */
export function crearFlujoProyectoVacio(proyectoId: number | string): ProjectWorkflow {
  return {
    projectId: String(proyectoId),
    roles: [],
    nodes: [],
    connections: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Recupera el contrato canónico en español sin propagar JSON inválido al editor. */
export function deserializarFlujoProyecto(
  json: string,
  proyectoId: number | string,
): ProjectWorkflow | null {
  const contenido = json.trim();
  if (!contenido || contenido === '{}') return crearFlujoProyectoVacio(proyectoId);

  const datos = deserializarObjetoJson(contenido);
  const roles = deserializarColeccion(datos['roles'], deserializarRol);
  const nodes = deserializarColeccion(datos['nodos'], deserializarNodo);
  const connections = deserializarColeccion(datos['conexiones'], deserializarConexion);
  if (
    typeof datos['proyectoId'] !== 'string' ||
    typeof datos['fechaActualizacion'] !== 'string' ||
    roles === null ||
    nodes === null ||
    connections === null
  ) {
    return null;
  }

  return {
    projectId: String(proyectoId),
    roles,
    nodes,
    connections,
    updatedAt: datos['fechaActualizacion'],
  };
}

/** Produce el contrato canónico en español almacenado en `diagramFlujoJson`. */
export function serializarFlujoProyecto(flujo: ProjectWorkflow): string {
  return JSON.stringify({
    proyectoId: flujo.projectId.trim(),
    roles: flujo.roles.map((rol) => ({
      id: rol.id,
      nombre: rol.name,
      fechaCreacion: rol.createdAt,
    })),
    nodos: flujo.nodes.map((nodo) => ({
      id: nodo.id,
      tipo: nodo.type,
      titulo: nodo.title,
      descripcion: nodo.description,
      criteriosAceptacion: nodo.acceptanceCriteria,
      posicion: nodo.position,
      idsRoles: nodo.roleIds,
      fechaCreacion: nodo.createdAt,
      fechaActualizacion: nodo.updatedAt,
      datos: serializarDatosNodo(nodo),
    })),
    conexiones: flujo.connections.map((conexion) => ({
      id: conexion.id,
      idNodoOrigen: conexion.sourceBlockId,
      idNodoDestino: conexion.targetBlockId,
      etiqueta: conexion.label ?? null,
      ladoDestino: conexion.targetSide ?? null,
      fechaCreacion: conexion.createdAt,
    })),
    fechaActualizacion: flujo.updatedAt,
  });
}

function deserializarRol(valor: unknown): ProjectFlowRole | null {
  if (!esObjeto(valor)) return null;
  const id = valor['id'];
  const nombre = valor['nombre'];
  const fechaCreacion = valor['fechaCreacion'];
  return typeof id === 'string' && typeof nombre === 'string' && typeof fechaCreacion === 'string'
    ? { id, name: nombre, createdAt: fechaCreacion }
    : null;
}

function deserializarNodo(valor: unknown): ProjectWorkflowNode | null {
  if (!esObjeto(valor) || !esTipoBloque(valor['tipo'])) return null;
  const id = valor['id'];
  const titulo = valor['titulo'];
  const descripcion = valor['descripcion'];
  const criteriosAceptacion = valor['criteriosAceptacion'];
  const posicion = valor['posicion'];
  const idsRoles = valor['idsRoles'];
  const fechaCreacion = valor['fechaCreacion'];
  const fechaActualizacion = valor['fechaActualizacion'];
  const datos = valor['datos'];
  if (
    typeof id !== 'string' ||
    typeof titulo !== 'string' ||
    typeof descripcion !== 'string' ||
    !esListaCadenas(criteriosAceptacion) ||
    !esObjeto(posicion) ||
    typeof posicion['x'] !== 'number' ||
    typeof posicion['y'] !== 'number' ||
    !esListaCadenas(idsRoles) ||
    typeof fechaCreacion !== 'string' ||
    typeof fechaActualizacion !== 'string' ||
    !esObjeto(datos)
  ) {
    return null;
  }

  const propiedadesComunes = {
    id,
    title: titulo,
    description: descripcion,
    acceptanceCriteria: criteriosAceptacion,
    position: { x: posicion['x'], y: posicion['y'] },
    roleIds: idsRoles,
    createdAt: fechaCreacion,
    updatedAt: fechaActualizacion,
  };

  switch (valor['tipo']) {
    case FlowBlockType.Module: {
      const datosModulo = deserializarDatosModulo(datos);
      return datosModulo
        ? { ...propiedadesComunes, type: FlowBlockType.Module, data: datosModulo }
        : null;
    }
    case FlowBlockType.Form: {
      const datosCapturados = datos['datosCapturados'];
      const camposObligatorios = datos['camposObligatorios'];
      const resultadoCompletado = datos['resultadoCompletado'];
      return typeof datosCapturados === 'string' &&
        typeof camposObligatorios === 'string' &&
        typeof resultadoCompletado === 'string'
        ? {
            ...propiedadesComunes,
            type: FlowBlockType.Form,
            data: {
              capturedData: datosCapturados,
              requiredFields: camposObligatorios,
              completionOutcome: resultadoCompletado,
            },
          }
        : null;
    }
    case FlowBlockType.Screen:
      return { ...propiedadesComunes, type: FlowBlockType.Screen, data: {} };
    case FlowBlockType.Action:
      return { ...propiedadesComunes, type: FlowBlockType.Action, data: {} };
    case FlowBlockType.Decision:
      return { ...propiedadesComunes, type: FlowBlockType.Decision, data: {} };
  }
}

function deserializarDatosModulo(datos: ObjetoJson): ModuleNodeData | null {
  const permisosRoles = deserializarColeccion(datos['permisosRoles'], (valor) => {
    if (!esObjeto(valor)) return null;
    const idRol = valor['idRol'];
    const permisos = valor['permisos'];
    return typeof idRol === 'string' &&
      Array.isArray(permisos) &&
      permisos.every((permiso) => typeof permiso === 'string' && isModulePermissionAction(permiso))
      ? { roleId: idRol, permissions: permisos }
      : null;
  });
  const horariosMayorActividad = deserializarColeccion(
    datos['horariosMayorActividad'],
    (valor) => {
      if (!esObjeto(valor)) return null;
      const dias = valor['dias'];
      const horaInicio = valor['horaInicio'];
      const horaFin = valor['horaFin'];
      return esListaCadenas(dias) && typeof horaInicio === 'string' && typeof horaFin === 'string'
        ? { days: dias, startTime: horaInicio, endTime: horaFin }
        : null;
    },
  );
  return permisosRoles !== null &&
    horariosMayorActividad !== null &&
    typeof datos['usuariosConcurrentes'] === 'string'
    ? {
        rolePermissions: permisosRoles,
        concurrentUsers: datos['usuariosConcurrentes'],
        peakBusinessHours: horariosMayorActividad,
      }
    : null;
}

function deserializarConexion(valor: unknown): ProjectFlowConnection | null {
  if (!esObjeto(valor)) return null;
  const id = valor['id'];
  const idNodoOrigen = valor['idNodoOrigen'];
  const idNodoDestino = valor['idNodoDestino'];
  const etiqueta = valor['etiqueta'];
  const ladoDestino = valor['ladoDestino'];
  const fechaCreacion = valor['fechaCreacion'];
  if (
    typeof id !== 'string' ||
    typeof idNodoOrigen !== 'string' ||
    typeof idNodoDestino !== 'string' ||
    (etiqueta !== null && typeof etiqueta !== 'string') ||
    (ladoDestino !== null && !esLadoConexion(ladoDestino)) ||
    typeof fechaCreacion !== 'string'
  ) {
    return null;
  }

  return {
    id,
    sourceBlockId: idNodoOrigen,
    targetBlockId: idNodoDestino,
    label: etiqueta ?? undefined,
    targetSide: ladoDestino ?? undefined,
    createdAt: fechaCreacion,
  };
}

function serializarDatosNodo(nodo: ProjectWorkflowNode): Record<string, unknown> {
  switch (nodo.type) {
    case FlowBlockType.Module:
      return {
        permisosRoles: nodo.data.rolePermissions.map((permiso) => ({
          idRol: permiso.roleId,
          permisos: permiso.permissions,
        })),
        usuariosConcurrentes: nodo.data.concurrentUsers,
        horariosMayorActividad: nodo.data.peakBusinessHours.map((periodo) => ({
          dias: periodo.days,
          horaInicio: periodo.startTime,
          horaFin: periodo.endTime,
        })),
      };
    case FlowBlockType.Form:
      return {
        datosCapturados: nodo.data.capturedData,
        camposObligatorios: nodo.data.requiredFields,
        resultadoCompletado: nodo.data.completionOutcome,
      };
    case FlowBlockType.Screen:
    case FlowBlockType.Action:
    case FlowBlockType.Decision:
      return {};
  }
}

function deserializarColeccion<T>(
  valor: unknown,
  deserializar: (elemento: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(valor)) return null;
  const resultado: T[] = [];
  for (const elemento of valor) {
    const dato = deserializar(elemento);
    if (dato === null) return null;
    resultado.push(dato);
  }
  return resultado;
}

function esTipoBloque(valor: unknown): valor is FlowBlockType {
  return Object.values(FlowBlockType).includes(valor as FlowBlockType);
}

function esLadoConexion(valor: unknown): valor is ProjectFlowConnectionSide {
  return ['left', 'right', 'top', 'bottom'].includes(String(valor));
}

function esListaCadenas(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((elemento) => typeof elemento === 'string');
}

function esObjeto(valor: unknown): valor is ObjetoJson {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}
