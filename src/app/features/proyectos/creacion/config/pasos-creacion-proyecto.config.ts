import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import {
  ClaveSeccionProyecto,
  SECCIONES_PROYECTO,
  type SeccionProyecto,
} from '../../config/secciones-proyecto.config';

/** Identifica el único paso del recorrido que no representa una sección editable. */
export const CLAVE_PASO_VINCULACION_AZURE = 'vinculacion-azure' as const;

/** Describe un paso presentado durante la creación del proyecto. */
export interface PasoCreacionProyecto extends Omit<SeccionProyecto, 'clave'> {
  readonly clave: ClavePasoCreacionProyecto;
  readonly icono: NombreIconoAplicacion;
}

/** Limita las claves admitidas por los pasos de creación. */
export type ClavePasoCreacionProyecto = typeof CLAVE_PASO_VINCULACION_AZURE | ClaveSeccionProyecto;

/** Agrega la vinculación de Azure al recorrido de las secciones del proyecto. */
export const PASOS_CREACION_PROYECTO = [
  {
    clave: CLAVE_PASO_VINCULACION_AZURE,
    titulo: 'Azure DevOps',
    descripcion: 'Vinculación de origen',
    icono: 'azureDevOps',
  },
  ...SECCIONES_PROYECTO,
] as const satisfies readonly PasoCreacionProyecto[];

/** Relaciona cada paso visual con el avance persistido por el backend. */
export const AVANCE_BORRADOR_POR_PASO = {
  [CLAVE_PASO_VINCULACION_AZURE]: null,
  [ClaveSeccionProyecto.Contexto]: 1,
  [ClaveSeccionProyecto.TipoSolucion]: 2,
  [ClaveSeccionProyecto.Necesidad]: 3,
  [ClaveSeccionProyecto.Objetivos]: 4,
  [ClaveSeccionProyecto.Alcance]: 5,
  [ClaveSeccionProyecto.Roles]: 6,
  [ClaveSeccionProyecto.Equipo]: 7,
  [ClaveSeccionProyecto.Flujo]: 8,
} as const satisfies Record<ClavePasoCreacionProyecto, number | null>;
