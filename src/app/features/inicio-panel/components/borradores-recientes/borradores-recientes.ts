import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { TiempoRelativoPipe } from '../../../../shared/fechas/pipes/tiempo-relativo.pipe';
import { PASOS_CREACION_PROYECTO } from '../../../proyectos/creacion/config/pasos-creacion-proyecto.config';
import { obtenerPosicionVisualCreacion } from '../../../proyectos/creacion/mappers/estado-recorrido-creacion-proyecto.mapper';
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
  protected readonly totalPasos = PASOS_CREACION_PROYECTO.length;

  /** Proporciona los borradores disponibles para el usuario vigente. */
  public readonly borradores = input.required<readonly BorradorInicioPanel[]>();

  /** Proporciona la cantidad total de borradores disponibles. */
  public readonly total = input.required<number>();

  /** Solicita continuar la definición del borrador seleccionado. */
  public readonly continuarBorrador = output<BorradorInicioPanel>();

  /** Presenta el avance funcional dentro del recorrido que también incluye Azure. */
  protected posicionVisual(borrador: BorradorInicioPanel): number {
    return obtenerPosicionVisualCreacion(borrador.pasoActual);
  }

  /** Representa el avance porcentual del borrador. */
  protected progreso(borrador: BorradorInicioPanel): number {
    return (this.posicionVisual(borrador) / this.totalPasos) * 100;
  }
}
