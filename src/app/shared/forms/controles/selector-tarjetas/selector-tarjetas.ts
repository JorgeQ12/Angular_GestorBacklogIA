import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconoComponent } from '../../../components/icono/icono.component';
import { CONTROL_CAMPO_PERSONALIZADO, ControlCampoPersonalizado } from '../../errores-validacion';
import {
  OpcionSelectorTarjeta,
  ValorSelectorTarjeta,
} from './models/opcion-selector-tarjeta.model';

/** Presenta opciones excluyentes como tarjetas accesibles para formularios reactivos. */
@Component({
  selector: 'app-selector-tarjetas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorTarjetas),
      multi: true,
    },
    {
      provide: CONTROL_CAMPO_PERSONALIZADO,
      useExisting: forwardRef(() => SelectorTarjetas),
    },
  ],
  templateUrl: './selector-tarjetas.html',
  styleUrl: './selector-tarjetas.css',
})
export class SelectorTarjetas implements ControlValueAccessor, ControlCampoPersonalizado {
  public readonly id = input.required<string>();
  public readonly opciones = input<readonly OpcionSelectorTarjeta[]>([]);
  public readonly etiquetadoPor = input<string>();
  public readonly columnas = input<2 | 3>(2);

  /** Conserva la alternativa seleccionada sin permitir cambios. */
  public readonly soloLectura = input(false);

  protected readonly valor = signal<ValorSelectorTarjeta | null>(null);
  protected readonly deshabilitado = signal(false);
  protected readonly conError = signal(false);

  private readonly grupo = viewChild<ElementRef<HTMLElement>>('grupo');
  private notificarCambio: (valor: ValorSelectorTarjeta | null) => void = () => undefined;
  private notificarTocado: () => void = () => undefined;

  /** Sincroniza el valor recibido desde el formulario. */
  public writeValue(valor: ValorSelectorTarjeta | null): void {
    this.valor.set(valor);
  }

  /** Registra la función que recibirá los cambios del usuario. */
  public registerOnChange(funcion: (valor: ValorSelectorTarjeta | null) => void): void {
    this.notificarCambio = funcion;
  }

  /** Registra la función que marcará la interacción del usuario. */
  public registerOnTouched(funcion: () => void): void {
    this.notificarTocado = funcion;
  }

  /** Sincroniza el estado deshabilitado administrado por el formulario. */
  public setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  /** Entrega a la validación el grupo que representa la selección. */
  public obtenerElementoInteraccion(): HTMLElement | null {
    return this.grupo()?.nativeElement ?? null;
  }

  /** Refleja el error administrado por la directiva compartida. */
  public establecerEstadoError(activo: boolean): void {
    this.conError.set(activo);
  }

  /** Confirma una opción habilitada y comunica el cambio al formulario. */
  protected seleccionar(opcion: OpcionSelectorTarjeta): void {
    if (this.soloLectura() || this.deshabilitado() || opcion.deshabilitada) return;
    this.valor.set(opcion.valor);
    this.notificarCambio(opcion.valor);
    this.notificarTocado();
  }

  /** Informa que el usuario abandonó una opción del grupo. */
  protected marcarTocado(): void {
    if (!this.soloLectura()) this.notificarTocado();
  }

  /** Evita que el comportamiento nativo del radio altere una selección de consulta. */
  protected impedirSeleccionEnLectura(evento: Event): void {
    if (this.soloLectura()) evento.preventDefault();
  }
}
