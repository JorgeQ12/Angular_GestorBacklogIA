/** Datos editables compartidos por catálogos y opciones. */
export interface DatosCatalogo {
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
  catalogoTipoNombre: string;
}
/** Identifica la entidad administrada sin inspeccionar la forma de respuestas HTTP. */
export enum ClaseCatalogo {
  Tipo = 'tipo',
  Valor = 'valor',
}
/** Contexto inmutable del editor; la identidad y el estado no son campos editables. */
export type EditorCatalogo =
  | { clase: ClaseCatalogo.Tipo; entidad: Catalogo | null }
  | { clase: ClaseCatalogo.Valor; entidad: ValorCatalogo | null; padre: Catalogo };
