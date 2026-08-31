import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconoComponent } from '../../../components/icono/icono.component';

/** Proporciona búsquedas consistentes e integradas con formularios reactivos. */
@Component({
  selector: 'app-campo-busqueda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoBusqueda),
      multi: true,
    },
  ],
  templateUrl: './campo-busqueda.html',
  styleUrl: './campo-busqueda.css',
})
export class CampoBusqueda implements ControlValueAccessor {
  /** Identifica el campo y su etiqueta accesible. */
  public readonly id = input.required<string>();

  /** Describe el criterio que permite localizar el campo. */
  public readonly etiqueta = input('Buscar');

  /** Orienta sobre el contenido admitido por la búsqueda. */
  public readonly placeholder = input('Buscar');

  /** Comunica al navegador la longitud mínima útil para el criterio. */
  public readonly longitudMinima = input<number>();

  protected readonly valor = signal('');
  protected readonly deshabilitado = signal(false);

  private notificarCambio: (valor: string) => void = () => undefined;
  private notificarTocado: () => void = () => undefined;

  /** Sincroniza el término proporcionado por el formulario. */
  public writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }

  /** Registra el destino de los cambios realizados en el buscador. */
  public registerOnChange(funcion: (valor: string) => void): void {
    this.notificarCambio = funcion;
  }

  /** Registra el destino del estado de interacción. */
  public registerOnTouched(funcion: () => void): void {
    this.notificarTocado = funcion;
  }

  /** Refleja la disponibilidad administrada por el formulario. */
  public setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  /** Mantiene el formulario alineado con el término escrito. */
  protected actualizarValor(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.valor.set(valor);
    this.notificarCambio(valor);
  }

  /** Comunica que el usuario terminó de interactuar con el campo. */
  protected marcarTocado(): void {
    this.notificarTocado();
  }
}
