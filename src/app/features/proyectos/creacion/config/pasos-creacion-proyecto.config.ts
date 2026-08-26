import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import { SECCIONES_PROYECTO, type SeccionProyecto } from '../../config/secciones-proyecto.config';

/** Describe un paso presentado durante la creación del proyecto. */
export interface PasoCreacionProyecto extends SeccionProyecto {
  readonly icono: NombreIconoAplicacion;
}

/** Agrega la vinculación de Azure al recorrido de las secciones del proyecto. */
export const PASOS_CREACION_PROYECTO = [
  {
    clave: 'vinculacion-azure',
    titulo: 'Azure DevOps',
    descripcion: 'Vinculación de origen',
    icono: 'azureDevOps',
  },
  ...SECCIONES_PROYECTO,
] as const satisfies readonly PasoCreacionProyecto[];

/** Limita las claves admitidas por los pasos de creación. */
export type ClavePasoCreacionProyecto = (typeof PASOS_CREACION_PROYECTO)[number]['clave'];

/** Identifica el paso activo declarado por una ruta de creación. */
export interface DatosRutaPasoCreacionProyecto {
  readonly pasoActual: ClavePasoCreacionProyecto;
}

/** Relaciona cada paso visual con el avance persistido por el backend. */
export const AVANCE_BORRADOR_POR_PASO = {
  'vinculacion-azure': null,
  contexto: 1,
  'tipo-solucion': 2,
  necesidad: 3,
  objetivos: 4,
  alcance: 5,
  roles: 6,
  equipo: 7,
  flujo: 8,
} as const satisfies Record<ClavePasoCreacionProyecto, number | null>;

/** Centraliza la identidad de las rutas disponibles durante la migración. */
export const DATOS_RUTA_PASOS_CREACION = {
  vinculacionAzure: {
    pasoActual: 'vinculacion-azure',
  },
  contexto: {
    pasoActual: 'contexto',
  },
  tipoSolucion: {
    pasoActual: 'tipo-solucion',
  },
  necesidad: {
    pasoActual: 'necesidad',
  },
  objetivos: {
    pasoActual: 'objetivos',
  },
  alcance: {
    pasoActual: 'alcance',
  },
  roles: {
    pasoActual: 'roles',
  },
} as const satisfies Record<string, DatosRutaPasoCreacionProyecto>;
