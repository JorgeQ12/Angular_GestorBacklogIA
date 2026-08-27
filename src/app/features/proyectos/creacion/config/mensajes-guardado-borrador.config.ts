import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import { SeccionActualizableBorrador } from '../models/actualizacion-seccion-borrador.model';

/** Centraliza los mensajes particulares de cada sección guardable. */
export const MENSAJES_GUARDADO_BORRADOR = {
  [ClaveSeccionProyecto.Contexto]: {
    titulo: 'No fue posible guardar el contexto',
    descripcion: 'Conservamos los datos del formulario para que puedas intentarlo nuevamente.',
  },
  [ClaveSeccionProyecto.TipoSolucion]: {
    titulo: 'No fue posible guardar el tipo de solución',
    descripcion: 'Conservamos la selección para que puedas intentarlo nuevamente.',
  },
  [ClaveSeccionProyecto.Necesidad]: {
    titulo: 'No fue posible guardar la necesidad',
    descripcion: 'Conservamos la información para que puedas intentarlo nuevamente.',
  },
  [ClaveSeccionProyecto.Objetivos]: {
    titulo: 'No fue posible guardar los objetivos',
    descripcion: 'Conservamos la información para que puedas intentarlo nuevamente.',
  },
  [ClaveSeccionProyecto.Alcance]: {
    titulo: 'No fue posible guardar el alcance',
    descripcion: 'Conservamos los límites definidos para que puedas intentarlo nuevamente.',
  },
  [ClaveSeccionProyecto.Roles]: {
    titulo: 'No fue posible guardar los roles',
    descripcion: 'Conservamos los perfiles definidos para que puedas intentarlo nuevamente.',
  },
  [ClaveSeccionProyecto.Equipo]: {
    titulo: 'No fue posible guardar el equipo',
    descripcion: 'Conservamos las asignaciones para que puedas intentarlo nuevamente.',
  },
} as const satisfies Record<SeccionActualizableBorrador, MensajeGuardadoBorrador>;

interface MensajeGuardadoBorrador {
  readonly titulo: string;
  readonly descripcion: string;
}

/** Limita las secciones admitidas por la notificación de guardado. */
export type SeccionGuardadoBorrador = SeccionActualizableBorrador;
