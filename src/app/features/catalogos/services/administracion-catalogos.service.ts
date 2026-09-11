import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CatalogoValorDto } from '../../../core/catalogos/models/catalogo-valor.dto';
import { exigirDatosResultadoApi } from '../../../core/http/mappers/resultado-api.mapper';
import { ResultadoApi } from '../../../core/http/models/resultado-api.model';
import { ENDPOINTS_ADMINISTRACION_CATALOGOS as E } from '../config/endpoints-administracion-catalogos.config';
import { mapearCatalogo, mapearValorCatalogo } from '../mappers/catalogo.mapper';
import { CatalogoTipoDto } from '../models/catalogo-tipo.dto';
import { Catalogo, DatosCatalogo, ValorCatalogo } from '../models/catalogo.model';

/** Administra catálogos mediante contratos explícitos y la carga HTTP global. */
@Injectable({ providedIn: 'root' })
export class AdministracionCatalogosService {
  private readonly http = inject(HttpClient);

  /** Recupera tipos activos e inactivos para su administración. */
  public obtenerTipos(): Observable<readonly Catalogo[]> {
    return this.http
      .get<ResultadoApi<CatalogoTipoDto[]>>(E.obtenerTipos, {
        params: new HttpParams().set('IncluirInactivos', true),
      })
      .pipe(map((r) => exigirDatosResultadoApi(r, 'los catálogos').map(mapearCatalogo)));
  }

  /** Recupera todas las opciones conservando su relación con el tipo. */
  public obtenerValores(): Observable<readonly ValorCatalogo[]> {
    return this.http
      .get<ResultadoApi<CatalogoValorDto[]>>(E.obtenerValores, {
        params: new HttpParams().set('IncluirInactivos', true),
      })
      .pipe(map((r) => exigirDatosResultadoApi(r, 'las opciones').map(mapearValorCatalogo)));
  }

  /** Crea o actualiza un tipo; el código solo forma parte del alta. */
  public guardarTipo(
    datos: DatosCatalogo,
    entidad: Catalogo | null,
    activo = entidad?.activo ?? true,
  ): Observable<Catalogo> {
    const cuerpoEditable = { nombre: datos.nombre, descripcion: datos.descripcion, activo };
    const solicitud = entidad
      ? this.http.put<ResultadoApi<CatalogoTipoDto>>(E.actualizarTipo, {
          id: entidad.id,
          ...cuerpoEditable,
        })
      : this.http.post<ResultadoApi<CatalogoTipoDto>>(E.crearTipo, {
          codigo: datos.codigo,
          ...cuerpoEditable,
        });
    return solicitud.pipe(
      map((r) => mapearCatalogo(exigirDatosResultadoApi(r, 'el catálogo guardado'))),
    );
  }

  /** Persiste una opción; el código solo forma parte del alta. */
  public guardarValor(
    datos: DatosCatalogo,
    padreId: number,
    entidad: ValorCatalogo | null,
    activo = entidad?.activo ?? true,
  ): Observable<ValorCatalogo> {
    const cuerpoEditable = {
      catalogoTipoId: padreId,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      activo,
    };
    const solicitud = entidad
      ? this.http.put<ResultadoApi<CatalogoValorDto>>(E.actualizarValor, {
          id: entidad.id,
          ...cuerpoEditable,
        })
      : this.http.post<ResultadoApi<CatalogoValorDto>>(E.crearValor, {
          codigo: datos.codigo,
          ...cuerpoEditable,
        });
    return solicitud.pipe(
      map((r) => mapearValorCatalogo(exigirDatosResultadoApi(r, 'la opción guardada'))),
    );
  }

  /** Solicita al backend validar restricciones e inactivar el tipo. */
  public inactivarTipo(id: number): Observable<Catalogo> {
    return this.http
      .patch<ResultadoApi<CatalogoTipoDto>>(E.inactivarTipo, null, {
        params: new HttpParams().set('Id', id),
      })
      .pipe(map((r) => mapearCatalogo(exigirDatosResultadoApi(r, 'el catálogo inactivado'))));
  }

  /** Retira la opción de nuevas selecciones sin eliminar su historial. */
  public inactivarValor(id: number): Observable<ValorCatalogo> {
    return this.http
      .patch<ResultadoApi<CatalogoValorDto>>(E.inactivarValor, null, {
        params: new HttpParams().set('Id', id),
      })
      .pipe(map((r) => mapearValorCatalogo(exigirDatosResultadoApi(r, 'la opción inactivada'))));
  }
}
