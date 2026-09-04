/** Identifica el autor visible de un mensaje persistido. */
export enum RolMensajeAsistenteIA {
  Usuario = 'usuario',
  Asistente = 'asistente',
}

/** Representa la decisión explícita tomada sobre una propuesta. */
export enum EstadoPropuestaAsistenteIA {
  Pendiente = 'pendiente',
  Aplicada = 'aplicada',
  Rechazada = 'rechazada',
}

/** Describe un campo legible derivado del JSON canónico de la propuesta. */
export interface DetallePropuestaAsistenteIA {
  readonly etiqueta: string;
  readonly valores: readonly string[];
}

/** Conserva el cambio sugerido y su estado de resolución. */
export interface PropuestaAsistenteIA {
  readonly seccion: string;
  readonly resumen: string;
  readonly contenidoJson: string;
  readonly estado: EstadoPropuestaAsistenteIA;
  readonly detalles: readonly DetallePropuestaAsistenteIA[];
}

/** Representa un turno confirmado dentro de la conversación. */
export interface MensajeAsistenteIA {
  readonly id: number;
  readonly rol: RolMensajeAsistenteIA;
  readonly texto: string;
  readonly orden: number;
  readonly fechaCreacion: string;
  readonly seccionContexto: string | null;
  readonly revisionContexto: number | null;
  readonly propuesta: PropuestaAsistenteIA | null;
}

/** Agrupa el historial único asociado al borrador del proyecto. */
export interface ConversacionAsistenteIA {
  readonly proyectoId: number;
  readonly conversacionId: number | null;
  readonly mensajes: readonly MensajeAsistenteIA[];
}

/** Contexto mínimo que el flujo anfitrión comparte sin acoplar IA a sus modelos. */
export interface ContextoAsistenteIA {
  readonly proyectoId: number;
  readonly revisionContexto: number;
  readonly seccionActiva: string;
  readonly nombreSeccion: string;
}

/** Entrega los dos turnos confirmados después de consultar el modelo. */
export interface RespuestaEnvioAsistenteIA {
  readonly conversacionId: number;
  readonly mensajeUsuario: MensajeAsistenteIA;
  readonly mensajeAsistente: MensajeAsistenteIA;
}

/** Informa el nuevo estado de una propuesta y la revisión resultante. */
export interface ResultadoResolucionPropuestaIA {
  readonly proyectoId: number;
  readonly mensajeId: number;
  readonly estado: EstadoPropuestaAsistenteIA;
  readonly revision: number;
}
