import { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { MensajesError } from '../../../../../shared/forms/errores-validacion';

/** Centraliza los perfiles técnicos mientras el backend incorpora su catálogo. */
export const OPCIONES_PERFIL_TECNICO_EQUIPO = [
  { valor: 'devops', etiqueta: 'DevOps' },
  { valor: 'cloud', etiqueta: 'Cloud' },
  { valor: 'dev-master', etiqueta: 'Desarrollador master' },
  { valor: 'dev-senior', etiqueta: 'Desarrollador senior' },
  { valor: 'qa', etiqueta: 'QA' },
  { valor: 'cientifico-datos', etiqueta: 'Científico de datos' },
  { valor: 'arquitecto', etiqueta: 'Arquitecto' },
  { valor: 'gerente', etiqueta: 'Gerente' },
  { valor: 'subgerente', etiqueta: 'Subgerente' },
  { valor: 'planner', etiqueta: 'Planner' },
  { valor: 'scrum-master', etiqueta: 'Scrum master' },
  { valor: 'ux-ui', etiqueta: 'UX/UI' },
  { valor: 'pmo', etiqueta: 'PMO' },
  { valor: 'operaciones-ti', etiqueta: 'Operaciones TI' },
  { valor: 'lider-tecnico', etiqueta: 'Líder técnico' },
  { valor: 'seguridad', etiqueta: 'Seguridad' },
] as const satisfies readonly OpcionSelector[];

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
