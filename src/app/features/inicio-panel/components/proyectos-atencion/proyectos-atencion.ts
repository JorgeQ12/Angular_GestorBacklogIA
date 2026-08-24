import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { FechaPipe } from '../../../../shared/fechas/pipes/fecha.pipe';
import { ProyectoInicioPanel } from '../../models/resumen-inicio-panel.model';

/** Presenta los proyectos que requieren una revisión prioritaria. */
@Component({
  selector: 'app-proyectos-atencion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, EstadoVacio, FechaPipe],
  templateUrl: './proyectos-atencion.html',
  styleUrl: './proyectos-atencion.css',
})
export class ProyectosAtencion {
  /** Proporciona los proyectos priorizados para el usuario vigente. */
  public readonly proyectos = input.required<readonly ProyectoInicioPanel[]>();

  /** Proporciona la cantidad de proyectos con fecha vencida. */
  public readonly vencidos = input(0);

  /** Proporciona la cantidad de proyectos próximos a vencer. */
  public readonly proximosAVencer = input(0);

  /** Solicita consultar el detalle del proyecto seleccionado. */
  public readonly seleccionarProyecto = output<ProyectoInicioPanel>();
}
