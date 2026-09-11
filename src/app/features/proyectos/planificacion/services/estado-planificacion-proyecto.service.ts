import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize, forkJoin } from 'rxjs';
import type { PlanificacionProyecto } from '../models/planificacion-proyecto.model';
import type { VersionPlanificacion } from '../models/version-planificacion.model';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

/** Coordina la carga y la fotografía presentada por la página de planificación. */
@Injectable()
export class EstadoPlanificacionProyectoService {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(PlanificacionProyectoService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva carga actual para controlar el ciclo de vida de la operación. */
  private cargaActual: Subscription | null = null;

  /** Conserva selección actual para controlar el ciclo de vida de la operación. */
  private seleccionActual: Subscription | null = null;

  /** Conserva planificación actual incluye eliminados para coordinar esta responsabilidad. */
  private planificacionActualIncluyeEliminados = false;

  /** Conserva planificación actual estado como estado reactivo de la instancia. */
  private readonly planificacionActualEstado = signal<PlanificacionProyecto | null>(null);

  /** Conserva planificación presentada estado como estado reactivo de la instancia. */
  private readonly planificacionPresentadaEstado = signal<PlanificacionProyecto | null>(null);

  /** Conserva versiones estado como estado reactivo de la instancia. */
  private readonly versionesEstado = signal<readonly VersionPlanificacion[]>([]);

  /** Conserva error carga estado como estado reactivo de la instancia. */
  private readonly errorCargaEstado = signal(false);

  /** Conserva seleccionando estado como estado reactivo de la instancia. */
  private readonly seleccionandoEstado = signal(false);

  /** Conserva incluir eliminados estado como estado reactivo de la instancia. */
  private readonly incluirEliminadosEstado = signal(false);

  /** Expone la fotografía vigente utilizada como referencia del selector. */
  public readonly planificacionActual = this.planificacionActualEstado.asReadonly();
  /** Expone la planificación vigente o histórica presentada en la página. */
  public readonly planificacion = this.planificacionPresentadaEstado.asReadonly();
  /** Expone las versiones integrales disponibles para el proyecto. */
  public readonly versiones = this.versionesEstado.asReadonly();
  /** Indica que no existe información confiable para la consulta solicitada. */
  public readonly errorCarga = this.errorCargaEstado.asReadonly();
  /** Indica que se está recuperando una fotografía histórica. */
  public readonly seleccionando = this.seleccionandoEstado.asReadonly();
  /** Indica si la vista vigente incluye elementos eliminados. */
  public readonly incluirEliminados = this.incluirEliminadosEstado.asReadonly();

  /** Carga la planificación vigente y su historial integral. */
  public cargar(proyectoId: number, incluirEliminados = false): void {
    this.cancelarOperaciones();
    this.errorCargaEstado.set(false);
    this.planificacionActualEstado.set(null);
    this.planificacionPresentadaEstado.set(null);
    this.versionesEstado.set([]);
    this.incluirEliminadosEstado.set(incluirEliminados);
    this.planificacionActualIncluyeEliminados = false;
    this.cargaActual = forkJoin({
      planificacion: this.api.obtenerPlanificacion(proyectoId, null, incluirEliminados),
      versiones: this.api.obtenerVersiones(proyectoId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ planificacion, versiones }) => {
          this.versionesEstado.set(versiones);
          this.planificacionActualEstado.set(planificacion);
          this.planificacionPresentadaEstado.set(planificacion);
          this.planificacionActualIncluyeEliminados = incluirEliminados;
        },
        error: () => this.errorCargaEstado.set(true),
      });
  }

  /** Presenta la versión vigente almacenada o consulta una fotografía histórica. */
  public presentarVersion(versionId: number | null): void {
    const actual = this.planificacionActualEstado();
    if (!actual) return;
    this.seleccionActual?.unsubscribe();
    this.errorCargaEstado.set(false);
    this.seleccionandoEstado.set(false);

    if (versionId === null || versionId === actual.versionId) {
      if (
        this.incluirEliminadosEstado() ||
        !this.planificacionActualIncluyeEliminados
      ) {
        this.planificacionPresentadaEstado.set(actual);
      } else {
        this.consultarPlanificacionActual(actual.proyectoId, false);
      }
      return;
    }
    this.incluirEliminadosEstado.set(false);
    if (!this.versionesEstado().some((version) => version.id === versionId)) {
      this.planificacionPresentadaEstado.set(null);
      this.errorCargaEstado.set(true);
      return;
    }
    if (this.planificacionPresentadaEstado()?.versionId === versionId) return;

    this.planificacionPresentadaEstado.set(null);
    this.seleccionandoEstado.set(true);
    this.seleccionActual = this.api
      .obtenerPlanificacion(actual.proyectoId, versionId)
      .pipe(
        finalize(() => this.seleccionandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (planificacion) => this.planificacionPresentadaEstado.set(planificacion),
        error: () => this.errorCargaEstado.set(true),
      });
  }

  /** Actualiza la vista vigente para mostrar u ocultar los elementos eliminados. */
  public actualizarInclusionEliminados(incluirEliminados: boolean): void {
    const actual = this.planificacionActualEstado();
    const presentada = this.planificacionPresentadaEstado();
    if (
      !actual ||
      presentada?.esHistorica ||
      incluirEliminados === this.incluirEliminadosEstado()
    ) {
      return;
    }

    this.incluirEliminadosEstado.set(incluirEliminados);
    this.consultarPlanificacionActual(actual.proyectoId, incluirEliminados);
  }

  /** Ejecuta consultar planificación actual como parte del flujo interno. */
  private consultarPlanificacionActual(
    proyectoId: number,
    incluirEliminados: boolean,
  ): void {
    this.seleccionActual?.unsubscribe();
    this.errorCargaEstado.set(false);
    this.planificacionPresentadaEstado.set(null);
    this.seleccionandoEstado.set(true);
    this.seleccionActual = this.api
      .obtenerPlanificacion(proyectoId, null, incluirEliminados)
      .pipe(
        finalize(() => this.seleccionandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (planificacion) => {
          this.planificacionActualEstado.set(planificacion);
          this.planificacionPresentadaEstado.set(planificacion);
          this.planificacionActualIncluyeEliminados = incluirEliminados;
        },
        error: () => this.errorCargaEstado.set(true),
      });
  }

  /** Cancela operaciones dentro del flujo actual. */
  private cancelarOperaciones(): void {
    this.cargaActual?.unsubscribe();
    this.seleccionActual?.unsubscribe();
    this.seleccionandoEstado.set(false);
  }
}
