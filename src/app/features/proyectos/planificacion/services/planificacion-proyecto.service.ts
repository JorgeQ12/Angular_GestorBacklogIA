import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_PLANIFICACION_PROYECTO } from '../config/endpoints-planificacion-proyecto.config';
import { mapearPlanificacionProyecto } from '../mappers/planificacion-proyecto.mapper';
import {
  crearSolicitudGeneracionIaPlanificacion,
  mapearResultadoGeneracionIaPlanificacion,
} from '../mappers/generacion-ia-planificacion.mapper';
import type { ResultadoGeneracionIaPlanificacionDto } from '../models/generacion-ia-planificacion.dto';
import {
  type ResultadoGeneracionIaPlanificacion,
  NivelGeneracionIaPlanificacion,
} from '../models/generacion-ia-planificacion.model';
import type { PlanificacionProyectoDto } from '../models/planificacion-proyecto.dto';
import type { PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import type { VersionPlanificacionDto } from '../models/version-planificacion.dto';
import type { VersionPlanificacion } from '../models/version-planificacion.model';
import { mapearVersionesPlanificacion } from '../mappers/version-planificacion.mapper';
import {
  crearSolicitudPublicacionAzurePlanificacion,
  mapearResultadoPublicacionAzurePlanificacion,
} from '../mappers/publicacion-azure-planificacion.mapper';
import type { ResultadoPublicacionAzurePlanificacionDto } from '../models/publicacion-azure-planificacion.dto';
import type { ResultadoPublicacionAzurePlanificacion } from '../models/publicacion-azure-planificacion.model';
import { mapearResultadoSincronizacionEpicaAzurePlanificacion } from '../mappers/sincronizacion-epica-azure-planificacion.mapper';
import type { ResultadoSincronizacionEpicaAzurePlanificacionDto } from '../models/sincronizacion-epica-azure-planificacion.dto';
import type { ResultadoSincronizacionEpicaAzurePlanificacion } from '../models/sincronizacion-epica-azure-planificacion.model';

/** Consulta la planificación y ejecuta sus operaciones de nivel general. */
@Injectable({ providedIn: 'root' })
export class PlanificacionProyectoService {
  private readonly http = inject(HttpClient);

  /** Obtiene una fotografía de la planificación con el alcance de visualización solicitado. */
  public obtenerPlanificacion(
    proyectoId: number,
    versionId: number | null = null,
    incluirEliminados = false,
  ): Observable<PlanificacionProyecto> {
    let params = new HttpParams()
      .set('ProyectoId', proyectoId)
      .set('IncluirEliminados', incluirEliminados);
    if (versionId !== null) params = params.set('VersionBacklogId', versionId);

    return this.http
      .get<ResultadoApi<PlanificacionProyectoDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.obtenerPlanificacion,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la planificación del proyecto')),
        map(mapearPlanificacionProyecto),
      );
  }

  /** Obtiene las fotografías integrales disponibles para el proyecto. */
  public obtenerVersiones(proyectoId: number): Observable<readonly VersionPlanificacion[]> {
    const params = new HttpParams().set('ProyectoId', proyectoId);
    return this.http
      .get<ResultadoApi<readonly VersionPlanificacionDto[]>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.obtenerVersiones,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'las versiones de la planificación')),
        map(mapearVersionesPlanificacion),
      );
  }

  /** Genera una nueva propuesta para el nivel solicitado. */
  public generarConIa(
    proyectoId: number,
    nivel: NivelGeneracionIaPlanificacion,
  ): Observable<ResultadoGeneracionIaPlanificacion> {
    return this.http
      .post<ResultadoApi<ResultadoGeneracionIaPlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.generarElementosConIa,
        crearSolicitudGeneracionIaPlanificacion(proyectoId, nivel),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la generación mediante IA')),
        map(mapearResultadoGeneracionIaPlanificacion),
      );
  }

  /** Publica los elementos vigentes de la planificación en Azure DevOps. */
  public publicarEnAzure(
    proyectoId: number,
  ): Observable<ResultadoPublicacionAzurePlanificacion> {
    return this.http
      .post<ResultadoApi<ResultadoPublicacionAzurePlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.publicarEnAzure,
        crearSolicitudPublicacionAzurePlanificacion(proyectoId),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la publicación en Azure DevOps')),
        map(mapearResultadoPublicacionAzurePlanificacion),
      );
  }

  /** Importa desde Azure DevOps las revisiones nuevas de la épica principal vinculada. */
  public sincronizarEpicaPrincipal(
    proyectoId: number,
  ): Observable<ResultadoSincronizacionEpicaAzurePlanificacion> {
    const params = new HttpParams().set('proyectoId', proyectoId);
    return this.http
      .post<ResultadoApi<ResultadoSincronizacionEpicaAzurePlanificacionDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.sincronizarEpicaPrincipal,
        null,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la sincronización de la épica principal')),
        map(mapearResultadoSincronizacionEpicaAzurePlanificacion),
      );
  }
}
