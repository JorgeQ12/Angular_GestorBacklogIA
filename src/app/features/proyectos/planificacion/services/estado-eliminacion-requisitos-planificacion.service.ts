import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { normalizarErrorApi } from '../../../../core/http/mappers/error-api.mapper';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MensajesService } from '../../../../core/mensajes/services/mensajes.service';
import { MENSAJES_ERROR_ELIMINACION_ELEMENTO_PLANIFICACION } from '../config/mensajes-planificacion-proyecto.config';
import {
  TipoElementoPlanificacion,
  type ElementoPlanificacion,
} from '../models/planificacion-proyecto.model';
import { EstadoPlanificacionProyectoService } from './estado-planificacion-proyecto.service';
import { ElementoPlanificacionService } from './elemento-planificacion.service';

/** Coordina la eliminación lógica de los elementos persistibles de la planificación. */
@Injectable()
export class EstadoEliminacionRequisitosPlanificacionService {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(ElementoPlanificacionService);

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

  /** Conserva eliminando estado como estado reactivo de la instancia. */
  private readonly eliminandoEstado = signal(false);

  /** Impide ejecutar mutaciones simultáneas mientras continúa una eliminación. */
  public readonly eliminando = this.eliminandoEstado.asReadonly();

  /** Confirma e inactiva un elemento vigente cuando el backend autoriza la operación. */
  public async eliminar(
    elemento: ElementoPlanificacion,
    actualizarArbol: () => void,
  ): Promise<void> {
    const planificacion = this.estadoPlanificacion.planificacion();
    if (
      !elemento.activo ||
      !elemento.capacidades.puedeEliminar ||
      elemento.capacidades.soloLectura ||
      !planificacion ||
      planificacion.esHistorica ||
      this.eliminandoEstado()
    ) {
      return;
    }

    const presentacion = obtenerPresentacionEliminacion(elemento.tipo);
    const confirmado = await this.mensajes.confirmarDestructiva(
      `Eliminar ${presentacion.nombre.toLowerCase()}`,
      presentacion.confirmacion,
    );
    if (!confirmado || this.eliminandoEstado()) return;

    this.eliminandoEstado.set(true);
    this.operacionActual = this.api
      .eliminar(elemento.tipo, elemento.id, elemento.numeroVersion)
      .pipe(
        finalize(() => this.eliminandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          actualizarArbol();
          void this.mensajes.exito(
            `${presentacion.nombre} eliminada`,
            `La ${presentacion.nombre.toLowerCase()} quedó disponible como histórica de solo lectura.`,
          );
        },
        error: (error: unknown) => {
          if (normalizarErrorApi(error).estadoHttp === 409) actualizarArbol();
          this.notificador.comunicar(
            error,
            MENSAJES_ERROR_ELIMINACION_ELEMENTO_PLANIFICACION,
          );
        },
      });
  }

  /** Cancela una eliminación asociada al proyecto anterior. */
  public restablecer(): void {
    this.operacionActual?.unsubscribe();
    this.operacionActual = null;
    this.eliminandoEstado.set(false);
  }
}

function obtenerPresentacionEliminacion(
  tipo: TipoElementoPlanificacion,
): { readonly nombre: string; readonly confirmacion: string } {
  switch (tipo) {
    case TipoElementoPlanificacion.ListaRequisitos:
      return {
        nombre: 'Lista de requisitos',
        confirmacion: 'La lista, sus actividades y sus tareas dejarán de estar vigentes. El historial se conservará.',
      };
    case TipoElementoPlanificacion.Epica:
      return {
        nombre: 'Épica',
        confirmacion: 'La épica local y todos sus elementos descendientes dejarán de estar vigentes. Sus versiones se conservarán.',
      };
    case TipoElementoPlanificacion.Caracteristica:
      return {
        nombre: 'Característica',
        confirmacion: 'La característica y todos sus elementos descendientes dejarán de estar vigentes. Sus versiones se conservarán.',
      };
    case TipoElementoPlanificacion.Historia:
      return {
        nombre: 'Historia de usuario',
        confirmacion: 'La historia de usuario y sus tareas dejarán de estar vigentes. Sus versiones se conservarán.',
      };
    case TipoElementoPlanificacion.ActividadRequisito:
      return {
        nombre: 'Actividad',
        confirmacion: 'La actividad y sus tareas de requisitos dejarán de estar vigentes. El historial se conservará.',
      };
    case TipoElementoPlanificacion.TareaRequisito:
      return {
        nombre: 'Tarea de requisitos',
        confirmacion: 'La tarea dejará de estar vigente, pero sus versiones se conservarán.',
      };
    case TipoElementoPlanificacion.Tarea:
      return {
        nombre: 'Tarea',
        confirmacion: 'La tarea dejará de estar vigente, pero sus versiones se conservarán.',
      };
  }
}
