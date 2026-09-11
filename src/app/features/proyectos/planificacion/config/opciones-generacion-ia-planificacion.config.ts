import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import { NivelGeneracionIaPlanificacion } from '../models/generacion-ia-planificacion.model';

/** Describe una alternativa visible del asistente de generación. */
export interface OpcionGeneracionIaPlanificacion {
  readonly nivel: NivelGeneracionIaPlanificacion;
  readonly nombre: string;
  readonly icono: NombreIconoAplicacion;
}

/** Centraliza los nombres utilizados en confirmaciones y resultados. */
export const NOMBRES_NIVEL_GENERACION_IA = {
  [NivelGeneracionIaPlanificacion.Epicas]: 'épicas',
  [NivelGeneracionIaPlanificacion.Caracteristicas]: 'características',
  [NivelGeneracionIaPlanificacion.Historias]: 'historias de usuario',
  [NivelGeneracionIaPlanificacion.Tareas]: 'tareas',
} satisfies Record<NivelGeneracionIaPlanificacion, string>;

/** Ordena los niveles que puede solicitar el usuario. */
export const OPCIONES_GENERACION_IA_PLANIFICACION: readonly OpcionGeneracionIaPlanificacion[] = [
  {
    nivel: NivelGeneracionIaPlanificacion.Epicas,
    nombre: 'Épicas',
    icono: 'epica',
  },
  {
    nivel: NivelGeneracionIaPlanificacion.Caracteristicas,
    nombre: 'Características',
    icono: 'caracteristica',
  },
  {
    nivel: NivelGeneracionIaPlanificacion.Historias,
    nombre: 'Historias',
    icono: 'historiaUsuario',
  },
  {
    nivel: NivelGeneracionIaPlanificacion.Tareas,
    nombre: 'Tareas',
    icono: 'tarea',
  },
];
