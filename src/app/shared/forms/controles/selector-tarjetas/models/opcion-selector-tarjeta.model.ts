import type { NombreIconoAplicacion } from '../../../../components/icono/iconos-aplicacion';

/** Limita los valores que puede comunicar una selección mediante tarjetas. */
export type ValorSelectorTarjeta = string | number | boolean;

/** Describe una opción visual sin incorporar conocimiento de una feature. */
export interface OpcionSelectorTarjeta {
  readonly valor: ValorSelectorTarjeta;
  readonly etiqueta: string;
  readonly descripcion: string;
  readonly icono: NombreIconoAplicacion;
  readonly categoria?: string;
  readonly deshabilitada?: boolean;
}
