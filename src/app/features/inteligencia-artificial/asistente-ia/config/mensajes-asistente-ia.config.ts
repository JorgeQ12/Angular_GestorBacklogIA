import type { ContextoErrorApi } from '../../../../core/mensajes/models/contexto-error-api.model';

/** Contexto visible cuando no puede recuperarse la conversación. */
export const ERROR_CARGA_ASISTENTE_IA: ContextoErrorApi = {
  titulo: 'No fue posible abrir el Asistente IA',
  descripcion: 'Intenta cargar nuevamente la conversación.',
};

/** Contexto visible cuando falla una interacción con el modelo. */
export const ERROR_ENVIO_ASISTENTE_IA: ContextoErrorApi = {
  titulo: 'No fue posible enviar el mensaje',
  descripcion: 'Revisa la conexión e intenta nuevamente.',
};

/** Contexto visible y especializaciones al aplicar o rechazar propuestas. */
export const ERROR_PROPUESTA_ASISTENTE_IA: ContextoErrorApi = {
  titulo: 'No fue posible resolver la propuesta',
  descripcion: 'Actualiza el borrador e intenta nuevamente.',
  mensajesPorCodigo: {
    'asistente_ia.revision_desactualizada': {
      titulo: 'El borrador cambió',
      descripcion: 'Recarga la información antes de aplicar esta propuesta.',
    },
  },
};
