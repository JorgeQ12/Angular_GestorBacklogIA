/** Describe una fecha visible dentro de la cuadrícula mensual. */
export interface DiaCalendario {
  readonly fecha: string;
  readonly numero: number;
  readonly otroMes: boolean;
  readonly deshabilitado: boolean;
  readonly hoy: boolean;
  readonly seleccionado: boolean;
}
