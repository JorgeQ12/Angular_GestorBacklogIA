import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../icono/icono.component';
import { NombreIconoAplicacion } from '../icono/iconos-aplicacion';

let consecutivoEncabezadoPagina = 0;

/** Presenta la identidad, el contexto y las acciones principales de una página. */
@Component({
  selector: 'app-encabezado-pagina',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './encabezado-pagina.html',
})
export class EncabezadoPagina {
  private readonly identificadorPredeterminado = `encabezado-pagina-${++consecutivoEncabezadoPagina}`;

  /** Define el título principal de la página. */
  public readonly titulo = input.required<string>();

  /** Proporciona una categoría breve para contextualizar el título. */
  public readonly etiqueta = input<string | null>(null);

  /** Describe el propósito principal de la página. */
  public readonly descripcion = input<string | null>(null);

  /** Selecciona el icono que identifica la capacidad presentada. */
  public readonly icono = input<NombreIconoAplicacion | null>(null);

  /** Presenta información complementaria sobre el contexto vigente. */
  public readonly contexto = input<string | null>(null);

  /** Permite relacionar el encabezado con un identificador estable. */
  public readonly idTitulo = input(this.identificadorPredeterminado);
}
