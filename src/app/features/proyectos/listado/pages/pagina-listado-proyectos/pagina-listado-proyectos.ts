import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PARAMETROS_RUTA,
  URL_CREACION_PROYECTO,
  crearUrlCreacionProyecto,
} from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { FormularioFiltrosListadoProyectos } from '../../components/filtros-listado-proyectos/filtros-listado-proyectos';
import { TablaProyectos } from '../../components/tabla-proyectos/tabla-proyectos';
import { MENSAJE_ERROR_LISTADO_PROYECTOS } from '../../config/mensajes-listado-proyectos.config';
import { sonFiltrosListadoProyectosIguales } from '../../mappers/filtros-listado-proyectos.mapper';
import { mapearParametrosListadoProyectos } from '../../mappers/parametros-listado-proyectos.mapper';
import type {
  CambioPaginaListadoProyectos,
  FiltrosListadoProyectos,
} from '../../models/consulta-listado-proyectos.model';
import type { ProyectoListado } from '../../models/proyecto-listado.model';
import { EstadoListadoProyectosService } from '../../services/estado-listado-proyectos.service';

/** Compone la consulta navegable del portafolio de proyectos. */
@Component({
  selector: 'app-pagina-listado-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    EstadoVacio,
    IconoComponent,
    FormularioFiltrosListadoProyectos,
    TablaProyectos,
  ],
  templateUrl: './pagina-listado-proyectos.html',
  styleUrl: './pagina-listado-proyectos.css',
})
export class PaginaListadoProyectos {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly estadoListado = inject(EstadoListadoProyectosService);
  protected readonly mensajeError = MENSAJE_ERROR_LISTADO_PROYECTOS;

  private readonly parametros = toSignal(this.route.queryParamMap, { requireSync: true });
  private readonly consulta = computed(() => mapearParametrosListadoProyectos(this.parametros()));

  protected readonly filtros = computed<FiltrosListadoProyectos>(() => {
    const consulta = this.consulta();
    return {
      nombre: consulta.nombre,
      responsable: consulta.responsable,
      estado: consulta.estado,
    };
  });
  protected readonly hayFiltros = computed(() => {
    const filtros = this.filtros();
    return !!(filtros.nombre || filtros.responsable || filtros.estado);
  });

  public constructor() {
    effect(() => this.estadoListado.consultar(this.consulta()));
  }

  /** Inicia el recorrido sin abrir un modal paralelo de vinculación. */
  protected crearProyecto(): void {
    void this.router.navigateByUrl(URL_CREACION_PROYECTO);
  }

  /** Reanuda el borrador desde el avance persistido por el backend. */
  protected continuarBorrador(proyecto: ProyectoListado): void {
    void this.router.navigateByUrl(crearUrlCreacionProyecto(proyecto.id));
  }

  /** Refleja los criterios en la URL y reinicia la paginación. */
  protected actualizarFiltros(filtros: FiltrosListadoProyectos): void {
    if (sonFiltrosListadoProyectosIguales(filtros, this.filtros())) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [PARAMETROS_RUTA.nombreProyecto]: filtros.nombre || null,
        [PARAMETROS_RUTA.responsableProyecto]: filtros.responsable || null,
        [PARAMETROS_RUTA.estadoProyecto]: filtros.estado,
        [PARAMETROS_RUTA.pagina]: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  /** Conserva los filtros mientras cambia únicamente la página solicitada. */
  protected cambiarPagina(cambio: CambioPaginaListadoProyectos): void {
    if (cambio.pagina === this.consulta().pagina) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [PARAMETROS_RUTA.pagina]: cambio.pagina === 1 ? null : cambio.pagina,
      },
      queryParamsHandling: 'merge',
    });
  }
}
