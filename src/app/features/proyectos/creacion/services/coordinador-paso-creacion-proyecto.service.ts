import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { ActualizacionSeccionBorrador } from '../models/actualizacion-seccion-borrador.model';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from './estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from './notificador-errores-borrador-proyecto.service';

type AccionGuardadoExitoso = () => void;

/** Coordina el ciclo remoto común de un componente de paso del recorrido. */
@Injectable()
export class CoordinadorPasoCreacionProyectoService {
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly estadoProyectoId = signal<number | null>(null);
  private readonly estadoBorrador = signal<BorradorProyecto | null>(null);
  private readonly estadoContenidoListo = signal(false);
  private readonly estadoErrorCarga = signal(false);
  private readonly estadoProcesando = signal(false);
  private cargaSolicitada = false;
  private cargaActual: Subscription | null = null;
  private guardadoActual: Subscription | null = null;

  public constructor() {
    effect(() => this.cambiarProyecto(this.estadoCreacion.proyectoId()));
  }

  /** Expone el identificador vigente para las operaciones complementarias del paso. */
  public get proyectoId(): number | null {
    return this.estadoProyectoId();
  }

  /** Expone la fotografía cargada para que el componente adapte su sección. */
  public readonly borrador = this.estadoBorrador.asReadonly();

  /** Indica si el componente ya puede presentar su formulario. */
  public readonly contenidoListo = this.estadoContenidoListo.asReadonly();

  /** Indica si la recuperación del borrador debe permitir reintento. */
  public readonly errorCarga = this.estadoErrorCarga.asReadonly();

  /** Indica si existe un guardado pendiente para bloquear envíos duplicados. */
  public readonly procesando = this.estadoProcesando.asReadonly();

  /** Recupera el borrador requerido por la sección vigente. */
  public cargar(): void {
    this.cargaSolicitada = true;
    const proyectoId = this.proyectoId;
    if (proyectoId === null) {
      this.estadoErrorCarga.set(true);
      return;
    }

    this.cargarProyecto(proyectoId);
  }

  /** Guarda una sección y comunica que el flujo puede continuar. */
  public guardar(
    actualizacion: ActualizacionSeccionBorrador,
    alCompletar: AccionGuardadoExitoso,
  ): void {
    const proyectoId = this.proyectoId;
    if (this.estadoProcesando() || proyectoId === null) return;

    this.estadoProcesando.set(true);
    this.guardadoActual = this.estadoCreacion
      .guardarSeccion(actualizacion)
      .pipe(
        finalize(() => this.estadoProcesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (borrador) => {
          if (this.proyectoId !== proyectoId) return;

          this.estadoBorrador.set(borrador);
          alCompletar();
        },
        error: (error: unknown) => this.notificadorErrores.comunicar(error, actualizacion.seccion),
      });
  }

  /** Descarta el contenido anterior cuando cambia el proyecto activo. */
  private cambiarProyecto(proyectoId: number | null): void {
    if (this.proyectoId === proyectoId) return;

    this.cargaActual?.unsubscribe();
    this.guardadoActual?.unsubscribe();
    this.cargaActual = null;
    this.guardadoActual = null;
    this.estadoProyectoId.set(proyectoId);
    this.estadoBorrador.set(null);
    this.estadoErrorCarga.set(false);
    this.estadoContenidoListo.set(false);

    if (this.cargaSolicitada && proyectoId !== null) this.cargarProyecto(proyectoId);
  }

  /** Ejecuta la carga cancelable del proyecto que permanece vigente. */
  private cargarProyecto(proyectoId: number): void {
    this.cargaActual?.unsubscribe();
    this.estadoBorrador.set(null);
    this.estadoErrorCarga.set(false);
    this.estadoContenidoListo.set(false);
    this.cargaActual = this.estadoCreacion
      .cargar(proyectoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (borrador) => {
          if (this.proyectoId !== proyectoId) return;

          this.estadoBorrador.set(borrador);
          this.estadoContenidoListo.set(true);
        },
        error: () => {
          if (this.proyectoId === proyectoId) this.estadoErrorCarga.set(true);
        },
      });
  }
}
