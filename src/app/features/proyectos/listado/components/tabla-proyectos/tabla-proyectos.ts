import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { FechaPipe } from '../../../../../shared/fechas/pipes/fecha.pipe';
import { EstadoCatalogoProyecto } from '../../../models/estado-catalogo-proyecto.model';
import type { CambioPaginaListadoProyectos } from '../../models/consulta-listado-proyectos.model';
import type { ProyectoListado } from '../../models/proyecto-listado.model';

type ClaseEstadoProyecto =
  'es-borrador' | 'es-en-progreso' | 'es-finalizado' | 'es-cerrado' | 'es-desconocido';

/** Presenta los proyectos y emite únicamente las interacciones de sus filas. */
@Component({
  selector: 'app-tabla-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, FechaPipe],
  templateUrl: './tabla-proyectos.html',
  styleUrl: './tabla-proyectos.css',
})
export class TablaProyectos {
  /** Proporciona los registros de la página vigente. */
  public readonly proyectos = input.required<readonly ProyectoListado[]>();

  /** Proporciona la posición vigente dentro del resultado paginado. */
  public readonly paginaActual = input.required<number>();

  /** Proporciona el número total de páginas disponibles. */
  public readonly totalPaginas = input.required<number>();

  /** Solicita reanudar un borrador desde el recorrido de creación. */
  public readonly continuarBorrador = output<ProyectoListado>();

  /** Solicita consultar la información de un proyecto publicado. */
  public readonly consultarProyecto = output<ProyectoListado>();

  /** Solicita otra página sin conocer la URL que la representa. */
  public readonly paginaCambiada = output<CambioPaginaListadoProyectos>();

  /** Deriva el tratamiento semántico sin comparar literales desde la plantilla. */
  protected obtenerClaseEstado(proyecto: ProyectoListado): ClaseEstadoProyecto {
    if (proyecto.esBorrador) return 'es-borrador';

    switch (proyecto.estado) {
      case EstadoCatalogoProyecto.Borrador:
        return 'es-borrador';
      case EstadoCatalogoProyecto.EnProgreso:
        return 'es-en-progreso';
      case EstadoCatalogoProyecto.Finalizado:
        return 'es-finalizado';
      case EstadoCatalogoProyecto.Cerrado:
        return 'es-cerrado';
      default:
        return 'es-desconocido';
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
