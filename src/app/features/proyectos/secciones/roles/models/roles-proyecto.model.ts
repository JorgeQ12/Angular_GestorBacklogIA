/** Describe un perfil funcional que participa en el proyecto. */
export interface RolProyecto {
  readonly nombre: string;
  readonly descripcion: string;
}

/** Agrupa los perfiles funcionales definidos para el proyecto. */
export interface RolesProyecto {
  readonly roles: readonly RolProyecto[];
}
