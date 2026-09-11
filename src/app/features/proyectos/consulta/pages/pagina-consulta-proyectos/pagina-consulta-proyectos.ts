import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PARAMETROS_RUTA,
  URL_CREACION_PROYECTO,
  crearUrlCreacionProyecto,
  crearUrlInformacionProyecto,
} from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { FormularioFiltrosProyectos } from '../../components/filtros-proyectos/filtros-proyectos';
import { TablaProyectos } from '../../components/tabla-proyectos/tabla-proyectos';
import { MENSAJE_ERROR_CONSULTA_PROYECTOS } from '../../config/mensajes-consulta-proyectos.config';
import { sonFiltrosProyectosIguales } from '../../mappers/filtros-proyectos.mapper';
import { mapearParametrosConsultaProyectos } from '../../mappers/parametros-consulta-proyectos.mapper';
import type {
  CambioPaginaProyectos,
  FiltrosProyectos,
} from '../../models/consulta-proyectos.model';
import type { ResumenProyecto } from '../../models/resumen-proyecto.model';
import { EstadoConsultaProyectosService } from '../../services/estado-consulta-proyectos.service';

/** Compone la consulta navegable del portafolio de proyectos. */
@Component({
  selector: 'app-pagina-consulta-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    EstadoVacio,
    IconoComponent,
    FormularioFiltrosProyectos,
    TablaProyectos,
  ],
  templateUrl: './pagina-consulta-proyectos.html',
  styleUrl: './pagina-consulta-proyectos.css',
})
export class PaginaConsultaProyectos {

  /** Proporciona acceso a activated route. */
  private readonly route = inject(ActivatedRoute);

  /** Proporciona acceso a la navegación administrada por Angular. */
  private readonly router = inject(Router);

  /** Proporciona acceso al servicio de estado consulta proyectos. */
  protected readonly estadoConsulta = inject(EstadoConsultaProyectosService);

  /** Conserva mensaje error para coordinar esta responsabilidad. */
  protected readonly mensajeError = MENSAJE_ERROR_CONSULTA_PROYECTOS;

  /** Conserva parámetros para coordinar esta responsabilidad. */
  private readonly parametros = toSignal(this.route.queryParamMap, { requireSync: true });

  /** Deriva consulta a partir del estado vigente. */
  private readonly consulta = computed(() => mapearParametrosConsultaProyectos(this.parametros()));

  /** Conserva filtros para coordinar esta responsabilidad. */
  protected readonly filtros = computed<FiltrosProyectos>(() => {
    const consulta = this.consulta();
    return {
      nombre: consulta.nombre,
      responsable: consulta.responsable,
      estado: consulta.estado,
    };
  });

  /** Deriva hay filtros a partir del estado vigente. */
  protected readonly hayFiltros = computed(() => {
    const filtros = this.filtros();
    return !!(filtros.nombre || filtros.responsable || filtros.estado);
  });

  public constructor() {
    effect(() => this.estadoConsulta.consultar(this.consulta()));
  }

  /** Inicia el recorrido sin abrir un modal paralelo de vinculación. */
  protected crearProyecto(): void {
    void this.router.navigateByUrl(URL_CREACION_PROYECTO);
  }

  /** Reanuda el borrador desde el avance persistido por el backend. */
  protected continuarBorrador(proyecto: ResumenProyecto): void {
    void this.router.navigateByUrl(crearUrlCreacionProyecto(proyecto.id));
  }

  /** Abre la consulta versionada de un proyecto publicado. */
  protected consultarProyecto(proyecto: ResumenProyecto): void {
    void this.router.navigateByUrl(crearUrlInformacionProyecto(proyecto.id));
  }

  /** Refleja los criterios en la URL y reinicia la paginación. */
  protected actualizarFiltros(filtros: FiltrosProyectos): void {
    if (sonFiltrosProyectosIguales(filtros, this.filtros())) return;

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
  protected cambiarPagina(cambio: CambioPaginaProyectos): void {
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
