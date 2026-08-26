import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PARAMETROS_RUTA } from '../../../../core/navegacion/rutas';
import {
  ClavePasoCreacionProyecto,
  PASOS_CREACION_PROYECTO,
} from '../config/pasos-creacion-proyecto.config';
import { puedeAbrirPasoCreacion } from '../mappers/estado-recorrido-creacion-proyecto.mapper';
import { crearUrlReanudacionProyecto } from '../mappers/navegacion-creacion-proyecto.mapper';
import { EstadoCreacionProyectoService } from '../services/estado-creacion-proyecto.service';

/** Impide abrir un paso que todavía no ha sido alcanzado por el borrador. */
export const avancePasoCreacionProyectoGuard: CanActivateChildFn = (ruta) => {
  const estadoCreacion = inject(EstadoCreacionProyectoService);
  const router = inject(Router);
  const proyectoId = Number(ruta.parent?.paramMap.get(PARAMETROS_RUTA.proyectoId));
  const pasoSolicitado = obtenerPaso(ruta.data['pasoActual']);

  if (!pasoSolicitado || !Number.isInteger(proyectoId) || proyectoId <= 0) return true;

  return estadoCreacion.cargar(proyectoId).pipe(
    map((borrador) =>
      puedeAbrirPasoCreacion(pasoSolicitado, borrador.pasoActual)
        ? true
        : router.parseUrl(crearUrlReanudacionProyecto(proyectoId, borrador.pasoActual)),
    ),
    catchError(() => of(true)),
  );
};

function obtenerPaso(valor: unknown): ClavePasoCreacionProyecto | null {
  return typeof valor === 'string' && PASOS_CREACION_PROYECTO.some((paso) => paso.clave === valor)
    ? (valor as ClavePasoCreacionProyecto)
    : null;
}
