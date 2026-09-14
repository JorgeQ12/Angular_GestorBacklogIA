import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FechaPipe } from '../../../../shared/fechas/pipes/fecha.pipe';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { IndicadorEstado } from '../../../../shared/components/indicador-estado/indicador-estado';
import { RegionDesplazable } from '../../../../shared/components/region-desplazable/region-desplazable';
import type { Usuario } from '../../models/usuario.model';

/** Presenta usuarios y acciones administrativas sin conocer persistencia. */
@Component({
  selector: 'app-tabla-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FechaPipe, IconoComponent, IndicadorEstado, RegionDesplazable],
  templateUrl: './tabla-usuarios.html',
  styleUrl: './tabla-usuarios.css',
})
export class TablaUsuarios {
  /** Registros que cumplen los filtros actuales. */
  public readonly usuarios = input.required<readonly Usuario[]>();

  /** Impide acciones mientras existe una operación remota. */
  public readonly bloqueado = input(false);

  /** Solicita abrir la edición de un registro confirmado. */
  public readonly editarUsuario = output<Usuario>();

  /** Solicita activar o inactivar el registro seleccionado. */
  public readonly cambiarEstadoUsuario = output<Usuario>();

  /** Representa el límite configurado sin confundir cero con ausencia de límite. */
  protected presentarLimite(limite: number | null): string {
    return limite === null ? 'Sin límite' : limite.toLocaleString('es-CO');
  }
}
