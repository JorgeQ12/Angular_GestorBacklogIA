import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { MENSAJES_ERROR_PUBLICACION_AZURE_PLANIFICACION } from '../config/mensajes-planificacion-proyecto.config';
import { TEXTOS_PUBLICACION_AZURE_PLANIFICACION } from '../config/publicacion-azure-planificacion.config';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

/** Coordina la confirmación y ejecución de la publicación en Azure DevOps. */
@Injectable()
export class EstadoPublicacionAzurePlanificacionService {
  private readonly api = inject(PlanificacionProyectoService);
  private readonly estadoPlanificacion = inject(EstadoPlanificacionProyectoService);
  private readonly mensajes = inject(MensajesService);
  private readonly notificador = inject(NotificadorErroresApiService);
  private readonly destroyRef = inject(DestroyRef);
  private operacionActual: Subscription | null = null;
  private confirmacionActualId = 0;
  private readonly publicandoEstado = signal(false);

  /** Impide iniciar una segunda publicación mientras existe una decisión u operación pendiente. */
  public readonly publicando = this.publicandoEstado.asReadonly();

  /** Confirma y publica exclusivamente la versión vigente que el backend declaró completa. */
  public async publicar(proyectoId: number): Promise<void> {
    const planificacion = this.estadoPlanificacion.planificacion();
    if (
      !planificacion ||
      planificacion.proyectoId !== proyectoId ||
      planificacion.esHistorica ||
      !planificacion.publicacionAzure.puedePublicar ||
      this.publicandoEstado()
    ) {
      return;
    }

    this.publicandoEstado.set(true);
    const confirmacionId = ++this.confirmacionActualId;
    const confirmado = await this.mensajes.confirmar(
      TEXTOS_PUBLICACION_AZURE_PLANIFICACION.titulo,
      TEXTOS_PUBLICACION_AZURE_PLANIFICACION.descripcionConfirmacion,
      TEXTOS_PUBLICACION_AZURE_PLANIFICACION.textoConfirmar,
    );
    if (confirmacionId !== this.confirmacionActualId) return;
    if (!confirmado) {
      this.publicandoEstado.set(false);
      return;
    }

    this.operacionActual = this.api
      .publicarEnAzure(proyectoId)
      .pipe(
        finalize(() => this.publicandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) =>
          void this.mensajes.exito(
            'Publicación completada',
            `Se publicaron ${resultado.totalElementos} work items.`,
          ),
        error: (error: unknown) =>
          this.notificador.comunicar(error, MENSAJES_ERROR_PUBLICACION_AZURE_PLANIFICACION),
      });
  }

  /** Descarta una confirmación o publicación asociada al proyecto anterior. */
  public restablecer(): void {
    this.confirmacionActualId += 1;
    this.operacionActual?.unsubscribe();
    this.operacionActual = null;
    this.publicandoEstado.set(false);
  }
}
