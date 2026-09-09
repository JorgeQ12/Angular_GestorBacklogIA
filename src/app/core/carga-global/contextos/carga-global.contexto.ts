import { HttpContextToken } from '@angular/common/http';

/** Permite que una solicitud con estado local no bloquee toda la aplicación. */
export const OMITIR_CARGA_GLOBAL = new HttpContextToken<boolean>(() => false);
