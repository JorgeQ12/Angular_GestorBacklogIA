import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconoComponent } from '../../../components/icono/icono.component';
import { CONTROL_CAMPO_PERSONALIZADO, ControlCampoPersonalizado } from '../../errores-validacion';
import { OpcionSelector } from './models/opcion-selector.model';

/** Ofrece una selección accesible y reutilizable compatible con formularios Angular. */
@Component({
  selector: 'app-selector-campo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, IconoComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorCampo),
      multi: true,
    },
    {
      provide: CONTROL_CAMPO_PERSONALIZADO,
      useExisting: forwardRef(() => SelectorCampo),
    },
  ],
  templateUrl: './selector-campo.html',
  styleUrl: './selector-campo.css',
})
export class SelectorCampo implements ControlValueAccessor, ControlCampoPersonalizado {
  public readonly id = input.required<string>();
  public readonly opciones = input<readonly OpcionSelector[]>([]);
  public readonly placeholder = input('Selecciona una opción');
  public readonly etiquetadoPor = input<string>();

  protected readonly abierto = signal(false);
  protected readonly deshabilitado = signal(false);
  protected readonly conError = signal(false);
  protected readonly valor = signal<string | number | null>(null);
  protected readonly indiceActivo = signal(-1);
  protected readonly anchoOverlay = signal(0);
  protected readonly opcionSeleccionada = computed(() =>
    this.opciones().find((opcion) => opcion.valor === this.valor()),
  );
  protected readonly posiciones: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 6,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -6,
    },
  ];

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly elementosOpcion = viewChildren<ElementRef<HTMLButtonElement>>('opcionElemento');
  private notificarCambio: (valor: string | number | null) => void = () => undefined;
  private notificarTocado: () => void = () => undefined;

  /** Sincroniza el valor recibido desde el formulario. */
  public writeValue(valor: string | number | null): void {
    this.valor.set(valor);
  }

  /** Registra la función que recibirá los cambios del usuario. */
  public registerOnChange(funcion: (valor: string | number | null) => void): void {
    this.notificarCambio = funcion;
  }

  /** Registra la función que marcará la interacción del usuario. */
  public registerOnTouched(funcion: () => void): void {
    this.notificarTocado = funcion;
  }

  /** Sincroniza el estado deshabilitado administrado por el formulario. */
  public setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
    if (deshabilitado) this.abierto.set(false);
  }

  /** Entrega a la validación el botón que representa al control. */
  public obtenerElementoInteraccion(): HTMLElement | null {
    return this.trigger()?.nativeElement ?? null;
  }

  /** Refleja el error administrado por la directiva compartida. */
  public establecerEstadoError(activo: boolean): void {
    this.conError.set(activo);
  }

  /** Alterna la lista de opciones desde el disparador. */
  protected alternar(): void {
    if (this.deshabilitado()) return;
    this.abierto() ? this.cerrar() : this.abrir();
  }

  /** Abre la lista desde el teclado y prepara su opción activa. */
  protected manejarTeclaTrigger(evento: KeyboardEvent): void {
    if (this.deshabilitado()) return;

    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(evento.key)) {
      evento.preventDefault();
      this.abrir(evento.key === 'ArrowUp' ? 'ultima' : 'seleccionada');
    }
  }

  /** Mantiene la navegación dentro de las opciones disponibles. */
  protected manejarTeclaLista(evento: KeyboardEvent): void {
    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        this.moverActivo(1);
        break;
      case 'ArrowUp':
        evento.preventDefault();
        this.moverActivo(-1);
        break;
      case 'Home':
        evento.preventDefault();
        this.activarExtremo('primera');
        break;
      case 'End':
        evento.preventDefault();
        this.activarExtremo('ultima');
        break;
      case 'Enter':
      case ' ':
        evento.preventDefault();
        this.seleccionarIndice(this.indiceActivo());
        break;
      case 'Escape':
        evento.preventDefault();
        this.cerrar(true);
        break;
      case 'Tab':
        this.cerrar();
        break;
    }
  }

  /** Confirma una opción habilitada y comunica el cambio al formulario. */
  protected seleccionar(opcion: OpcionSelector): void {
    if (opcion.deshabilitada) return;
    this.valor.set(opcion.valor);
    this.notificarCambio(opcion.valor);
    this.notificarTocado();
    this.cerrar(true);
  }

  /** Completa el enfoque inicial cuando el overlay ya está disponible. */
  protected alAdjuntarOverlay(): void {
    this.enfocarOpcionActiva();
  }

  /** Cierra la lista desde interacciones externas. */
  protected cerrarDesdeExterior(): void {
    this.cerrar();
  }

  private abrir(preferencia: 'seleccionada' | 'ultima' = 'seleccionada'): void {
    const trigger = this.trigger()?.nativeElement;
    if (!trigger) return;

    this.anchoOverlay.set(trigger.getBoundingClientRect().width);
    const indiceSeleccionado = this.opciones().findIndex(
      (opcion) => opcion.valor === this.valor() && !opcion.deshabilitada,
    );
    this.indiceActivo.set(
      indiceSeleccionado >= 0
        ? indiceSeleccionado
        : this.obtenerIndiceExtremo(preferencia === 'ultima' ? 'ultima' : 'primera'),
    );
    this.abierto.set(true);
  }

  private cerrar(devolverFoco = false): void {
    if (!this.abierto()) return;
    this.abierto.set(false);
    this.notificarTocado();
    if (devolverFoco) queueMicrotask(() => this.trigger()?.nativeElement.focus());
  }

  private moverActivo(direccion: 1 | -1): void {
    const opciones = this.opciones();
    if (opciones.length === 0) return;

    let indice = this.indiceActivo();
    for (let recorrido = 0; recorrido < opciones.length; recorrido += 1) {
      indice = (indice + direccion + opciones.length) % opciones.length;
      if (!opciones[indice]?.deshabilitada) {
        this.indiceActivo.set(indice);
        this.enfocarOpcionActiva();
        return;
      }
    }
  }

  private activarExtremo(extremo: 'primera' | 'ultima'): void {
    this.indiceActivo.set(this.obtenerIndiceExtremo(extremo));
    this.enfocarOpcionActiva();
  }

  private obtenerIndiceExtremo(extremo: 'primera' | 'ultima'): number {
    const opciones = this.opciones();
    if (extremo === 'primera') return opciones.findIndex((opcion) => !opcion.deshabilitada);

    for (let indice = opciones.length - 1; indice >= 0; indice -= 1) {
      if (!opciones[indice]?.deshabilitada) return indice;
    }
    return -1;
  }

  private seleccionarIndice(indice: number): void {
    const opcion = this.opciones()[indice];
    if (opcion) this.seleccionar(opcion);
  }

  private enfocarOpcionActiva(): void {
    queueMicrotask(() => this.elementosOpcion()[this.indiceActivo()]?.nativeElement.focus());
  }
}
