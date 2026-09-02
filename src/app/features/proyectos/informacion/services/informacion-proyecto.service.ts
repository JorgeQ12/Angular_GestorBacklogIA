import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_INFORMACION_PROYECTO } from '../config/endpoints-informacion-proyecto.config';
import {
  mapearActualizacionProyecto,
  mapearInformacionProyecto,
  mapearVersionProyecto,
  mapearVersionesProyecto,
} from '../mappers/informacion-proyecto.mapper';
import type {
  ActualizarProyectoRespuestaDto,
  ProyectoInformacionDto,
  VersionProyectoDto,
  VersionProyectoResumenDto,
} from '../models/informacion-proyecto.dto';
import type { VinculacionAzureProyectoResumen } from '../../models/vinculacion-azure-proyecto.model';
import type { VersionProyectoResumen } from '../../models/versionamiento-proyecto.model';
import type { InformacionProyecto } from '../models/informacion-proyecto.model';
import type { ActualizacionSeccionProyecto } from '../../models/actualizacion-seccion-proyecto.model';

/** Ejecuta y adapta las operaciones remotas de consulta y versionamiento. */
@Injectable({ providedIn: 'root' })
export class InformacionProyectoService {
  private readonly http = inject(HttpClient);

  /** Obtiene la fotografía vigente y la asociación de Azure del proyecto. */
  public obtenerProyecto(proyectoId: number): Observable<InformacionProyecto> {
    return this.http
      .get<ResultadoApi<ProyectoInformacionDto>>(ENDPOINTS_INFORMACION_PROYECTO.obtenerProyecto, {
        params: new HttpParams().set('ProyectoId', proyectoId),
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la información del proyecto')),
        map(mapearInformacionProyecto),
      );
  }

  /** Obtiene las versiones disponibles para el selector global. */
  public obtenerVersiones(proyectoId: number): Observable<readonly VersionProyectoResumen[]> {
    return this.http
      .get<ResultadoApi<readonly VersionProyectoResumenDto[]>>(
        ENDPOINTS_INFORMACION_PROYECTO.obtenerVersiones,
        { params: new HttpParams().set('ProyectoId', proyectoId) },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'las versiones del proyecto')),
        map(mapearVersionesProyecto),
      );
  }

  /** Obtiene una fotografía histórica sin convertir Azure en contenido versionado. */
  public obtenerVersion(
    proyectoId: number,
    versionId: number,
    azure: VinculacionAzureProyectoResumen | null,
  ): Observable<InformacionProyecto> {
    const params = new HttpParams()
      .set('ProyectoId', proyectoId)
      .set('VersionProyectoId', versionId);
    return this.http
      .get<ResultadoApi<VersionProyectoDto>>(ENDPOINTS_INFORMACION_PROYECTO.obtenerVersion, {
        params,
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la versión del proyecto')),
        map((dto) => mapearVersionProyecto(dto, azure)),
      );
  }

  /** Crea una versión nueva a partir de una actualización discriminada de sección. */
  public actualizarProyecto(
    proyecto: InformacionProyecto,
    actualizacion: ActualizacionSeccionProyecto,
  ): Observable<InformacionProyecto> {
    return this.http
      .put<ResultadoApi<ActualizarProyectoRespuestaDto>>(
        ENDPOINTS_INFORMACION_PROYECTO.actualizarProyecto,
        mapearActualizacionProyecto(proyecto, actualizacion),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el proyecto actualizado')),
        map((dto) => mapearInformacionProyecto({ ...dto, azure: proyecto.azure })),
      );
  }
}
