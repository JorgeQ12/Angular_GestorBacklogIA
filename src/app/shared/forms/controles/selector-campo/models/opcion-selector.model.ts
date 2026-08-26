/** Describe una opción neutral para controles de selección compartidos. */
export interface OpcionSelector {
  readonly valor: string | number;
  readonly etiqueta: string;
  readonly descripcion?: string;
  readonly deshabilitada?: boolean;
}
