import { MensajesFormulario } from '../../../../../shared/forms/errores-validacion';
import { CampoAlcanceProyecto } from '../models/formulario-alcance-proyecto.model';

/** Conserva los límites vigentes de la definición del alcance. */
export const LIMITES_ALCANCE_PROYECTO = {
  incluido: 700,
  excluido: 700,
} as const;

/** Proporciona mensajes propios del lenguaje de Alcance. */
export const MENSAJES_ALCANCE_PROYECTO = {
  incluido: {
    required: 'Describe qué incluye el proyecto.',
    maxlength: `El alcance incluido no debe superar ${LIMITES_ALCANCE_PROYECTO.incluido} caracteres.`,
  },
  excluido: {
    required: 'Define qué queda fuera del alcance.',
    maxlength: `El alcance excluido no debe superar ${LIMITES_ALCANCE_PROYECTO.excluido} caracteres.`,
  },
} satisfies MensajesFormulario<CampoAlcanceProyecto>;
