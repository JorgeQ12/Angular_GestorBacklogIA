import { Routes } from '@angular/router';
import { RUTA_INICIO_SESION, RUTA_PANEL, SEGMENTOS_RUTA } from './core/navegacion/rutas';
import { sesionGuard } from './core/autenticacion/guards/sesion.guard';

/** Define las rutas disponibles y su estrategia de carga. */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: RUTA_INICIO_SESION,
  },
  {
    path: RUTA_INICIO_SESION,
    loadComponent: () =>
      import('./features/autenticacion/pages/pagina-inicio-sesion/pagina-inicio-sesion').then(
        (modulo) => modulo.PaginaInicioSesion,
      ),
  },
  {
    path: RUTA_PANEL,
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./layouts/panel/panel-layout').then((modulo) => modulo.PanelLayout),
    children: [
      {
        path: SEGMENTOS_RUTA.catalogos,
        redirectTo: `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.catalogos}`,
        pathMatch: 'full',
      },
      {
        path: `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.catalogos}`,
        loadComponent: () =>
          import('./features/catalogos/pages/pagina-catalogos/pagina-catalogos').then(
            (modulo) => modulo.PaginaCatalogos,
          ),
      },
      {
        path: SEGMENTOS_RUTA.usuarios,
        redirectTo: `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.usuarios}`,
        pathMatch: 'full',
      },
      {
        path: `${SEGMENTOS_RUTA.configuracion}/${SEGMENTOS_RUTA.usuarios}`,
        loadComponent: () =>
          import('./features/usuarios/pages/pagina-usuarios/pagina-usuarios').then(
            (modulo) => modulo.PaginaUsuarios,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: SEGMENTOS_RUTA.inicio,
      },
      {
        path: SEGMENTOS_RUTA.inicio,
        loadComponent: () =>
          import('./features/inicio-panel/pages/pagina-inicio-panel/pagina-inicio-panel').then(
            (modulo) => modulo.PaginaInicioPanel,
          ),
      },
      {
        path: SEGMENTOS_RUTA.proyectos,
        loadChildren: () =>
          import('./features/proyectos/proyectos.routes').then((modulo) => modulo.RUTAS_PROYECTOS),
      },
    ],
  },
  {
    path: '**',
    redirectTo: RUTA_INICIO_SESION,
  },
];
