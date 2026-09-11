import { Routes } from '@angular/router';
import { PARAMETROS_RUTA, SEGMENTOS_RUTA } from '../../core/navegacion/rutas';
import { EstadoAsistenteIAService } from '../inteligencia-artificial/asistente-ia/public-api';
import { EstadoCreacionProyectoService } from './creacion/services/estado-creacion-proyecto.service';
import { EstadoConsultaProyectosService } from './consulta/services/estado-consulta-proyectos.service';
import { EstadoInformacionProyectoService } from './informacion/services/estado-informacion-proyecto.service';
import { EstadoPlanificacionProyectoService } from './planificacion/services/estado-planificacion-proyecto.service';
import { EstadoEditorElementoPlanificacionService } from './planificacion/services/estado-editor-elemento-planificacion.service';
import { EstadoHistorialElementoPlanificacionService } from './planificacion/services/estado-historial-elemento-planificacion.service';
import { EstadoGeneracionIaPlanificacionService } from './planificacion/services/estado-generacion-ia-planificacion.service';
import { EstadoExploracionPlanificacionService } from './planificacion/services/estado-exploracion-planificacion.service';
import { EstadoPublicacionAzurePlanificacionService } from './planificacion/services/estado-publicacion-azure-planificacion.service';
import { EstadoSincronizacionEpicaAzurePlanificacionService } from './planificacion/services/estado-sincronizacion-epica-azure-planificacion.service';
import { EstadoEliminacionRequisitosPlanificacionService } from './planificacion/services/estado-eliminacion-requisitos-planificacion.service';
import { EstadoGanttPlanificacionService } from './planificacion/services/estado-gantt-planificacion.service';

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
  {
    path: `:${PARAMETROS_RUTA.proyectoId}/${SEGMENTOS_RUTA.planificacion}`,
    providers: [
      EstadoPlanificacionProyectoService,
      EstadoEditorElementoPlanificacionService,
      EstadoHistorialElementoPlanificacionService,
      EstadoGeneracionIaPlanificacionService,
      EstadoExploracionPlanificacionService,
      EstadoPublicacionAzurePlanificacionService,
      EstadoSincronizacionEpicaAzurePlanificacionService,
      EstadoEliminacionRequisitosPlanificacionService,
      EstadoGanttPlanificacionService,
    ],
    loadComponent: () =>
      import(
        './planificacion/pages/pagina-planificacion-proyecto/pagina-planificacion-proyecto'
      ).then((modulo) => modulo.PaginaPlanificacionProyecto),
  },
];
