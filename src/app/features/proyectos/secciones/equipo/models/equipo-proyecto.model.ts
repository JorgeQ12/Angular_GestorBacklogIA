/** Describe la identidad importada desde el Team vinculado en Azure DevOps. */
export interface IntegranteOrigenEquipoAzureProyecto {
  readonly idAzure: string;
  readonly nombre: string;
  readonly correo: string | null;
  readonly esAdministradorAzure: boolean;
}

/** Conserva el origen vigente utilizado para configurar el equipo del proyecto. */
export interface OrigenEquipoAzureProyecto {
  readonly idEquipo: string;
  readonly nombreEquipo: string;
  readonly integrantes: readonly IntegranteOrigenEquipoAzureProyecto[];
  readonly fechaSincronizacion: string | null;
}

/** Describe la configuración asignada a un integrante importado desde Azure. */
export interface IntegranteEquipoProyecto extends IntegranteOrigenEquipoAzureProyecto {
  readonly perfilTecnicoCodigo: string;
  readonly dedicacionCodigo: string;
}

/** Agrupa los integrantes configurados para participar en el proyecto. */
export interface EquipoProyecto {
  readonly integrantes: readonly IntegranteEquipoProyecto[];
}

/** Resume el avance de configuración presentado durante la edición. */
export interface ProgresoEquipoProyecto {
  readonly configurados: number;
  readonly pendientes: number;
}
