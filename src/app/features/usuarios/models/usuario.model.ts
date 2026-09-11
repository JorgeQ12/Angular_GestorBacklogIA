/** Representa un usuario administrable independiente del contrato HTTP. */
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

/** Agrupa únicamente los datos que la administración permite persistir. */
export interface DatosUsuario {
  readonly idAzure: string;
  readonly nombre: string;
  readonly correo: string | null;
  readonly perfilTecnicoId: number;
  readonly limiteTokensMensual: number | null;
}

/** Conserva la nulabilidad necesaria mientras el formulario está incompleto. */
export interface ValoresFormularioUsuario {
  readonly idAzure: string;
  readonly nombre: string;
  readonly correo: string;
  readonly perfilTecnicoId: number | null;
  readonly limiteTokensMensual: number | null;
}
