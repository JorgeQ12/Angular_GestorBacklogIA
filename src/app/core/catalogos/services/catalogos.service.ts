import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ResultadoApi } from '../../http/models/resultado-api.model';
import { exigirDatosResultadoApi } from '../../http/mappers/resultado-api.mapper';
import { ENDPOINTS_CATALOGOS } from '../config/endpoints-catalogos.config';
import { mapearOpcionesCatalogo } from '../mappers/catalogo.mapper';
import { CatalogoValorDto } from '../models/catalogo-valor.dto';
import { CodigoTipoCatalogoIdentidad } from '../models/codigo-tipo-catalogo-identidad.enum';
import { CodigoTipoCatalogoGestionProducto } from '../models/codigo-tipo-catalogo-gestion-producto.enum';
import { OpcionCatalogo } from '../models/opcion-catalogo.model';

type CodigoTipoCatalogo =
  | CodigoTipoCatalogoGestionProducto
  | CodigoTipoCatalogoIdentidad;

/** Proporciona los catálogos transversales requeridos por las features. */
@Injectable({ providedIn: 'root' })
export class CatalogosService {

  /** Ejecuta las solicitudes HTTP correspondientes a esta responsabilidad. */
  private readonly http = inject(HttpClient);

  /** Obtiene las opciones activas del tipo de catálogo solicitado por su código técnico. */
  public obtenerOpciones(
    codigoCatalogo: CodigoTipoCatalogo,
  ): Observable<readonly OpcionCatalogo[]> {
    const params = new HttpParams().set('catalogoTipoCodigo', codigoCatalogo);

    return this.http
      .get<ResultadoApi<readonly CatalogoValorDto[]>>(ENDPOINTS_CATALOGOS.obtenerValores, {
        params,
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, `el catálogo ${codigoCatalogo}`)),
        map((valores) => valores.filter((valor) => valor.catalogoTipoCodigo === codigoCatalogo)),
        map(mapearOpcionesCatalogo),
      );
  }
}
