import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import {
  ESTADOS_PROYECTO,
  EstadoProyecto,
  IndicadoresInicioPanel,
} from '../../models/resumen-inicio-panel.model';

interface EstadoRepresentado {
  estado: EstadoProyecto;
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
  clase: string;
}

/** Presenta la distribución y cobertura de los proyectos disponibles. */
@Component({
  selector: 'app-estado-proyectos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './estado-proyectos.html',
  styleUrl: './estado-proyectos.css',
})
export class EstadoProyectos {
  /** Proporciona los valores utilizados para construir la distribución. */
  public readonly indicadores = input.required<IndicadoresInicioPanel>();

  /** Solicita consultar todos los proyectos disponibles. */
  public readonly verProyectos = output<void>();

  /** Solicita consultar los proyectos asociados a un estado. */
  public readonly seleccionarEstado = output<EstadoProyecto>();

  /** Expone los estados con sus cantidades y proporciones normalizadas. */
  protected readonly estados = computed<readonly EstadoRepresentado[]>(() => [
    this.construirEstado(ESTADOS_PROYECTO.nuevo, 'Nuevos', this.indicadores().nuevos, 'es-nuevo'),
    this.construirEstado(
      ESTADOS_PROYECTO.activo,
      'Activos',
      this.indicadores().activos,
      'es-activo',
    ),
    this.construirEstado(
      ESTADOS_PROYECTO.finalizado,
      'Finalizados',
      this.indicadores().finalizados,
      'es-finalizado',
    ),
    this.construirEstado(
      ESTADOS_PROYECTO.cerrado,
      'Cerrados',
      this.indicadores().cerrados,
      'es-cerrado',
    ),
  ]);

  /** Representa el porcentaje de proyectos cuya preparación de backlog está disponible. */
  protected readonly coberturaBacklog = computed(() =>
    this.calcularPorcentaje(this.indicadores().conBacklog),
  );

  private construirEstado(
    estado: EstadoProyecto,
    etiqueta: string,
    cantidad: number,
    clase: string,
  ): EstadoRepresentado {
    return {
      estado,
      etiqueta,
      cantidad,
      porcentaje: this.calcularPorcentaje(cantidad),
      clase,
    };
  }

  private calcularPorcentaje(cantidad: number): number {
    const total = this.indicadores().totalProyectos;
    return total > 0 ? Math.min(100, Math.round((cantidad / total) * 100)) : 0;
  }
}
