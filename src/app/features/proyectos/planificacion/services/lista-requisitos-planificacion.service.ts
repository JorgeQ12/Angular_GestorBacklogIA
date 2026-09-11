import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import {
  exigirDatosResultadoApi,
  exigirExitoResultadoApi,
} from '../../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_PLANIFICACION_PROYECTO } from '../config/endpoints-planificacion-proyecto.config';
import {
  mapearCatalogoRequisitos,
  mapearRequisitoProyecto,
} from '../mappers/lista-requisitos.mapper';
import type {
  ActualizarCumplimientoRequisitoDto,
  CatalogoRequisitosProyectoDto,
  CrearRequisitoProyectoDto,
  ListaRequisitosProyectoDto,
  RequisitoProyectoCreadoDto,
} from '../models/lista-requisitos.dto';
import type {
  ActualizacionRequisito,
  CatalogoRequisitos,
  CreacionRequisito,
  RequisitoProyecto,
} from '../models/lista-requisitos.model';

/** Encapsula el contrato HTTP de la lista de requisitos del proyecto. */
@Injectable({ providedIn: 'root' })
export class ListaRequisitosPlanificacionService {

  /** Ejecuta las solicitudes HTTP correspondientes a esta responsabilidad. */
  private readonly http = inject(HttpClient);

  /** Obtiene y ordena los requisitos vigentes del proyecto. */
  public obtener(proyectoId: number): Observable<readonly RequisitoProyecto[]> {
    const params = new HttpParams().set('proyectoId', proyectoId);

    return this.http
      .get<ResultadoApi<ListaRequisitosProyectoDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.obtenerListaRequisitos,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la lista de requisitos').requisitos),
        map((items) => items.map(mapearRequisitoProyecto).sort((a, b) => a.orden - b.orden)),
      );
  }

  /** Obtiene las opciones remotas necesarias para crear un requisito. */
  public obtenerCatalogo(): Observable<CatalogoRequisitos> {
    return this.http
      .get<ResultadoApi<CatalogoRequisitosProyectoDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.obtenerCatalogoRequisitos,
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el catálogo de requisitos')),
        map(mapearCatalogoRequisitos),
      );
  }

  /** Registra un requisito y entrega su representación normalizada. */
  public crear(proyectoId: number, solicitud: CreacionRequisito): Observable<RequisitoProyecto> {
    const cuerpo: CrearRequisitoProyectoDto = solicitud;

    return this.http
      .post<ResultadoApi<RequisitoProyectoCreadoDto>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.crearRequisito(proyectoId),
        { proyectoId, ...cuerpo },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el requisito creado')),
        map(mapearRequisitoProyecto),
      );
  }

  /** Persiste los campos de revisión editables de un requisito existente. */
  public actualizar(
    proyectoId: number,
    requisitoId: number,
    solicitud: ActualizacionRequisito,
  ): Observable<void> {
    const cuerpo: ActualizarCumplimientoRequisitoDto = solicitud;

    return this.http
      .put<ResultadoApi<unknown>>(
        ENDPOINTS_PLANIFICACION_PROYECTO.actualizarCumplimientoRequisito(proyectoId, requisitoId),
        { proyectoId, requisitoId, ...cuerpo },
      )
      .pipe(
        map((resultado) => exigirExitoResultadoApi(resultado, 'la actualización del requisito')),
      );
  }
}
