/** Refleja una referencia resumida de catálogo entregada junto a un proyecto. */
export interface CatalogoProyectoResumenDto {
  readonly id: number;
  readonly codigo: string;
  readonly nombre: string;
  readonly descripcion: string;
}

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
