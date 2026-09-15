import type {
  ConversacionAsistenteIADto,
  DetallePropuestaAsistenteIADto,
  EnviarMensajeAsistenteIARespuestaDto,
  MensajeAsistenteIADto,
  PropuestaAsistenteIADto,
  ResolverPropuestaAsistenteIARespuestaDto,
} from '../models/asistente-ia.dto';
import type {
  ConversacionAsistenteIA,
  DetallePropuestaAsistenteIA,
  MensajeAsistenteIA,
  PropuestaAsistenteIA,
  RespuestaEnvioAsistenteIA,
  ResultadoResolucionPropuestaIA,
} from '../models/asistente-ia.model';
import { EstadoPropuestaAsistenteIA, RolMensajeAsistenteIA } from '../models/asistente-ia.model';

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
    propuesta: dto.propuesta ? mapearPropuesta(dto.propuesta) : null,
  };
}

function mapearPropuesta(dto: PropuestaAsistenteIADto): PropuestaAsistenteIA {
  return {
    seccion: exigirTexto(dto.seccion, 'sección'),
    etiquetaSeccion: exigirTexto(dto.etiquetaSeccion, 'etiqueta de sección'),
    campoObjetivo: normalizarTextoOpcional(dto.campoObjetivo),
    etiquetaObjetivo: normalizarTextoOpcional(dto.etiquetaObjetivo),
    resumen: exigirTexto(dto.resumen, 'resumen'),
    estado: normalizarEstado(dto.estado),
    detalles: dto.detalles.map(mapearDetalle),
  };
}

function mapearDetalle(dto: DetallePropuestaAsistenteIADto): DetallePropuestaAsistenteIA {
  return {
    etiqueta: exigirTexto(dto.etiqueta, 'etiqueta de detalle'),
    valores: dto.valores.map((valor) => exigirTexto(valor, 'valor de detalle')),
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

function normalizarTextoOpcional(valor: string | null): string | null {
  const normalizado = valor?.trim();
  return normalizado ? normalizado : null;
}

function exigirTexto(valor: string, campo: string): string {
  const normalizado = valor.trim();
  if (normalizado) return normalizado;
  throw new Error(`El contrato del Asistente IA no contiene ${campo}.`);
}
