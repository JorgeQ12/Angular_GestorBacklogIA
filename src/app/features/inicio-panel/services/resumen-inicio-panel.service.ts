import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ResultadoApi } from '../../../core/http/models/resultado-api.model';
import { ENDPOINTS_INICIO_PANEL } from '../config/endpoints-inicio-panel.config';
import { mapearResumenInicioPanel } from '../mappers/resumen-inicio-panel.mapper';
import { ResumenAdministrativoDto } from '../models/resumen-administrativo.dto';
import { ResumenInicioPanel } from '../models/resumen-inicio-panel.model';

/** Consulta y adapta el resumen administrativo utilizado por el inicio. */
@Injectable({ providedIn: 'root' })
export class ResumenInicioPanelService {
  private readonly http = inject(HttpClient);

  /** Obtiene el resumen de proyectos disponible para el usuario vigente. */
  public obtenerResumen(): Observable<ResumenInicioPanel> {
    return this.http
      .get<ResultadoApi<ResumenAdministrativoDto>>(ENDPOINTS_INICIO_PANEL.resumenAdministrativo)
      .pipe(
        map((resultado) => this.exigirDatos(resultado)),
        map(mapearResumenInicioPanel),
      );
  }

  private exigirDatos(resultado: ResultadoApi<ResumenAdministrativoDto>): ResumenAdministrativoDto {
    if (resultado.exitoso && resultado.datos) return resultado.datos;

    const detalle = resultado.errores?.join(' ') || resultado.mensaje;
    throw new Error(detalle || 'El backend no proporcionó el resumen administrativo.');
  }
}
