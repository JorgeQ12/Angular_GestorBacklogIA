/** Reúne los valores capturados para consultar Azure. */
export interface DatosVinculacionAzure {
  urlBoard: string;
  idEpica: number;
  idEquipo: string | null;
}

/** Presenta la información encontrada al validar la vinculación. */
export interface ResultadoVinculacionAzure {
  organizacion: string;
  nombreProyecto: string;
  idEpica: number;
  tituloEpica: string;
  cantidadRevisiones: number;
  nombreEquipo: string;
  cantidadMiembros: number;
}
