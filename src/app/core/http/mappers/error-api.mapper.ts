import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi, OrigenErrorApi } from '../models/error-api.model';
import type { ResultadoApi } from '../models/resultado-api.model';

/** Normaliza errores funcionales y de transporte en un contrato seguro para la interfaz. */
export function normalizarErrorApi(error: unknown): ErrorApi {
  if (error instanceof ErrorApi) return error;

  if (error instanceof HttpErrorResponse) {
    const origen = error.status === 0 ? OrigenErrorApi.Conexion : OrigenErrorApi.Http;
    return crearErrorApiDesdeCuerpo(error.error, error.status, origen);
  }

  return new ErrorApi({
    estadoHttp: null,
    codigo: null,
    mensajeUsuario: null,
    detalles: [],
    origen: OrigenErrorApi.Desconocido,
  });
}

/** Conserva el detalle funcional de una respuesta sin datos válidos. */
export function crearErrorApiDesdeResultado(
  resultado: ResultadoApi<unknown>,
  mensajeRespaldo: string,
): ErrorApi {
  return new ErrorApi({
    estadoHttp: null,
    codigo: normalizarTexto(resultado.codigoError),
    mensajeUsuario: normalizarTexto(resultado.mensaje),
    detalles: normalizarDetalles(resultado.errores),
    origen: OrigenErrorApi.Funcional,
    mensajeRespaldo,
  });
}

function crearErrorApiDesdeCuerpo(
  cuerpo: unknown,
  estadoHttp: number,
  origen: OrigenErrorApi,
): ErrorApi {
  if (!esRegistro(cuerpo)) {
    return new ErrorApi({
      estadoHttp,
      codigo: null,
      mensajeUsuario: esTextoPresentable(cuerpo) ? cuerpo.trim() : null,
      detalles: [],
      origen,
    });
  }

  const resultado = esResultadoApi(cuerpo) ? cuerpo : null;
  const mensaje = resultado
    ? normalizarTexto(resultado.mensaje)
    : (normalizarTexto(cuerpo['detail']) ??
      normalizarTexto(cuerpo['message']) ??
      normalizarTexto(cuerpo['title']));
  const detalles = resultado
    ? normalizarDetalles(resultado.errores)
    : normalizarErroresDesconocidos(cuerpo['errors']);

  return new ErrorApi({
    estadoHttp,
    codigo: resultado
      ? normalizarTexto(resultado.codigoError)
      : (normalizarTexto(cuerpo['codigoError']) ?? normalizarTexto(cuerpo['code'])),
    mensajeUsuario: mensaje,
    detalles,
    origen,
  });
}

function esResultadoApi(
  valor: Record<string, unknown>,
): valor is Record<string, unknown> & ResultadoApi<unknown> {
  return (
    typeof valor['exitoso'] === 'boolean' &&
    'mensaje' in valor &&
    'codigoError' in valor &&
    'errores' in valor
  );
}

function normalizarErroresDesconocidos(valor: unknown): readonly string[] {
  if (Array.isArray(valor)) return normalizarDetalles(valor);
  if (!esRegistro(valor)) return [];

  return normalizarDetalles(Object.values(valor).flatMap((detalle) => detalle));
}

function normalizarDetalles(valor: unknown): readonly string[] {
  if (!Array.isArray(valor)) return [];
  return [...new Set(valor.filter(esTextoPresentable).map((detalle) => detalle.trim()))];
}

function normalizarTexto(valor: unknown): string | null {
  return esTextoPresentable(valor) ? valor.trim() : null;
}

function esTextoPresentable(valor: unknown): valor is string {
  return (
    typeof valor === 'string' &&
    valor.trim().length > 0 &&
    !/<(?:!doctype|html|body|script)\b/i.test(valor)
  );
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}
