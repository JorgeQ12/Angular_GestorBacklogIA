import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import {
  MENSAJES_ERROR_SINCRONIZACION_EPICA_AZURE_PLANIFICACION,
  MENSAJES_EXITO_SINCRONIZACION_EPICA_AZURE_PLANIFICACION,
  obtenerDescripcionSincronizacionEpicaAzure,
} from '../config/mensajes-planificacion-proyecto.config';
import { TipoElementoPlanificacion } from '../models/planificacion-proyecto.model';
import type { ResultadoSincronizacionEpicaAzurePlanificacion } from '../models/sincronizacion-epica-azure-planificacion.model';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { PlanificacionProyectoService } from './planificacion-proyecto.service';

/** Coordina la importación de revisiones de la épica principal desde Azure DevOps. */
@Injectable()
export class EstadoSincronizacionEpicaAzurePlanificacionService {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(PlanificacionProyectoService);

  /** Proporciona acceso al servicio de estado planificación proyecto. */
  private readonly estadoPlanificacion = inject(EstadoPlanificacionProyectoService);

  /** Proporciona acceso al servicio de mensajes. */
  private readonly mensajes = inject(MensajesService);

  /** Proporciona acceso al servicio de notificador errores API. */
  private readonly notificador = inject(NotificadorErroresApiService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva operación actual para controlar el ciclo de vida de la operación. */
  private operacionActual: Subscription | null = null;

  /** Conserva sincronizando estado como estado reactivo de la instancia. */
  private readonly sincronizandoEstado = signal(false);

  /** Impide iniciar otra sincronización mientras la actual continúa. */
  public readonly sincronizando = this.sincronizandoEstado.asReadonly();

  /** Sincroniza únicamente el proyecto cuya épica principal fue autorizada por el backend. */
  public sincronizar(
    proyectoId: number,
    completado: (resultado: ResultadoSincronizacionEpicaAzurePlanificacion) => void,
  ): void {
    const planificacion = this.estadoPlanificacion.planificacion();
    const puedeSincronizar = planificacion?.elementos.some(
      (elemento) =>
        elemento.tipo === TipoElementoPlanificacion.Epica &&
        elemento.activo &&
        elemento.capacidades.puedeSincronizar,
    );
    if (
      !planificacion ||
      planificacion.proyectoId !== proyectoId ||
      planificacion.esHistorica ||
      !puedeSincronizar ||
      this.sincronizandoEstado()
    ) {
      return;
    }

    this.sincronizandoEstado.set(true);
    this.operacionActual = this.api
      .sincronizarEpicaPrincipal(proyectoId)
      .pipe(
        finalize(() => this.sincronizandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          completado(resultado);
          void this.mensajes.exito(
            MENSAJES_EXITO_SINCRONIZACION_EPICA_AZURE_PLANIFICACION.titulo,
            obtenerDescripcionSincronizacionEpicaAzure(resultado.revisionesImportadas),
          );
        },
        error: (error: unknown) =>
          this.notificador.comunicar(
            error,
            MENSAJES_ERROR_SINCRONIZACION_EPICA_AZURE_PLANIFICACION,
          ),
      });
  }

  /** Cancela una sincronización asociada al proyecto anterior. */
  public restablecer(): void {
    this.operacionActual?.unsubscribe();
    this.operacionActual = null;
    this.sincronizandoEstado.set(false);
  }
}
