import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../../../components/icono/icono.component';

/** Presenta una fila numerada y eliminable para colecciones de formulario. */
@Component({
  selector: 'app-fila-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  host: {
    '[class.fila-formulario--campos-etiquetados]': 'camposEtiquetados()',
    '[class.fila-formulario--solo-lectura]': 'soloLectura()',
  },
  templateUrl: './fila-formulario.html',
  styleUrl: './fila-formulario.css',
})
export class FilaFormulario {
  /** Identifica la posición visible del elemento dentro de la colección. */
  public readonly numero = input.required<number>();

  /** Ajusta las acciones cuando el contenido presenta etiquetas sobre los controles. */
  public readonly camposEtiquetados = input(false);

  /** Indica si la colección permite retirar el elemento vigente. */
  public readonly eliminable = input(true);

  /** Bloquea la eliminación mientras el formulario procesa otra operación. */
  public readonly procesando = input(false);

  /** Oculta la operación de retiro cuando la colección se presenta para consulta. */
  public readonly soloLectura = input(false);

  /** Describe la eliminación para tecnologías de asistencia. */
  public readonly etiquetaEliminar = input.required<string>();

  /** Solicita retirar el elemento desde el formulario propietario. */
  public readonly eliminar = output<void>();
}
