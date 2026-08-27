import { Routes } from '@angular/router';
import { PARAMETROS_RUTA, SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { DATOS_RUTA_PASOS_CREACION } from './creacion/config/pasos-creacion-proyecto.config';
import { avancePasoCreacionProyectoGuard } from './creacion/guards/avance-paso-creacion-proyecto.guard';
import { reanudacionCreacionProyectoGuard } from './creacion/guards/reanudacion-creacion-proyecto.guard';
import { EstadoCreacionProyectoService } from './creacion/services/estado-creacion-proyecto.service';
import { ContenidoEncabezadoPasoCreacionService } from './creacion/services/contenido-encabezado-paso-creacion.service';

/** Define las rutas internas del dominio de Proyectos. */
export const RUTAS_PROYECTOS: Routes = [
  {
    path: SEGMENTOS_RUTA.nuevo,
    providers: [EstadoCreacionProyectoService, ContenidoEncabezadoPasoCreacionService],
    loadComponent: () =>
      import('./creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
        (modulo) => modulo.PaginaCreacionProyecto,
      ),
    children: [
      {
        path: '',
        data: DATOS_RUTA_PASOS_CREACION.vinculacionAzure,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-vinculacion-azure/pagina-vinculacion-azure').then(
            (modulo) => modulo.PaginaVinculacionAzure,
          ),
      },
    ],
  },
  {
    path: `:${PARAMETROS_RUTA.proyectoId}/${SEGMENTOS_RUTA.creacion}`,
    providers: [EstadoCreacionProyectoService, ContenidoEncabezadoPasoCreacionService],
    canActivate: [reanudacionCreacionProyectoGuard],
    canActivateChild: [avancePasoCreacionProyectoGuard],
    loadComponent: () =>
      import('./creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
        (modulo) => modulo.PaginaCreacionProyecto,
      ),
    children: [
      {
        path: SEGMENTOS_RUTA.contexto,
        data: DATOS_RUTA_PASOS_CREACION.contexto,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-contexto-proyecto/pagina-contexto-proyecto').then(
            (modulo) => modulo.PaginaContextoProyecto,
          ),
      },
      {
        path: SEGMENTOS_RUTA.tipoSolucion,
        data: DATOS_RUTA_PASOS_CREACION.tipoSolucion,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-tipo-solucion-proyecto/pagina-tipo-solucion-proyecto').then(
            (modulo) => modulo.PaginaTipoSolucionProyecto,
          ),
      },
      {
        path: SEGMENTOS_RUTA.necesidad,
        data: DATOS_RUTA_PASOS_CREACION.necesidad,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-necesidad-proyecto/pagina-necesidad-proyecto').then(
            (modulo) => modulo.PaginaNecesidadProyecto,
          ),
      },
      {
        path: SEGMENTOS_RUTA.objetivos,
        data: DATOS_RUTA_PASOS_CREACION.objetivos,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-objetivos-proyecto/pagina-objetivos-proyecto').then(
            (modulo) => modulo.PaginaObjetivosProyecto,
          ),
      },
      {
        path: SEGMENTOS_RUTA.alcance,
        data: DATOS_RUTA_PASOS_CREACION.alcance,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-alcance-proyecto/pagina-alcance-proyecto').then(
            (modulo) => modulo.PaginaAlcanceProyecto,
          ),
      },
      {
        path: SEGMENTOS_RUTA.roles,
        data: DATOS_RUTA_PASOS_CREACION.roles,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-roles-proyecto/pagina-roles-proyecto').then(
            (modulo) => modulo.PaginaRolesProyecto,
          ),
      },
      {
        path: SEGMENTOS_RUTA.equipo,
        data: DATOS_RUTA_PASOS_CREACION.equipo,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-equipo-proyecto/pagina-equipo-proyecto').then(
            (modulo) => modulo.PaginaEquipoProyecto,
          ),
      },
      {
        path: SEGMENTOS_RUTA.flujo,
        data: DATOS_RUTA_PASOS_CREACION.flujo,
        loadComponent: () =>
          import('./creacion/pages/pasos/pagina-flujo-proyecto/pagina-flujo-proyecto').then(
            (modulo) => modulo.PaginaFlujoProyecto,
          ),
      },
    ],
  },
];
