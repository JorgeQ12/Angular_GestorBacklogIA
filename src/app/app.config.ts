import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { credencialesKongInterceptor } from './core/autenticacion/interceptors/credenciales-kong.interceptor';
import { cargaGlobalInterceptor } from './core/carga-global/interceptors/carga-global.interceptor';
import { LOCALE_APLICACION } from './core/localizacion/config/localizacion.config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: LOCALE_APLICACION },
    provideRouter(routes),
    provideHttpClient(withInterceptors([credencialesKongInterceptor, cargaGlobalInterceptor])),
  ],
};
