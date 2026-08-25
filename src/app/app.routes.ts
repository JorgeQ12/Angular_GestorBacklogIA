import { Routes } from '@angular/router';
import { RUTA_INICIO_SESION, RUTA_PANEL, SEGMENTOS_RUTA } from './core/navegacion/rutas';
import { sesionGuard } from './core/autenticacion/guards/sesion.guard';
import { DATOS_RUTA_ETAPAS_CREACION } from './features/proyectos/creacion/config/etapas-creacion-proyecto.config';

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
        path: `${SEGMENTOS_RUTA.proyectos}/${SEGMENTOS_RUTA.nuevo}`,
        loadComponent: () =>
          import('./features/proyectos/creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
            (modulo) => modulo.PaginaCreacionProyecto,
          ),
        children: [
          {
            path: '',
            data: DATOS_RUTA_ETAPAS_CREACION.vinculacionAzure,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/etapas/pagina-vinculacion-azure/pagina-vinculacion-azure').then(
                (modulo) => modulo.PaginaVinculacionAzure,
              ),
          },
        ],
      },
      {
        path: `${SEGMENTOS_RUTA.proyectos}/:proyectoId/${SEGMENTOS_RUTA.creacion}`,
        loadComponent: () =>
          import('./features/proyectos/creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
            (modulo) => modulo.PaginaCreacionProyecto,
          ),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: SEGMENTOS_RUTA.contexto,
          },
          {
            path: SEGMENTOS_RUTA.contexto,
            data: DATOS_RUTA_ETAPAS_CREACION.contexto,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/etapas/pagina-contexto-proyecto/pagina-contexto-proyecto').then(
                (modulo) => modulo.PaginaContextoProyecto,
              ),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: RUTA_INICIO_SESION,
  },
];
