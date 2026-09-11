import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { NOMBRES_NIVEL_GENERACION_IA } from '../config/opciones-generacion-ia-planificacion.config';
import { MENSAJES_ERROR_GENERACION_IA_PLANIFICACION } from '../config/mensajes-planificacion-proyecto.config';
import { NivelGeneracionIaPlanificacion } from '../models/generacion-ia-planificacion.model';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

/** Coordina la confirmación y ejecución de la generación mediante IA. */
@Injectable()
export class EstadoGeneracionIaPlanificacionService {
  private readonly api = inject(PlanificacionProyectoService);
  private readonly estadoPlanificacion = inject(EstadoPlanificacionProyectoService);
  private readonly mensajes = inject(MensajesService);
  private readonly notificador = inject(NotificadorErroresApiService);
  private readonly destroyRef = inject(DestroyRef);
  private operacionActual: Subscription | null = null;
  private confirmacionActualId = 0;

  private readonly panelAbiertoEstado = signal(false);
  private readonly procesandoEstado = signal(false);

  /** Indica si se presentan las alternativas de generación. */
  public readonly panelAbierto = this.panelAbiertoEstado.asReadonly();
  /** Impide iniciar otra generación mientras existe una decisión u operación pendiente. */
  public readonly procesando = this.procesandoEstado.asReadonly();

  /** Alterna el asistente únicamente sobre la versión vigente. */
  public alternarPanel(): void {
    const planificacion = this.estadoPlanificacion.planificacion();
    if (!planificacion || planificacion.esHistorica || this.procesandoEstado()) return;
    this.panelAbiertoEstado.update((abierto) => !abierto);
  }

  /** Confirma y genera el nivel solicitado antes de renovar el árbol. */
  public async generar(
    proyectoId: number,
    nivel: NivelGeneracionIaPlanificacion,
  ): Promise<void> {
    const planificacion = this.estadoPlanificacion.planificacion();
    if (
      !planificacion ||
      planificacion.proyectoId !== proyectoId ||
      planificacion.esHistorica ||
      this.procesandoEstado()
    ) {
      return;
    }

    this.procesandoEstado.set(true);
    const confirmacionId = ++this.confirmacionActualId;
    const nombreNivel = NOMBRES_NIVEL_GENERACION_IA[nivel];
    const confirmado = await this.mensajes.confirmar(
      `Generar ${nombreNivel}`,
      'La planificación actual se conservará como una versión histórica antes de crear la nueva propuesta.',
      'Generar',
    );
    if (confirmacionId !== this.confirmacionActualId) return;
    if (!confirmado) {
      this.procesandoEstado.set(false);
      return;
    }

    this.operacionActual = this.api
      .generarConIa(proyectoId, nivel)
      .pipe(
        finalize(() => this.procesandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.panelAbiertoEstado.set(false);
          this.estadoPlanificacion.cargar(proyectoId);
          void this.mensajes.exito(
            'Planificación actualizada',
            `Se generaron ${resultado.totalCreados} ${nombreNivel} correctamente.`,
          );
        },
        error: (error: unknown) =>
          this.notificador.comunicar(error, MENSAJES_ERROR_GENERACION_IA_PLANIFICACION),
      });
  }

  /** Descarta el panel y cualquier solicitud asociada al proyecto anterior. */
  public restablecer(): void {
    this.confirmacionActualId += 1;
    this.operacionActual?.unsubscribe();
    this.operacionActual = null;
    this.panelAbiertoEstado.set(false);
    this.procesandoEstado.set(false);
  }
}
