import type { NombreIconoAplicacion } from '../../../shared/components/icono/iconos-aplicacion';
import {
  ClaveSeccionProyecto,
  SECCIONES_PROYECTO,
  type SeccionProyecto,
} from './secciones-proyecto.config';

/** Identifica los pasos que no representan una sección versionada del proyecto. */
export enum ClavePasoEspecialProyecto {
  VinculacionAzure = 'vinculacion-azure',
}

/** Identifica cualquier paso presentado por los recorridos del proyecto. */
export type ClavePasoProyecto = ClavePasoEspecialProyecto | ClaveSeccionProyecto;

/** Describe la identidad visual compartida de un paso del proyecto. */
export interface PasoProyecto extends Omit<SeccionProyecto, 'clave'> {
  readonly clave: ClavePasoProyecto;
  readonly icono: NombreIconoAplicacion;
}

/** Centraliza el recorrido compartido por Creación e Información. */
export const PASOS_PROYECTO = [
  {
    clave: ClavePasoEspecialProyecto.VinculacionAzure,
    titulo: 'Azure DevOps',
    descripcion: 'Vinculación de origen',
    icono: 'azureDevOps',
  },
  ...SECCIONES_PROYECTO,
] as const satisfies readonly PasoProyecto[];

/** Recupera la presentación de un paso desde el catálogo único del dominio. */
export function obtenerPasoProyecto(clave: ClavePasoProyecto): PasoProyecto {
  return PASOS_PROYECTO.find((paso) => paso.clave === clave) ?? PASOS_PROYECTO[0];
}

/** Construye el identificador estable que vincula un paso con su formulario. */
export function construirIdFormularioPasoProyecto(clave: ClavePasoProyecto): string {
  return `formulario-paso-${clave}`;
}
