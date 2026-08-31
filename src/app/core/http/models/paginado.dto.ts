/** Refleja el contrato paginado común entregado por el backend. */
export interface PaginadoDto<T> {
  readonly registros: readonly T[] | null;
  readonly paginaActual: number;
  readonly paginaTamano: number;
  readonly totalRegistros: number;
  readonly paginas: number;
}
