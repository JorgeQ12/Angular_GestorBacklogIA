import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { CargaGlobalService } from '../services/carga-global.service';

/** Mantiene activo el cargador mientras una solicitud HTTP continúa pendiente. */
export const cargaGlobalInterceptor: HttpInterceptorFn = (solicitud, siguiente) => {
  const cargaGlobal = inject(CargaGlobalService);
  cargaGlobal.iniciar();

  return siguiente(solicitud).pipe(finalize(() => cargaGlobal.finalizar()));
};
