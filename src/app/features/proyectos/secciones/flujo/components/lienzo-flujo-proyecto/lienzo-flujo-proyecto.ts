import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
} from '@angular/core';
import { EstadoVacio } from '../../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';
import {
  CapaConexionesFlujoProyecto,
  ModoCapaConexionesFlujo,
} from '../capa-conexiones-flujo-proyecto/capa-conexiones-flujo-proyecto';
import { TarjetaBloqueFlujoProyecto } from '../tarjeta-bloque-flujo-proyecto/tarjeta-bloque-flujo-proyecto';

/** Presenta el área interactiva en la que se organizan y conectan los bloques. */
@Component({
  selector: 'app-lienzo-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoVacio, IconoComponent, CapaConexionesFlujoProyecto, TarjetaBloqueFlujoProyecto],
  templateUrl: './lienzo-flujo-proyecto.html',
  styleUrl: './lienzo-flujo-proyecto.css',
})
export class LienzoFlujoProyecto {
  private readonly referenciaDestruccion = inject(DestroyRef);
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);
  protected readonly modosCapaConexiones = ModoCapaConexionesFlujo;
  @ViewChild('elementoVista', { static: true })
  private readonly elementoVista?: ElementRef<HTMLDivElement>;

  protected readonly transformacionEscena = computed(() => {
    const vista = this.estadoEditor.vista();
    return `translate(${vista.desplazamientoX}px, ${vista.desplazamientoY}px) scale(${vista.escala})`;
  });
  protected readonly estiloTamanoLienzo = computed(() => ({
    width: `${this.estadoEditor.tamanoLienzo.ancho}px`,
    height: `${this.estadoEditor.tamanoLienzo.alto}px`,
    transform: this.transformacionEscena(),
  }));
  protected readonly estiloCuadriculaVista = computed(() => {
    const vista = this.estadoEditor.vista();
    const tamanoCuadricula = 40 * vista.escala;
    return {
      backgroundSize: `${tamanoCuadricula}px ${tamanoCuadricula}px`,
      backgroundPosition: `${vista.desplazamientoX}px ${vista.desplazamientoY}px`,
    };
  });
  protected readonly etiquetaEscala = computed(
    () => `${Math.round(this.estadoEditor.vista().escala * 100)}%`,
  );

  protected acercar(): void {
    this.estadoEditor.ajustarEscala(0.1);
  }

  protected alejar(): void {
    this.estadoEditor.ajustarEscala(-0.1);
  }

  protected restablecerVista(): void {
    this.estadoEditor.restablecerVista();
  }

  protected abrirPaletaBloques(): void {
    this.estadoEditor.abrirPaletaBloques();
  }

  protected seleccionarSuperficie(evento: MouseEvent): void {
    const objetivo = evento.target as HTMLElement | null;
    if (
      objetivo?.closest(
        '[data-tarjeta-flujo], [data-interaccion-conexion="true"], button, input, textarea, label',
      )
    ) {
      return;
    }

    this.estadoEditor.limpiarSeleccion();
    this.estadoEditor.cancelarConexion();
  }

  protected iniciarDesplazamiento(evento: PointerEvent): void {
    if (this.estadoEditor.arrastrandoConexion()) return;

    const objetivo = evento.target as HTMLElement | null;
    if (
      objetivo?.closest(
        '[data-tarjeta-flujo], [data-interaccion-conexion="true"], button, input, textarea, label',
      )
    ) {
      return;
    }

    let clienteXInicial = evento.clientX;
    let clienteYInicial = evento.clientY;
    const moverPuntero = (eventoMovimiento: PointerEvent): void => {
      this.estadoEditor.desplazarVista(
        eventoMovimiento.clientX - clienteXInicial,
        eventoMovimiento.clientY - clienteYInicial,
      );
      clienteXInicial = eventoMovimiento.clientX;
      clienteYInicial = eventoMovimiento.clientY;
    };
    const detenerDesplazamiento = (): void => {
      window.removeEventListener('pointermove', moverPuntero);
      window.removeEventListener('pointerup', detenerDesplazamiento);
    };

    window.addEventListener('pointermove', moverPuntero);
    window.addEventListener('pointerup', detenerDesplazamiento, { once: true });
    this.referenciaDestruccion.onDestroy(detenerDesplazamiento);
  }

  @HostListener('document:pointermove', ['$event'])
  protected moverPunteroDocumento(evento: PointerEvent): void {
    if (!this.estadoEditor.arrastrandoConexion()) return;
    this.estadoEditor.actualizarPunteroConexion(
      this.convertirEnPuntoLienzo(evento.clientX, evento.clientY),
    );
  }

  @HostListener('document:pointerup')
  protected soltarPunteroDocumento(): void {
    if (this.estadoEditor.arrastrandoConexion()) this.estadoEditor.completarArrastreConexion();
  }

  @HostListener('document:keydown.escape')
  protected pulsarEscape(): void {
    if (this.estadoEditor.arrastrandoConexion()) this.estadoEditor.cancelarConexion();
  }

  private convertirEnPuntoLienzo(clienteX: number, clienteY: number): { x: number; y: number } {
    const rectanguloVista = this.elementoVista?.nativeElement.getBoundingClientRect();
    const vista = this.estadoEditor.vista();
    if (!rectanguloVista) return { x: 0, y: 0 };

    return {
      x: (clienteX - rectanguloVista.left - vista.desplazamientoX) / vista.escala,
      y: (clienteY - rectanguloVista.top - vista.desplazamientoY) / vista.escala,
    };
  }
}
