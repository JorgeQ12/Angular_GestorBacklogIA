/** Centraliza los mensajes particulares de cada sección guardable. */
export const MENSAJES_GUARDADO_BORRADOR = {
  contexto: {
    titulo: 'No fue posible guardar el contexto',
    descripcion: 'Conservamos los datos del formulario para que puedas intentarlo nuevamente.',
  },
  tipoSolucion: {
    titulo: 'No fue posible guardar el tipo de solución',
    descripcion: 'Conservamos la selección para que puedas intentarlo nuevamente.',
  },
  necesidad: {
    titulo: 'No fue posible guardar la necesidad',
    descripcion: 'Conservamos la información para que puedas intentarlo nuevamente.',
  },
  objetivos: {
    titulo: 'No fue posible guardar los objetivos',
    descripcion: 'Conservamos la información para que puedas intentarlo nuevamente.',
  },
  alcance: {
    titulo: 'No fue posible guardar el alcance',
    descripcion: 'Conservamos los límites definidos para que puedas intentarlo nuevamente.',
  },
} as const;

/** Limita las secciones admitidas por la notificación de guardado. */
export type SeccionGuardadoBorrador = keyof typeof MENSAJES_GUARDADO_BORRADOR;
