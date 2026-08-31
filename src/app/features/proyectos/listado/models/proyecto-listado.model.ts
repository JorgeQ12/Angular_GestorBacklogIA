import type { ProgresoCreacionProyecto } from '../../models/progreso-creacion-proyecto.model';

/** Describe una fila del portafolio independiente del contrato HTTP. */
export interface ProyectoListado {
  readonly id: number;
  readonly nombre: string;
  readonly responsable: string;
  readonly estado: string;
  readonly prioridad: string;
  readonly fechaObjetivo: string | null;
  readonly tieneBacklog: boolean;
  readonly esBorrador: boolean;
  readonly progresoCreacion: ProgresoCreacionProyecto | null;
}

/** Representa la página de proyectos consumida por la interfaz. */
export interface PaginaListadoProyectos {
  readonly proyectos: readonly ProyectoListado[];
  readonly paginaActual: number;
  readonly paginaTamano: number;
  readonly totalRegistros: number;
  readonly totalPaginas: number;
}
