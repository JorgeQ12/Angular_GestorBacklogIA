import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import {
  ACENTOS_TIPO_BLOQUE_FLUJO,
  ETIQUETAS_TIPO_BLOQUE_FLUJO,
  ICONOS_TIPO_BLOQUE_FLUJO,
  RAMAS_DECISION_FLUJO,
} from '../../config/flujo-proyecto.config';
import {
  EtiquetaRamaDecision,
  NodoFlujoProyecto,
  TipoBloqueFlujo,
} from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

/** Presenta un bloque y administra sus interacciones directas dentro del lienzo. */
@Component({
  selector: 'app-tarjeta-bloque-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './tarjeta-bloque-flujo-proyecto.html',
  styleUrl: './tarjeta-bloque-flujo-proyecto.css',
})
export class TarjetaBloqueFlujoProyecto {
  private readonly referenciaDestruccion = inject(DestroyRef);
  private readonly mensajes = inject(MensajesService);
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);

  /** Bloque normalizado que debe representarse y manipularse en el lienzo. */
  public readonly bloque = input.required<NodoFlujoProyecto>();
  private seMovioDuranteArrastre = false;
  protected readonly accionesAbiertas = signal(false);
  protected readonly ramasDecision = RAMAS_DECISION_FLUJO;
  protected readonly etiquetasRamaDecision = EtiquetaRamaDecision;
  protected readonly etiquetasTipo = ETIQUETAS_TIPO_BLOQUE_FLUJO;
  protected readonly iconosTipo = ICONOS_TIPO_BLOQUE_FLUJO;
  protected readonly acentosTipo = ACENTOS_TIPO_BLOQUE_FLUJO;
  protected readonly nombresRoles = computed(() =>
    this.bloque().idsRoles.map((idRol) => this.estadoEditor.obtenerNombreRol(idRol)),
  );

  protected esBloqueDecision(): boolean {
    return this.bloque().tipo === TipoBloqueFlujo.Decision;
  }

  protected abrirEditor(): void {
    if (this.seMovioDuranteArrastre || this.estadoEditor.arrastrandoConexion()) {
      this.seMovioDuranteArrastre = false;
      return;
    }
    this.estadoEditor.abrirEditorNodo(this.bloque().id);
  }

  protected iniciarArrastreConexion(evento: PointerEvent, etiqueta?: EtiquetaRamaDecision): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.estadoEditor.iniciarArrastreConexion(this.bloque().id, etiqueta);
  }

  protected alternarAcciones(evento: MouseEvent): void {
    evento.stopPropagation();
    this.accionesAbiertas.update((abiertas) => !abiertas);
  }

  protected editarBloque(evento: MouseEvent): void {
    evento.stopPropagation();
    this.accionesAbiertas.set(false);
    this.estadoEditor.abrirEditorNodo(this.bloque().id);
  }

  protected async eliminarBloque(evento: MouseEvent): Promise<void> {
    evento.stopPropagation();
    this.accionesAbiertas.set(false);
    const bloque = this.bloque();
    const confirmado = await this.mensajes.confirmarDestructiva(
      `Eliminar ${this.etiquetasTipo[bloque.tipo].toLowerCase()}`,
      `El bloque “${bloque.titulo}” y sus conexiones dejarán de formar parte del flujo.`,
      'Eliminar bloque',
    );
    if (confirmado) this.estadoEditor.eliminarBloque(bloque.id);
  }

  @HostListener('document:click')
  protected cerrarAcciones(): void {
    this.accionesAbiertas.set(false);
  }

  protected enfocarDestino(): void {
    this.estadoEditor.establecerDestinoConexionEnfocado(this.bloque().id);
  }

  protected desenfocarDestino(): void {
    this.estadoEditor.establecerDestinoConexionEnfocado(null);
  }

  protected entrarTarjeta(): void {
    if (
      this.estadoEditor.arrastrandoConexion() &&
      this.estadoEditor.esDestinoConexion(this.bloque().id)
    ) {
      this.enfocarDestino();
    }
  }

  protected salirTarjeta(): void {
    if (
      this.estadoEditor.arrastrandoConexion() &&
      this.estadoEditor.esDestinoConexion(this.bloque().id)
    ) {
      this.desenfocarDestino();
    }
  }

  protected completarArrastreConexion(evento: PointerEvent): void {
    if (!this.estadoEditor.arrastrandoConexion()) return;
    evento.preventDefault();
    evento.stopPropagation();
    this.enfocarDestino();
    this.estadoEditor.completarArrastreConexion();
  }

  protected iniciarArrastreBloque(evento: PointerEvent): void {
    if (this.estadoEditor.soloLectura()) return;

    const objetivo = evento.target;
    if (objetivo instanceof Element && objetivo.closest('button')) return;

    evento.preventDefault();
    evento.stopPropagation();
    const elemento = evento.currentTarget;
    if (!(elemento instanceof HTMLElement)) return;
    const punteroId = evento.pointerId;
    this.estadoEditor.seleccionarBloque(this.bloque().id);
    const clienteXInicial = evento.clientX;
    const clienteYInicial = evento.clientY;
    const posicionInicial = this.bloque().posicion;

    if (typeof elemento.setPointerCapture === 'function') {
      elemento.setPointerCapture(punteroId);
    }

    const moverPuntero = (eventoMovimiento: PointerEvent): void => {
      if (eventoMovimiento.pointerId !== punteroId) return;

      const escala = this.estadoEditor.vista().escala;
      const desplazamientoX = (eventoMovimiento.clientX - clienteXInicial) / escala;
      const desplazamientoY = (eventoMovimiento.clientY - clienteYInicial) / escala;

      if (
        Math.abs(eventoMovimiento.clientX - clienteXInicial) > 3 ||
        Math.abs(eventoMovimiento.clientY - clienteYInicial) > 3
      ) {
        this.seMovioDuranteArrastre = true;
      }

      this.estadoEditor.moverBloque(this.bloque().id, {
        x: posicionInicial.x + desplazamientoX,
        y: posicionInicial.y + desplazamientoY,
      });
    };
    const detenerArrastre = (eventoFinal?: PointerEvent): void => {
      if (eventoFinal && eventoFinal.pointerId !== punteroId) return;

      window.removeEventListener('pointermove', moverPuntero);
      window.removeEventListener('pointerup', detenerArrastre);
      window.removeEventListener('pointercancel', detenerArrastre);
      if (
        typeof elemento.hasPointerCapture === 'function' &&
        elemento.hasPointerCapture(punteroId)
      ) {
        elemento.releasePointerCapture(punteroId);
      }
    };

    window.addEventListener('pointermove', moverPuntero);
    window.addEventListener('pointerup', detenerArrastre);
    window.addEventListener('pointercancel', detenerArrastre);
    this.referenciaDestruccion.onDestroy(detenerArrastre);
  }
}
