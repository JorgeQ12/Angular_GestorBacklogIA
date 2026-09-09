import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  IndicadorEstado,
  type TonoIndicadorEstado,
} from '../../../../../shared/components/indicador-estado/indicador-estado';
import { FechaPipe } from '../../../../../shared/fechas/pipes/fecha.pipe';
import { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import type { CambioPaginaProyectos } from '../../models/consulta-proyectos.model';
import type { ResumenProyecto } from '../../models/resumen-proyecto.model';

/** Presenta los proyectos y emite únicamente las interacciones de sus filas. */
@Component({
  selector: 'app-tabla-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, IndicadorEstado, FechaPipe],
  templateUrl: './tabla-proyectos.html',
  styleUrl: './tabla-proyectos.css',
})
export class TablaProyectos {
  /** Proporciona los registros de la página vigente. */
  public readonly proyectos = input.required<readonly ResumenProyecto[]>();

  /** Proporciona la posición vigente dentro del resultado paginado. */
  public readonly paginaActual = input.required<number>();

  /** Proporciona el número total de páginas disponibles. */
  public readonly totalPaginas = input.required<number>();

  /** Solicita reanudar un borrador desde el recorrido de creación. */
  public readonly continuarBorrador = output<ResumenProyecto>();

  /** Solicita consultar la información de un proyecto publicado. */
  public readonly consultarProyecto = output<ResumenProyecto>();

  /** Solicita otra página sin conocer la URL que la representa. */
  public readonly paginaCambiada = output<CambioPaginaProyectos>();

  /** Traduce el estado del dominio al tono visual compartido. */
  protected obtenerTonoEstado(proyecto: ResumenProyecto): TonoIndicadorEstado {
    if (proyecto.esBorrador) return 'neutral';

    switch (proyecto.estado) {
      case EstadoCatalogoProyecto.EnProgreso:
        return 'informativo';
      case EstadoCatalogoProyecto.Finalizado:
        return 'positivo';
      default:
        return 'neutral';
    }
  }

  /** Abre la página anterior cuando existe. */
  protected anterior(): void {
    if (this.paginaActual() > 1) this.paginaCambiada.emit({ pagina: this.paginaActual() - 1 });
  }

  /** Abre la página siguiente cuando existe. */
  protected siguiente(): void {
    if (this.paginaActual() < this.totalPaginas()) {
      this.paginaCambiada.emit({ pagina: this.paginaActual() + 1 });
    }
  }
}
