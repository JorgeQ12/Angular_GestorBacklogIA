/** Datos del editor; el código solo se persiste durante la creación. */
export interface DatosCatalogo {
  codigo: string;
  nombre: string;
  descripcion: string;
}
/** Catálogo disponible para administración. */
export interface Catalogo extends DatosCatalogo {
  id: number;
  activo: boolean;
}
/** Opción asociada a un catálogo por su identidad persistida. */
export interface ValorCatalogo extends Catalogo {
  catalogoTipoId: number;
  catalogoTipoCodigo: string;
  catalogoTipoNombre: string;
}
/** Identifica la entidad administrada sin inspeccionar la forma de respuestas HTTP. */
export enum ClaseCatalogo {
  Tipo = 'tipo',
  Valor = 'valor',
}
/** Contexto del editor; código, identidad persistida y estado son inmutables al editar. */
export type EditorCatalogo =
  | { clase: ClaseCatalogo.Tipo; entidad: Catalogo | null }
  | { clase: ClaseCatalogo.Valor; entidad: ValorCatalogo | null; padre: Catalogo };
