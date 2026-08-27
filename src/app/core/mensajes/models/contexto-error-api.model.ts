/** Describe el mensaje de respaldo de una operación que consume el API. */
export interface ContextoErrorApi {
  readonly titulo: string;
  readonly descripcion: string;
  readonly mensajesPorCodigo?: Readonly<Record<string, MensajeErrorApi>>;
  readonly mensajesPorEstado?: Readonly<Partial<Record<number, MensajeErrorApi>>>;
}

/** Permite especializar la presentación de un código funcional o estado HTTP. */
export interface MensajeErrorApi {
  readonly titulo?: string;
  readonly descripcion: string;
}
