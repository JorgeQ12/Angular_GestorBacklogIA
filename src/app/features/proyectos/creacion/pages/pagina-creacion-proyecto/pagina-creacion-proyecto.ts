import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, distinctUntilChanged, finalize, map } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../../core/mensajes/services/notificador-errores-api.service';
import { URL_INICIO_PANEL, obtenerProyectoIdRuta } from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import { PasoAlcanceProyecto } from '../../components/pasos/paso-alcance-proyecto/paso-alcance-proyecto';
import { PasoContextoProyecto } from '../../components/pasos/paso-contexto-proyecto/paso-contexto-proyecto';
import { PasoEquipoProyecto } from '../../components/pasos/paso-equipo-proyecto/paso-equipo-proyecto';
import { PasoFlujoProyecto } from '../../components/pasos/paso-flujo-proyecto/paso-flujo-proyecto';
import { PasoNecesidadProyecto } from '../../components/pasos/paso-necesidad-proyecto/paso-necesidad-proyecto';
import { PasoObjetivosProyecto } from '../../components/pasos/paso-objetivos-proyecto/paso-objetivos-proyecto';
import { PasoRolesProyecto } from '../../components/pasos/paso-roles-proyecto/paso-roles-proyecto';
import { PasoTipoSolucionProyecto } from '../../components/pasos/paso-tipo-solucion-proyecto/paso-tipo-solucion-proyecto';
import { RecorridoCreacionProyecto } from '../../components/recorrido-creacion-proyecto/recorrido-creacion-proyecto';
import { VinculacionAzure } from '../../components/vinculacion-azure/vinculacion-azure';
import {
  ClavePasoCreacionProyecto,
  CLAVE_PASO_VINCULACION_AZURE,
  PASOS_CREACION_PROYECTO,
} from '../../config/pasos-creacion-proyecto.config';
import {
  ERROR_CONSULTA_AZURE,
  ERROR_CREACION_BORRADOR,
} from '../../config/mensajes-error-creacion-proyecto.config';
import {
  construirEstadoRecorridoCreacion,
  obtenerUltimoPasoCreacion,
  puedeAbrirPasoCreacion,
} from '../../mappers/estado-recorrido-creacion-proyecto.mapper';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../../models/vinculacion-azure.model';
import { CreacionProyectoService } from '../../services/creacion-proyecto.service';
import { EstadoCreacionProyectoService } from '../../services/estado-creacion-proyecto.service';
import { ContenidoEncabezadoPasoCreacionService } from '../../services/contenido-encabezado-paso-creacion.service';

/** Compone el encabezado, el recorrido y el paso activo de creación. */
@Component({
  selector: 'app-pagina-creacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    IconoComponent,
    RecorridoCreacionProyecto,
    VinculacionAzure,
    PasoContextoProyecto,
    PasoTipoSolucionProyecto,
    PasoNecesidadProyecto,
    PasoObjetivosProyecto,
    PasoAlcanceProyecto,
    PasoRolesProyecto,
    PasoEquipoProyecto,
    PasoFlujoProyecto,
  ],
  templateUrl: './pagina-creacion-proyecto.html',
  styleUrl: './pagina-creacion-proyecto.css',
})
export class PaginaCreacionProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly creacionProyecto = inject(CreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresApiService);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly encabezadoPaso = inject(ContenidoEncabezadoPasoCreacionService);
  private readonly idProyecto = toSignal(
    this.ruta.queryParamMap.pipe(map(obtenerProyectoIdRuta), distinctUntilChanged()),
    { initialValue: null },
  );
  private readonly pasoSeleccionado = signal<ClavePasoCreacionProyecto | null>(null);
  private cargaRecorridoActual: Subscription | null = null;
  private proyectoAnterior: number | null | undefined;

  protected readonly clavePasoVinculacionAzure = CLAVE_PASO_VINCULACION_AZURE;
  protected readonly clavesSeccion = ClaveSeccionProyecto;
  protected readonly recorridoListo = signal(false);
  protected readonly errorCargaRecorrido = signal(false);
  protected readonly datosVinculacion = signal<DatosVinculacionAzure | null>(null);
  protected readonly resultadoValidacion = signal<ResultadoVinculacionAzure | null>(null);
  protected readonly procesandoVinculacion = signal(false);

  public constructor() {
    effect(() => {
      const proyectoId = this.idProyecto();
      if (this.proyectoAnterior === proyectoId) return;

      this.proyectoAnterior = proyectoId;
      this.prepararRecorrido(proyectoId);
    });
  }

  protected readonly estadoRecorrido = computed(() => {
    const proyectoId = this.idProyecto();
    if (!proyectoId) {
      return construirEstadoRecorridoCreacion(CLAVE_PASO_VINCULACION_AZURE, null);
    }

    const borrador = this.estadoCreacion.borrador();
    const pasoActual =
      this.pasoSeleccionado() ?? obtenerUltimoPasoCreacion(borrador?.pasoActual ?? 1);
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

  /** Selecciona un paso cuando el avance vigente permite presentarlo. */
  protected abrirPaso(clave: ClavePasoCreacionProyecto): void {
    const borrador = this.estadoCreacion.borrador();
    if (!borrador || !puedeAbrirPasoCreacion(clave, borrador.pasoActual)) return;

    this.pasoSeleccionado.set(clave);
  }

  /** Comprueba la referencia capturada y prepara su confirmación. */
  protected validarVinculacion(datos: DatosVinculacionAzure): void {
    if (this.procesandoVinculacion()) return;

    this.datosVinculacion.set(datos);
    this.procesandoVinculacion.set(true);
    this.creacionProyecto
      .validarVinculacionAzure(datos)
      .pipe(
        finalize(() => this.procesandoVinculacion.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => this.resultadoValidacion.set(resultado),
        error: (error: unknown) =>
          this.notificadorErrores.comunicar(error, ERROR_CONSULTA_AZURE),
      });
  }

  /** Regresa a la captura para corregir la vinculación consultada. */
  protected editarVinculacion(): void {
    this.resultadoValidacion.set(null);
  }

  /** Crea el borrador confirmado y mantiene la única ruta de creación. */
  protected crearBorrador(): void {
    const datos = this.datosVinculacion();
    if (!datos || this.procesandoVinculacion()) return;

    this.procesandoVinculacion.set(true);
    this.creacionProyecto
      .crearBorrador(datos)
      .pipe(
        finalize(() => this.procesandoVinculacion.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (borrador) => {
          void this.router.navigate([], {
            relativeTo: this.ruta,
            queryParams: { proyectoId: borrador.id },
            replaceUrl: true,
          });
        },
        error: (error: unknown) =>
          this.notificadorErrores.comunicar(error, ERROR_CREACION_BORRADOR),
      });
  }

  /** Reintenta recuperar el borrador requerido para componer el recorrido. */
  protected cargarRecorrido(): void {
    const proyectoId = this.idProyecto();
    if (proyectoId !== null) this.prepararRecorrido(proyectoId);
  }

  /** Prepara la creación inicial o reanuda el último paso alcanzado. */
  private prepararRecorrido(proyectoId: number | null): void {
    this.cargaRecorridoActual?.unsubscribe();
    this.pasoSeleccionado.set(null);
    this.errorCargaRecorrido.set(false);
    this.estadoCreacion.seleccionarProyecto(proyectoId);

    if (proyectoId === null) {
      this.recorridoListo.set(true);
      return;
    }

    this.recorridoListo.set(false);
    this.cargaRecorridoActual = this.estadoCreacion
      .cargar(proyectoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (borrador) => {
          if (this.idProyecto() !== proyectoId) return;

          this.pasoSeleccionado.set(obtenerUltimoPasoCreacion(borrador.pasoActual));
          this.recorridoListo.set(true);
        },
        error: () => {
          if (this.idProyecto() !== proyectoId) return;

          this.errorCargaRecorrido.set(true);
          this.recorridoListo.set(false);
        },
      });
  }
}
