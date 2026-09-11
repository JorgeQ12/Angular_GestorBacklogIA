/** Identifica el origen utilizado para interpretar un fallo de integración. */
export enum OrigenErrorApi {
  Funcional = 'funcional',
  Http = 'http',
  Conexion = 'conexion',
  Desconocido = 'desconocido',
}

/** Reúne los datos normalizados necesarios para construir un error de integración. */
export interface ConfiguracionErrorApi {
  readonly estadoHttp: number | null;
  readonly codigo: string | null;
  readonly mensajeUsuario: string | null;
  readonly detalles: readonly string[];
  readonly origen: OrigenErrorApi;
  readonly mensajeRespaldo?: string;
}

/** Conserva la información funcional de un error sin exponer el transporte a la interfaz. */
export class ErrorApi extends Error {
  /** Conserva el estado HTTP asociado cuando existe una respuesta del servidor. */
  public readonly estadoHttp: number | null;
  /** Identifica el error funcional informado por la API. */
  public readonly codigo: string | null;
  /** Expone el mensaje seguro que puede presentar la interfaz. */
  public readonly mensajeUsuario: string | null;
  /** Reúne detalles funcionales adicionales sin incluir datos del transporte. */
  public readonly detalles: readonly string[];
  /** Indica cómo se clasificó el fallo durante su normalización. */
  public readonly origen: OrigenErrorApi;

  public constructor(configuracion: ConfiguracionErrorApi) {
    const mensaje =
      configuracion.mensajeUsuario ||
      configuracion.detalles.join(' ') ||
      configuracion.mensajeRespaldo ||
      'La operación no pudo completarse.';
    super(mensaje);
    this.name = 'ErrorApi';
    this.estadoHttp = configuracion.estadoHttp;
    this.codigo = configuracion.codigo;
    this.mensajeUsuario = configuracion.mensajeUsuario;
    this.detalles = configuracion.detalles;
    this.origen = configuracion.origen;
  }
}
