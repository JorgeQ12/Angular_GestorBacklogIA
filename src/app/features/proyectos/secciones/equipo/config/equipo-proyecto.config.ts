import { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { MensajesError } from '../../../../../shared/forms/errores-validacion';

/** Identifica el catálogo administrado por backend para los perfiles técnicos. */
export const CATALOGO_PERFILES_TECNICOS_EQUIPO = 'identidad_perfil_tecnico';

/** Centraliza las dedicaciones admitidas para cada integrante. */
export const OPCIONES_DEDICACION_EQUIPO = [
  { valor: '25', etiqueta: '25%' },
  { valor: '50', etiqueta: '50%' },
  { valor: '75', etiqueta: '75%' },
  { valor: '100', etiqueta: '100%' },
  { valor: 'puntual', etiqueta: 'Participación puntual' },
] as const satisfies readonly OpcionSelector[];

/** Proporciona el mensaje requerido por la asignación individual. */
export const MENSAJES_ASIGNACION_EQUIPO = {
  required: 'Completa esta asignación.',
} satisfies MensajesError;
