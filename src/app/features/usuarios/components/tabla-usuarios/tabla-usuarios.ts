import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { IndicadorEstado } from '../../../../shared/components/indicador-estado/indicador-estado';
import {
  RegionDesplazable,
} from '../../../../shared/components/region-desplazable/region-desplazable';
import type { Usuario } from '../../models/usuario.model';

/** Presenta usuarios en una tabla administrativa sin conocer sus casos de uso. */
@Component({
  selector: 'app-tabla-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, IconoComponent, IndicadorEstado, RegionDesplazable],
  templateUrl: './tabla-usuarios.html',
  styleUrl: './tabla-usuarios.css',
})
export class TablaUsuarios {
  /** Registros visibles después de aplicar los criterios de la página. */
  public readonly usuarios = input.required<readonly Usuario[]>();

  /** Impide acciones mientras una mutación remota está en curso. */
  public readonly bloqueado = input(false);

  /** Solicita editar el registro seleccionado. */
  public readonly editarUsuario = output<Usuario>();

  /** Solicita activar o desactivar el registro seleccionado. */
  public readonly cambiarEstadoUsuario = output<Usuario>();
}
