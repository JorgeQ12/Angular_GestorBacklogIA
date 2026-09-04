import { environment } from '../../../../../environments/environment';

const RUTA_ASISTENTE_IA = `${environment.apiBaseUrl}/GeneracionIA/Asistente`;

/** Centraliza las operaciones remotas de la conversación y sus propuestas. */
export const ENDPOINTS_ASISTENTE_IA = {
  obtenerConversacion: `${RUTA_ASISTENTE_IA}/ObtenerConversacion`,
  enviarMensaje: `${RUTA_ASISTENTE_IA}/EnviarMensaje`,
  aplicarPropuesta: `${RUTA_ASISTENTE_IA}/AplicarPropuesta`,
  rechazarPropuesta: `${RUTA_ASISTENTE_IA}/RechazarPropuesta`,
} as const;
