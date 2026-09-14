/** Refleja la respuesta vigente de la administración de usuarios. */
export interface UsuarioDto {
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
