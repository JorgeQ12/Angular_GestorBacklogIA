import {
  ObjetoJson,
  deserializarObjetoJson,
} from '../../../../../shared/serializacion/json/lector-json';
import {
  ConexionFlujoProyecto,
  DatosNodoModulo,
  FlujoProyecto,
  LadoConexionFlujo,
  NodoFlujoProyecto,
  RolFlujoProyecto,
  TipoBloqueFlujo,
  esAccionPermisoModulo,
} from '../models/flujo-proyecto.model';

/** Crea el documento mínimo requerido por el editor de Flujo. */
export function crearFlujoProyectoVacio(proyectoId: number | string): FlujoProyecto {
  return {
    proyectoId: String(proyectoId),
    roles: [],
    nodos: [],
    conexiones: [],
    fechaActualizacion: new Date().toISOString(),
  };
}

/** Recupera el contrato canónico en español sin propagar JSON inválido al editor. */
export function deserializarFlujoProyecto(
  json: string,
  proyectoId: number | string,
): FlujoProyecto | null {
  const contenido = json.trim();
  if (!contenido || contenido === '{}') return crearFlujoProyectoVacio(proyectoId);

  const datos = deserializarObjetoJson(contenido);
  const roles = deserializarColeccion(datos['roles'], deserializarRol);
  const nodos = deserializarColeccion(datos['nodos'], deserializarNodo);
  const conexiones = deserializarColeccion(datos['conexiones'], deserializarConexion);
  if (
    typeof datos['proyectoId'] !== 'string' ||
    typeof datos['fechaActualizacion'] !== 'string' ||
    roles === null ||
    nodos === null ||
    conexiones === null
  ) {
    return null;
  }

  return {
    proyectoId: String(proyectoId),
    roles,
    nodos,
    conexiones,
    fechaActualizacion: datos['fechaActualizacion'],
  };
}

/** Produce el contrato canónico en español almacenado en `diagramFlujoJson`. */
export function serializarFlujoProyecto(flujo: FlujoProyecto): string {
  return JSON.stringify({
    proyectoId: flujo.proyectoId.trim(),
    roles: flujo.roles,
    nodos: flujo.nodos,
    conexiones: flujo.conexiones,
    fechaActualizacion: flujo.fechaActualizacion,
  });
}

function deserializarRol(valor: unknown): RolFlujoProyecto | null {
  if (!esObjeto(valor)) return null;
  const id = valor['id'];
  const nombre = valor['nombre'];
  const fechaCreacion = valor['fechaCreacion'];
  return typeof id === 'string' && typeof nombre === 'string' && typeof fechaCreacion === 'string'
    ? { id, nombre, fechaCreacion }
    : null;
}

function deserializarNodo(valor: unknown): NodoFlujoProyecto | null {
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
    titulo,
    descripcion,
    criteriosAceptacion,
    posicion: { x: posicion['x'], y: posicion['y'] },
    idsRoles,
    fechaCreacion,
    fechaActualizacion,
  };

  switch (valor['tipo']) {
    case TipoBloqueFlujo.Modulo: {
      const datosModulo = deserializarDatosModulo(datos);
      return datosModulo
        ? { ...propiedadesComunes, tipo: TipoBloqueFlujo.Modulo, datos: datosModulo }
        : null;
    }
    case TipoBloqueFlujo.Componente: {
      const datosCapturados = datos['datosCapturados'];
      const camposObligatorios = datos['camposObligatorios'];
      const resultadoCompletado = datos['resultadoCompletado'];
      return typeof datosCapturados === 'string' &&
        typeof camposObligatorios === 'string' &&
        typeof resultadoCompletado === 'string'
        ? {
            ...propiedadesComunes,
            tipo: TipoBloqueFlujo.Componente,
            datos: { datosCapturados, camposObligatorios, resultadoCompletado },
          }
        : null;
    }
    case TipoBloqueFlujo.Pagina:
      return { ...propiedadesComunes, tipo: TipoBloqueFlujo.Pagina, datos: {} };
    case TipoBloqueFlujo.Accion:
      return { ...propiedadesComunes, tipo: TipoBloqueFlujo.Accion, datos: {} };
    case TipoBloqueFlujo.Decision:
      return { ...propiedadesComunes, tipo: TipoBloqueFlujo.Decision, datos: {} };
  }
}

function deserializarDatosModulo(datos: ObjetoJson): DatosNodoModulo | null {
  const permisosRoles = deserializarColeccion(datos['permisosRoles'], (valor) => {
    if (!esObjeto(valor)) return null;
    const idRol = valor['idRol'];
    const permisos = valor['permisos'];
    return typeof idRol === 'string' &&
      Array.isArray(permisos) &&
      permisos.every(
        (permiso) => typeof permiso === 'string' && esAccionPermisoModulo(permiso),
      )
      ? { idRol, permisos }
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
        ? { dias, horaInicio, horaFin }
        : null;
    },
  );
  return permisosRoles !== null &&
    horariosMayorActividad !== null &&
    typeof datos['usuariosConcurrentes'] === 'string'
    ? {
        permisosRoles,
        usuariosConcurrentes: datos['usuariosConcurrentes'],
        horariosMayorActividad,
      }
    : null;
}

function deserializarConexion(valor: unknown): ConexionFlujoProyecto | null {
  if (!esObjeto(valor)) return null;
  const id = valor['id'];
  const idBloqueOrigen = valor['idBloqueOrigen'];
  const idBloqueDestino = valor['idBloqueDestino'];
  const etiqueta = valor['etiqueta'];
  const ladoDestino = valor['ladoDestino'];
  const fechaCreacion = valor['fechaCreacion'];
  if (
    typeof id !== 'string' ||
    typeof idBloqueOrigen !== 'string' ||
    typeof idBloqueDestino !== 'string' ||
    (etiqueta !== null && etiqueta !== undefined && typeof etiqueta !== 'string') ||
    (ladoDestino !== null && ladoDestino !== undefined && !esLadoConexion(ladoDestino)) ||
    typeof fechaCreacion !== 'string'
  ) {
    return null;
  }

  return {
    id,
    idBloqueOrigen,
    idBloqueDestino,
    etiqueta: etiqueta ?? undefined,
    ladoDestino: ladoDestino ?? undefined,
    fechaCreacion,
  };
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

function esTipoBloque(valor: unknown): valor is TipoBloqueFlujo {
  return Object.values(TipoBloqueFlujo).includes(valor as TipoBloqueFlujo);
}

function esLadoConexion(valor: unknown): valor is LadoConexionFlujo {
  return ['izquierda', 'derecha', 'arriba', 'abajo'].includes(String(valor));
}

function esListaCadenas(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((elemento) => typeof elemento === 'string');
}

function esObjeto(valor: unknown): valor is ObjetoJson {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}
