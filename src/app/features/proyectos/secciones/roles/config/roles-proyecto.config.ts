import { MensajesError } from '../../../../../shared/forms/errores-validacion';

/** Proporciona los mensajes particulares del nombre de cada rol. */
export const MENSAJES_NOMBRE_ROL_PROYECTO = {
  required: 'Ingresa el nombre del rol.',
  duplicado: 'Ya existe un rol con este nombre.',
} satisfies MensajesError;

/** Proporciona el mensaje particular de la descripción de cada rol. */
export const MENSAJES_DESCRIPCION_ROL_PROYECTO = {
  required: 'Describe la participación de este rol.',
} satisfies MensajesError;
