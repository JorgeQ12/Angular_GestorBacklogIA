import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { PARAMETROS_RUTA, URL_INICIO_PANEL } from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { RecorridoCreacionProyecto } from '../../components/recorrido-creacion-proyecto/recorrido-creacion-proyecto';
import {
  DATOS_RUTA_ETAPAS_CREACION,
  DatosRutaEtapaCreacionProyecto,
  ETAPAS_CREACION_PROYECTO,
} from '../../config/etapas-creacion-proyecto.config';

/** Compone el encabezado, el recorrido y la etapa activa de creación. */
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
      ? DATOS_RUTA_ETAPAS_CREACION.contexto
      : DATOS_RUTA_ETAPAS_CREACION.vinculacionAzure;
    const datos = this.ruta.firstChild?.snapshot.data as
      Partial<DatosRutaEtapaCreacionProyecto> | undefined;

    return {
      etapaActual: datos?.etapaActual ?? predeterminado.etapaActual,
      etapasCompletadas: datos?.etapasCompletadas ?? predeterminado.etapasCompletadas,
      etapasNavegables: datos?.etapasNavegables ?? predeterminado.etapasNavegables,
    } satisfies DatosRutaEtapaCreacionProyecto;
  });

  protected readonly etiquetaEncabezado = this.idProyecto
    ? `Borrador #${this.idProyecto}`
    : 'Creación de proyectos';
  protected readonly descripcionEncabezado =
    'Completa las etapas para definir la información esencial del proyecto.';

  /** Proporciona al encabezado la misma identidad declarada en el recorrido. */
  protected readonly etapaActiva = computed(
    () =>
      ETAPAS_CREACION_PROYECTO.find(
        (etapa) => etapa.clave === this.estadoRecorrido().etapaActual,
      ) ?? ETAPAS_CREACION_PROYECTO[0],
  );

  /** Abandona el recorrido conservando cualquier borrador creado. */
  protected volverAlInicio(): void {
    void this.router.navigateByUrl(URL_INICIO_PANEL);
  }
}
