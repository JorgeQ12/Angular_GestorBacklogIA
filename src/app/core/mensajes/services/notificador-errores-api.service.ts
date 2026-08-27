import { Injectable, inject } from '@angular/core';
import { normalizarErrorApi } from '../../http/mappers/error-api.mapper';
import type { ErrorApi } from '../../http/models/error-api.model';
import type { ContextoErrorApi, MensajeErrorApi } from '../models/contexto-error-api.model';
import { MensajesService } from './mensajes.service';

const MENSAJES_HTTP: Readonly<Record<number, string>> = {
  0: 'No fue posible conectarse con el servidor. Intenta nuevamente en unos momentos.',
  401: 'La sesión ya no es válida. Inicia sesión nuevamente para continuar.',
  403: 'No tienes permisos para realizar esta operación.',
  404: 'No encontramos la información solicitada.',
  409: 'La información cambió mientras realizabas la operación. Actualízala e intenta nuevamente.',
  500: 'El servidor no pudo completar la operación. Intenta nuevamente en unos momentos.',
};

/** Presenta errores del API priorizando el detalle funcional proporcionado por el backend. */
@Injectable({ providedIn: 'root' })
export class NotificadorErroresApiService {
  private readonly mensajes = inject(MensajesService);

  /** Comunica el error con el contexto de la operación que no pudo completarse. */
  public comunicar(error: unknown, contexto: ContextoErrorApi): void {
    const errorApi = normalizarErrorApi(error);
    const mensajeEspecializado = this.obtenerMensajeEspecializado(errorApi, contexto);
    const contenido = this.obtenerContenido(errorApi, mensajeEspecializado, contexto.descripcion);

    void this.mensajes.error(
      mensajeEspecializado?.titulo ?? contexto.titulo,
      contenido.descripcion,
      contenido.detalles,
    );
  }

  private obtenerMensajeEspecializado(
    error: ErrorApi,
    contexto: ContextoErrorApi,
  ): MensajeErrorApi | undefined {
    if (error.codigo) {
      const mensajeCodigo = contexto.mensajesPorCodigo?.[error.codigo];
      if (mensajeCodigo) return mensajeCodigo;
    }

    return error.estadoHttp === null ? undefined : contexto.mensajesPorEstado?.[error.estadoHttp];
  }

  private obtenerContenido(
    error: ErrorApi,
    mensajeEspecializado: MensajeErrorApi | undefined,
    descripcionPredeterminada: string,
  ): { readonly descripcion: string; readonly detalles: readonly string[] } {
    if (error.mensajeUsuario) {
      return {
        descripcion: error.mensajeUsuario,
        detalles: error.detalles.filter((detalle) => detalle !== error.mensajeUsuario),
      };
    }

    const [primerDetalle, ...detallesRestantes] = error.detalles;
    if (primerDetalle) return { descripcion: primerDetalle, detalles: detallesRestantes };

    return {
      descripcion:
        mensajeEspecializado?.descripcion ??
        this.obtenerDescripcionHttp(error.estadoHttp) ??
        descripcionPredeterminada,
      detalles: [],
    };
  }

  private obtenerDescripcionHttp(estadoHttp: number | null): string | undefined {
    if (estadoHttp === null) return undefined;
    if (estadoHttp >= 500) return MENSAJES_HTTP[500];
    return MENSAJES_HTTP[estadoHttp];
  }
}
