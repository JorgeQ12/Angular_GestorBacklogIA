import type { ResultadoApi } from '../models/resultado-api.model';
import { crearErrorApiDesdeResultado } from './error-api.mapper';

/** Exige los datos de una respuesta funcional y conserva el detalle proporcionado por el API. */
export function exigirDatosResultadoApi<T>(resultado: ResultadoApi<T>, recurso: string): T {
  if (resultado.exitoso && resultado.datos !== null && resultado.datos !== undefined) {
    return resultado.datos;
  }

  throw crearErrorApiDesdeResultado(resultado, `El backend no proporcionó ${recurso}.`);
}

/** Exige que una operación sin datos haya finalizado correctamente. */
export function exigirExitoResultadoApi(resultado: ResultadoApi<unknown>, operacion: string): void {
  if (resultado.exitoso) {
    return;
  }

  throw crearErrorApiDesdeResultado(resultado, `El backend no pudo completar ${operacion}.`);
}
