/** Representa la identidad y los datos base de un proyecto. */
export interface ContextoProyecto {
  readonly nombre: string;
  readonly responsable: string;
  readonly fechaObjetivo: string;
  readonly prioridadCatalogoId: number | null;
  readonly descripcion: string;
}
