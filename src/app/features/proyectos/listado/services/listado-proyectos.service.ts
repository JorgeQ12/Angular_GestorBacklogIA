import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { PaginadoDto } from '../../../../core/http/models/paginado.dto';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_LISTADO_PROYECTOS } from '../config/endpoints-listado-proyectos.config';
import { VALOR_API_ESTADO_PROYECTO } from '../config/filtros-listado-proyectos.config';
import { mapearPaginaListadoProyectos } from '../mappers/listado-proyectos.mapper';
import type { ConsultaListadoProyectos } from '../models/consulta-listado-proyectos.model';
import type { ProyectoListadoDto } from '../models/proyecto-listado.dto';
import type { PaginaListadoProyectos } from '../models/proyecto-listado.model';

/** Consulta y adapta los proyectos disponibles para el usuario vigente. */
@Injectable({ providedIn: 'root' })
export class ListadoProyectosService {
  private readonly http = inject(HttpClient);

  /** Obtiene una página del portafolio con sus filtros aplicados en el backend. */
  public obtenerProyectos(consulta: ConsultaListadoProyectos): Observable<PaginaListadoProyectos> {
    return this.http
      .get<ResultadoApi<PaginadoDto<ProyectoListadoDto>>>(
        ENDPOINTS_LISTADO_PROYECTOS.obtenerProyectos,
        { params: this.construirParametros(consulta) },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el listado de proyectos')),
        map(mapearPaginaListadoProyectos),
      );
  }

  private construirParametros(consulta: ConsultaListadoProyectos): HttpParams {
    let parametros = new HttpParams()
      .set('paginaActual', consulta.pagina)
      .set('paginaTamano', consulta.paginaTamano);
    const nombre = consulta.nombre.trim();
    const responsable = consulta.responsable.trim();

    if (nombre) parametros = parametros.set('nombre', nombre);
    if (responsable) parametros = parametros.set('responsable', responsable);
    if (consulta.estado !== null) {
      parametros = parametros.set('estado', VALOR_API_ESTADO_PROYECTO[consulta.estado]);
    }

    return parametros;
  }
}
