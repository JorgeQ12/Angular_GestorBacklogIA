/** Representa un detalle de presentación preparado por el API. */
export interface DetallePropuestaAsistenteIADto {
  readonly etiqueta: string;
  readonly valores: readonly string[];
}

/** Representa la propuesta estructurada recibida desde el API. */
export interface PropuestaAsistenteIADto {
  readonly seccion: string;
  readonly etiquetaSeccion: string;
  readonly campoObjetivo: string | null;
  readonly etiquetaObjetivo: string | null;
  readonly resumen: string;
  readonly detalles: readonly DetallePropuestaAsistenteIADto[];
  readonly estado: string;
}

/** Representa un mensaje persistido en el contrato HTTP. */
export interface MensajeAsistenteIADto {
  readonly id: number;
  readonly rol: string;
  readonly texto: string;
  readonly orden: number;
  readonly fechaCreacion: string;
  readonly seccionContexto: string | null;
  readonly revisionContexto: number | null;
  readonly propuesta: PropuestaAsistenteIADto | null;
}

/** Agrupa el historial remoto asociado a un proyecto. */
export interface ConversacionAsistenteIADto {
  readonly proyectoId: number;
  readonly conversacionId: number | null;
  readonly mensajes: readonly MensajeAsistenteIADto[];
}

/** Contiene los dos turnos persistidos por una interacción. */
export interface EnviarMensajeAsistenteIARespuestaDto {
  readonly conversacionId: number;
  readonly mensajeUsuario: MensajeAsistenteIADto;
  readonly mensajeAsistente: MensajeAsistenteIADto;
}

/** Informa el estado y la revisión resultantes al resolver una propuesta. */
export interface ResolverPropuestaAsistenteIARespuestaDto {
  readonly proyectoId: number;
  readonly mensajeId: number;
  readonly estado: string;
  readonly revision: number;
}

/** Define el contexto mínimo enviado al modelo junto con el mensaje. */
export interface EnviarMensajeAsistenteIASolicitudDto {
  readonly proyectoId: number;
  readonly revisionContexto: number;
  readonly seccionContexto: string;
  readonly etiquetaSeccionContexto: string;
  readonly mensaje: string;
  readonly contenidoSeccionTemporalJson: string | null;
}

/** Identifica la propuesta y la revisión esperada antes de aplicarla. */
export interface AplicarPropuestaAsistenteIASolicitudDto {
  readonly proyectoId: number;
  readonly mensajeId: number;
  readonly revisionEsperada: number;
  readonly contenidoSeccionActualJson: string | null;
}

/** Identifica la propuesta que el usuario decidió rechazar. */
export interface RechazarPropuestaAsistenteIASolicitudDto {
  readonly proyectoId: number;
  readonly mensajeId: number;
}
