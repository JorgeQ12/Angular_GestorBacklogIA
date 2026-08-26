import { MensajesFormulario } from '../../../../../shared/forms/errores-validacion';
import { CampoNecesidadProyecto } from '../models/formulario-necesidad-proyecto.model';

/** Conserva los límites vigentes de la definición de la necesidad. */
export const LIMITES_NECESIDAD_PROYECTO = {
  situacionActual: 900,
  problemas: 900,
  impacto: 900,
} as const;

/** Proporciona mensajes propios del lenguaje de Necesidad de negocio. */
export const MENSAJES_NECESIDAD_PROYECTO = {
  situacionActual: {
    required: 'Describe cómo se trabaja actualmente.',
    maxlength: `El proceso actual no debe superar ${LIMITES_NECESIDAD_PROYECTO.situacionActual} caracteres.`,
  },
  problemas: {
    required: 'Describe los problemas principales.',
    maxlength: `Los problemas no deben superar ${LIMITES_NECESIDAD_PROYECTO.problemas} caracteres.`,
  },
  impacto: {
    required: 'Describe el impacto de no resolver el problema.',
    maxlength: `El impacto no debe superar ${LIMITES_NECESIDAD_PROYECTO.impacto} caracteres.`,
  },
} satisfies MensajesFormulario<CampoNecesidadProyecto>;
