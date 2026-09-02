import type { CatalogoProyectoResumenDto } from '../../models/catalogo-proyecto-resumen.dto';

/** Refleja un registro de ObtenerProyectos. */
export interface ProyectoListadoDto {
  readonly id: number;
  readonly nombre: string;
  readonly responsable: string;
  readonly prioridadCatalogoId: number;
  readonly prioridadCatalogo: CatalogoProyectoResumenDto | null;
  readonly estadoCatalogoId: number;
  readonly estadoCatalogo: CatalogoProyectoResumenDto | null;
  readonly estado: string;
  readonly fechaObjetivo: string | null;
  readonly tieneBacklog: boolean;
  readonly esBorrador: boolean;
  readonly pasoActual: number | null;
}
