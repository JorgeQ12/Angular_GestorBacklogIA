import { Routes } from '@angular/router';
import { PARAMETROS_RUTA, SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { EstadoAsistenteIaService } from '../inteligencia-artificial/asistente-conversacional/public-api';
import { EstadoCreacionProyectoService } from './creacion/services/estado-creacion-proyecto.service';
import { EstadoListadoProyectosService } from './listado/services/estado-listado-proyectos.service';
import { EstadoInformacionProyectoService } from './informacion/services/estado-informacion-proyecto.service';

/** Define las rutas internas del dominio de Proyectos. */
export const RUTAS_PROYECTOS: Routes = [
  {
    path: `:${PARAMETROS_RUTA.proyectoId}/${SEGMENTOS_RUTA.informacion}`,
    providers: [EstadoInformacionProyectoService],
    loadComponent: () =>
      import('./informacion/pages/pagina-informacion-proyecto/pagina-informacion-proyecto').then(
        (modulo) => modulo.PaginaInformacionProyecto,
      ),
  },
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
    providers: [EstadoCreacionProyectoService, EstadoAsistenteIaService],
    loadComponent: () =>
      import('./creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
        (modulo) => modulo.PaginaCreacionProyecto,
      ),
  },
];
