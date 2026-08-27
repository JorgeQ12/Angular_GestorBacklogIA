/** Identifica la intención funcional de un mensaje global. */
export enum VarianteMensaje {
  Informacion = 'informacion',
  Exito = 'exito',
  Advertencia = 'advertencia',
  Error = 'error',
  Confirmacion = 'confirmacion',
  Destructiva = 'destructiva',
}

/** Configura el contenido y las decisiones disponibles en un mensaje global. */
export interface OpcionesMensaje {
  titulo: string;
  descripcion: string;
  detalles?: readonly string[];
  variante?: VarianteMensaje;
  contexto?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  mostrarCancelar?: boolean;
}

/** Representa el mensaje normalizado que consume la presentación global. */
export interface EstadoMensaje {
  titulo: string;
  descripcion: string;
  detalles: readonly string[];
  variante: VarianteMensaje;
  contexto: string;
  textoConfirmar: string;
  textoCancelar: string;
  mostrarCancelar: boolean;
}
