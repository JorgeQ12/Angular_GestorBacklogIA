import type { ContextoErrorApi } from '../../../../core/mensajes/models/contexto-error-api.model';

/** Proporciona respaldo cuando Azure no comunica un detalle funcional. */
export const ERROR_CONSULTA_AZURE = {
  titulo: 'No fue posible consultar Azure',
  descripcion: 'Revisa el enlace, la épica principal y el Team seleccionado.',
} satisfies ContextoErrorApi;

/** Proporciona respaldo cuando no puede inicializarse el borrador validado. */
export const ERROR_CREACION_BORRADOR = {
  titulo: 'No fue posible crear el proyecto',
  descripcion: 'La información de Azure fue validada, pero el borrador no pudo ser creado.',
} satisfies ContextoErrorApi;

/** Proporciona respaldo cuando no puede renovarse la membresía vinculada. */
export const ERROR_SINCRONIZACION_EQUIPO = {
  titulo: 'No fue posible actualizar el equipo',
  descripcion: 'Revisa la membresía del Team en Azure DevOps e intenta nuevamente.',
} satisfies ContextoErrorApi;

/** Proporciona respaldo cuando el borrador no puede convertirse en proyecto definitivo. */
export const ERROR_GUARDADO_PROYECTO = {
  titulo: 'No fue posible guardar el proyecto',
  descripcion: 'El flujo quedó guardado como borrador. Intenta finalizar el proyecto nuevamente.',
} satisfies ContextoErrorApi;

/** Proporciona respaldo cuando la IA no puede producir un diagrama utilizable. */
export const ERROR_GENERACION_DIAGRAMA_FLUJO_IA = {
  titulo: 'No fue posible generar el diagrama',
  descripcion: 'Conservamos el flujo actual para que puedas intentarlo nuevamente.',
} satisfies ContextoErrorApi;
