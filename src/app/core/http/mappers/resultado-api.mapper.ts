import { ResultadoApi } from '../models/resultado-api.model';

/** Exige los datos de una respuesta funcional y conserva el detalle proporcionado por el API. */
export function exigirDatosResultadoApi<T>(resultado: ResultadoApi<T>, recurso: string): T {
  if (resultado.exitoso && resultado.datos !== null && resultado.datos !== undefined) {
    return resultado.datos;
  }

  const detalle = resultado.errores?.join(' ') || resultado.mensaje;
  throw new Error(detalle || `El backend no proporcionó ${recurso}.`);
}
