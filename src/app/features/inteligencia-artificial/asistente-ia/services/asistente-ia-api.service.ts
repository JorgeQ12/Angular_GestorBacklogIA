import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OMITIR_CARGA_GLOBAL } from '../../../../core/carga-global/contextos/carga-global.contexto';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_ASISTENTE_IA } from '../config/endpoints-asistente-ia.config';
import {
  mapearConversacionAsistenteIA,
  mapearResolucionPropuestaIA,
  mapearRespuestaEnvioAsistenteIA,
} from '../mappers/asistente-ia.mapper';
import type {
  AplicarPropuestaAsistenteIASolicitudDto,
  ConversacionAsistenteIADto,
  EnviarMensajeAsistenteIARespuestaDto,
  EnviarMensajeAsistenteIASolicitudDto,
  RechazarPropuestaAsistenteIASolicitudDto,
  ResolverPropuestaAsistenteIARespuestaDto,
} from '../models/asistente-ia.dto';
import type {
  ContextoAsistenteIA,
  ConversacionAsistenteIA,
  RespuestaEnvioAsistenteIA,
  ResultadoResolucionPropuestaIA,
} from '../models/asistente-ia.model';

/** Encapsula exclusivamente el transporte HTTP del Asistente IA. */
@Injectable({ providedIn: 'root' })
export class AsistenteIAApiService {
  private readonly http = inject(HttpClient);
  private readonly contextoHttp = new HttpContext().set(OMITIR_CARGA_GLOBAL, true);

  /** Recupera y adapta la conversación persistida del borrador indicado. */
  public obtenerConversacion(proyectoId: number): Observable<ConversacionAsistenteIA> {
    const params = new HttpParams().set('proyectoId', proyectoId);
    return this.http
      .get<ResultadoApi<ConversacionAsistenteIADto>>(
        ENDPOINTS_ASISTENTE_IA.obtenerConversacion,
        { params, context: this.contextoHttp },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la conversación del Asistente IA')),
        map(mapearConversacionAsistenteIA),
      );
  }

  /** Envía un mensaje junto con el contexto mínimo de proyecto y sección. */
  public enviarMensaje(
    contexto: ContextoAsistenteIA,
    mensaje: string,
  ): Observable<RespuestaEnvioAsistenteIA> {
    const solicitud: EnviarMensajeAsistenteIASolicitudDto = {
      proyectoId: contexto.proyectoId,
      revisionContexto: contexto.revisionContexto,
      seccionContexto: contexto.seccionActiva,
      mensaje: mensaje.trim(),
    };

    return this.http
      .post<ResultadoApi<EnviarMensajeAsistenteIARespuestaDto>>(
        ENDPOINTS_ASISTENTE_IA.enviarMensaje,
        solicitud,
        { context: this.contextoHttp },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la respuesta del Asistente IA')),
        map(mapearRespuestaEnvioAsistenteIA),
      );
  }

  /** Solicita aplicar una propuesta contra la revisión observada por el cliente. */
  public aplicarPropuesta(
    contexto: ContextoAsistenteIA,
    mensajeId: number,
  ): Observable<ResultadoResolucionPropuestaIA> {
    const solicitud: AplicarPropuestaAsistenteIASolicitudDto = {
      proyectoId: contexto.proyectoId,
      mensajeId,
      revisionEsperada: contexto.revisionContexto,
    };
    return this.resolverPropuesta(ENDPOINTS_ASISTENTE_IA.aplicarPropuesta, solicitud);
  }

  /** Marca una propuesta como rechazada sin modificar el borrador. */
  public rechazarPropuesta(
    proyectoId: number,
    mensajeId: number,
  ): Observable<ResultadoResolucionPropuestaIA> {
    const solicitud: RechazarPropuestaAsistenteIASolicitudDto = { proyectoId, mensajeId };
    return this.resolverPropuesta(ENDPOINTS_ASISTENTE_IA.rechazarPropuesta, solicitud);
  }

  private resolverPropuesta(
    endpoint: string,
    solicitud:
      | AplicarPropuestaAsistenteIASolicitudDto
      | RechazarPropuestaAsistenteIASolicitudDto,
  ): Observable<ResultadoResolucionPropuestaIA> {
    return this.http
      .post<ResultadoApi<ResolverPropuestaAsistenteIARespuestaDto>>(endpoint, solicitud, {
        context: this.contextoHttp,
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la propuesta del Asistente IA')),
        map(mapearResolucionPropuestaIA),
      );
  }
}
