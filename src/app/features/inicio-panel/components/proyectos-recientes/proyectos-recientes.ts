import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { FechaPipe } from '../../../../shared/fechas/pipes/fecha.pipe';
import { ProyectoInicioPanel } from '../../models/resumen-inicio-panel.model';

/** Presenta los proyectos recientes disponibles para continuar su gestión. */
@Component({
  selector: 'app-proyectos-recientes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, EstadoVacio, FechaPipe],
  templateUrl: './proyectos-recientes.html',
  styleUrl: './proyectos-recientes.css',
})
export class ProyectosRecientes {
  /** Proporciona los proyectos recientes que se deben representar. */
  public readonly proyectos = input.required<readonly ProyectoInicioPanel[]>();

  /** Solicita consultar todos los proyectos disponibles. */
  public readonly verTodos = output<void>();

  /** Solicita consultar el detalle del proyecto seleccionado. */
  public readonly seleccionarProyecto = output<ProyectoInicioPanel>();
}
