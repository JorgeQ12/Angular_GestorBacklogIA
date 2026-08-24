/** Representa el sobre común utilizado por las respuestas del backend. */
export interface ResultadoApi<T> {
  exitoso: boolean;
  tipo: number;
  datos: T | null;
  mensaje: string | null;
  codigoError: string | null;
  errores: readonly string[] | null;
}
