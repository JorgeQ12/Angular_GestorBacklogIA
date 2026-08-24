import { ValidationErrors } from '@angular/forms';

/** Representa el detalle asociado a un error de validación. */
export type ValorErrorValidacion = ValidationErrors[string];

/** Define un mensaje calculado a partir del detalle del error. */
export type FabricaMensajeError = (error: ValorErrorValidacion) => string;

/** Agrupa los mensajes disponibles por código de validación. */
export type MensajesError = Readonly<Record<string, string | FabricaMensajeError>>;

/** Relaciona cada campo del formulario con sus mensajes particulares. */
export type MensajesFormulario<TCampo extends string = string> = Readonly<
  Partial<Record<TCampo, MensajesError>>
>;
