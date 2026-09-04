import type {
  ConversacionAsistenteIADto,
  EnviarMensajeAsistenteIARespuestaDto,
  MensajeAsistenteIADto,
  ResolverPropuestaAsistenteIARespuestaDto,
} from '../models/asistente-ia.dto';
import type {
  ConversacionAsistenteIA,
  DetallePropuestaAsistenteIA,
  MensajeAsistenteIA,
  RespuestaEnvioAsistenteIA,
  ResultadoResolucionPropuestaIA,
} from '../models/asistente-ia.model';
import {
  EstadoPropuestaAsistenteIA,
  RolMensajeAsistenteIA,
} from '../models/asistente-ia.model';

/** Adapta el historial HTTP a los modelos consumidos por el panel. */
export function mapearConversacionAsistenteIA(
  dto: ConversacionAsistenteIADto,
): ConversacionAsistenteIA {
  return {
    proyectoId: dto.proyectoId,
    conversacionId: dto.conversacionId,
    mensajes: dto.mensajes.map(mapearMensajeAsistenteIA),
  };
}

/** Adapta los turnos confirmados de una nueva interacción. */
export function mapearRespuestaEnvioAsistenteIA(
  dto: EnviarMensajeAsistenteIARespuestaDto,
): RespuestaEnvioAsistenteIA {
  return {
    conversacionId: dto.conversacionId,
    mensajeUsuario: mapearMensajeAsistenteIA(dto.mensajeUsuario),
    mensajeAsistente: mapearMensajeAsistenteIA(dto.mensajeAsistente),
  };
}

/** Normaliza el estado externo devuelto al resolver una propuesta. */
export function mapearResolucionPropuestaIA(
  dto: ResolverPropuestaAsistenteIARespuestaDto,
): ResultadoResolucionPropuestaIA {
  return {
    proyectoId: dto.proyectoId,
    mensajeId: dto.mensajeId,
    estado: normalizarEstado(dto.estado),
    revision: dto.revision,
  };
}

function mapearMensajeAsistenteIA(dto: MensajeAsistenteIADto): MensajeAsistenteIA {
  return {
    id: dto.id,
    rol: normalizarRol(dto.rol),
    texto: dto.texto,
    orden: dto.orden,
    fechaCreacion: dto.fechaCreacion,
    seccionContexto: dto.seccionContexto,
    revisionContexto: dto.revisionContexto,
    propuesta: dto.propuesta
      ? {
          seccion: dto.propuesta.seccion,
          resumen: dto.propuesta.resumen,
          contenidoJson: dto.propuesta.contenidoJson,
          estado: normalizarEstado(dto.propuesta.estado),
          detalles: crearDetallesPropuesta(dto.propuesta.seccion, dto.propuesta.contenidoJson),
        }
      : null,
  };
}

function normalizarRol(rol: string): RolMensajeAsistenteIA {
  const normalizado = rol.toLowerCase();
  if (normalizado === RolMensajeAsistenteIA.Usuario) return RolMensajeAsistenteIA.Usuario;
  if (normalizado === RolMensajeAsistenteIA.Asistente) return RolMensajeAsistenteIA.Asistente;
  throw new Error(`Rol desconocido en la conversación del Asistente IA: ${rol}`);
}

function normalizarEstado(estado: string): EstadoPropuestaAsistenteIA {
  const normalizado = estado.toLowerCase();
  if (normalizado === EstadoPropuestaAsistenteIA.Pendiente) {
    return EstadoPropuestaAsistenteIA.Pendiente;
  }
  if (normalizado === EstadoPropuestaAsistenteIA.Aplicada) {
    return EstadoPropuestaAsistenteIA.Aplicada;
  }
  if (normalizado === EstadoPropuestaAsistenteIA.Rechazada) {
    return EstadoPropuestaAsistenteIA.Rechazada;
  }
  throw new Error(`Estado desconocido en una propuesta del Asistente IA: ${estado}`);
}

function crearDetallesPropuesta(
  seccion: string,
  contenidoJson: string,
): readonly DetallePropuestaAsistenteIA[] {
  try {
    const contenido: unknown = JSON.parse(contenidoJson);
    switch (seccion.toLocaleLowerCase()) {
      case 'necesidad':
        return detallesObjeto(contenido, [
          ['Proceso actual', 'situacionActual'],
          ['Problemas', 'problemas'],
          ['Impacto', 'impacto'],
        ]);
      case 'objetivos':
        return detallesObjeto(contenido, [
          ['Objetivo general', 'objetivoGeneral'],
          ['Objetivos específicos', 'objetivosEspecificos'],
        ]);
      case 'alcance':
        return detallesObjeto(contenido, [
          ['Incluido', 'incluido'],
          ['Excluido', 'excluido'],
        ]);
      case 'roles':
        return detallesRoles(contenido);
      default:
        return [];
    }
  } catch {
    return [];
  }
}

function detallesObjeto(
  contenido: unknown,
  campos: readonly (readonly [string, string])[],
): readonly DetallePropuestaAsistenteIA[] {
  if (!esObjeto(contenido)) return [];
  return campos
    .map(([etiqueta, clave]) => ({ etiqueta, valores: normalizarValores(contenido[clave]) }))
    .filter((detalle) => detalle.valores.length > 0);
}

function detallesRoles(contenido: unknown): readonly DetallePropuestaAsistenteIA[] {
  if (!Array.isArray(contenido)) return [];
  return contenido.flatMap((rol, indice) => {
    if (!esObjeto(rol)) return [];
    const nombre = typeof rol['nombre'] === 'string' ? rol['nombre'].trim() : '';
    const descripcion = typeof rol['descripcion'] === 'string' ? rol['descripcion'].trim() : '';
    if (!nombre && !descripcion) return [];
    return [{ etiqueta: nombre || `Rol ${indice + 1}`, valores: descripcion ? [descripcion] : [] }];
  });
}

function normalizarValores(valor: unknown): readonly string[] {
  if (typeof valor === 'string') return valor.trim() ? [valor.trim()] : [];
  if (!Array.isArray(valor)) return [];
  return valor.filter((item): item is string => typeof item === 'string' && !!item.trim());
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}
