import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_PLANIFICACION_PROYECTO } from '../config/endpoints-planificacion-proyecto.config';
import {
  mapearDetalleElementoPlanificacion,
  mapearResultadoEliminacionElemento,
  serializarTipoElemento,
} from '../mappers/elemento-planificacion.mapper';
import {
  mapearHistorialElementoPlanificacion,
  mapearVersionElementoPlanificacion,
} from '../mappers/historial-elemento-planificacion.mapper';
import type {
  ActualizarElementoPlanificacionDto,
  CrearElementoPlanificacionDto,
  DetalleElementoPlanificacionDto,
  ResultadoEliminacionElementoPlanificacionDto,
} from '../models/elemento-planificacion.dto';
import type {
  DetalleElementoPlanificacion,
  ResultadoEliminacionElementoPlanificacion,
  TipoItemPlanificacion,
} from '../models/detalle-elemento-planificacion.model';
import type {
  HistorialElementoPlanificacionDto,
  VersionElementoPlanificacionDto,
} from '../models/historial-elemento-planificacion.dto';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';
import type {
  HistorialElementoPlanificacion,
  TipoElementoVersionable,
  VersionElementoPlanificacion,
} from '../models/historial-elemento-planificacion.model';

/** Encapsula las operaciones remotas de consulta y persistencia de elementos. */
@Injectable({ providedIn: 'root' })
export class ElementoPlanificacionService {

  /** Ejecuta las solicitudes HTTP correspondientes a esta responsabilidad. */
  private readonly http = inject(HttpClient);

  /** Obtiene el detalle vigente de un elemento persistible. */
  public obtener(
    tipo: TipoItemPlanificacion,
    elementoId: number,
    versionPlanificacionId: number | null = null,
  ): Observable<DetalleElementoPlanificacion> {
    let params = new HttpParams()
      .set('Tipo', serializarTipoElemento(tipo))
      .set('ItemTrabajoId', elementoId);
    if (versionPlanificacionId !== null) {
      params = params.set('VersionBacklogId', versionPlanificacionId);
    }
    return this.http
      .get<ResultadoApi<DetalleElementoPlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.obtenerElemento,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el detalle del elemento')),
        map(mapearDetalleElementoPlanificacion),
      );
  }

  /** Crea un elemento bajo la identidad padre indicada por el comando. */
  public crear(
    solicitud: CrearElementoPlanificacionDto,
  ): Observable<DetalleElementoPlanificacion> {
    return this.http
      .post<ResultadoApi<DetalleElementoPlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.crearElemento,
        solicitud,
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el elemento creado')),
        map(mapearDetalleElementoPlanificacion),
      );
  }

  /** Guarda una nueva versión del elemento usando concurrencia optimista. */
  public actualizar(
    solicitud: ActualizarElementoPlanificacionDto,
  ): Observable<DetalleElementoPlanificacion> {
    return this.http
      .put<ResultadoApi<DetalleElementoPlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.actualizarElemento,
        solicitud,
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el elemento actualizado')),
        map(mapearDetalleElementoPlanificacion),
      );
  }

  /** Inactiva un elemento y sus descendientes usando concurrencia optimista. */
  public eliminar(
    tipo: TipoElementoPlanificacion,
    elementoId: number,
    numeroVersionEsperada: number,
  ): Observable<ResultadoEliminacionElementoPlanificacion> {
    const params = new HttpParams()
      .set('Tipo', serializarTipoElemento(tipo))
      .set('ItemTrabajoId', elementoId)
      .set('NumeroVersionEsperada', numeroVersionEsperada);

    return this.http
      .delete<ResultadoApi<ResultadoEliminacionElementoPlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.eliminarElemento,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el resultado de la eliminación')),
        map(mapearResultadoEliminacionElemento),
      );
  }

  /** Obtiene una página de versiones anteriores del elemento. */
  public obtenerHistorial(
    tipo: TipoElementoVersionable,
    elementoId: number,
    cursor: number | null = null,
    tamanoPagina = 20,
  ): Observable<HistorialElementoPlanificacion> {
    let params = new HttpParams()
      .set('Tipo', serializarTipoElemento(tipo))
      .set('ItemTrabajoId', elementoId)
      .set('TamanoPagina', tamanoPagina);
    if (cursor !== null) params = params.set('Cursor', cursor);

    return this.http
      .get<ResultadoApi<HistorialElementoPlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.obtenerHistorialElemento,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el historial del elemento')),
        map(mapearHistorialElementoPlanificacion),
      );
  }

  /** Obtiene el contenido inmutable de una versión específica. */
  public obtenerVersion(
    tipo: TipoElementoVersionable,
    elementoId: number,
    versionId: number,
  ): Observable<VersionElementoPlanificacion> {
    const params = new HttpParams()
      .set('Tipo', serializarTipoElemento(tipo))
      .set('ItemTrabajoId', elementoId)
      .set('VersionId', versionId);

    return this.http
      .get<ResultadoApi<VersionElementoPlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.obtenerVersionElemento,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la versión del elemento')),
        map(mapearVersionElementoPlanificacion),
      );
  }
}
