import { MensajesFormulario } from '../../../../../../shared/forms/errores-validacion';
import { CampoFormularioVinculacionAzure } from '../models/formulario-vinculacion-azure.model';

/** Personaliza el feedback de los datos requeridos para consultar Azure. */
export const MENSAJES_VINCULACION_AZURE = {
  urlBoard: {
    required: 'El enlace del proyecto o board es obligatorio.',
    maxlength: 'El enlace no debe superar 500 caracteres.',
    pattern: 'Ingresa un enlace HTTPS válido de Azure DevOps.',
  },
  idEpica: {
    required: 'El ID de la épica principal es obligatorio.',
    min: 'El ID de la épica debe ser mayor que cero.',
  },
  idEquipo: {
    pattern: 'Ingresa un identificador GUID válido para el Team.',
  },
} satisfies MensajesFormulario<CampoFormularioVinculacionAzure>;
