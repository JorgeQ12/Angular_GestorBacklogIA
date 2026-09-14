import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import { MENSAJES_ERROR_ELEMENTO_PLANIFICACION } from '../config/mensajes-planificacion-proyecto.config';
import type {
  TipoElementoVersionable,
  VersionElementoPlanificacion,
  VersionElementoResumen,
} from '../models/historial-elemento-planificacion.model';
import { ElementoPlanificacionService } from './elemento-planificacion.service';

interface IdentidadHistorialElemento {
  readonly tipo: TipoElementoVersionable;
  readonly elementoId: number;
}

/** Coordina la paginación y selección histórica sin trasladar HTTP al componente visual. */
@Injectable()
export class EstadoHistorialElementoPlanificacionService {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(ElementoPlanificacionService);

  /** Proporciona acceso al servicio de notificador errores API. */
  private readonly notificador = inject(NotificadorErroresApiService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva operación historial para controlar el ciclo de vida de la operación. */
  private operacionHistorial: Subscription | null = null;

  /** Conserva operación version para controlar el ciclo de vida de la operación. */
  private operacionVersion: Subscription | null = null;

  /** Conserva identidad estado como estado reactivo de la instancia. */
  private readonly identidadEstado = signal<IdentidadHistorialElemento | null>(null);

  /** Conserva registros estado como estado reactivo de la instancia. */
  private readonly registrosEstado = signal<readonly VersionElementoResumen[]>([]);

  /** Conserva siguiente cursor estado como estado reactivo de la instancia. */
  private readonly siguienteCursorEstado = signal<number | null>(null);

  /** Conserva hay mas estado como estado reactivo de la instancia. */
  private readonly hayMasEstado = signal(false);

  /** Conserva version seleccionada ID estado como estado reactivo de la instancia. */
  private readonly versionSeleccionadaIdEstado = signal<number | null>(null);

  /** Conserva version seleccionada estado como estado reactivo de la instancia. */
  private readonly versionSeleccionadaEstado = signal<VersionElementoPlanificacion | null>(null);

  /** Conserva cargando historial estado como estado reactivo de la instancia. */
  private readonly cargandoHistorialEstado = signal(false);

  /** Conserva cargando version estado como estado reactivo de la instancia. */
  private readonly cargandoVersionEstado = signal(false);

  /** Conserva error historial estado como estado reactivo de la instancia. */
  private readonly errorHistorialEstado = signal(false);

  /** Conserva error version estado como estado reactivo de la instancia. */
  private readonly errorVersionEstado = signal(false);

  /** Expone los resúmenes de versiones cargados hasta el momento. */
  public readonly registros = this.registrosEstado.asReadonly();

  /** Conserva el cursor requerido para solicitar la siguiente página. */
  public readonly siguienteCursor = this.siguienteCursorEstado.asReadonly();

  /** Indica si el backend informa más versiones disponibles. */
  public readonly hayMas = this.hayMasEstado.asReadonly();

  /** Identifica la versión elegida en el historial. */
  public readonly versionSeleccionadaId = this.versionSeleccionadaIdEstado.asReadonly();

  /** Expone el detalle de la versión seleccionada. */
  public readonly versionSeleccionada = this.versionSeleccionadaEstado.asReadonly();

  /** Indica si se está consultando una página del historial. */
  public readonly cargandoHistorial = this.cargandoHistorialEstado.asReadonly();

  /** Indica si se está consultando el detalle de una versión. */
  public readonly cargandoVersion = this.cargandoVersionEstado.asReadonly();

  /** Indica si falló la consulta principal del historial. */
  public readonly errorHistorial = this.errorHistorialEstado.asReadonly();

  /** Indica si falló la consulta del detalle seleccionado. */
  public readonly errorVersion = this.errorVersionEstado.asReadonly();

  /** Inicia una consulta histórica limpia para la identidad seleccionada. */
  public abrir(tipo: TipoElementoVersionable, elementoId: number): void {
    this.cerrar();
    this.identidadEstado.set({ tipo, elementoId });
    this.cargarHistorial(false);
  }

  /** Selecciona y consulta el contenido de una versión resumida. */
  public seleccionar(version: VersionElementoResumen): void {
    const identidad = this.identidadEstado();
    if (!identidad || this.cargandoVersionEstado()) return;
    this.operacionVersion?.unsubscribe();
    this.versionSeleccionadaIdEstado.set(version.versionId);
    this.versionSeleccionadaEstado.set(null);
    this.errorVersionEstado.set(false);
    this.cargandoVersionEstado.set(true);
    this.operacionVersion = this.api
      .obtenerVersion(identidad.tipo, identidad.elementoId, version.versionId)
      .pipe(
        finalize(() => this.cargandoVersionEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (detalle) => this.versionSeleccionadaEstado.set(detalle),
        error: (error: unknown) => {
          this.errorVersionEstado.set(true);
          this.notificador.comunicar(error, MENSAJES_ERROR_ELEMENTO_PLANIFICACION.version);
        },
      });
  }

  /** Agrega la siguiente página cuando el backend informa más registros. */
  public cargarMas(): void {
    if (this.hayMasEstado() && this.siguienteCursorEstado() !== null) {
      this.cargarHistorial(true);
    }
  }

  /** Reintenta la primera página después de una falla bloqueante. */
  public reintentarHistorial(): void {
    this.cargarHistorial(false);
  }

  /** Reintenta el detalle de la versión que permanece seleccionada. */
  public reintentarVersion(): void {
    const versionId = this.versionSeleccionadaIdEstado();
    const version = this.registrosEstado().find((item) => item.versionId === versionId);
    if (version) this.seleccionar(version);
  }

  /** Cancela solicitudes y descarta la identidad asociada al diálogo. */
  public cerrar(): void {
    this.operacionHistorial?.unsubscribe();
    this.operacionVersion?.unsubscribe();
    this.operacionHistorial = null;
    this.operacionVersion = null;
    this.identidadEstado.set(null);
    this.registrosEstado.set([]);
    this.siguienteCursorEstado.set(null);
    this.hayMasEstado.set(false);
    this.versionSeleccionadaIdEstado.set(null);
    this.versionSeleccionadaEstado.set(null);
    this.cargandoHistorialEstado.set(false);
    this.cargandoVersionEstado.set(false);
    this.errorHistorialEstado.set(false);
    this.errorVersionEstado.set(false);
  }

  /** Carga historial dentro del flujo actual. */
  private cargarHistorial(acumular: boolean): void {
    const identidad = this.identidadEstado();
    if (!identidad || this.cargandoHistorialEstado()) return;
    const cursor = acumular ? this.siguienteCursorEstado() : null;
    this.operacionHistorial?.unsubscribe();
    this.errorHistorialEstado.set(false);
    this.cargandoHistorialEstado.set(true);
    this.operacionHistorial = this.api
      .obtenerHistorial(identidad.tipo, identidad.elementoId, cursor)
      .pipe(
        finalize(() => this.cargandoHistorialEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pagina) => {
          this.registrosEstado.update((actual) =>
            acumular ? [...actual, ...pagina.registros] : pagina.registros,
          );
          this.siguienteCursorEstado.set(pagina.siguienteCursor);
          this.hayMasEstado.set(pagina.hayMas);
          if (!acumular) {
            this.versionSeleccionadaIdEstado.set(null);
            this.versionSeleccionadaEstado.set(null);
            const masReciente = pagina.registros[0];
            if (masReciente) this.seleccionar(masReciente);
          }
        },
        error: (error: unknown) => {
          if (!acumular) this.errorHistorialEstado.set(true);
          this.notificador.comunicar(error, MENSAJES_ERROR_ELEMENTO_PLANIFICACION.historial);
        },
      });
  }
}
