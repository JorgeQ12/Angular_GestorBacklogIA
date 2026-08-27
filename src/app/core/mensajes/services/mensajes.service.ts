import { Injectable, signal } from '@angular/core';
import type { EstadoMensaje, OpcionesMensaje, VarianteMensaje } from '../models/mensaje.model';

const CONTEXTO_POR_VARIANTE = {
  informacion: 'Información',
  exito: 'Proceso completado',
  advertencia: 'Requiere tu atención',
  error: 'No fue posible continuar',
  confirmacion: 'Confirma esta acción',
  destructiva: 'Acción destructiva',
} satisfies Record<VarianteMensaje, string>;

/** Coordina los mensajes y las decisiones globales solicitadas por la aplicación. */
@Injectable({ providedIn: 'root' })
export class MensajesService {
  private readonly mensaje = signal<EstadoMensaje | null>(null);
  private resolverPendiente: ((aceptado: boolean) => void) | null = null;

  /** Expone el mensaje vigente a la única presentación montada en la raíz. */
  public readonly mensajeActual = this.mensaje.asReadonly();

  /** Abre un mensaje configurable y resuelve la decisión tomada por el usuario. */
  public abrir(opciones: OpcionesMensaje): Promise<boolean> {
    this.resolverAnterior(false);

    const variante = opciones.variante ?? 'informacion';
    const mostrarCancelar =
      opciones.mostrarCancelar ?? (variante === 'confirmacion' || variante === 'destructiva');

    this.mensaje.set({
      titulo: opciones.titulo,
      descripcion: opciones.descripcion,
      detalles: opciones.detalles ?? [],
      variante,
      contexto: opciones.contexto ?? CONTEXTO_POR_VARIANTE[variante],
      textoConfirmar:
        opciones.textoConfirmar ??
        (variante === 'destructiva' ? 'Eliminar' : mostrarCancelar ? 'Confirmar' : 'Aceptar'),
      textoCancelar: opciones.textoCancelar ?? 'Cancelar',
      mostrarCancelar,
      descartable: opciones.descartable ?? !mostrarCancelar,
    });

    return new Promise<boolean>((resolver) => {
      this.resolverPendiente = resolver;
    });
  }

  /** Presenta información transversal que requiere reconocimiento. */
  public async informar(titulo: string, descripcion: string): Promise<void> {
    await this.abrir({ titulo, descripcion, variante: 'informacion' });
  }

  /** Comunica que una operación finalizó correctamente. */
  public async exito(titulo: string, descripcion: string): Promise<void> {
    await this.abrir({ titulo, descripcion, variante: 'exito' });
  }

  /** Advierte una condición que el usuario debe revisar. */
  public async advertir(
    titulo: string,
    descripcion: string,
    detalles: readonly string[] = [],
  ): Promise<void> {
    await this.abrir({ titulo, descripcion, detalles, variante: 'advertencia' });
  }

  /** Informa un fallo que impidió completar la operación actual. */
  public async error(
    titulo: string,
    descripcion: string,
    detalles: readonly string[] = [],
  ): Promise<void> {
    await this.abrir({ titulo, descripcion, detalles, variante: 'error' });
  }

  /** Solicita una decisión explícita antes de continuar. */
  public confirmar(
    titulo: string,
    descripcion: string,
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
  ): Promise<boolean> {
    return this.abrir({
      titulo,
      descripcion,
      variante: 'confirmacion',
      textoConfirmar,
      textoCancelar,
    });
  }

  /** Solicita autorización explícita para ejecutar una acción irreversible. */
  public confirmarDestructiva(
    titulo: string,
    descripcion: string,
    textoConfirmar = 'Eliminar',
    textoCancelar = 'Cancelar',
  ): Promise<boolean> {
    return this.abrir({
      titulo,
      descripcion,
      variante: 'destructiva',
      textoConfirmar,
      textoCancelar,
    });
  }

  /** Resuelve el mensaje vigente como aceptado. */
  public aceptar(): void {
    this.cerrar(true);
  }

  /** Resuelve el mensaje vigente como cancelado. */
  public cancelar(): void {
    this.cerrar(false);
  }

  /** Descarta únicamente los mensajes que no requieren una decisión explícita. */
  public descartar(): void {
    if (this.mensaje()?.descartable) {
      this.cerrar(false);
    }
  }

  private cerrar(aceptado: boolean): void {
    if (!this.mensaje()) {
      return;
    }

    const resolver = this.resolverPendiente;

    this.resolverPendiente = null;
    this.mensaje.set(null);
    resolver?.(aceptado);
  }

  private resolverAnterior(aceptado: boolean): void {
    const resolver = this.resolverPendiente;

    this.resolverPendiente = null;
    resolver?.(aceptado);
  }
}
