import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Observable,
  Subject,
  Subscription,
  catchError,
  finalize,
  map,
  takeUntil,
  tap,
} from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import {
  ERROR_CARGA_ASISTENTE_IA,
  ERROR_ENVIO_ASISTENTE_IA,
  ERROR_PROPUESTA_ASISTENTE_IA,
} from '../config/mensajes-asistente-ia.config';
import type {
  ContextoAsistenteIA,
  MensajeAsistenteIA,
  ResultadoResolucionPropuestaIA,
} from '../models/asistente-ia.model';
import { AsistenteIAApiService } from './asistente-ia-api.service';

/** Conserva una única conversación de IA durante la vida de la ruta del proyecto. */
@Injectable()
export class EstadoAsistenteIAService {
  private readonly api = inject(AsistenteIAApiService);
  private readonly notificador = inject(NotificadorErroresApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly estadoMensajes = signal<readonly MensajeAsistenteIA[]>([]);
  private readonly estadoCargando = signal(false);
  private readonly estadoErrorCarga = signal(false);
  private readonly estadoEnviando = signal(false);
  private readonly estadoMensajePendiente = signal<string | null>(null);
  private readonly estadoPropuestaProcesando = signal<number | null>(null);
  private readonly cambioProyecto = new Subject<void>();
  private proyectoActivo: number | null = null;
  private historialCargado = false;
  private cargaActual: Subscription | null = null;

  /** Expone el historial confirmado del proyecto activo. */
  public readonly mensajes = this.estadoMensajes.asReadonly();

  /** Indica que se está recuperando el historial. */
  public readonly cargando = this.estadoCargando.asReadonly();

  /** Indica que el historial no está disponible hasta un nuevo intento. */
  public readonly errorCarga = this.estadoErrorCarga.asReadonly();

  /** Indica que existe un turno pendiente con el modelo. */
  public readonly enviando = this.estadoEnviando.asReadonly();

  /** Expone el texto optimista mientras se confirma la interacción. */
  public readonly mensajePendiente = this.estadoMensajePendiente.asReadonly();

  /** Identifica la propuesta cuya resolución continúa pendiente. */
  public readonly propuestaProcesando = this.estadoPropuestaProcesando.asReadonly();

  /** Descarta conversación y operaciones pendientes cuando cambia el proyecto anfitrión. */
  public seleccionarProyecto(proyectoId: number): void {
    if (this.proyectoActivo === proyectoId) return;

    this.cambioProyecto.next();
    this.cargaActual?.unsubscribe();
    this.cargaActual = null;
    this.proyectoActivo = proyectoId;
    this.historialCargado = false;
    this.estadoMensajes.set([]);
    this.estadoCargando.set(false);
    this.estadoErrorCarga.set(false);
    this.estadoEnviando.set(false);
    this.estadoMensajePendiente.set(null);
    this.estadoPropuestaProcesando.set(null);
  }

  /** Recupera una vez el historial del proyecto activo o fuerza su actualización. */
  public cargar(proyectoId: number, forzar = false): void {
    this.seleccionarProyecto(proyectoId);
    if (!forzar && (this.historialCargado || this.cargaActual !== null)) return;

    this.cargaActual?.unsubscribe();
    this.estadoCargando.set(true);
    this.estadoErrorCarga.set(false);
    const carga = this.api
      .obtenerConversacion(proyectoId)
      .pipe(
        takeUntil(this.cambioProyecto),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.proyectoActivo !== proyectoId) return;
          this.estadoCargando.set(false);
          this.cargaActual = null;
        }),
      )
      .subscribe({
        next: (conversacion) => {
          if (this.proyectoActivo !== proyectoId) return;
          this.historialCargado = true;
          this.estadoMensajes.set(conversacion.mensajes);
        },
        error: (error: unknown) => {
          if (this.proyectoActivo !== proyectoId) return;
          this.estadoErrorCarga.set(true);
          this.notificador.comunicar(error, ERROR_CARGA_ASISTENTE_IA);
        },
      });
    this.cargaActual = carga.closed ? null : carga;
  }

  /** Envía un turno únicamente mientras su proyecto continúa activo y disponible. */
  public enviar(contexto: ContextoAsistenteIA, texto: string): Observable<void> {
    const mensaje = texto.trim();
    if (!mensaje || !this.puedeOperar(contexto.proyectoId) || this.estadoEnviando()) return EMPTY;

    this.estadoEnviando.set(true);
    this.estadoMensajePendiente.set(mensaje);
    return this.api.enviarMensaje(contexto, mensaje).pipe(
      takeUntil(this.cambioProyecto),
      takeUntilDestroyed(this.destroyRef),
      tap((respuesta) => {
        this.estadoMensajePendiente.set(null);
        this.estadoMensajes.update((mensajes) => [
          ...mensajes,
          respuesta.mensajeUsuario,
          respuesta.mensajeAsistente,
        ]);
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        this.notificador.comunicar(error, ERROR_ENVIO_ASISTENTE_IA);
        return EMPTY;
      }),
      finalize(() => {
        if (this.proyectoActivo !== contexto.proyectoId) return;
        this.estadoEnviando.set(false);
        this.estadoMensajePendiente.set(null);
      }),
    );
  }

  /** Aplica una propuesta pendiente y conserva su nuevo estado en el historial activo. */
  public aplicar(
    contexto: ContextoAsistenteIA,
    mensajeId: number,
  ): Observable<ResultadoResolucionPropuestaIA> {
    if (!this.puedeOperar(contexto.proyectoId) || this.hayOperacionEnCurso()) return EMPTY;
    this.estadoPropuestaProcesando.set(mensajeId);
    return this.api.aplicarPropuesta(contexto, mensajeId).pipe(
      takeUntil(this.cambioProyecto),
      takeUntilDestroyed(this.destroyRef),
      tap((resultado) => {
        this.exigirProyectoResultado(resultado, contexto.proyectoId);
        this.actualizarEstadoPropuesta(resultado);
      }),
      catchError((error: unknown) => {
        this.notificador.comunicar(error, ERROR_PROPUESTA_ASISTENTE_IA);
        return EMPTY;
      }),
      finalize(() => {
        if (this.proyectoActivo === contexto.proyectoId) {
          this.estadoPropuestaProcesando.set(null);
        }
      }),
    );
  }

  /** Rechaza una propuesta pendiente sin afectar una conversación de otro proyecto. */
  public rechazar(proyectoId: number, mensajeId: number): Observable<void> {
    if (!this.puedeOperar(proyectoId) || this.hayOperacionEnCurso()) return EMPTY;
    this.estadoPropuestaProcesando.set(mensajeId);
    return this.api.rechazarPropuesta(proyectoId, mensajeId).pipe(
      takeUntil(this.cambioProyecto),
      takeUntilDestroyed(this.destroyRef),
      tap((resultado) => {
        this.exigirProyectoResultado(resultado, proyectoId);
        this.actualizarEstadoPropuesta(resultado);
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        this.notificador.comunicar(error, ERROR_PROPUESTA_ASISTENTE_IA);
        return EMPTY;
      }),
      finalize(() => {
        if (this.proyectoActivo === proyectoId) this.estadoPropuestaProcesando.set(null);
      }),
    );
  }

  private puedeOperar(proyectoId: number): boolean {
    return (
      this.proyectoActivo === proyectoId && !this.estadoCargando() && !this.estadoErrorCarga()
    );
  }

  private hayOperacionEnCurso(): boolean {
    return this.estadoEnviando() || this.estadoPropuestaProcesando() !== null;
  }

  private exigirProyectoResultado(
    resultado: ResultadoResolucionPropuestaIA,
    proyectoEsperado: number,
  ): void {
    if (resultado.proyectoId !== proyectoEsperado) {
      throw new Error('La propuesta resuelta no pertenece al proyecto activo.');
    }
  }

  private actualizarEstadoPropuesta(resultado: ResultadoResolucionPropuestaIA): void {
    this.estadoMensajes.update((mensajes) =>
      mensajes.map((mensaje) =>
        mensaje.id === resultado.mensajeId && mensaje.propuesta
          ? {
              ...mensaje,
              propuesta: { ...mensaje.propuesta, estado: resultado.estado },
            }
          : mensaje,
      ),
    );
  }
}
