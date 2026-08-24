import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { TiempoRelativoPipe } from '../../../../shared/fechas/pipes/tiempo-relativo.pipe';
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
  /** Proporciona los borradores disponibles para el usuario vigente. */
  public readonly borradores = input.required<readonly BorradorInicioPanel[]>();

  /** Proporciona la cantidad total de borradores disponibles. */
  public readonly total = input.required<number>();

  /** Solicita continuar la definición del borrador seleccionado. */
  public readonly continuarBorrador = output<BorradorInicioPanel>();

  /** Normaliza el paso dentro del recorrido disponible. */
  protected paso(borrador: BorradorInicioPanel): number {
    return Math.min(10, Math.max(1, borrador.pasoActual || 1));
  }

  /** Representa el avance porcentual del borrador. */
  protected progreso(borrador: BorradorInicioPanel): number {
    return this.paso(borrador) * 10;
  }
}
