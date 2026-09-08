import { Routes } from '@angular/router';
import { PARAMETROS_RUTA, SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { EstadoAsistenteIAService } from '../inteligencia-artificial/asistente-ia/public-api';
import { EstadoCreacionProyectoService } from './creacion/services/estado-creacion-proyecto.service';
import { EstadoConsultaProyectosService } from './consulta/services/estado-consulta-proyectos.service';
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
    providers: [EstadoConsultaProyectosService],
    loadComponent: () =>
      import('./consulta/pages/pagina-consulta-proyectos/pagina-consulta-proyectos').then(
        (modulo) => modulo.PaginaConsultaProyectos,
      ),
  },
  {
    path: SEGMENTOS_RUTA.creacion,
    providers: [EstadoCreacionProyectoService, EstadoAsistenteIAService],
    loadComponent: () =>
      import('./creacion/pages/pagina-creacion-proyecto/pagina-creacion-proyecto').then(
        (modulo) => modulo.PaginaCreacionProyecto,
      ),
  },
];
