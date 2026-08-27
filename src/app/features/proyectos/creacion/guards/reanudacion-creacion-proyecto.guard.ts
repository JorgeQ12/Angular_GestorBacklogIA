import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import {
  URL_INICIO_PANEL,
  crearUrlContextoProyecto,
  obtenerProyectoIdRuta,
} from '../../../../core/navegacion/rutas';
import { crearUrlReanudacionProyecto } from '../mappers/navegacion-creacion-proyecto.mapper';
import { EstadoCreacionProyectoService } from '../services/estado-creacion-proyecto.service';

/** Reanuda la ruta base en el último paso disponible del borrador. */
export const reanudacionCreacionProyectoGuard: CanActivateFn = (ruta) => {
  if (ruta.firstChild) return true;

  const estadoCreacion = inject(EstadoCreacionProyectoService);
  const router = inject(Router);
  const proyectoId = obtenerProyectoIdRuta(ruta.paramMap);

  if (proyectoId === null) {
    return router.parseUrl(URL_INICIO_PANEL);
  }

  return estadoCreacion.cargar(proyectoId).pipe(
    map((borrador) =>
      router.parseUrl(crearUrlReanudacionProyecto(proyectoId, borrador.pasoActual)),
    ),
    catchError(() => of(router.parseUrl(crearUrlContextoProyecto(proyectoId)))),
  );
};
