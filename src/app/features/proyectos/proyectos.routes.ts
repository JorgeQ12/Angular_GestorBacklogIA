import { Routes } from '@angular/router';
import { PARAMETROS_RUTA, SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { EstadoCreacionProyectoService } from './creacion/services/estado-creacion-proyecto.service';
import { ContenidoEncabezadoPasoCreacionService } from './creacion/services/contenido-encabezado-paso-creacion.service';
import { EstadoListadoProyectosService } from './listado/services/estado-listado-proyectos.service';

/** Define las rutas internas del dominio de Proyectos. */
export const RUTAS_PROYECTOS: Routes = [
  {
    path: '',
    pathMatch: 'full',
    providers: [EstadoListadoProyectosService],
    loadComponent: () =>
      import('./listado/pages/pagina-listado-proyectos/pagina-listado-proyectos').then(
        (modulo) => modulo.PaginaListadoProyectos,
      ),
  },
  {
    path: SEGMENTOS_RUTA.creacion,
    providers: [EstadoCreacionProyectoService, ContenidoEncabezadoPasoCreacionService],
    loadComponent: () =>
      import('./creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
        (modulo) => modulo.PaginaCreacionProyecto,
      ),
  },
  {
    path: `:${PARAMETROS_RUTA.proyectoId}/${SEGMENTOS_RUTA.planificacion}`,
    loadComponent: () =>
      import(
        './planificacion/pages/pagina-planificacion-proyecto/pagina-planificacion-proyecto'
      ).then((modulo) => modulo.PaginaPlanificacionProyecto),
  },
];
