import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ResultadoApi } from '../../../../core/http/models/resultado-api.model';
import { ENDPOINTS_CREACION_PROYECTO } from '../config/endpoints-creacion-proyecto.config';
import {
  mapearBorradorProyectoCreado,
  mapearResultadoVinculacionAzure,
  mapearSolicitudVinculacionAzure,
} from '../mappers/creacion-proyecto.mapper';
import {
  CrearBorradorProyectoRespuestaDto,
  CrearBorradorProyectoSolicitudDto,
} from '../models/borrador-proyecto.dto';
import { BorradorProyectoCreado } from '../models/borrador-proyecto.model';
import { ValidarVinculacionAzureRespuestaDto } from '../models/vinculacion-azure.dto';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../models/vinculacion-azure.model';

/** Ejecuta y adapta las operaciones remotas del inicio de creación. */
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
        map((resultado) => this.exigirDatos(resultado, 'la vinculación con Azure')),
        map(mapearResultadoVinculacionAzure),
      );
  }

  /** Crea el borrador que habilita las etapas posteriores a Azure. */
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
        map((resultado) => this.exigirDatos(resultado, 'el borrador del proyecto')),
        map(mapearBorradorProyectoCreado),
      );
  }

  private exigirDatos<T>(resultado: ResultadoApi<T>, recurso: string): T {
    if (resultado.exitoso && resultado.datos) return resultado.datos;

    const detalle = resultado.errores?.join(' ') || resultado.mensaje;
    throw new Error(detalle || `El backend no proporcionó ${recurso}.`);
  }
}
