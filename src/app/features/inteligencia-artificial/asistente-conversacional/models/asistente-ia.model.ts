/** Identifica el autor visible de un mensaje persistido. */
export enum RolMensajeAsistenteIa {
  Usuario = 'usuario',
  Asistente = 'asistente',
}

/** Representa la decisión explícita tomada sobre una propuesta. */
export enum EstadoPropuestaAsistenteIa {
  Pendiente = 'pendiente',
  Aplicada = 'aplicada',
  Rechazada = 'rechazada',
}

/** Describe un campo legible derivado del JSON canónico de la propuesta. */
export interface DetallePropuestaAsistenteIa {
  readonly etiqueta: string;
  readonly valores: readonly string[];
}

/** Conserva el cambio sugerido y su estado de resolución. */
export interface PropuestaAsistenteIa {
  readonly seccion: string;
  readonly resumen: string;
  readonly contenidoJson: string;
  readonly estado: EstadoPropuestaAsistenteIa;
  readonly detalles: readonly DetallePropuestaAsistenteIa[];
}

/** Representa un turno confirmado dentro de la conversación. */
export interface MensajeAsistenteIa {
  readonly id: number;
  readonly rol: RolMensajeAsistenteIa;
  readonly texto: string;
  readonly orden: number;
  readonly fechaCreacion: string;
  readonly seccionContexto: string | null;
  readonly revisionContexto: number | null;
  readonly propuesta: PropuestaAsistenteIa | null;
}

/** Agrupa el historial único asociado al borrador del proyecto. */
export interface ConversacionAsistenteIa {
  readonly proyectoId: number;
  readonly conversacionId: number | null;
  readonly mensajes: readonly MensajeAsistenteIa[];
}

/** Contexto mínimo que el flujo anfitrión comparte sin acoplar IA a sus modelos. */
export interface ContextoAsistenteIa {
  readonly proyectoId: number;
  readonly revisionContexto: number;
  readonly seccionActiva: string;
  readonly nombreSeccion: string;
}

/** Entrega los dos turnos confirmados después de consultar el modelo. */
export interface RespuestaEnvioAsistenteIa {
  readonly conversacionId: number;
  readonly mensajeUsuario: MensajeAsistenteIa;
  readonly mensajeAsistente: MensajeAsistenteIa;
}

/** Informa el nuevo estado de una propuesta y la revisión resultante. */
export interface ResultadoResolucionPropuestaIa {
  readonly proyectoId: number;
  readonly mensajeId: number;
  readonly estado: EstadoPropuestaAsistenteIa;
  readonly revision: number;
}
