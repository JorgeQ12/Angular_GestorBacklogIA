import { MensajesFormulario } from '../../../shared/forms/errores-validacion';
import { DatosCatalogo } from '../models/catalogo.model';
/** Límites vigentes de los validadores de Catalogo en el backend. */
export const LIMITES_CATALOGO = { nombre: 100, descripcion: 500 } as const;
/** Mensajes de los campos administrables. */
export const MENSAJES_CATALOGO = {
  nombre: {
    required: 'El nombre es obligatorio.',
    maxlength: 'El nombre admite hasta 100 caracteres.',
  },
  descripcion: {
    required: 'La descripción es obligatoria.',
    maxlength: 'La descripción admite hasta 500 caracteres.',
  },
} satisfies MensajesFormulario<keyof DatosCatalogo>;
/** Contexto funcional para el notificador transversal. */
export const ERRORES_CATALOGOS = {
  carga: {
    titulo: 'No fue posible cargar los catálogos',
    descripcion: 'Intenta consultar nuevamente la configuración.',
  },
  guardado: {
    titulo: 'No fue posible guardar',
    descripcion: 'Revisa la información e inténtalo nuevamente.',
  },
} as const;
