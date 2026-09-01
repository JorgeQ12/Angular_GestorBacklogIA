import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconoComponent } from '../icono/icono.component';
import type { NombreIconoAplicacion } from '../icono/iconos-aplicacion';

let consecutivoModal = 0;

const SELECTOR_ELEMENTO_ENFOCABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export type TamanoModal = 'sm' | 'md' | 'lg' | 'xl';
export type RolModal = 'dialog' | 'alertdialog';
export type VarianteConfirmacionModal = 'primary' | 'danger';

/** Presenta contenido de dominio dentro de un diálogo accesible y reutilizable. */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  host: {
    '(document:keydown)': 'gestionarTeclado($event)',
  },
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements AfterViewInit, OnDestroy {
  private readonly documento = inject(DOCUMENT);
  private readonly dialogo = viewChild.required<ElementRef<HTMLElement>>('dialogo');
  private readonly overlay = viewChild.required<ElementRef<HTMLElement>>('overlay');
  private readonly identificador = ++consecutivoModal;
  private elementoConFocoAnterior: HTMLElement | null = null;
  private overflowAnterior = '';

  /** Define el encabezado principal anunciado por las tecnologías de asistencia. */
  public readonly titulo = input.required<string>();

  /** Añade un contexto breve sobre la finalidad del diálogo. */
  public readonly etiqueta = input<string | null>(null);

  /** Proporciona información complementaria asociada al título. */
  public readonly descripcion = input<string | null>(null);

  /** Selecciona el icono semántico del encabezado. */
  public readonly icono = input<NombreIconoAplicacion | null>(null);

  /** Ajusta el ancho del diálogo sin alterar su comportamiento. */
  public readonly tamano = input<TamanoModal>('md');

  /** Comunica si el contenido requiere atención inmediata. */
  public readonly rol = input<RolModal>('dialog');

  /** Permite descartar el diálogo mediante Escape, backdrop o el botón superior. */
  public readonly descartable = input(true);

  /** Permite que Escape o un clic directo en el backdrop soliciten el cierre. */
  public readonly cierreExteriorHabilitado = input(true);

  /** Vincula la acción principal con un formulario proyectado. */
  public readonly idFormulario = input<string | null>(null);

  /** Configura el texto de la acción de cancelación. */
  public readonly textoCancelar = input('Cancelar');

  /** Configura el texto de la acción principal. */
  public readonly textoConfirmar = input('Guardar');

  /** Añade un icono a la acción principal cuando aporta significado. */
  public readonly iconoConfirmar = input<NombreIconoAplicacion | null>('confirmar');

  /** Controla la disponibilidad de la acción principal. */
  public readonly confirmacionDeshabilitada = input(false);

  /** Expresa la intención visual de la acción principal. */
  public readonly varianteConfirmacion = input<VarianteConfirmacionModal>('primary');

  /** Controla la presencia de la región destinada al contenido proyectado. */
  public readonly mostrarCuerpo = input(true);

  /** Controla la presencia de la acción de cancelación. */
  public readonly mostrarCancelar = input(true);

  /** Controla la presencia de la acción principal. */
  public readonly mostrarConfirmar = input(true);

  /** Solicita al contenedor cerrar o cancelar el flujo actual. */
  public readonly cerrar = output<void>();

  /** Comunica la acción principal cuando no pertenece a un formulario. */
  public readonly confirmar = output<void>();

  protected readonly idTitulo = `modal-titulo-${this.identificador}`;
  protected readonly idDescripcion = `modal-descripcion-${this.identificador}`;

  /** Lleva el foco al diálogo y bloquea el desplazamiento del documento. */
  public ngAfterViewInit(): void {
    const elementoActivo = this.documento.activeElement;

    this.elementoConFocoAnterior = elementoActivo instanceof HTMLElement ? elementoActivo : null;
    this.overflowAnterior = this.documento.body.style.overflow;
    this.documento.body.style.overflow = 'hidden';
    this.dialogo().nativeElement.focus();
  }

  /** Restablece el documento cuando el diálogo deja de presentarse. */
  public ngOnDestroy(): void {
    this.documento.body.style.overflow = this.overflowAnterior;

    if (this.elementoConFocoAnterior?.isConnected) {
      this.elementoConFocoAnterior.focus();
    }
  }

  /** Cierra el diálogo cuando el usuario selecciona directamente el backdrop. */
  protected gestionarBackdrop(evento: MouseEvent): void {
    if (
      this.descartable() &&
      this.cierreExteriorHabilitado() &&
      evento.target === evento.currentTarget &&
      this.esModalSuperior()
    ) {
      this.cerrar.emit();
    }
  }

  /** Mantiene la navegación por teclado dentro del diálogo activo. */
  protected gestionarTeclado(evento: KeyboardEvent): void {
    if (!this.esModalSuperior()) {
      return;
    }

    if (evento.key === 'Escape' && this.descartable() && this.cierreExteriorHabilitado()) {
      evento.preventDefault();
      this.cerrar.emit();
      return;
    }

    if (evento.key === 'Tab') {
      this.conservarFoco(evento);
    }
  }

  /** Ejecuta la confirmación cuando la acción no envía un formulario externo. */
  protected gestionarConfirmacion(): void {
    if (!this.idFormulario()) {
      this.confirmar.emit();
    }
  }

  private conservarFoco(evento: KeyboardEvent): void {
    const dialogo = this.dialogo().nativeElement;
    const elementos = Array.from(
      dialogo.querySelectorAll<HTMLElement>(SELECTOR_ELEMENTO_ENFOCABLE),
    );

    if (!elementos.length) {
      evento.preventDefault();
      dialogo.focus();
      return;
    }

    const primero = elementos[0];
    const ultimo = elementos[elementos.length - 1];
    const activo = this.documento.activeElement;

    if (evento.shiftKey && (activo === primero || !dialogo.contains(activo))) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && (activo === ultimo || !dialogo.contains(activo))) {
      evento.preventDefault();
      primero.focus();
    }
  }

  private esModalSuperior(): boolean {
    const modales = this.documento.querySelectorAll<HTMLElement>('[data-app-modal]');
    return modales.item(modales.length - 1) === this.overlay().nativeElement;
  }
}
