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
  mapearOrigenEquipoAzure,
  mapearResultadoVinculacionAzure,
  mapearSolicitudVinculacionAzure,
} from '../mappers/creacion-proyecto.mapper';
import { mapearCambioSeccionProyecto } from '../../mappers/actualizacion-seccion-proyecto.mapper';
import { mapearDiagramaFlujoGeneradoIA } from '../mappers/flujo-creacion-proyecto.mapper';
import {
  CrearBorradorProyectoRespuestaDto,
  CrearBorradorProyectoSolicitudDto,
  BorradorProyectoDto,
  GuardarProyectoRespuestaDto,
  GuardarProyectoSolicitudDto,
} from '../models/borrador-proyecto.dto';
import type {
  GenerarDiagramaFlujoIARespuestaDto,
  GenerarDiagramaFlujoIASolicitudDto,
} from '../models/generacion-diagrama-flujo-ia.dto';
import { BorradorProyecto, BorradorProyectoCreado } from '../models/borrador-proyecto.model';
import { ActualizacionSeccionProyecto } from '../../models/actualizacion-seccion-proyecto.model';
import {
  SincronizarEquipoAzureRespuestaDto,
  ValidarVinculacionAzureRespuestaDto,
} from '../models/vinculacion-azure.dto';
import type {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../../models/vinculacion-azure-proyecto.model';
import { OrigenEquipoAzureProyecto } from '../../secciones/equipo/models/equipo-proyecto.model';
import type { FlujoProyecto } from '../../secciones/flujo/models/flujo-proyecto.model';

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

  /** Renueva los integrantes del Team vinculado en Azure DevOps. */
  public sincronizarEquipoAzure(proyectoId: number): Observable<OrigenEquipoAzureProyecto> {
    const params = new HttpParams().set('ProyectoId', proyectoId);
    return this.http
      .post<ResultadoApi<SincronizarEquipoAzureRespuestaDto>>(
        ENDPOINTS_CREACION_PROYECTO.sincronizarEquipoAzure,
        null,
        { params },
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el equipo de Azure')),
        map(mapearOrigenEquipoAzure),
      );
  }

  /** Persiste una sección sin perder la información de las demás secciones. */
  public actualizarBorrador(
    borrador: BorradorProyecto,
    actualizacion: ActualizacionSeccionProyecto,
    pasoActual: number,
  ): Observable<BorradorProyecto> {
    return this.http
      .put<ResultadoApi<BorradorProyectoDto>>(
        ENDPOINTS_CREACION_PROYECTO.actualizarBorrador,
        mapearActualizacionBorrador(
          borrador,
          mapearCambioSeccionProyecto(actualizacion),
          pasoActual,
        ),
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el borrador actualizado')),
        map(mapearBorradorProyecto),
      );
  }

  /** Convierte la última revisión confirmada del borrador en un proyecto guardado. */
  public guardarProyecto(solicitud: GuardarProyectoSolicitudDto): Observable<void> {
    return this.http
      .post<ResultadoApi<GuardarProyectoRespuestaDto>>(
        ENDPOINTS_CREACION_PROYECTO.guardarProyecto,
        solicitud,
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el proyecto guardado')),
        map(() => undefined),
      );
  }

  /** Genera un diagrama sin persistirlo a partir del contexto vigente del proyecto. */
  public generarDiagramaFlujoIA(proyectoId: number): Observable<FlujoProyecto> {
    const solicitud: GenerarDiagramaFlujoIASolicitudDto = { proyectoId };
    return this.http
      .post<ResultadoApi<GenerarDiagramaFlujoIARespuestaDto>>(
        ENDPOINTS_CREACION_PROYECTO.generarDiagramaFlujoIA,
        solicitud,
      )
      .pipe(
        map((resultado) => exigirDatosResultadoApi(resultado, 'el diagrama generado con IA')),
        map((respuesta) => mapearDiagramaFlujoGeneradoIA(respuesta, proyectoId)),
      );
  }
}
