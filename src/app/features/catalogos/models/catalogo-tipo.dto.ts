/** Contrato de consulta y mutación de tipos del API Catalogo. */
export interface CatalogoTipoDto {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
