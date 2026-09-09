import type { MensajesFormulario } from '../../../../shared/forms/errores-validacion';
import type { CampoFormularioElementoPlanificacion } from '../models/detalle-elemento-planificacion.model';

/** Límites compartidos con las validaciones vigentes del backend. */
export const LIMITES_FORMULARIO_ELEMENTO_PLANIFICACION = {
  titulo: 250,
  descripcion: 2000,
  responsable: 250,
  requisito: 100,
  complejidadMinima: 1,
  complejidadMaxima: 5,
  prioridadMinima: 1,
  prioridadMaxima: 4,
} as const;

/** Nombres estables administrados por el módulo transversal de catálogos. */
export const CATALOGOS_ELEMENTO_PLANIFICACION = {
  prioridad: 'Prioridad',
  riesgo: 'Riesgo',
  actividadTarea: 'ActividadTarea',
  actividadRequisito: 'ActividadRequisito',
} as const;

/** Mensajes particulares presentados por las directivas compartidas. */
export const MENSAJES_FORMULARIO_ELEMENTO_PLANIFICACION = {
  titulo: {
    required: 'El título es obligatorio.',
    maxlength: 'El título puede tener máximo 250 caracteres.',
  },
  descripcion: {
    required: 'La descripción es obligatoria.',
    maxlength: 'La descripción puede tener máximo 2000 caracteres.',
  },
  alcance: { required: 'El alcance es obligatorio.' },
  objetivo: { required: 'El objetivo es obligatorio.' },
  criteriosAceptacion: { required: 'Los criterios de aceptación son obligatorios.' },
  actividadCatalogoId: { required: 'Selecciona una actividad.' },
  complejidad: {
    required: 'La complejidad es obligatoria.',
    min: 'La complejidad mínima es 1.',
    max: 'La complejidad máxima es 5.',
  },
  prioridad: {
    required: 'La prioridad es obligatoria.',
    min: 'La prioridad mínima es 1.',
    max: 'La prioridad máxima es 4.',
  },
  estimacionHoras: {
    required: 'La estimación es obligatoria.',
    min: 'La estimación debe ser mayor que cero.',
  },
  fechaInicio: { required: 'La fecha de inicio es obligatoria.' },
  fechaFinal: { required: 'La fecha final es obligatoria.' },
  responsable: { maxlength: 'El responsable puede tener máximo 250 caracteres.' },
  requisito: { maxlength: 'El requisito puede tener máximo 100 caracteres.' },
} satisfies MensajesFormulario<CampoFormularioElementoPlanificacion>;
