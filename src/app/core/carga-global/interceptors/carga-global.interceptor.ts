import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { OMITIR_CARGA_GLOBAL } from '../contextos/carga-global.contexto';
import { CargaGlobalService } from '../services/carga-global.service';

/** Mantiene activo el cargador mientras una solicitud HTTP continúa pendiente. */
export const cargaGlobalInterceptor: HttpInterceptorFn = (solicitud, siguiente) => {
  if (solicitud.context.get(OMITIR_CARGA_GLOBAL)) return siguiente(solicitud);

  const cargaGlobal = inject(CargaGlobalService);
  cargaGlobal.iniciar();

  return siguiente(solicitud).pipe(finalize(() => cargaGlobal.finalizar()));
};
