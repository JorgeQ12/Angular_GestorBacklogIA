import { Routes } from '@angular/router';
import { SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { EstadoCreacionProyectoService } from './creacion/services/estado-creacion-proyecto.service';
import { ContenidoEncabezadoPasoCreacionService } from './creacion/services/contenido-encabezado-paso-creacion.service';

/** Define las rutas internas del dominio de Proyectos. */
export const RUTAS_PROYECTOS: Routes = [
  {
    path: SEGMENTOS_RUTA.creacion,
    providers: [EstadoCreacionProyectoService, ContenidoEncabezadoPasoCreacionService],
    loadComponent: () =>
      import('./creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
        (modulo) => modulo.PaginaCreacionProyecto,
      ),
  },
];
