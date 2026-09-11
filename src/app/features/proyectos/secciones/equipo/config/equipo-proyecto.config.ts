import { CodigoTipoCatalogoIdentidad } from '../../../../../core/catalogos/models/codigo-tipo-catalogo-identidad.enum';
import { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { MensajesError } from '../../../../../shared/forms/errores-validacion';

/** Identifica el catálogo remoto que alimenta los perfiles técnicos de Equipo. */
export const CATALOGO_PERFILES_TECNICOS_EQUIPO = CodigoTipoCatalogoIdentidad.PerfilTecnico;

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
