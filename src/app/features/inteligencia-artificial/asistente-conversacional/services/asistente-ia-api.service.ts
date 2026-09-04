import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OMITIR_CARGA_GLOBAL } from '../../../../core/carga-global/contextos/carga-global.contexto';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_ASISTENTE_IA } from '../config/endpoints-asistente-ia.config';
import {
  mapearConversacionAsistenteIa,
  mapearResolucionPropuestaIa,
  mapearRespuestaEnvioAsistenteIa,
} from '../mappers/asistente-ia.mapper';
import type {
  AplicarPropuestaAsistenteIaSolicitudDto,
  ConversacionAsistenteIaDto,
  EnviarMensajeAsistenteIaRespuestaDto,
  EnviarMensajeAsistenteIaSolicitudDto,
  RechazarPropuestaAsistenteIaSolicitudDto,
  ResolverPropuestaAsistenteIaRespuestaDto,
} from '../models/asistente-ia.dto';
import type {
  ContextoAsistenteIa,
  ConversacionAsistenteIa,
  RespuestaEnvioAsistenteIa,
  ResultadoResolucionPropuestaIa,
} from '../models/asistente-ia.model';

/** Encapsula exclusivamente el transporte HTTP del Asistente IA. */
@Injectable({ providedIn: 'root' })
export class AsistenteIaApiService {
  private readonly http = inject(HttpClient);
  private readonly contextoHttp = new HttpContext().set(OMITIR_CARGA_GLOBAL, true);

  /** Recupera y adapta la conversación persistida del borrador indicado. */
  public obtenerConversacion(proyectoId: number): Observable<ConversacionAsistenteIa> {
    const params = new HttpParams().set('proyectoId', proyectoId);
    return this.http
      .get<ResultadoApi<ConversacionAsistenteIaDto>>(
        ENDPOINTS_ASISTENTE_IA.obtenerConversacion,
        { params, context: this.contextoHttp },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la conversación del Asistente IA')),
        map(mapearConversacionAsistenteIa),
      );
  }

  /** Envía un mensaje junto con el contexto mínimo de proyecto y sección. */
  public enviarMensaje(
    contexto: ContextoAsistenteIa,
    mensaje: string,
  ): Observable<RespuestaEnvioAsistenteIa> {
    const solicitud: EnviarMensajeAsistenteIaSolicitudDto = {
      proyectoId: contexto.proyectoId,
      revisionContexto: contexto.revisionContexto,
      seccionContexto: contexto.seccionActiva,
      mensaje: mensaje.trim(),
    };

    return this.http
      .post<ResultadoApi<EnviarMensajeAsistenteIaRespuestaDto>>(
        ENDPOINTS_ASISTENTE_IA.enviarMensaje,
        solicitud,
        { context: this.contextoHttp },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la respuesta del Asistente IA')),
        map(mapearRespuestaEnvioAsistenteIa),
      );
  }

  /** Solicita aplicar una propuesta contra la revisión observada por el cliente. */
  public aplicarPropuesta(
    contexto: ContextoAsistenteIa,
    mensajeId: number,
  ): Observable<ResultadoResolucionPropuestaIa> {
    const solicitud: AplicarPropuestaAsistenteIaSolicitudDto = {
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
  ): Observable<ResultadoResolucionPropuestaIa> {
    const solicitud: RechazarPropuestaAsistenteIaSolicitudDto = { proyectoId, mensajeId };
    return this.resolverPropuesta(ENDPOINTS_ASISTENTE_IA.rechazarPropuesta, solicitud);
  }

  private resolverPropuesta(
    endpoint: string,
    solicitud:
      | AplicarPropuestaAsistenteIaSolicitudDto
      | RechazarPropuestaAsistenteIaSolicitudDto,
  ): Observable<ResultadoResolucionPropuestaIa> {
    return this.http
      .post<ResultadoApi<ResolverPropuestaAsistenteIaRespuestaDto>>(endpoint, solicitud, {
        context: this.contextoHttp,
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la propuesta del Asistente IA')),
        map(mapearResolucionPropuestaIa),
      );
  }
}
