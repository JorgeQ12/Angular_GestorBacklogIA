import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import type { GanttPlanificacion } from '../models/gantt-planificacion.model';
import type {
  ElementoPlanificacion,
  PlanificacionProyecto,
} from '../models/planificacion-proyecto.model';
import { GanttPlanificacionService } from './gantt-planificacion.service';

/** Coordina la apertura, carga y recuperación de la vista Gantt. */
@Injectable()
export class EstadoGanttPlanificacionService {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(GanttPlanificacionService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva operación actual para controlar el ciclo de vida de la operación. */
  private operacionActual: Subscription | null = null;

  /** Conserva clave cargada para coordinar esta responsabilidad. */
  private claveCargada: string | null = null;

  /** Conserva planificación solicitada para coordinar esta responsabilidad. */
  private planificacionSolicitada: PlanificacionProyecto | null = null;

  /** Conserva abierto estado como estado reactivo de la instancia. */
  private readonly abiertoEstado = signal(false);

  /** Conserva cargando estado como estado reactivo de la instancia. */
  private readonly cargandoEstado = signal(false);

  /** Conserva error estado como estado reactivo de la instancia. */
  private readonly errorEstado = signal(false);

  /** Conserva datos estado como estado reactivo de la instancia. */
  private readonly datosEstado = signal<GanttPlanificacion | null>(null);

  /** Indica si la vista Gantt reemplaza actualmente al árbol. */
  public readonly abierto = this.abiertoEstado.asReadonly();

  /** Indica si existe una consulta del cronograma en curso. */
  public readonly cargando = this.cargandoEstado.asReadonly();

  /** Indica si la última consulta del cronograma falló. */
  public readonly error = this.errorEstado.asReadonly();

  /** Expone la fotografía del Gantt lista para representar. */
  public readonly datos = this.datosEstado.asReadonly();

  /** Abre la vista y prepara el cronograma de la fotografía presentada. */
  public abrir(planificacion: PlanificacionProyecto): void {
    this.abiertoEstado.set(true);
    this.sincronizar(planificacion);
  }

  /** Renueva el Gantt cuando cambia la versión o el contenido del árbol. */
  public sincronizar(planificacion: PlanificacionProyecto | null): void {
    if (!this.abiertoEstado() || !planificacion) return;
    const clave = crearClavePlanificacion(planificacion);
    if (clave === this.claveCargada && (this.datosEstado() || this.cargandoEstado())) return;
    this.cargar(planificacion, clave);
  }

  /** Reintenta la última fotografía solicitada después de una falla. */
  public reintentar(): void {
    if (this.planificacionSolicitada && !this.cargandoEstado()) {
      this.cargar(this.planificacionSolicitada, crearClavePlanificacion(this.planificacionSolicitada));
    }
  }

  /** Regresa al árbol y cancela cualquier detalle todavía pendiente. */
  public cerrar(): void {
    this.operacionActual?.unsubscribe();
    this.operacionActual = null;
    this.abiertoEstado.set(false);
    this.cargandoEstado.set(false);
  }

  /** Descarta por completo los datos asociados al proyecto anterior. */
  public restablecer(): void {
    this.cerrar();
    this.claveCargada = null;
    this.planificacionSolicitada = null;
    this.errorEstado.set(false);
    this.datosEstado.set(null);
  }

  /** Carga la operación solicitada dentro del flujo actual. */
  private cargar(planificacion: PlanificacionProyecto, clave: string): void {
    this.operacionActual?.unsubscribe();
    this.planificacionSolicitada = planificacion;
    this.claveCargada = clave;
    this.errorEstado.set(false);
    this.cargandoEstado.set(true);
    this.operacionActual = this.api
      .obtener(planificacion)
      .pipe(
        finalize(() => this.cargandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (datos) => this.datosEstado.set(datos),
        error: () => {
          this.errorEstado.set(true);
          this.datosEstado.set(null);
        },
      });
  }
}

function crearClavePlanificacion(planificacion: PlanificacionProyecto): string {
  return [
    planificacion.proyectoId,
    planificacion.versionId,
    planificacion.esHistorica,
    crearFirmaElementos(planificacion.elementos),
  ].join(':');
}

function crearFirmaElementos(elementos: readonly ElementoPlanificacion[]): string {
  return elementos
    .flatMap((elemento) => [
      `${elemento.clave},${elemento.numeroVersion},${elemento.activo}`,
      crearFirmaElementos(elemento.hijos),
    ])
    .join('|');
}
