import type { MensajesFormulario } from '../../../shared/forms/errores-validacion';
import type { ValoresFormularioUsuario } from '../models/usuario.model';

/** Código estable del catálogo de perfiles técnicos administrado por Identidad. */
export const CATALOGO_PERFILES_TECNICOS_USUARIO = 'identidad_perfil_tecnico';

/** Límites vigentes en los validadores del backend. */
export const LIMITES_USUARIO = {
  idAzure: 200,
  nombre: 200,
  correo: 320,
  limiteTokensMensual: Number.MAX_SAFE_INTEGER,
} as const;

/** Mensajes particulares de los campos administrables del usuario. */
export const MENSAJES_USUARIO = {
  idAzure: {
    required: 'La identidad de Azure es obligatoria.',
    maxlength: 'La identidad de Azure admite hasta 200 caracteres.',
  },
  nombre: {
    required: 'El nombre es obligatorio.',
    maxlength: 'El nombre admite hasta 200 caracteres.',
  },
  correo: {
    email: 'Ingresa un correo válido.',
    maxlength: 'El correo admite hasta 320 caracteres.',
  },
  perfilTecnicoId: {
    required: 'Selecciona un perfil técnico.',
  },
  limiteTokensMensual: {
    min: 'El límite mensual no puede ser negativo.',
    max: 'El límite mensual supera el valor seguro admitido.',
    pattern: 'Ingresa un número entero de tokens.',
  },
} satisfies MensajesFormulario<keyof ValoresFormularioUsuario>;

/** Contextualiza los fallos de mutación sin reemplazar la página cargada. */
export const ERRORES_USUARIOS = {
  guardado: {
    titulo: 'No fue posible guardar el usuario',
    descripcion: 'Revisa la información e inténtalo nuevamente.',
    mensajesPorCodigo: {
      'usuario.id_azure_duplicado': {
        titulo: 'La identidad de Azure ya está registrada',
        descripcion: 'Usa una identidad diferente o edita el usuario existente.',
      },
      'usuario.perfil_tecnico_invalido': {
        titulo: 'El perfil técnico no está disponible',
        descripcion: 'Selecciona un perfil técnico activo e inténtalo nuevamente.',
      },
    },
  },
  estado: {
    titulo: 'No fue posible cambiar el estado',
    descripcion: 'Intenta nuevamente en unos momentos.',
  },
} as const;
