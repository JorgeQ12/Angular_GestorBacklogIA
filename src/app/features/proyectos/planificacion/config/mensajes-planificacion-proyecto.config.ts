/** Textos de respaldo para la carga inicial de la planificación. */
export const MENSAJE_ERROR_CARGA_PLANIFICACION_PROYECTO = {
  titulo: 'No fue posible cargar la planificación',
  descripcion: 'Verifica la conexión e intenta nuevamente.',
} as const;

/** Orienta la recuperación cuando no fue posible completar los detalles del cronograma. */
export const MENSAJE_ERROR_CARGA_GANTT_PLANIFICACION = {
  titulo: 'No fue posible preparar el Gantt',
  descripcion: 'Verifica la conexión e intenta cargar nuevamente el cronograma.',
} as const;

/** Contexto funcional para fallos durante la generación mediante IA. */
export const MENSAJES_ERROR_GENERACION_IA_PLANIFICACION = {
  titulo: 'No fue posible generar la planificación',
  descripcion: 'La generación mediante IA no pudo completarse. Intenta nuevamente.',
} as const;

/** Contexto funcional para fallos durante la publicación en Azure DevOps. */
export const MENSAJES_ERROR_PUBLICACION_AZURE_PLANIFICACION = {
  titulo: 'No fue posible publicar en Azure DevOps',
  descripcion: 'La publicación de la planificación no pudo completarse. Intenta nuevamente.',
} as const;

/** Contexto funcional para fallos durante la sincronización de la épica principal. */
export const MENSAJES_ERROR_SINCRONIZACION_EPICA_AZURE_PLANIFICACION = {
  titulo: 'No fue posible sincronizar la épica',
  descripcion: 'Revisa la vinculación con Azure DevOps e intenta nuevamente.',
} as const;

/** Textos de resultado conservados para la sincronización con Azure DevOps. */
export const MENSAJES_EXITO_SINCRONIZACION_EPICA_AZURE_PLANIFICACION = {
  titulo: 'Épica sincronizada',
  sinCambios: 'La épica ya se encontraba actualizada con Azure DevOps.',
} as const;

/** Describe cuántas revisiones nuevas fueron incorporadas desde Azure DevOps. */
export function obtenerDescripcionSincronizacionEpicaAzure(
  revisionesImportadas: number,
): string {
  if (revisionesImportadas === 0) {
    return MENSAJES_EXITO_SINCRONIZACION_EPICA_AZURE_PLANIFICACION.sinCambios;
  }
  return `Se importaron ${revisionesImportadas} revisiones nuevas.`;
}

/** Contextos funcionales para errores del editor de elementos. */
export const MENSAJES_ERROR_ELEMENTO_PLANIFICACION = {
  consulta: {
    titulo: 'No fue posible consultar el elemento',
    descripcion: 'Actualiza la planificación e intenta nuevamente.',
  },
  creacion: {
    titulo: 'No fue posible crear el elemento',
    descripcion: 'Revisa la información e intenta nuevamente.',
  },
  edicion: {
    titulo: 'No fue posible guardar los cambios',
    descripcion: 'Actualiza la planificación y vuelve a intentarlo.',
    mensajesPorEstado: {
      409: {
        titulo: 'El elemento fue modificado',
        descripcion: 'La versión cambió mientras editabas. Actualiza la planificación e intenta nuevamente.',
      },
    },
  },
  catalogos: {
    titulo: 'No fue posible preparar el formulario',
    descripcion: 'No se pudieron cargar los catálogos requeridos. Intenta nuevamente.',
  },
  historial: {
    titulo: 'No fue posible consultar el historial',
    descripcion: 'Intenta cargar nuevamente las versiones anteriores del elemento.',
  },
  version: {
    titulo: 'No fue posible consultar la versión',
    descripcion: 'Selecciona nuevamente la versión o intenta más tarde.',
  },
} as const;

/** Contexto funcional para errores al inactivar cualquier elemento de planificación. */
export const MENSAJES_ERROR_ELIMINACION_ELEMENTO_PLANIFICACION = {
  titulo: 'No fue posible eliminar el elemento',
  descripcion: 'Actualiza la planificación e intenta nuevamente.',
  mensajesPorEstado: {
    409: {
      titulo: 'El elemento fue modificado',
      descripcion: 'Actualizamos la planificación con la versión vigente. Revísala antes de volver a eliminar.',
    },
  },
} as const;
