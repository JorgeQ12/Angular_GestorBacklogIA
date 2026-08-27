/** Identifica las plataformas principales admitidas para soluciones con interfaz. */
export enum PlataformaSolucion {
  Web = 'Web',
  Escritorio = 'Escritorio',
  Movil = 'Móvil',
}

/** Describe el canal principal definido para una solución. */
export interface TipoSolucionProyecto {
  readonly tieneInterfaz: boolean;
  readonly plataforma: PlataformaSolucion | null;
}
