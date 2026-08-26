import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ResultadoApi } from '../../http/models/resultado-api.model';
import { exigirDatosResultadoApi } from '../../http/mappers/resultado-api.mapper';
import { ENDPOINTS_CATALOGOS } from '../config/endpoints-catalogos.config';
import { mapearOpcionesCatalogo } from '../mappers/catalogo.mapper';
import { CatalogoValorDto } from '../models/catalogo-valor.dto';
import { OpcionCatalogo } from '../models/opcion-catalogo.model';

/** Proporciona los catálogos transversales requeridos por las features. */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);

  /** Obtiene las opciones activas del tipo de catálogo solicitado. */
  public obtenerOpciones(nombreCatalogo: string): Observable<readonly OpcionCatalogo[]> {
    const params = new HttpParams().set('catalogoTipoNombre', nombreCatalogo);

    return this.http
      .get<ResultadoApi<readonly CatalogoValorDto[]>>(ENDPOINTS_CATALOGOS.obtenerValores, {
        params,
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, `el catálogo ${nombreCatalogo}`)),
        map(mapearOpcionesCatalogo),
      );
  }
}
