/** Comunica una falla que impide consultar el proyecto o una versión. */
export const MENSAJE_ERROR_CARGA_INFORMACION_PROYECTO = {
  titulo: 'No fue posible cargar el proyecto',
  descripcion: 'Verifica que el proyecto exista e intenta nuevamente.',
} as const;

/** Adapta los errores funcionales de la creación de una nueva versión. */
export const CONTEXTO_ERROR_ACTUALIZACION_PROYECTO = {
  titulo: 'No fue posible guardar los cambios',
  descripcion: 'Conservamos la información para que puedas intentarlo nuevamente.',
  mensajesPorCodigo: {
    'proyecto.version_desactualizada': {
      titulo: 'El proyecto cambió',
      descripcion: 'Otra actualización creó una versión nueva. Recarga antes de continuar.',
    },
  },
} as const;
