import type { MensajesFormulario } from '../../../../shared/forms/errores-validacion';
import type { ValoresFormularioCreacionRequisito } from '../models/lista-requisitos.model';

/** Campos booleanos que pueden modificarse mediante una decisión binaria. */
export type CampoBinarioRequisito = 'cumple' | 'aplica' | 'transversal';

/** Describe una decisión binaria presentada en creación o detalle. */
export interface DecisionRequisito {
  readonly campo: CampoBinarioRequisito;
  readonly titulo: string;
  readonly texto?: string;
}

/** Centraliza los límites de texto acordados para la creación de requisitos. */
export const LIMITES_FORMULARIO_REQUISITO = {
  areaNombre: 200,
  seccionNombre: 250,
  titulo: 250,
  nombreResponsable: 250,
} as const;

/** Proporciona los mensajes funcionales de validación del formulario. */
export const MENSAJES_FORMULARIO_REQUISITO = {
  areaId: { required: 'Selecciona un área.' },
  areaNombre: { required: 'Escribe el nombre del área.' },
  seccionId: { required: 'Selecciona una sección.' },
  seccionNombre: { required: 'Escribe el nombre de la sección.' },
  tipoId: { required: 'Selecciona un tipo.' },
  titulo: { required: 'Escribe un título.' },
  descripcion: { required: 'Escribe la descripción.' },
  responsable: { required: 'Selecciona un responsable.' },
  validador: { required: 'Selecciona un validador.' },
  agrupador: { required: 'Selecciona un agrupador.' },
} satisfies MensajesFormulario<keyof ValoresFormularioCreacionRequisito>;

/** Ordena las decisiones mostradas al registrar un requisito. */
export const DECISIONES_INICIALES_REQUISITO: readonly DecisionRequisito[] = [
  { campo: 'transversal', titulo: 'Transversal', texto: '¿Involucra varias áreas?' },
  { campo: 'aplica', titulo: 'Aplica', texto: '¿Aplica para este proyecto?' },
  { campo: 'cumple', titulo: '¿Cumple?', texto: 'Inicia en No y puedes cambiarlo.' },
];

/** Ordena las decisiones editables en el detalle de un requisito. */
export const DECISIONES_DETALLE_REQUISITO: readonly DecisionRequisito[] = [
  { campo: 'transversal', titulo: 'Transversal' },
  { campo: 'aplica', titulo: 'Aplica' },
];
