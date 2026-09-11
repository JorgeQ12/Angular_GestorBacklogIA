/** Refleja un valor de catálogo entregado por el backend. */
export interface CatalogoValorDto {
  id: number;
  codigo: string;
  catalogoTipoId: number;
  catalogoTipoCodigo: string;
  catalogoTipoNombre: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
