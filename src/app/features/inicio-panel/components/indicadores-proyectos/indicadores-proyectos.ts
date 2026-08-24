import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import { IndicadoresInicioPanel } from '../../models/resumen-inicio-panel.model';

/** Presenta los indicadores principales de los proyectos disponibles. */
@Component({
  selector: 'app-indicadores-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './indicadores-proyectos.html',
  styleUrl: './indicadores-proyectos.css',
})
export class IndicadoresProyectos {
  /** Proporciona los valores agregados que se deben representar. */
  public readonly indicadores = input.required<IndicadoresInicioPanel>();
}
