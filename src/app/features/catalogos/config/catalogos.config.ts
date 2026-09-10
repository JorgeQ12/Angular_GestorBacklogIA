import { MensajesFormulario } from '../../../shared/forms/errores-validacion';
import { ClaseCatalogo, DatosCatalogo } from '../models/catalogo.model';
/** Límites vigentes de los validadores de Catalogo en el backend. */
export const LIMITES_CATALOGO = { codigo: 150, nombre: 100, descripcion: 500 } as const;

/** Formato de identidad técnica aceptado por el backend. */
export const PATRON_CODIGO_CATALOGO = /^\s*[a-z](?:[a-z0-9]|_(?=[a-z0-9]))*\s*$/;

/** Explica la convención estable de cada clase sin derivar códigos automáticamente. */
export const AYUDAS_CODIGO_CATALOGO = {
  [ClaseCatalogo.Tipo]:
    'Usa snake_case y antepone el nombre del módulo. Ejemplo: gestion_producto_prioridad.',
  [ClaseCatalogo.Valor]:
    'Usa snake_case y antepone el nombre del catálogo padre. Ejemplo: prioridad_alta.',
} as const satisfies Record<ClaseCatalogo, string>;

/** Mensajes de los campos administrados. */
export const MENSAJES_CATALOGO = {
  codigo: {
    required: 'El código es obligatorio.',
    maxlength: 'El código admite hasta 150 caracteres.',
    pattern: 'Usa snake_case con letras minúsculas, números y guion bajo.',
  },
  nombre: {
    required: 'El nombre es obligatorio.',
    maxlength: 'El nombre admite hasta 100 caracteres.',
  },
  descripcion: {
    required: 'La descripción es obligatoria.',
    maxlength: 'La descripción admite hasta 500 caracteres.',
  },
} satisfies MensajesFormulario<keyof DatosCatalogo>;
/** Contexto funcional para comunicar fallos de guardado sin reemplazar la página. */
export const ERRORES_CATALOGOS = {
  guardado: {
    titulo: 'No fue posible guardar',
    descripcion: 'Revisa la información e inténtalo nuevamente.',
  },
} as const;
