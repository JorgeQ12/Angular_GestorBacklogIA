import { InjectionToken } from '@angular/core';
import { MensajesError, ValorErrorValidacion } from '../models/mensajes-error.model';

/** Reúne los mensajes comunes para validadores estándar de Angular. */
export const MENSAJES_ERROR_PREDETERMINADOS = {
  required: 'Este campo es obligatorio.',
  email: 'Debe ingresar un correo válido.',
  minlength: (error) =>
    `Debe tener al menos ${obtenerNumero(error, 'requiredLength') ?? 0} caracteres.`,
  maxlength: (error) =>
    `No debe superar ${obtenerNumero(error, 'requiredLength') ?? 0} caracteres.`,
  min: (error) => `El valor mínimo permitido es ${obtenerNumero(error, 'min') ?? 0}.`,
  max: (error) => `El valor máximo permitido es ${obtenerNumero(error, 'max') ?? 0}.`,
  pattern: 'El formato ingresado no es válido.',
} satisfies MensajesError;

/** Permite reemplazar el catálogo común de mensajes desde los providers de la aplicación. */
export const MENSAJES_ERROR_FORMULARIO = new InjectionToken<MensajesError>(
  'MENSAJES_ERROR_FORMULARIO',
  {
    providedIn: 'root',
    factory: () => MENSAJES_ERROR_PREDETERMINADOS,
  },
);

/** Obtiene valores numéricos para construir mensajes de validación dinámicos. */
function obtenerNumero(error: ValorErrorValidacion, propiedad: string): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const valor = (error as Record<string, unknown>)[propiedad];
  return typeof valor === 'number' ? valor : undefined;
}
