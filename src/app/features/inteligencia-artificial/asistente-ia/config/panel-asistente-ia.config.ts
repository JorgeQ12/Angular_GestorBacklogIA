import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import type { MensajesError } from '../../../../shared/forms/errores-validacion';

/** Límite contractual del mensaje enviado al Asistente IA. */
export const LIMITE_MENSAJE_ASISTENTE_IA = 4000;

/** Mensajes de validación propios del compositor del Asistente IA. */
export const MENSAJES_CAMPO_MENSAJE_ASISTENTE_IA: MensajesError = {
  required: 'Escribe un mensaje antes de enviarlo.',
  maxlength: `El mensaje no puede superar ${LIMITE_MENSAJE_ASISTENTE_IA} caracteres.`,
};

/** Describe una acción sugerida en el estado inicial de la conversación. */
export interface AccionRapidaAsistenteIA {
  readonly etiqueta: string;
  readonly icono: NombreIconoAplicacion;
  readonly mensaje: string;
}

/** Ordena las acciones sugeridas disponibles antes del primer mensaje. */
export const ACCIONES_RAPIDAS_ASISTENTE_IA: readonly AccionRapidaAsistenteIA[] = [
  {
    etiqueta: 'Detectar vacíos',
    icono: 'buscar',
    mensaje: 'Detecta vacíos en esta sección y hazme preguntas concretas para completarla.',
  },
  {
    etiqueta: 'Mejorar claridad',
    icono: 'editar',
    mensaje: 'Ayúdame a mejorar la claridad y precisión de esta sección.',
  },
  {
    etiqueta: 'Crear propuestas',
    icono: 'asistenteIA',
    mensaje: 'Crea una propuesta completa para esta sección con el contexto disponible.',
  },
];
