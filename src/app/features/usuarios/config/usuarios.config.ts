import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import type { MensajesFormulario } from '../../../shared/forms/errores-validacion';
import type { DatosUsuario } from '../models/usuario.model';

/** Límites reflejados desde los validadores del backend. */
export const LIMITES_USUARIO = {
  idAzure: 200,
  nombre: 200,
  correo: 320,
} as const;

/** Mensajes específicos de los campos de usuario. */
export const MENSAJES_USUARIO = {
  idAzure: {
    required: 'El identificador de Azure es obligatorio.',
    maxlength: 'El identificador de Azure admite hasta 200 caracteres.',
  },
  nombre: {
    required: 'El nombre es obligatorio.',
    maxlength: 'El nombre admite hasta 200 caracteres.',
  },
  correo: {
    email: 'Ingresa un correo electrónico válido.',
    maxlength: 'El correo admite hasta 320 caracteres.',
  },
  perfilTecnicoId: {
    required: 'Selecciona un perfil técnico.',
  },
  limiteTokensMensual: {
    min: 'El límite mensual no puede ser negativo.',
    entero: 'El límite mensual debe ser un número entero.',
  },
} satisfies MensajesFormulario<keyof DatosUsuario>;

/** Contextos de respaldo para fallos que no reemplazan la página. */
export const ERRORES_USUARIOS = {
  guardado: {
    titulo: 'No fue posible guardar el usuario',
    descripcion: 'Revisa la información e inténtalo nuevamente.',
  },
  estado: {
    titulo: 'No fue posible cambiar el estado',
    descripcion: 'El usuario conserva su estado anterior. Inténtalo nuevamente.',
  },
} as const;

/** Rechaza valores fraccionarios sin considerar vacío como un error. */
export const validarEnteroOpcional: ValidatorFn = (
  control: AbstractControl<unknown>,
): ValidationErrors | null => {
  const valor = control.value;
  return valor === null || valor === '' || Number.isInteger(valor) ? null : { entero: true };
};
