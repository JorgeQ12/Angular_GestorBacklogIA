import { Injectable, signal, type Signal } from '@angular/core';
import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';

/** Describe información contextual que complementa la identidad de un paso. */
export interface ContenidoEncabezadoPasoCreacion {
  readonly iconoDetalle: NombreIconoAplicacion;
  readonly detallePrincipal: Signal<string>;
  readonly detalleSecundario: Signal<string>;
  readonly accion?: AccionEncabezadoPasoCreacion;
}

/** Describe una acción particular presentada en el encabezado del paso. */
export interface AccionEncabezadoPasoCreacion {
  readonly icono: NombreIconoAplicacion;
  readonly texto: Signal<string>;
  readonly deshabilitada: Signal<boolean>;
  readonly ejecutar: () => void;
}

/** Coordina contenido opcional entre una página hija y el shell de creación. */
@Injectable()
export class ContenidoEncabezadoPasoCreacionService {
  private readonly estadoContenido = signal<ContenidoEncabezadoPasoCreacion | null>(null);

  /** Expone el complemento vigente sin permitir su modificación externa. */
  public readonly contenido = this.estadoContenido.asReadonly();

  /** Registra el contenido proporcionado por la página activa. */
  public registrar(contenido: ContenidoEncabezadoPasoCreacion): void {
    this.estadoContenido.set(contenido);
  }

  /** Retira únicamente el contenido perteneciente a la página destruida. */
  public limpiar(contenido: ContenidoEncabezadoPasoCreacion): void {
    if (this.estadoContenido() === contenido) this.estadoContenido.set(null);
  }
}
