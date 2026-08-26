/** Refleja un valor de catálogo entregado por el backend. */
export interface CatalogoValorDto {
  id: number;
  catalogoTipoId: number;
  catalogoTipoNombre: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
