import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Exige contenido textual diferente de espacios en blanco. */
export function validarTextoRequerido(control: AbstractControl<unknown>): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim() ? null : { required: true };
}
