/** Datos editables de una persona administrada localmente. */
export interface DatosUsuario {
  readonly idAzure: string;
  readonly nombre: string;
  readonly correo: string;
  readonly perfilTecnicoId: number | null;
  readonly limiteTokensMensual: number | null;
}

/** Usuario presentado por la administración local. */
export interface Usuario {
  readonly id: number;
  readonly idAzure: string | null;
  readonly nombre: string;
  readonly correo: string | null;
  readonly perfilTecnicoId: number | null;
  readonly perfilTecnicoCodigo: string | null;
  readonly perfilTecnicoNombre: string | null;
  readonly limiteTokensMensual: number | null;
  readonly activo: boolean;
  readonly fechaCreacion: string;
  readonly fechaActualizacion: string | null;
}

/** Contexto inmutable utilizado para crear o editar un usuario. */
export interface EditorUsuario {
  readonly entidad: Usuario | null;
}
