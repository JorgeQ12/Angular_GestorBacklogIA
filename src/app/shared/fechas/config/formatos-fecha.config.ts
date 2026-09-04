/** Centraliza los formatos visuales de fecha disponibles en la aplicación. */
export const FORMATOS_FECHA = {
  breve: {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
  completa: {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  extendida: {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  },
  mesAnio: {
    month: 'long',
    year: 'numeric',
  },
  hora: {
    hour: 'numeric',
    minute: '2-digit',
  },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/** Identifica un formato visual de fecha registrado. */
export type FormatoFecha = keyof typeof FORMATOS_FECHA;
