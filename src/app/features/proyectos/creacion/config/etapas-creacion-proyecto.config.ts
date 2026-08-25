import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import { SECCIONES_PROYECTO, type SeccionProyecto } from '../../config/secciones-proyecto.config';

/** Describe una etapa presentada durante la creación del proyecto. */
export interface EtapaCreacionProyecto extends SeccionProyecto {
  readonly icono: NombreIconoAplicacion;
}

/** Agrega la vinculación de Azure al recorrido de las secciones del proyecto. */
export const ETAPAS_CREACION_PROYECTO = [
  {
    clave: 'vinculacion-azure',
    titulo: 'Azure DevOps',
    descripcion: 'Vinculación de origen',
    icono: 'azureDevOps',
  },
  ...SECCIONES_PROYECTO,
] as const satisfies readonly EtapaCreacionProyecto[];

/** Limita las claves admitidas por el recorrido de creación. */
export type ClaveEtapaCreacionProyecto = (typeof ETAPAS_CREACION_PROYECTO)[number]['clave'];

/** Proporciona el estado declarativo de una etapa desde la configuración de rutas. */
export interface DatosRutaEtapaCreacionProyecto {
  readonly etapaActual: ClaveEtapaCreacionProyecto;
  readonly etapasCompletadas: readonly ClaveEtapaCreacionProyecto[];
  readonly etapasNavegables: readonly ClaveEtapaCreacionProyecto[];
}

/** Centraliza el estado inicial de las rutas disponibles durante la migración. */
export const DATOS_RUTA_ETAPAS_CREACION = {
  vinculacionAzure: {
    etapaActual: 'vinculacion-azure',
    etapasCompletadas: [],
    etapasNavegables: [],
  },
  contexto: {
    etapaActual: 'contexto',
    etapasCompletadas: ['vinculacion-azure'],
    etapasNavegables: [],
  },
} as const satisfies Record<string, DatosRutaEtapaCreacionProyecto>;
