import {
  type ClavePasoProyecto,
  PASOS_PROYECTO,
} from '../../config/pasos-proyecto.config';
import { AVANCE_BORRADOR_POR_PASO } from '../config/avance-borrador-proyecto.config';

/** Representa el estado visible y navegable del recorrido de creación. */
export interface EstadoRecorridoCreacionProyecto {
  readonly pasoActual: ClavePasoProyecto;
  readonly pasosCompletados: readonly ClavePasoProyecto[];
  readonly pasosNavegables: readonly ClavePasoProyecto[];
}

/** Deriva el recorrido desde la selección actual y el máximo avance persistido. */
export function construirEstadoRecorridoCreacion(
  clavePasoActual: ClavePasoProyecto,
  avanceBorrador: number | null,
): EstadoRecorridoCreacionProyecto {
  if (avanceBorrador === null) {
    return { pasoActual: clavePasoActual, pasosCompletados: [], pasosNavegables: [] };
  }

  const avance = normalizarAvanceCreacionProyecto(avanceBorrador);
  const pasosCompletados = PASOS_PROYECTO.filter((paso) => {
    const avanceRequerido = AVANCE_BORRADOR_POR_PASO[paso.clave];
    return avanceRequerido === null || avanceRequerido < avance;
  }).map((paso) => paso.clave);
  const pasosNavegables = PASOS_PROYECTO.filter((paso) => {
    const avanceRequerido = AVANCE_BORRADOR_POR_PASO[paso.clave];
    return avanceRequerido !== null && avanceRequerido <= avance && paso.clave !== clavePasoActual;
  }).map((paso) => paso.clave);

  return { pasoActual: clavePasoActual, pasosCompletados, pasosNavegables };
}

/** Determina si el avance persistido permite abrir un paso. */
export function puedeAbrirPasoCreacion(
  paso: ClavePasoProyecto,
  pasoActual: number,
): boolean {
  const avanceRequerido = AVANCE_BORRADOR_POR_PASO[paso];
  return (
    avanceRequerido !== null && avanceRequerido <= normalizarAvanceCreacionProyecto(pasoActual)
  );
}

/** Convierte el avance persistido en el último paso disponible del recorrido. */
export function obtenerUltimoPasoCreacion(pasoActual: number): ClavePasoProyecto {
  const avance = normalizarAvanceCreacionProyecto(pasoActual);
  let ultimoPaso: ClavePasoProyecto = PASOS_PROYECTO[1].clave;

  for (const paso of PASOS_PROYECTO) {
    const avanceRequerido = AVANCE_BORRADOR_POR_PASO[paso.clave];
    if (avanceRequerido !== null && avanceRequerido <= avance) ultimoPaso = paso.clave;
  }

  return ultimoPaso;
}

/** Normaliza el avance persistido dentro de los límites del recorrido. */
export function normalizarAvanceCreacionProyecto(pasoActual: number): number {
  const ultimoPaso = Object.values(AVANCE_BORRADOR_POR_PASO).reduce<number>(
    (mayor, paso) => (paso === null ? mayor : Math.max(mayor, paso)),
    1,
  );
  const avance = Number.isFinite(pasoActual) ? Math.trunc(pasoActual) : 1;
  return Math.min(Math.max(avance, 1), ultimoPaso);
}

/** Convierte el avance del backend en su posición dentro del recorrido visual. */
export function obtenerPosicionVisualCreacion(pasoActual: number): number {
  return Math.min(normalizarAvanceCreacionProyecto(pasoActual) + 1, PASOS_PROYECTO.length);
}
