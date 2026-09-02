/** Presenta la asociación inmutable que dio origen al proyecto. */
export interface VinculacionAzureProyectoResumen {
  readonly organizacion: string;
  readonly proyectoAzureNombre: string;
  readonly teamNombre: string;
  readonly boardUrl: string;
  readonly epicaAzureId: number;
  readonly urlEpica: string;
  readonly tituloEpica: string;
}

/** Reúne los valores capturados para consultar Azure durante la creación. */
export interface DatosVinculacionAzure {
  readonly urlBoard: string;
  readonly idEpica: number;
  readonly idEquipo: string | null;
}

/** Presenta la información encontrada antes de confirmar la asociación. */
export interface ResultadoVinculacionAzure {
  readonly organizacion: string;
  readonly nombreProyecto: string;
  readonly idEpica: number;
  readonly tituloEpica: string;
  readonly cantidadRevisiones: number;
  readonly nombreEquipo: string;
  readonly cantidadMiembros: number;
}
