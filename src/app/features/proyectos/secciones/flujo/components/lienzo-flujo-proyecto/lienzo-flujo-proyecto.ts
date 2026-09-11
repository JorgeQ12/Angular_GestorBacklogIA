import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  input,
  output,
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

  /** Proporciona acceso a destroy ref. */
  private readonly referenciaDestruccion = inject(DestroyRef);

  /** Proporciona acceso al servicio de estado editor flujo proyecto. */
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);

  /** Conserva modos capa conexiones para coordinar esta responsabilidad. */
  protected readonly modosCapaConexiones = ModoCapaConexionesFlujo;

  /** Indica si el editor que contiene el lienzo ocupa la pantalla completa. */
  public readonly pantallaCompleta = input(false);

  /** Indica si el flujo contiene cambios que todavía no se han persistido. */
  public readonly cambiosPendientes = input(false);

  /** Mantiene disponible la acción mientras el backend construye el primer diagrama. */
  public readonly generandoConIA = input(false);

  /** Solicita al editor alternar el modo de pantalla completa. */
  public readonly alternarPantallaCompletaSolicitado = output<void>();

  /** Solicita persistir la fotografía vigente sin abandonar el editor. */
  public readonly guardarSolicitado = output<void>();

  /** Solicita generar el primer diagrama a partir del contexto del proyecto. */
  public readonly generarConIASolicitado = output<void>();

  /** Conserva elemento vista para coordinar esta responsabilidad. */
  @ViewChild('elementoVista', { static: true })
  private readonly elementoVista?: ElementRef<HTMLDivElement>;

  /** Deriva transformacion escena a partir del estado vigente. */
  protected readonly transformacionEscena = computed(() => {
    const vista = this.estadoEditor.vista();
    return `translate(${vista.desplazamientoX}px, ${vista.desplazamientoY}px) scale(${vista.escala})`;
  });

  /** Deriva estilo tamaño lienzo a partir del estado vigente. */
  protected readonly estiloTamanoLienzo = computed(() => ({
    width: `${this.estadoEditor.tamanoLienzo.ancho}px`,
    height: `${this.estadoEditor.tamanoLienzo.alto}px`,
    transform: this.transformacionEscena(),
  }));

  /** Deriva estilo cuadricula vista a partir del estado vigente. */
  protected readonly estiloCuadriculaVista = computed(() => {
    const vista = this.estadoEditor.vista();
    const tamanoCuadricula = 40 * vista.escala;
    return {
      backgroundSize: `${tamanoCuadricula}px ${tamanoCuadricula}px`,
      backgroundPosition: `${vista.desplazamientoX}px ${vista.desplazamientoY}px`,
    };
  });

  /** Deriva etiqueta escala a partir del estado vigente. */
  protected readonly etiquetaEscala = computed(
    () => `${Math.round(this.estadoEditor.vista().escala * 100)}%`,
  );

  /** Ejecuta acercar como parte del flujo interno. */
  protected acercar(): void {
    this.estadoEditor.ajustarEscala(0.1);
  }

  /** Ejecuta alejar como parte del flujo interno. */
  protected alejar(): void {
    this.estadoEditor.ajustarEscala(-0.1);
  }

  /** Restablece vista dentro del flujo actual. */
  protected restablecerVista(): void {
    this.estadoEditor.restablecerVista();
  }

  /** Abre paleta bloques dentro del flujo actual. */
  protected abrirPaletaBloques(): void {
    this.estadoEditor.abrirPaletaBloques();
  }

  /** Selecciona superficie dentro del flujo actual. */
  protected seleccionarSuperficie(evento: MouseEvent): void {
    const objetivo = evento.target;
    if (
      objetivo instanceof Element &&
      objetivo.closest(
        '[data-tarjeta-flujo], [data-interaccion-conexion="true"], button, input, textarea, label',
      )
    ) {
      return;
    }

    this.estadoEditor.limpiarSeleccion();
    this.estadoEditor.cancelarConexion();
  }

  /** Inicia desplazamiento dentro del flujo actual. */
  protected iniciarDesplazamiento(evento: PointerEvent): void {
    if (this.estadoEditor.arrastrandoConexion()) return;

    const objetivo = evento.target;
    if (
      objetivo instanceof Element &&
      objetivo.closest(
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

  /** Ejecuta mover puntero documento como parte del flujo interno. */
  @HostListener('document:pointermove', ['$event'])
  protected moverPunteroDocumento(evento: PointerEvent): void {
    if (!this.estadoEditor.arrastrandoConexion()) return;
    this.estadoEditor.actualizarPunteroConexion(
      this.convertirEnPuntoLienzo(evento.clientX, evento.clientY),
    );
  }

  /** Ejecuta soltar puntero documento como parte del flujo interno. */
  @HostListener('document:pointerup')
  protected soltarPunteroDocumento(): void {
    if (this.estadoEditor.arrastrandoConexion()) this.estadoEditor.completarArrastreConexion();
  }

  /** Ejecuta pulsar escape como parte del flujo interno. */
  @HostListener('document:keydown.escape')
  protected pulsarEscape(): void {
    if (this.estadoEditor.arrastrandoConexion()) this.estadoEditor.cancelarConexion();
  }

  /** Convierte en punto lienzo dentro del flujo actual. */
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
