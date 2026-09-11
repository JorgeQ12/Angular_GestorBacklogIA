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
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly contenido = viewChild.required<ElementRef<HTMLElement>>('contenido');
  private readonly pista = viewChild.required<ElementRef<HTMLElement>>('pista');
  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');
  private observadorTamano: ResizeObserver | null = null;
  private arrastre: ArrastreScrollbar | null = null;
  private temporizadorOcultar: ReturnType<typeof setTimeout> | null = null;

  /** Proporciona el nombre accesible de la región que recibe el desplazamiento. */
  public readonly etiqueta = input.required<string>();

  protected readonly controlVisible = signal(false);
  protected readonly controlActivo = signal(false);
  protected readonly controlArrastrado = signal(false);
  protected readonly alturaControl = signal(0);
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

  private mostrarTemporalmente(): void {
    if (!this.controlVisible()) return;

    this.cancelarOcultamiento();
    this.controlActivo.set(true);
    this.temporizadorOcultar = setTimeout(() => {
      if (!this.controlArrastrado()) this.controlActivo.set(false);
      this.temporizadorOcultar = null;
    }, DURACION_VISIBILIDAD_SCROLLBAR_MS);
  }

  private cancelarOcultamiento(): void {
    if (this.temporizadorOcultar === null) return;

    clearTimeout(this.temporizadorOcultar);
    this.temporizadorOcultar = null;
  }
}
