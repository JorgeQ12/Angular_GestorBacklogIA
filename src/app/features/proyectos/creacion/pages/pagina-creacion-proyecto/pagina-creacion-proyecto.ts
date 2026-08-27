import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { PARAMETROS_RUTA, URL_INICIO_PANEL } from '../../../../../core/navegacion/rutas';
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
  private readonly idProyecto =
    this.ruta.snapshot.paramMap.get(PARAMETROS_RUTA.proyectoId)?.trim() ?? '';
  private readonly navegacionFinalizada = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      startWith(null),
    ),
    { initialValue: null },
  );

  protected readonly estadoRecorrido = computed(() => {
    this.navegacionFinalizada();
    const predeterminado = this.idProyecto
      ? DATOS_RUTA_PASOS_CREACION.contexto
      : DATOS_RUTA_PASOS_CREACION.vinculacionAzure;
    const datos = this.ruta.firstChild?.snapshot.data as
      Partial<DatosRutaPasoCreacionProyecto> | undefined;
    const pasoActual = datos?.pasoActual ?? predeterminado.pasoActual;
    const avanceBorrador = this.idProyecto
      ? (this.estadoCreacion.borrador()?.pasoActual ?? 1)
      : null;

    return construirEstadoRecorridoCreacion(pasoActual, avanceBorrador);
  });

  protected readonly etiquetaEncabezado = this.idProyecto
    ? `Borrador #${this.idProyecto}`
    : 'Creación de proyectos';
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
    if (!this.idProyecto) return;

    const destino = crearUrlPasoCreacionProyecto(this.idProyecto, clave);
    if (destino) void this.router.navigateByUrl(destino);
  }
}
