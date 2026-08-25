export type VarianteMensaje =
  'informacion' | 'exito' | 'advertencia' | 'error' | 'confirmacion' | 'destructiva';

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
  descartable?: boolean;
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
  descartable: boolean;
}
