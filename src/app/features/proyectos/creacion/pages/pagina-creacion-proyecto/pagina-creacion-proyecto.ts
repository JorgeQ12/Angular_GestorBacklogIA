import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { URL_INICIO_PANEL, obtenerProyectoIdRuta } from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { RecorridoCreacionProyecto } from '../../components/recorrido-creacion-proyecto/recorrido-creacion-proyecto';
import {
  ClavePasoCreacionProyecto,
  DATOS_RUTA_PASOS_CREACION,
  DatosRutaPasoCreacionProyecto,
  PASOS_CREACION_PROYECTO,
} from '../../config/pasos-creacion-proyecto.config';
import { construirEstadoRecorridoCreacion } from '../../mappers/estado-recorrido-creacion-proyecto.mapper';
import { crearUrlPasoCreacionProyecto } from '../../mappers/navegacion-creacion-proyecto.mapper';
import { EstadoCreacionProyectoService } from '../../services/estado-creacion-proyecto.service';
import { ContenidoEncabezadoPasoCreacionService } from '../../services/contenido-encabezado-paso-creacion.service';

/** Compone el encabezado, el recorrido y el paso activo de creación. */
@Component({
  selector: 'app-pagina-creacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, EncabezadoPagina, IconoComponent, RecorridoCreacionProyecto],
  templateUrl: './pagina-creacion-proyecto.html',
  styleUrl: './pagina-creacion-proyecto.css',
})
export class PaginaCreacionProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  protected readonly encabezadoPaso = inject(ContenidoEncabezadoPasoCreacionService);
  private readonly idProyecto = toSignal(
    this.ruta.paramMap.pipe(map(obtenerProyectoIdRuta), distinctUntilChanged()),
    { initialValue: null },
  );
  private readonly navegacionFinalizada = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      startWith(null),
    ),
    { initialValue: null },
  );

  public constructor() {
    effect(() => this.estadoCreacion.seleccionarProyecto(this.idProyecto()));
  }

  protected readonly estadoRecorrido = computed(() => {
    this.navegacionFinalizada();
    const proyectoId = this.idProyecto();
    const predeterminado = proyectoId
      ? DATOS_RUTA_PASOS_CREACION.contexto
      : DATOS_RUTA_PASOS_CREACION.vinculacionAzure;
    const datos = this.ruta.firstChild?.snapshot.data as
      Partial<DatosRutaPasoCreacionProyecto> | undefined;
    const pasoActual = datos?.pasoActual ?? predeterminado.pasoActual;
    const avanceBorrador = proyectoId ? (this.estadoCreacion.borrador()?.pasoActual ?? 1) : null;

    return construirEstadoRecorridoCreacion(pasoActual, avanceBorrador);
  });

  protected readonly etiquetaEncabezado = computed(() => {
    const proyectoId = this.idProyecto();
    return proyectoId ? `Borrador #${proyectoId}` : 'Creación de proyectos';
  });
  protected readonly descripcionEncabezado =
    'Completa los pasos para definir la información esencial del proyecto.';
  protected readonly tituloEncabezado = computed(
    () => this.estadoCreacion.nombreProyecto() || 'Nuevo proyecto',
  );

  /** Proporciona al encabezado la misma identidad declarada en el recorrido. */
  protected readonly pasoActivo = computed(
    () =>
      PASOS_CREACION_PROYECTO.find((paso) => paso.clave === this.estadoRecorrido().pasoActual) ??
      PASOS_CREACION_PROYECTO[0],
  );

  /** Abandona el recorrido conservando cualquier borrador creado. */
  protected volverAlInicio(): void {
    void this.router.navigateByUrl(URL_INICIO_PANEL);
  }

  /** Abre un paso cuando el estado del recorrido lo habilita. */
  protected abrirPaso(clave: ClavePasoCreacionProyecto): void {
    const proyectoId = this.idProyecto();
    if (!proyectoId) return;

    const destino = crearUrlPasoCreacionProyecto(proyectoId, clave);
    if (destino) void this.router.navigateByUrl(destino);
  }
}
