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
