import { PASOS_CREACION_PROYECTO } from '../creacion/config/pasos-creacion-proyecto.config';
import { obtenerPosicionVisualCreacion } from '../creacion/mappers/estado-recorrido-creacion-proyecto.mapper';
import { ProgresoCreacionProyecto } from '../models/progreso-creacion-proyecto.model';

/** Proyecta el avance interno como un contrato estable para otras funcionalidades. */
export function obtenerProgresoCreacionProyecto(pasoActual: number): ProgresoCreacionProyecto {
  const total = PASOS_CREACION_PROYECTO.length;
  const posicion = obtenerPosicionVisualCreacion(pasoActual);
  return { posicion, total, porcentaje: (posicion / total) * 100 };
}
