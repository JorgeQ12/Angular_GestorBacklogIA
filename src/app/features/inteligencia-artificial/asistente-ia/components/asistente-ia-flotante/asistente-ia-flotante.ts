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
  private readonly destroyRef = inject(DestroyRef);
  private readonly activador = viewChild<ElementRef<HTMLButtonElement>>('activador');
  protected readonly estado = inject(EstadoAsistenteIAService);

  /** Recibe la identidad, revisión y sección vigentes de la página anfitriona. */
  public readonly contexto = input.required<ContextoAsistenteIA>();

  /** Informa qué proyecto debe recargarse después de aplicar una propuesta. */
  public readonly contextoActualizado = output<number>();

  protected readonly abierto = signal(false);

  public constructor() {
    effect(() => this.estado.seleccionarProyecto(this.contexto().proyectoId));
  }

  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar();
      return;
    }

    this.estado.cargar(this.contexto().proyectoId);
    this.abierto.set(true);
  }

  protected cerrar(): void {
    if (!this.abierto()) return;
    this.abierto.set(false);
    queueMicrotask(() => this.activador()?.nativeElement.focus());
  }

  protected enviarMensaje(mensaje: string): void {
    this.estado
      .enviar(this.contexto(), mensaje)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected aplicarPropuesta(mensajeId: number): void {
    this.estado
      .aplicar(this.contexto(), mensajeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (resultado) => this.contextoActualizado.emit(resultado.proyectoId) });
  }

  protected rechazarPropuesta(mensajeId: number): void {
    this.estado
      .rechazar(this.contexto().proyectoId, mensajeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  @HostListener('document:keydown.escape')
  protected cerrarConEscape(): void {
    this.cerrar();
  }
}
