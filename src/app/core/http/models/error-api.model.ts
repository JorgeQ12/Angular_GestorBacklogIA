/** Identifica el origen utilizado para interpretar un fallo de integración. */
export enum OrigenErrorApi {
  Funcional = 'funcional',
  Http = 'http',
  Conexion = 'conexion',
  Desconocido = 'desconocido',
}

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
  public readonly estadoHttp: number | null;
  public readonly codigo: string | null;
  public readonly mensajeUsuario: string | null;
  public readonly detalles: readonly string[];
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
