import { Injectable, inject } from '@angular/core';
import { Observable, from, map, mergeMap, of, toArray } from 'rxjs';
import {
  consolidarPeriodosGantt,
  crearGanttPlanificacion,
  crearReferenciasGantt,
  mapearElementoGantt,
} from '../mappers/gantt-planificacion.mapper';
import type { GanttPlanificacion } from '../models/gantt-planificacion.model';
import type { PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';

const CONCURRENCIA_DETALLES_GANTT = 6;

/** Recupera los detalles necesarios para representar la planificación como cronograma. */
@Injectable({ providedIn: 'root' })
export class GanttPlanificacionService {
  private readonly elementosApi = inject(ElementoPlanificacionService);

  /** Construye el Gantt vigente o histórico a partir del árbol ya consultado. */
  public obtener(planificacion: PlanificacionProyecto): Observable<GanttPlanificacion> {
    const referencias = crearReferenciasGantt(planificacion);
    if (referencias.length === 0) {
      return of(crearGanttPlanificacion(planificacion, []));
    }

    const versionId = planificacion.esHistorica ? planificacion.versionId : null;
    return from(referencias).pipe(
      mergeMap(
        (referencia) =>
          this.elementosApi
            .obtener(referencia.tipo, referencia.id, versionId)
            .pipe(map((detalle) => mapearElementoGantt(referencia, detalle))),
        CONCURRENCIA_DETALLES_GANTT,
      ),
      toArray(),
      map((elementos) => elementos.sort((a, b) => a.orden - b.orden)),
      map(consolidarPeriodosGantt),
      map((elementos) => crearGanttPlanificacion(planificacion, elementos)),
    );
  }
}
