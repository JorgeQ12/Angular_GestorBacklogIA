import { Routes } from '@angular/router';
import { RUTA_INICIO_SESION, RUTA_PANEL, SEGMENTOS_RUTA } from './core/navegacion/rutas';
import { sesionGuard } from './core/autenticacion/guards/sesion.guard';
import { DATOS_RUTA_PASOS_CREACION } from './features/proyectos/creacion/config/pasos-creacion-proyecto.config';
import { avancePasoCreacionProyectoGuard } from './features/proyectos/creacion/guards/avance-paso-creacion-proyecto.guard';
import { reanudacionCreacionProyectoGuard } from './features/proyectos/creacion/guards/reanudacion-creacion-proyecto.guard';
import { EstadoCreacionProyectoService } from './features/proyectos/creacion/services/estado-creacion-proyecto.service';

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
        providers: [EstadoCreacionProyectoService],
        loadComponent: () =>
          import('./features/proyectos/creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
            (modulo) => modulo.PaginaCreacionProyecto,
          ),
        children: [
          {
            path: '',
            data: DATOS_RUTA_PASOS_CREACION.vinculacionAzure,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/pasos/pagina-vinculacion-azure/pagina-vinculacion-azure').then(
                (modulo) => modulo.PaginaVinculacionAzure,
              ),
          },
        ],
      },
      {
        path: `${SEGMENTOS_RUTA.proyectos}/:proyectoId/${SEGMENTOS_RUTA.creacion}`,
        providers: [EstadoCreacionProyectoService],
        canActivate: [reanudacionCreacionProyectoGuard],
        canActivateChild: [avancePasoCreacionProyectoGuard],
        loadComponent: () =>
          import('./features/proyectos/creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
            (modulo) => modulo.PaginaCreacionProyecto,
          ),
        children: [
          {
            path: SEGMENTOS_RUTA.contexto,
            data: DATOS_RUTA_PASOS_CREACION.contexto,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/pasos/pagina-contexto-proyecto/pagina-contexto-proyecto').then(
                (modulo) => modulo.PaginaContextoProyecto,
              ),
          },
          {
            path: SEGMENTOS_RUTA.tipoSolucion,
            data: DATOS_RUTA_PASOS_CREACION.tipoSolucion,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/pasos/pagina-tipo-solucion-proyecto/pagina-tipo-solucion-proyecto').then(
                (modulo) => modulo.PaginaTipoSolucionProyecto,
              ),
          },
          {
            path: SEGMENTOS_RUTA.necesidad,
            data: DATOS_RUTA_PASOS_CREACION.necesidad,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/pasos/pagina-necesidad-proyecto/pagina-necesidad-proyecto').then(
                (modulo) => modulo.PaginaNecesidadProyecto,
              ),
          },
          {
            path: SEGMENTOS_RUTA.objetivos,
            data: DATOS_RUTA_PASOS_CREACION.objetivos,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/pasos/pagina-objetivos-proyecto/pagina-objetivos-proyecto').then(
                (modulo) => modulo.PaginaObjetivosProyecto,
              ),
          },
          {
            path: SEGMENTOS_RUTA.alcance,
            data: DATOS_RUTA_PASOS_CREACION.alcance,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/pasos/pagina-alcance-proyecto/pagina-alcance-proyecto').then(
                (modulo) => modulo.PaginaAlcanceProyecto,
              ),
          },
          {
            path: SEGMENTOS_RUTA.roles,
            data: DATOS_RUTA_PASOS_CREACION.roles,
            loadComponent: () =>
              import('./features/proyectos/creacion/pages/pasos/pagina-roles-proyecto/pagina-roles-proyecto').then(
                (modulo) => modulo.PaginaRolesProyecto,
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
