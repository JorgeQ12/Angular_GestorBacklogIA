import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ResultadoApi } from '../../../core/http/models/resultado-api.model';
import { exigirDatosResultadoApi } from '../../../core/http/mappers/resultado-api.mapper';
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
        map((resultado) => exigirDatosResultadoApi(resultado, 'el resumen administrativo')),
        map(mapearResumenInicioPanel),
      );
  }
}
