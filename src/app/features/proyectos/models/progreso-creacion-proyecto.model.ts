/** Representa el avance público de un proyecto sin exponer la configuración del recorrido. */
export interface ProgresoCreacionProyecto {
  readonly posicion: number;
  readonly total: number;
  readonly porcentaje: number;
}
