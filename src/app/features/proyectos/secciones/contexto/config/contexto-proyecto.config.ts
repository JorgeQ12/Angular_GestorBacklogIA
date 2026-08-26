import { MensajesFormulario } from '../../../../../shared/forms/errores-validacion';
import { CampoContextoProyecto } from '../models/formulario-contexto-proyecto.model';

/** Centraliza los límites acordados con el contrato del backend. */
export const LIMITES_CONTEXTO_PROYECTO = {
  nombre: 200,
  responsable: 150,
  descripcion: 2000,
} as const;

/** Identifica el catálogo remoto utilizado por la prioridad del proyecto. */
export const CATALOGO_PRIORIDADES_PROYECTO = 'Prioridad';

/** Proporciona mensajes propios del lenguaje de Contexto. */
export const MENSAJES_CONTEXTO_PROYECTO = {
  nombre: {
    required: 'El nombre del proyecto es obligatorio.',
    maxlength: `El nombre no debe superar ${LIMITES_CONTEXTO_PROYECTO.nombre} caracteres.`,
  },
  responsable: {
    required: 'El responsable es obligatorio.',
    maxlength: `El responsable no debe superar ${LIMITES_CONTEXTO_PROYECTO.responsable} caracteres.`,
  },
  fechaObjetivo: {
    required: 'La fecha proyectada es obligatoria.',
  },
  prioridadCatalogoId: {
    required: 'La prioridad es obligatoria.',
  },
  descripcion: {
    required: 'La descripción del proyecto es obligatoria.',
    maxlength: `La descripción no debe superar ${LIMITES_CONTEXTO_PROYECTO.descripcion} caracteres.`,
  },
} satisfies MensajesFormulario<CampoContextoProyecto>;
