/** Refleja el contrato de lectura entregado por el API Usuario. */
export interface UsuarioDto {
  id: number;
  idAzure: string | null;
  nombre: string;
  correo: string | null;
  perfilTecnicoId: number | null;
  perfilTecnicoCodigo: string | null;
  perfilTecnicoNombre: string | null;
  limiteTokensMensual: number | null;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

/** Cuerpo admitido por la creación de usuarios. */
export interface CrearUsuarioDto {
  idAzure: string;
  nombre: string;
  correo: string | null;
  perfilTecnicoId: number;
  limiteTokensMensual: number | null;
  activo: boolean;
}

/** Cuerpo admitido por la actualización; la identidad Azure es inmutable. */
export interface ActualizarUsuarioDto {
  id: number;
  nombre: string;
  correo: string | null;
  perfilTecnicoId: number;
  limiteTokensMensual: number | null;
  activo: boolean;
}
