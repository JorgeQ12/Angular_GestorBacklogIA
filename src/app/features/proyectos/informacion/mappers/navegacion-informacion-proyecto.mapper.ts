import {
  ClavePasoEspecialProyecto,
  type ClavePasoProyecto,
  PASOS_PROYECTO,
} from '../../config/pasos-proyecto.config';

/** Normaliza el paso solicitado y utiliza Azure como entrada canónica. */
export function obtenerPasoInformacionProyecto(valor: string | null): ClavePasoProyecto {
  return PASOS_PROYECTO.some((paso) => paso.clave === valor)
    ? (valor as ClavePasoProyecto)
    : ClavePasoEspecialProyecto.VinculacionAzure;
}

/** Recupera únicamente identificadores positivos de versión desde la URL. */
export function obtenerVersionIdInformacionProyecto(valor: string | null): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}
