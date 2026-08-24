import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { URL_INICIO_SESION } from '../../navegacion/rutas';
import { AutenticacionService } from '../services/autenticacion.service';

/** Permite ingresar únicamente cuando Kong confirma una sesión vigente. */
export const sesionGuard: CanActivateFn = () => {
  const autenticacion = inject(AutenticacionService);
  const router = inject(Router);

  if (autenticacion.sesionActual()) {
    return true;
  }

  return autenticacion.verificarSesion().pipe(
    map(() => true),
    catchError(() => of(router.parseUrl(URL_INICIO_SESION))),
  );
};
