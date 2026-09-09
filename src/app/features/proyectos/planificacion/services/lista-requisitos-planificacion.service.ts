import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import type { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { environment } from '../../../../../environments/environment';
import { mapearCatalogoRequisitos, mapearRequisitoProyecto } from '../mappers/lista-requisitos.mapper';
import type { ActualizarCumplimientoRequisitoDto, CatalogoRequisitosProyectoDto, CrearRequisitoProyectoDto, ListaRequisitosProyectoDto, RequisitoProyectoCreadoDto } from '../models/lista-requisitos.dto';
import type { ActualizacionRequisito, CatalogoRequisitos, CreacionRequisito, RequisitoProyecto } from '../models/lista-requisitos.model';

const BASE = `${environment.apiBaseUrl}/Requisito`;
@Injectable({ providedIn: 'root' })
export class ListaRequisitosPlanificacionService {
  private readonly http = inject(HttpClient);
  public obtener(proyectoId: number): Observable<readonly RequisitoProyecto[]> {
    const params = new HttpParams().set('proyectoId', proyectoId);
    return this.http.get<ResultadoApi<ListaRequisitosProyectoDto>>(`${BASE}/ObtenerListaRequisitos`, { params }).pipe(
      map(resultado => exigirDatosResultadoApi(resultado, 'la lista de requisitos').requisitos),
      map(items => items.map(mapearRequisitoProyecto).sort((a, b) => a.orden - b.orden)));
  }
  public obtenerCatalogo(): Observable<CatalogoRequisitos> {
    return this.http.get<ResultadoApi<CatalogoRequisitosProyectoDto>>(`${BASE}/ObtenerCatalogoRequisitos`).pipe(
      map(resultado => exigirDatosResultadoApi(resultado, 'el catálogo de requisitos')), map(mapearCatalogoRequisitos));
  }
  public crear(proyectoId: number, solicitud: CreacionRequisito): Observable<RequisitoProyecto> {
    const cuerpo: CrearRequisitoProyectoDto = solicitud;
    return this.http.post<ResultadoApi<RequisitoProyectoCreadoDto>>(`${BASE}/CrearRequisito/${encodeURIComponent(proyectoId)}`, { proyectoId, ...cuerpo }).pipe(
      map(resultado => exigirDatosResultadoApi(resultado, 'el requisito creado')), map(mapearRequisitoProyecto));
  }
  public actualizar(proyectoId: number, requisitoId: number, solicitud: ActualizacionRequisito): Observable<void> {
    const cuerpo: ActualizarCumplimientoRequisitoDto = solicitud;
    return this.http.put<ResultadoApi<unknown>>(`${BASE}/ActualizarCumplimiento/${encodeURIComponent(proyectoId)}/${encodeURIComponent(requisitoId)}`, { proyectoId, requisitoId, ...cuerpo }).pipe(map(() => undefined));
  }
}