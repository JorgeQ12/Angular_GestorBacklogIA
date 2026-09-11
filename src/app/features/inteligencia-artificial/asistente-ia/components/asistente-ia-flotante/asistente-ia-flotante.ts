import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import type { ContextoAsistenteIA } from '../../models/asistente-ia.model';
import { EstadoAsistenteIAService } from '../../services/estado-asistente-ia.service';
import { PanelAsistenteIA } from '../panel-asistente-ia/panel-asistente-ia';

/** Conecta el botón flotante y el panel con el estado conversacional de la ruta. */
@Component({
  selector: 'app-asistente-ia-flotante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, PanelAsistenteIA],
  templateUrl: './asistente-ia-flotante.html',
  styleUrl: './asistente-ia-flotante.css',
})
export class AsistenteIAFlotante {

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Referencia activador dentro de la vista. */
  private readonly activador = viewChild<ElementRef<HTMLButtonElement>>('activador');

  /** Proporciona acceso al servicio de estado asistente IA. */
  protected readonly estado = inject(EstadoAsistenteIAService);

  /** Recibe la identidad, revisión y sección vigentes de la página anfitriona. */
  public readonly contexto = input.required<ContextoAsistenteIA>();

  /** Informa qué proyecto debe recargarse después de aplicar una propuesta. */
  public readonly contextoActualizado = output<number>();

  /** Conserva abierto como estado reactivo de la instancia. */
  protected readonly abierto = signal(false);

  public constructor() {
    effect(() => this.estado.seleccionarProyecto(this.contexto().proyectoId));
  }

  /** Alterna la operación solicitada dentro del flujo actual. */
  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar();
      return;
    }

    this.estado.cargar(this.contexto().proyectoId);
    this.abierto.set(true);
  }

  /** Cierra la operación solicitada dentro del flujo actual. */
  protected cerrar(): void {
    if (!this.abierto()) return;
    this.abierto.set(false);
    queueMicrotask(() => this.activador()?.nativeElement.focus());
  }

  /** Ejecuta enviar mensaje como parte del flujo interno. */
  protected enviarMensaje(mensaje: string): void {
    this.estado
      .enviar(this.contexto(), mensaje)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /** Aplica propuesta dentro del flujo actual. */
  protected aplicarPropuesta(mensajeId: number): void {
    this.estado
      .aplicar(this.contexto(), mensajeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (resultado) => this.contextoActualizado.emit(resultado.proyectoId) });
  }

  /** Ejecuta rechazar propuesta como parte del flujo interno. */
  protected rechazarPropuesta(mensajeId: number): void {
    this.estado
      .rechazar(this.contexto().proyectoId, mensajeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /** Cierra con escape dentro del flujo actual. */
  @HostListener('document:keydown.escape')
  protected cerrarConEscape(): void {
    this.cerrar();
  }
}
