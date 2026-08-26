import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { exigirDatosResultadoApi } from '../../../../core/http/mappers/resultado-api.mapper';
import { ENDPOINTS_CREACION_PROYECTO } from '../config/endpoints-creacion-proyecto.config';
import {
  mapearBorradorProyectoCreado,
  mapearActualizacionBorrador,
  mapearBorradorProyecto,
  mapearResultadoVinculacionAzure,
  mapearSolicitudVinculacionAzure,
} from '../mappers/creacion-proyecto.mapper';
import {
  CrearBorradorProyectoRespuestaDto,
  CrearBorradorProyectoSolicitudDto,
  BorradorProyectoDto,
} from '../models/borrador-proyecto.dto';
import { BorradorProyecto, BorradorProyectoCreado } from '../models/borrador-proyecto.model';
import { ContextoProyecto } from '../../secciones/contexto/models/contexto-proyecto.model';
import { serializarAlcanceProyecto } from '../../secciones/alcance/mappers/alcance-proyecto.mapper';
import { AlcanceProyecto } from '../../secciones/alcance/models/alcance-proyecto.model';
import { serializarNecesidadProyecto } from '../../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { NecesidadProyecto } from '../../secciones/necesidad/models/necesidad-proyecto.model';
import { serializarObjetivosProyecto } from '../../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { ObjetivosProyecto } from '../../secciones/objetivos/models/objetivos-proyecto.model';
import { serializarTipoSolucionProyecto } from '../../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';
import { TipoSolucionProyecto } from '../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { ValidarVinculacionAzureRespuestaDto } from '../models/vinculacion-azure.dto';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../models/vinculacion-azure.model';

/** Ejecuta y adapta las operaciones remotas del recorrido de creación. */
@Injectable({ providedIn: 'root' })
export class CreacionProyectoService {
  private readonly http = inject(HttpClient);

  /** Comprueba en Azure los datos capturados antes de crear información local. */
  public validarVinculacionAzure(
    datos: DatosVinculacionAzure,
  ): Observable<ResultadoVinculacionAzure> {
    return this.http
      .post<ResultadoApi<ValidarVinculacionAzureRespuestaDto>>(
        ENDPOINTS_CREACION_PROYECTO.validarVinculacionAzure,
        mapearSolicitudVinculacionAzure(datos),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'la vinculación con Azure')),
        map(mapearResultadoVinculacionAzure),
      );
  }

  /** Crea el borrador que habilita los pasos posteriores a Azure. */
  public crearBorrador(datos: DatosVinculacionAzure): Observable<BorradorProyectoCreado> {
    const solicitud: CrearBorradorProyectoSolicitudDto = {
      vinculacionAzure: mapearSolicitudVinculacionAzure(datos),
    };

    return this.http
      .post<ResultadoApi<CrearBorradorProyectoRespuestaDto>>(
        ENDPOINTS_CREACION_PROYECTO.crearBorrador,
        solicitud,
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador del proyecto')),
        map(mapearBorradorProyectoCreado),
      );
  }

  /** Recupera la fotografía editable utilizada por los pasos del recorrido. */
  public obtenerBorrador(proyectoId: number): Observable<BorradorProyecto> {
    const params = new HttpParams().set('proyectoId', proyectoId);

    return this.http
      .get<ResultadoApi<BorradorProyectoDto>>(ENDPOINTS_CREACION_PROYECTO.obtenerBorrador, {
        params,
      })
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador del proyecto')),
        map(mapearBorradorProyecto),
      );
  }

  /** Persiste Contexto sin perder la información de las demás secciones. */
  public actualizarContexto(
    borrador: BorradorProyecto,
    contexto: ContextoProyecto,
    pasoActual: number,
  ): Observable<BorradorProyecto> {
    return this.http
      .put<ResultadoApi<BorradorProyectoDto>>(
        ENDPOINTS_CREACION_PROYECTO.actualizarBorrador,
        mapearActualizacionBorrador(borrador, { contexto }, pasoActual),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador actualizado')),
        map(mapearBorradorProyecto),
      );
  }

  /** Persiste Tipo de solución sin perder la información de las demás secciones. */
  public actualizarTipoSolucion(
    borrador: BorradorProyecto,
    tipoSolucion: TipoSolucionProyecto,
    pasoActual: number,
  ): Observable<BorradorProyecto> {
    return this.http
      .put<ResultadoApi<BorradorProyectoDto>>(
        ENDPOINTS_CREACION_PROYECTO.actualizarBorrador,
        mapearActualizacionBorrador(
          borrador,
          { tipoSolucionJson: serializarTipoSolucionProyecto(tipoSolucion) },
          pasoActual,
        ),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador actualizado')),
        map(mapearBorradorProyecto),
      );
  }

  /** Persiste Necesidad sin perder la información de las demás secciones. */
  public actualizarNecesidad(
    borrador: BorradorProyecto,
    necesidad: NecesidadProyecto,
    pasoActual: number,
  ): Observable<BorradorProyecto> {
    return this.http
      .put<ResultadoApi<BorradorProyectoDto>>(
        ENDPOINTS_CREACION_PROYECTO.actualizarBorrador,
        mapearActualizacionBorrador(
          borrador,
          { necesidadJson: serializarNecesidadProyecto(necesidad) },
          pasoActual,
        ),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador actualizado')),
        map(mapearBorradorProyecto),
      );
  }

  /** Persiste Objetivos sin perder la información de las demás secciones. */
  public actualizarObjetivos(
    borrador: BorradorProyecto,
    objetivos: ObjetivosProyecto,
    pasoActual: number,
  ): Observable<BorradorProyecto> {
    return this.http
      .put<ResultadoApi<BorradorProyectoDto>>(
        ENDPOINTS_CREACION_PROYECTO.actualizarBorrador,
        mapearActualizacionBorrador(
          borrador,
          { objetivosJson: serializarObjetivosProyecto(objetivos) },
          pasoActual,
        ),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador actualizado')),
        map(mapearBorradorProyecto),
      );
  }

  /** Persiste Alcance sin perder la información de las demás secciones. */
  public actualizarAlcance(
    borrador: BorradorProyecto,
    alcance: AlcanceProyecto,
    pasoActual: number,
  ): Observable<BorradorProyecto> {
    return this.http
      .put<ResultadoApi<BorradorProyectoDto>>(
        ENDPOINTS_CREACION_PROYECTO.actualizarBorrador,
        mapearActualizacionBorrador(
          borrador,
          { alcanceJson: serializarAlcanceProyecto(alcance) },
          pasoActual,
        ),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador actualizado')),
        map(mapearBorradorProyecto),
      );
  }
}
