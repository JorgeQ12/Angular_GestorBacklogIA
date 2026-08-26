/** Identifica las plataformas principales admitidas para soluciones con interfaz. */
export type PlataformaSolucion = 'Web' | 'Escritorio' | 'Móvil';

/** Describe el canal principal definido para una solución. */
export interface TipoSolucionProyecto {
  readonly tieneInterfaz: boolean;
  readonly plataforma: PlataformaSolucion | null;
}
