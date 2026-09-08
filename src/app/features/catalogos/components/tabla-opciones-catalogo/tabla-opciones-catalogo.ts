import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import type { ValorCatalogo } from '../../models/catalogo.model';

/** Presenta las opciones en una tabla administrativa responsiva y desplazable. */
@Component({
  selector: 'app-tabla-opciones-catalogo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './tabla-opciones-catalogo.html',
  styleUrl: './tabla-opciones-catalogo.css',
})
export class TablaOpcionesCatalogo {
  /** Registros visibles del catálogo seleccionado. */
  public readonly opciones = input.required<readonly ValorCatalogo[]>();

  /** Impide interacciones mientras la página confirma una operación. */
  public readonly bloqueado = input(false);

  /** Solicita editar una opción sin conocer el editor que la atiende. */
  public readonly editarOpcion = output<ValorCatalogo>();

  /** Solicita activar o desactivar una opción desde la página orquestadora. */
  public readonly cambiarEstadoOpcion = output<ValorCatalogo>();
}
