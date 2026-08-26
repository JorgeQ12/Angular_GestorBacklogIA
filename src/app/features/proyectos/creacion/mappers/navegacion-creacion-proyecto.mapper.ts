import {
  crearUrlAlcanceProyecto,
  crearUrlContextoProyecto,
  crearUrlNecesidadProyecto,
  crearUrlObjetivosProyecto,
  crearUrlRolesProyecto,
  crearUrlTipoSolucionProyecto,
} from '../../../../core/navegacion/rutas';
import { ClaveSeccionProyecto } from '../../config/secciones-proyecto.config';
import {
  AVANCE_BORRADOR_POR_PASO,
  ClavePasoCreacionProyecto,
  PASOS_CREACION_PROYECTO,
} from '../config/pasos-creacion-proyecto.config';
import { normalizarAvanceCreacionProyecto } from './estado-recorrido-creacion-proyecto.mapper';

type ConstructorUrlPaso = (proyectoId: number | string) => string;

const CONSTRUCTORES_URL_PASO: Partial<Record<ClavePasoCreacionProyecto, ConstructorUrlPaso>> = {
  [ClaveSeccionProyecto.Contexto]: crearUrlContextoProyecto,
  [ClaveSeccionProyecto.TipoSolucion]: crearUrlTipoSolucionProyecto,
  [ClaveSeccionProyecto.Necesidad]: crearUrlNecesidadProyecto,
  [ClaveSeccionProyecto.Objetivos]: crearUrlObjetivosProyecto,
  [ClaveSeccionProyecto.Alcance]: crearUrlAlcanceProyecto,
  [ClaveSeccionProyecto.Roles]: crearUrlRolesProyecto,
};

/** Construye la URL de un paso disponible dentro del recorrido migrado. */
export function crearUrlPasoCreacionProyecto(
  proyectoId: number | string,
  paso: ClavePasoCreacionProyecto,
): string | null {
  return CONSTRUCTORES_URL_PASO[paso]?.(proyectoId) ?? null;
}

/** Resuelve el último paso alcanzado que ya tiene una ruta disponible. */
export function crearUrlReanudacionProyecto(
  proyectoId: number | string,
  pasoActual: number,
): string {
  const avance = normalizarAvanceCreacionProyecto(pasoActual);
  let destino = crearUrlContextoProyecto(proyectoId);

  for (const paso of PASOS_CREACION_PROYECTO) {
    const avanceRequerido = AVANCE_BORRADOR_POR_PASO[paso.clave];
    const url = crearUrlPasoCreacionProyecto(proyectoId, paso.clave);
    if (avanceRequerido !== null && avanceRequerido <= avance && url) destino = url;
  }

  return destino;
}
