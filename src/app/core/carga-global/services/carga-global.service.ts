import { Injectable, computed, signal } from '@angular/core';

/** Administra la visibilidad compartida del cargador durante operaciones concurrentes. */
@Injectable({ providedIn: 'root' })
export class CargaGlobalService {
  private readonly operacionesPendientes = signal(0);

  /** Indica si existe al menos una operación pendiente. */
  public readonly visible = computed(() => this.operacionesPendientes() > 0);

  /** Registra el inicio de una operación que requiere bloquear la interfaz. */
  public iniciar(): void {
    this.operacionesPendientes.update((cantidad) => cantidad + 1);
  }

  /** Registra la finalización de una operación pendiente. */
  public finalizar(): void {
    this.operacionesPendientes.update((cantidad) => Math.max(0, cantidad - 1));
  }
}
