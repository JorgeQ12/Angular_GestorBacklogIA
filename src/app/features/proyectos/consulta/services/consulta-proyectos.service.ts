import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { PaginadoDto } from '../../../../core/http/models/paginado.dto';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_CONSULTA_PROYECTOS } from '../config/endpoints-consulta-proyectos.config';
import { VALOR_API_ESTADO_PROYECTO } from '../config/filtros-proyectos.config';
import { mapearPaginaProyectos } from '../mappers/consulta-proyectos.mapper';
import type { ConsultaProyectos } from '../models/consulta-proyectos.model';
import type { ResumenProyectoDto } from '../models/resumen-proyecto.dto';
import type { PaginaProyectos } from '../models/resumen-proyecto.model';

/** Consulta y adapta los proyectos disponibles para el usuario vigente. */
@Injectable({ providedIn: 'root' })
export class ConsultaProyectosService {

  /** Ejecuta las solicitudes HTTP correspondientes a esta responsabilidad. */
  private readonly http = inject(HttpClient);

  /** Obtiene una página del portafolio con sus filtros aplicados en el backend. */
  public obtenerProyectos(consulta: ConsultaProyectos): Observable<PaginaProyectos> {
    return this.http
      .get<ResultadoApi<PaginadoDto<ResumenProyectoDto>>>(
        ENDPOINTS_CONSULTA_PROYECTOS.obtenerProyectos,
        { params: this.construirParametros(consulta) },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la consulta de proyectos')),
        map(mapearPaginaProyectos),
      );
  }

  /** Construye parámetros dentro del flujo actual. */
  private construirParametros(consulta: ConsultaProyectos): HttpParams {
    let parametros = new HttpParams()
      .set('PaginaActual', consulta.pagina)
      .set('PaginaTamano', consulta.paginaTamano);
    const nombre = consulta.nombre.trim();
    const responsable = consulta.responsable.trim();

    if (nombre) parametros = parametros.set('Nombre', nombre);
    if (responsable) parametros = parametros.set('Responsable', responsable);
    if (consulta.estado !== null) {
      parametros = parametros.set('Estado', VALOR_API_ESTADO_PROYECTO[consulta.estado]);
    }

    return parametros;
  }
}
