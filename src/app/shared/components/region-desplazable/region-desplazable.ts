import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  signal,
  viewChild,
} from '@angular/core';

interface ArrastreScrollbar {
  readonly punteroId: number;
  readonly posicionInicial: number;
  readonly desplazamientoInicial: number;
}

const DURACION_VISIBILIDAD_SCROLLBAR_MS = 900;

/** Conserva el desplazamiento nativo y presenta su indicador superpuesto sobre el contenido. */
@Component({
  selector: 'app-region-desplazable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mouseenter)': 'sincronizarControl()',
    '(mouseleave)': 'ocultarControl()',
  },
  templateUrl: './region-desplazable.html',
  styleUrl: './region-desplazable.css',
})
export class RegionDesplazable implements AfterViewInit, OnDestroy {

  /** Referencia viewport dentro de la vista. */
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');

  /** Referencia contenido dentro de la vista. */
  private readonly contenido = viewChild.required<ElementRef<HTMLElement>>('contenido');

  /** Referencia pista dentro de la vista. */
  private readonly pista = viewChild.required<ElementRef<HTMLElement>>('pista');

  /** Referencia control dentro de la vista. */
  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');

  /** Conserva observador tamaño para coordinar esta responsabilidad. */
  private observadorTamano: ResizeObserver | null = null;

  /** Conserva arrastre para coordinar esta responsabilidad. */
  private arrastre: ArrastreScrollbar | null = null;

  /** Conserva temporizador ocultar para coordinar esta responsabilidad. */
  private temporizadorOcultar: ReturnType<typeof setTimeout> | null = null;

  /** Proporciona el nombre accesible de la región que recibe el desplazamiento. */
  public readonly etiqueta = input.required<string>();

  /** Conserva control visible como estado reactivo de la instancia. */
  protected readonly controlVisible = signal(false);

  /** Conserva control activo como estado reactivo de la instancia. */
  protected readonly controlActivo = signal(false);

  /** Conserva control arrastrado como estado reactivo de la instancia. */
  protected readonly controlArrastrado = signal(false);

  /** Conserva altura control como estado reactivo de la instancia. */
  protected readonly alturaControl = signal(0);

  /** Conserva posición control como estado reactivo de la instancia. */
  protected readonly posicionControl = signal(0);

  /** Inicia la observación cuando el contenido proyectado ya forma parte del documento. */
  public ngAfterViewInit(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.observadorTamano = new ResizeObserver(() => this.sincronizarControl());
      this.observadorTamano.observe(this.viewport().nativeElement);
      this.observadorTamano.observe(this.contenido().nativeElement);
    }

    queueMicrotask(() => this.sincronizarControl());
  }

  /** Libera la observación y cualquier captura de puntero pendiente. */
  public ngOnDestroy(): void {
    this.observadorTamano?.disconnect();
    this.cancelarOcultamiento();
    this.arrastre = null;
  }

  /** Muestra temporalmente el indicador al desplazar mediante rueda, teclado o touch. */
  protected gestionarDesplazamiento(): void {
    this.sincronizarControl();
    this.mostrarTemporalmente();
  }

  /** Oculta el indicador al abandonar la región cuando no existe un arrastre activo. */
  protected ocultarControl(): void {
    if (this.controlArrastrado()) return;

    this.cancelarOcultamiento();
    this.controlActivo.set(false);
  }

  /** Actualiza el tamaño y posición del indicador según el viewport vigente. */
  protected sincronizarControl(): void {
    const viewport = this.viewport().nativeElement;
    const pista = this.pista().nativeElement;
    const desplazamientoMaximo = viewport.scrollHeight - viewport.clientHeight;
    const alturaPista = pista.clientHeight;

    if (desplazamientoMaximo <= 0 || alturaPista <= 0) {
      this.cancelarOcultamiento();
      this.controlVisible.set(false);
      this.controlActivo.set(false);
      this.alturaControl.set(0);
      this.posicionControl.set(0);
      return;
    }

    const alturaMinima = Number.parseFloat(
      getComputedStyle(this.control().nativeElement).minHeight,
    );
    const proporcionVisible = viewport.clientHeight / viewport.scrollHeight;
    const alturaControl = Math.min(
      alturaPista,
      Math.max(Number.isFinite(alturaMinima) ? alturaMinima : 0, alturaPista * proporcionVisible),
    );
    const recorridoControl = alturaPista - alturaControl;
    const posicionControl = (viewport.scrollTop / desplazamientoMaximo) * recorridoControl;

    this.alturaControl.set(alturaControl);
    this.posicionControl.set(posicionControl);
    this.controlVisible.set(true);
  }

  /** Captura el puntero para permitir arrastrar únicamente la barrita visible. */
  protected iniciarArrastre(evento: PointerEvent): void {
    if (!this.controlVisible()) return;

    evento.preventDefault();
    const control = evento.currentTarget;
    if (!(control instanceof HTMLElement)) return;

    control.setPointerCapture(evento.pointerId);
    this.cancelarOcultamiento();
    this.arrastre = {
      punteroId: evento.pointerId,
      posicionInicial: evento.clientY,
      desplazamientoInicial: this.viewport().nativeElement.scrollTop,
    };
    this.controlActivo.set(true);
    this.controlArrastrado.set(true);
  }

  /** Traduce el movimiento del indicador al desplazamiento proporcional del contenido. */
  protected arrastrar(evento: PointerEvent): void {
    if (!this.arrastre || this.arrastre.punteroId !== evento.pointerId) return;

    const viewport = this.viewport().nativeElement;
    const recorridoControl = this.pista().nativeElement.clientHeight - this.alturaControl();
    const desplazamientoMaximo = viewport.scrollHeight - viewport.clientHeight;
    if (recorridoControl <= 0 || desplazamientoMaximo <= 0) return;

    const diferencia = evento.clientY - this.arrastre.posicionInicial;
    viewport.scrollTop =
      this.arrastre.desplazamientoInicial + diferencia * (desplazamientoMaximo / recorridoControl);
    this.sincronizarControl();
  }

  /** Finaliza el arrastre y devuelve el indicador a su estado ordinario. */
  protected finalizarArrastre(evento: PointerEvent): void {
    if (!this.arrastre || this.arrastre.punteroId !== evento.pointerId) return;

    const control = evento.currentTarget;
    if (!(control instanceof HTMLElement)) return;

    if (control.hasPointerCapture(evento.pointerId))
      control.releasePointerCapture(evento.pointerId);
    this.arrastre = null;
    this.controlArrastrado.set(false);
    this.mostrarTemporalmente();
  }

  /** Muestra temporalmente dentro del flujo actual. */
  private mostrarTemporalmente(): void {
    if (!this.controlVisible()) return;

    this.cancelarOcultamiento();
    this.controlActivo.set(true);
    this.temporizadorOcultar = setTimeout(() => {
      if (!this.controlArrastrado()) this.controlActivo.set(false);
      this.temporizadorOcultar = null;
    }, DURACION_VISIBILIDAD_SCROLLBAR_MS);
  }

  /** Cancela ocultamiento dentro del flujo actual. */
  private cancelarOcultamiento(): void {
    if (this.temporizadorOcultar === null) return;

    clearTimeout(this.temporizadorOcultar);
    this.temporizadorOcultar = null;
  }
}
