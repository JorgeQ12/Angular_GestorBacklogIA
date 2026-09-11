import { TipoElementoPlanificacion } from './planificacion-proyecto.model';

/** Escalas temporales disponibles para explorar el cronograma. */
export enum EscalaGanttPlanificacion {
  Dia = 'dia',
  Semana = 'semana',
  Mes = 'mes',
  Trimestre = 'trimestre',
  Anio = 'anio',
}

/** Limita el cronograma a la jerarquía que representaba el Gantt original. */
export type TipoElementoGanttPlanificacion =
  | TipoElementoPlanificacion.Epica
  | TipoElementoPlanificacion.Caracteristica
  | TipoElementoPlanificacion.Historia
  | TipoElementoPlanificacion.Tarea;

/** Identifica un elemento del árbol que debe completar sus datos de planificación. */
export interface ReferenciaElementoGanttPlanificacion {
  readonly clave: string;
  readonly id: number;
  readonly clavePadre: string | null;
  readonly tituloPadre: string | null;
  readonly tipo: TipoElementoGanttPlanificacion;
  readonly nivel: number;
  readonly orden: number;
  readonly titulo: string;
  readonly activo: boolean;
  readonly tieneHijos: boolean;
}

/** Contiene una fila de trabajo y su periodo dentro del cronograma. */
export interface ElementoGanttPlanificacion extends ReferenciaElementoGanttPlanificacion {
  readonly fechaInicio: string;
  readonly fechaFinal: string;
  readonly estimacionHoras: number;
  readonly dependencias: string | null;
}

/** Agrupa la fotografía de planificación presentada por el Gantt. */
export interface GanttPlanificacion {
  readonly proyectoId: number;
  readonly nombreProyecto: string;
  readonly versionId: number;
  readonly numeroVersion: number;
  readonly esHistorica: boolean;
  readonly elementos: readonly ElementoGanttPlanificacion[];
}
