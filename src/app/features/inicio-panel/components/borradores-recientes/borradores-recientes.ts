import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { TiempoRelativoPipe } from '../../../../shared/fechas/pipes/tiempo-relativo.pipe';
import { obtenerProgresoCreacionProyecto } from '../../../proyectos/public-api';
import { BorradorInicioPanel } from '../../models/resumen-inicio-panel.model';

/** Presenta los borradores que pueden continuar su definición. */
@Component({
  selector: 'app-borradores-recientes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, EstadoVacio, TiempoRelativoPipe],
  templateUrl: './borradores-recientes.html',
  styleUrl: './borradores-recientes.css',
})
export class BorradoresRecientes {
  protected readonly obtenerProgreso = obtenerProgresoCreacionProyecto;

  /** Proporciona los borradores disponibles para el usuario vigente. */
  public readonly borradores = input.required<readonly BorradorInicioPanel[]>();

  /** Proporciona la cantidad total de borradores disponibles. */
  public readonly total = input.required<number>();

  /** Solicita continuar la definición del borrador seleccionado. */
  public readonly continuarBorrador = output<BorradorInicioPanel>();
}
