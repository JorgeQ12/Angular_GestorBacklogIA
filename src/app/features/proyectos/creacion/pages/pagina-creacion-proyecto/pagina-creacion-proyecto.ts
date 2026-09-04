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
import {
  EMPTY,
  Subscription,
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
} from 'rxjs';
import type { OpcionCatalogo } from '../../../../../core/catalogos/models/opcion-catalogo.model';
import { CatalogosService } from '../../../../../core/catalogos/services/catalogos.service';
import { NotificadorErroresApiService } from '../../../../../core/mensajes/services/notificador-errores-api.service';
import { URL_INICIO_PANEL, obtenerProyectoIdRuta } from '../../../../../core/navegacion/rutas';
import { EncabezadoPagina } from '../../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoError } from '../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  AsistenteIaFlotante,
  type ContextoAsistenteIa,
} from '../../../../inteligencia-artificial/asistente-conversacional/public-api';
import { PasoAlcanceProyecto } from '../../../components/pasos/paso-alcance-proyecto/paso-alcance-proyecto';
import { PasoContextoProyecto } from '../../../components/pasos/paso-contexto-proyecto/paso-contexto-proyecto';
import { PasoEquipoProyecto } from '../../../components/pasos/paso-equipo-proyecto/paso-equipo-proyecto';
import { PasoFlujoProyecto } from '../../../components/pasos/paso-flujo-proyecto/paso-flujo-proyecto';
import { PasoNecesidadProyecto } from '../../../components/pasos/paso-necesidad-proyecto/paso-necesidad-proyecto';
import { PasoObjetivosProyecto } from '../../../components/pasos/paso-objetivos-proyecto/paso-objetivos-proyecto';
import { PasoRolesProyecto } from '../../../components/pasos/paso-roles-proyecto/paso-roles-proyecto';
import { PasoTipoSolucionProyecto } from '../../../components/pasos/paso-tipo-solucion-proyecto/paso-tipo-solucion-proyecto';
import { PasoVinculacionAzureProyecto } from '../../../components/pasos/paso-vinculacion-azure-proyecto/paso-vinculacion-azure-proyecto';
import { RecorridoProyecto } from '../../../components/recorrido-proyecto/recorrido-proyecto';
import {
  ClavePasoEspecialProyecto,
  type ClavePasoProyecto,
} from '../../../config/pasos-proyecto.config';
import {
  ClaveSeccionProyecto,
  SECCIONES_PROYECTO,
} from '../../../config/secciones-proyecto.config';
import type { ActualizacionSeccionProyecto } from '../../../models/actualizacion-seccion-proyecto.model';
import {
  ACCIONES_CREACION_PASO_PROYECTO,
  type AccionesPasoProyecto,
} from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../../../models/vinculacion-azure-proyecto.model';
import { deserializarAlcanceProyecto } from '../../../secciones/alcance/mappers/alcance-proyecto.mapper';
import { CATALOGO_PRIORIDADES_PROYECTO } from '../../../secciones/contexto/config/contexto-proyecto.config';
import type { ContextoProyecto } from '../../../secciones/contexto/models/contexto-proyecto.model';
import {
  combinarEquipoConAzure,
  deserializarEquipoProyecto,
} from '../../../secciones/equipo/mappers/equipo-proyecto.mapper';
import type {
  EquipoProyecto,
  OrigenEquipoAzureProyecto,
} from '../../../secciones/equipo/models/equipo-proyecto.model';
import { deserializarFlujoProyecto } from '../../../secciones/flujo/mappers/flujo-proyecto.mapper';
import type { FlujoProyecto } from '../../../secciones/flujo/models/flujo-proyecto.model';
import { deserializarNecesidadProyecto } from '../../../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { deserializarObjetivosProyecto } from '../../../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { deserializarRolesProyecto } from '../../../secciones/roles/mappers/roles-proyecto.mapper';
import { deserializarTipoSolucionProyecto } from '../../../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';
import {
  ERROR_CONSULTA_AZURE,
  ERROR_CREACION_BORRADOR,
  ERROR_GUARDADO_PROYECTO,
  ERROR_SINCRONIZACION_EQUIPO,
} from '../../config/mensajes-error-creacion-proyecto.config';
import { AVANCE_BORRADOR_POR_PASO } from '../../config/avance-borrador-proyecto.config';
import {
  construirEstadoRecorridoCreacion,
  obtenerUltimoPasoCreacion,
  puedeAbrirPasoCreacion,
} from '../../mappers/estado-recorrido-creacion-proyecto.mapper';
import { sincronizarRolesDelFlujo } from '../../mappers/flujo-creacion-proyecto.mapper';
import { CreacionProyectoService } from '../../services/creacion-proyecto.service';
import { EstadoCreacionProyectoService } from '../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../services/notificador-errores-borrador-proyecto.service';

/** Compone el recorrido y conecta los pasos compartidos con el borrador. */
@Component({
  selector: 'app-pagina-creacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EncabezadoPagina,
    EstadoError,
    IconoComponent,
    AsistenteIaFlotante,
    RecorridoProyecto,
    PasoVinculacionAzureProyecto,
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
  private readonly catalogos = inject(CatalogosService);
  private readonly creacionProyecto = inject(CreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresApiService);
  private readonly notificadorBorrador = inject(NotificadorErroresBorradorProyectoService);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly idProyecto = toSignal(
    this.ruta.queryParamMap.pipe(map(obtenerProyectoIdRuta), distinctUntilChanged()),
    { initialValue: null },
  );
  private readonly pasoSeleccionado = signal<ClavePasoProyecto | null>(null);
  private cargaRecorridoActual: Subscription | null = null;
  private guardadoActual: Subscription | null = null;
  private proyectoAnterior: number | null | undefined;
  private sincronizacionInicialEquipoSolicitada = false;

  protected readonly pasoAzure = ClavePasoEspecialProyecto.VinculacionAzure;
  protected readonly secciones = ClaveSeccionProyecto;
  protected readonly modoEdicion = ModoFormularioProyecto.Edicion;
  protected readonly accionesCreacion = ACCIONES_CREACION_PASO_PROYECTO;
  protected readonly accionesFlujo: AccionesPasoProyecto = {
    ...ACCIONES_CREACION_PASO_PROYECTO,
    textoPrincipal: 'Guardar proyecto',
    iconoPrincipal: 'guardar',
    nota: 'El diagrama completo se guardará en el borrador del proyecto.',
  };
  protected readonly recorridoListo = signal(false);
  protected readonly errorCargaRecorrido = signal(false);
  protected readonly prioridades = signal<readonly OpcionCatalogo[]>([]);
  protected readonly datosVinculacion = signal<DatosVinculacionAzure | null>(null);
  protected readonly resultadoValidacion = signal<ResultadoVinculacionAzure | null>(null);
  protected readonly procesandoVinculacion = signal(false);
  protected readonly guardandoSeccion = signal(false);
  protected readonly sincronizandoEquipo = signal(false);
  private readonly origenEquipoActualizado = signal<OrigenEquipoAzureProyecto | null>(null);
  private readonly equipoActualizado = signal<EquipoProyecto | null>(null);

  protected readonly contexto = computed(() => this.estadoCreacion.borrador()?.contexto ?? null);
  protected readonly tipoSolucion = computed(() => {
    const borrador = this.estadoCreacion.borrador();
    return borrador ? deserializarTipoSolucionProyecto(borrador.tipoSolucionJson) : null;
  });
  protected readonly necesidad = computed(() => {
    const borrador = this.estadoCreacion.borrador();
    return borrador ? deserializarNecesidadProyecto(borrador.necesidadJson) : null;
  });
  protected readonly objetivos = computed(() => {
    const borrador = this.estadoCreacion.borrador();
    return borrador ? deserializarObjetivosProyecto(borrador.objetivosJson) : null;
  });
  protected readonly alcance = computed(() => {
    const borrador = this.estadoCreacion.borrador();
    return borrador ? deserializarAlcanceProyecto(borrador.alcanceJson) : null;
  });
  protected readonly roles = computed(() => {
    const borrador = this.estadoCreacion.borrador();
    return borrador ? deserializarRolesProyecto(borrador.rolesJson) : null;
  });
  private readonly equipoGuardado = computed<EquipoProyecto>(() => {
    const borrador = this.estadoCreacion.borrador();
    return borrador
      ? (deserializarEquipoProyecto(borrador.equipoJson) ?? { integrantes: [] })
      : { integrantes: [] };
  });
  private readonly origenEquipo = computed(
    () => this.origenEquipoActualizado() ?? this.estadoCreacion.borrador()?.equipoAzure ?? null,
  );
  protected readonly equipo = computed<EquipoProyecto>(() => {
    const actualizado = this.equipoActualizado();
    if (actualizado) return actualizado;
    const origen = this.origenEquipo();
    const guardado = this.equipoGuardado();
    return origen?.integrantes.length ? combinarEquipoConAzure(origen, guardado) : guardado;
  });
  protected readonly nombreEquipo = computed(
    () => this.origenEquipo()?.nombreEquipo || 'Team de Azure DevOps',
  );
  protected readonly flujo = computed<FlujoProyecto | null>(() => {
    const borrador = this.estadoCreacion.borrador();
    if (!borrador) return null;
    const flujo = deserializarFlujoProyecto(borrador.diagramFlujoJson, borrador.id);
    const roles = deserializarRolesProyecto(borrador.rolesJson);
    return flujo && roles
      ? sincronizarRolesDelFlujo(flujo, roles, borrador.fechaUltimoGuardado)
      : null;
  });

  protected readonly estadoRecorrido = computed(() => {
    const proyectoId = this.idProyecto();
    if (!proyectoId) return construirEstadoRecorridoCreacion(this.pasoAzure, null);
    const borrador = this.estadoCreacion.borrador();
    const pasoActual =
      this.pasoSeleccionado() ?? obtenerUltimoPasoCreacion(borrador?.pasoActual ?? 1);
    return construirEstadoRecorridoCreacion(pasoActual, borrador?.pasoActual ?? 1);
  });
  protected readonly etiquetaEncabezado = computed(() =>
    this.idProyecto() ? `Borrador #${this.idProyecto()}` : 'Creación de proyectos',
  );
  protected readonly descripcionEncabezado =
    'Completa los pasos para definir la información esencial del proyecto.';
  protected readonly tituloEncabezado = computed(
    () => this.estadoCreacion.nombreProyecto() || 'Nuevo proyecto',
  );
  protected readonly mostrarAsistenteIa = computed(() => {
    const borrador = this.estadoCreacion.borrador();
    return (
      !!borrador &&
      borrador.pasoActual >= AVANCE_BORRADOR_POR_PASO[ClaveSeccionProyecto.Necesidad]
    );
  });
  protected readonly contextoAsistenteIa = computed<ContextoAsistenteIa | null>(() => {
    const borrador = this.estadoCreacion.borrador();
    const proyectoId = this.idProyecto();
    if (!borrador || proyectoId === null) return null;

    const seccionActiva = this.estadoRecorrido().pasoActual;
    const seccion = SECCIONES_PROYECTO.find((item) => item.clave === seccionActiva);
    return {
      proyectoId,
      revisionContexto: borrador.revision,
      seccionActiva,
      nombreSeccion: seccion?.titulo ?? 'Creación del proyecto',
    };
  });

  public constructor() {
    this.cargarPrioridades();
    effect(() => {
      const proyectoId = this.idProyecto();
      if (this.proyectoAnterior === proyectoId) return;
      this.proyectoAnterior = proyectoId;
      this.prepararRecorrido(proyectoId);
    });
    effect(() => {
      const esEquipo = this.estadoRecorrido().pasoActual === ClaveSeccionProyecto.Equipo;
      const borrador = this.estadoCreacion.borrador();
      if (!esEquipo || !borrador || this.sincronizacionInicialEquipoSolicitada) return;
      this.sincronizacionInicialEquipoSolicitada = true;
      if (!this.origenEquipo()?.integrantes.length) this.sincronizarEquipo(this.equipoGuardado());
    });
  }

  protected volverAlInicio(): void {
    void this.router.navigateByUrl(URL_INICIO_PANEL);
  }

  protected abrirPaso(clave: ClavePasoProyecto): void {
    const borrador = this.estadoCreacion.borrador();
    if (!borrador || !puedeAbrirPasoCreacion(clave, borrador.pasoActual)) return;
    this.pasoSeleccionado.set(clave);
  }

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
        error: (error: unknown) => this.notificadorErrores.comunicar(error, ERROR_CONSULTA_AZURE),
      });
  }

  protected editarVinculacion(): void {
    this.resultadoValidacion.set(null);
  }

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

  protected guardarSeccion(
    actualizacion: ActualizacionSeccionProyecto,
    siguiente: ClavePasoProyecto,
  ): void {
    const proyectoId = this.estadoCreacion.proyectoId();
    if (proyectoId === null || this.guardandoSeccion()) return;
    this.guardandoSeccion.set(true);
    this.guardadoActual = this.estadoCreacion
      .guardarSeccion(actualizacion)
      .pipe(
        finalize(() => this.guardandoSeccion.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (this.estadoCreacion.proyectoId() !== proyectoId) return;
          this.abrirPaso(siguiente);
        },
        error: (error: unknown) =>
          this.notificadorBorrador.comunicar(error, actualizacion.seccion),
      });
  }

  /** Actualiza el flujo, guarda el proyecto con la nueva revisión y regresa al inicio. */
  protected guardarProyecto(flujo: FlujoProyecto): void {
    const proyectoId = this.estadoCreacion.proyectoId();
    if (proyectoId === null || this.guardandoSeccion()) return;

    const actualizacion: ActualizacionSeccionProyecto = {
      seccion: ClaveSeccionProyecto.Flujo,
      datos: flujo,
    };
    this.guardandoSeccion.set(true);
    this.guardadoActual = this.estadoCreacion
      .guardarSeccion(actualizacion)
      .pipe(
        catchError((error: unknown) => {
          this.notificadorBorrador.comunicar(error, actualizacion.seccion);
          return EMPTY;
        }),
        switchMap((borrador) =>
          this.creacionProyecto
            .guardarProyecto({
              proyectoId: borrador.id,
              revisionEsperada: borrador.revision,
            })
            .pipe(
              catchError((error: unknown) => {
                this.notificadorErrores.comunicar(error, ERROR_GUARDADO_PROYECTO);
                return EMPTY;
              }),
            ),
        ),
        finalize(() => this.guardandoSeccion.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (this.estadoCreacion.proyectoId() === proyectoId) this.volverAlInicio();
        },
      });
  }

  protected actualizarContextoTemporal(contexto: ContextoProyecto): void {
    this.estadoCreacion.actualizarNombreProyecto(contexto.nombre);
  }

  protected sincronizarEquipo(equipoVigente: EquipoProyecto): void {
    const proyectoId = this.estadoCreacion.proyectoId();
    if (proyectoId === null || this.sincronizandoEquipo()) return;
    this.sincronizandoEquipo.set(true);
    this.creacionProyecto
      .sincronizarEquipoAzure(proyectoId)
      .pipe(
        finalize(() => this.sincronizandoEquipo.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (origen) => {
          this.origenEquipoActualizado.set(origen);
          this.equipoActualizado.set(combinarEquipoConAzure(origen, equipoVigente));
        },
        error: (error: unknown) =>
          this.notificadorErrores.comunicar(error, ERROR_SINCRONIZACION_EQUIPO),
      });
  }

  protected cargarRecorrido(): void {
    const proyectoId = this.idProyecto();
    if (proyectoId !== null) this.prepararRecorrido(proyectoId);
  }

  /** Recarga únicamente el borrador que originó la propuesta confirmada. */
  protected recargarBorradorDesdeIa(proyectoId: number): void {
    if (this.idProyecto() !== proyectoId) return;

    this.estadoCreacion
      .recargar(proyectoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) =>
          this.notificadorErrores.comunicar(error, {
            titulo: 'La propuesta se aplicó, pero no pudimos refrescar el formulario',
            descripcion: 'Recarga el borrador para ver la información actualizada.',
          }),
      });
  }

  private cargarPrioridades(): void {
    this.catalogos
      .obtenerOpciones(CATALOGO_PRIORIDADES_PROYECTO)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (opciones) => this.prioridades.set(opciones) });
  }

  private prepararRecorrido(proyectoId: number | null): void {
    this.cargaRecorridoActual?.unsubscribe();
    this.guardadoActual?.unsubscribe();
    this.pasoSeleccionado.set(null);
    this.errorCargaRecorrido.set(false);
    this.origenEquipoActualizado.set(null);
    this.equipoActualizado.set(null);
    this.sincronizacionInicialEquipoSolicitada = false;
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
