import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/** Incluye la cookie de sesión únicamente en solicitudes dirigidas a Kong. */
export const credencialesKongInterceptor: HttpInterceptorFn = (solicitud, siguiente) => {
  const perteneceAKong =
    solicitud.url === environment.kongUrl ||
    solicitud.url.startsWith(`${environment.kongUrl}/`);

  if (!perteneceAKong) {
    return siguiente(solicitud);
  }

  return siguiente(solicitud.clone({ withCredentials: true }));
};
