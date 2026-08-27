import { MensajesError, MensajesFormulario } from '../../../../../shared/forms/errores-validacion';
import { CampoObjetivosProyecto } from '../models/formulario-objetivos-proyecto.model';

/** Conserva los límites funcionales de la definición de Objetivos. */
export const LIMITES_OBJETIVOS_PROYECTO = {
  objetivoGeneral: 400,
  objetivosEspecificos: 8,
} as const;

/** Proporciona los mensajes del objetivo general. */
export const MENSAJES_OBJETIVOS_PROYECTO = {
  objetivoGeneral: {
    required: 'Describe el objetivo general del proyecto.',
    maxlength: `El objetivo general no debe superar ${LIMITES_OBJETIVOS_PROYECTO.objetivoGeneral} caracteres.`,
  },
} satisfies MensajesFormulario<CampoObjetivosProyecto>;

/** Proporciona el mensaje común de cada objetivo específico dinámico. */
export const MENSAJES_OBJETIVO_ESPECIFICO = {
  required: 'Describe el objetivo específico.',
} satisfies MensajesError;
