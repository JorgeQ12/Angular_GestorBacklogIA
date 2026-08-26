import { InjectionToken } from '@angular/core';

/** Permite que la validación alcance el elemento interactivo de un control compuesto. */
export interface ControlCampoPersonalizado {
  obtenerElementoInteraccion(): HTMLElement | null;
  establecerEstadoError(activo: boolean): void;
}

/** Identifica controles compuestos compatibles con la presentación compartida de errores. */
export const CONTROL_CAMPO_PERSONALIZADO = new InjectionToken<ControlCampoPersonalizado>(
  'CONTROL_CAMPO_PERSONALIZADO',
);
