import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../icono/icono.component';

/** Presenta una falla de carga mediante una experiencia reutilizable. */
@Component({
  selector: 'app-estado-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './estado-error.html',
  styleUrl: './estado-error.css',
})
export class EstadoError {
  /** Proporciona el mensaje principal de la falla. */
  public readonly titulo = input('No fue posible obtener la información');

  /** Proporciona una orientación breve para el usuario. */
  public readonly descripcion = input('Intenta nuevamente en unos momentos.');

  /** Habilita la recuperación manual del contenido. */
  public readonly reintentable = input(false);

  /** Solicita repetir la operación que produjo la falla. */
  public readonly reintentar = output<void>();
}
