import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize, forkJoin } from 'rxjs';
import { NotificadorErroresApiService } from '../../../../core/mensajes/services/notificador-errores-api.service';
import type { ActualizacionSeccionProyecto } from '../../models/actualizacion-seccion-proyecto.model';
import type { VersionProyectoResumen } from '../../models/versionamiento-proyecto.model';
import { CONTEXTO_ERROR_ACTUALIZACION_PROYECTO } from '../config/mensajes-informacion-proyecto.config';
import type { InformacionProyecto } from '../models/informacion-proyecto.model';
import { InformacionProyectoService } from './informacion-proyecto.service';

/** Coordina la fotografía vigente, la versión presentada y las actualizaciones de la página. */
@Injectable()
export class EstadoInformacionProyectoService {
  private readonly api = inject(InformacionProyectoService);
  private readonly notificador = inject(NotificadorErroresApiService);
  private readonly destroyRef = inject(DestroyRef);
  private cargaActual: Subscription | null = null;
  private seleccionActual: Subscription | null = null;
  private guardadoActual: Subscription | null = null;

  private readonly proyectoActualEstado = signal<InformacionProyecto | null>(null);
  private readonly proyectoPresentadoEstado = signal<InformacionProyecto | null>(null);
  private readonly versionesEstado = signal<readonly VersionProyectoResumen[]>([]);
  private readonly errorCargaEstado = signal(false);
  private readonly guardandoEstado = signal(false);

  /** Expone la única fotografía que puede originar una nueva versión. */
  public readonly proyectoActual = this.proyectoActualEstado.asReadonly();
  /** Expone la fotografía vigente o histórica seleccionada globalmente. */
  public readonly proyectoPresentado = this.proyectoPresentadoEstado.asReadonly();
  /** Expone el historial disponible para el selector. */
  public readonly versiones = this.versionesEstado.asReadonly();
  /** Indica que no existe una fotografía utilizable para la consulta solicitada. */
  public readonly errorCarga = this.errorCargaEstado.asReadonly();
  /** Bloquea nuevos guardados mientras se crea una versión. */
  public readonly guardando = this.guardandoEstado.asReadonly();

  /** Carga el proyecto y su historial, cancelando operaciones de otra identidad. */
  public cargar(proyectoId: number, versionId: number | null): void {
    this.cancelarOperaciones();
    this.errorCargaEstado.set(false);
    this.proyectoActualEstado.set(null);
    this.proyectoPresentadoEstado.set(null);
    this.versionesEstado.set([]);
    this.cargaActual = forkJoin({
      proyecto: this.api.obtenerProyecto(proyectoId),
      versiones: this.api.obtenerVersiones(proyectoId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ proyecto, versiones }) => {
          this.proyectoActualEstado.set(proyecto);
          this.versionesEstado.set(versiones);
          this.presentarVersion(versionId);
        },
        error: () => this.errorCargaEstado.set(true),
      });
  }

  /** Presenta la versión vigente almacenada o consulta una fotografía histórica. */
  public presentarVersion(versionId: number | null): void {
    const actual = this.proyectoActualEstado();
    if (!actual) return;
    this.errorCargaEstado.set(false);
    this.seleccionActual?.unsubscribe();
    if (versionId === null || versionId === actual.versionId) {
      this.proyectoPresentadoEstado.set(actual);
      return;
    }
    if (!this.versionesEstado().some((version) => version.id === versionId)) {
      this.errorCargaEstado.set(true);
      return;
    }
    this.proyectoPresentadoEstado.set(null);
    this.seleccionActual = this.api
      .obtenerVersion(actual.id, versionId, actual.azure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (version) => this.proyectoPresentadoEstado.set(version),
        error: () => this.errorCargaEstado.set(true),
      });
  }

  /** Persiste una sección de la versión vigente y renueva el historial. */
  public guardar(actualizacion: ActualizacionSeccionProyecto, completado: () => void): void {
    const actual = this.proyectoActualEstado();
    if (!actual || this.guardandoEstado()) return;
    this.guardandoEstado.set(true);
    this.guardadoActual = this.api
      .actualizarProyecto(actual, actualizacion)
      .pipe(
        finalize(() => this.guardandoEstado.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (proyecto) => {
          this.proyectoActualEstado.set(proyecto);
          this.proyectoPresentadoEstado.set(proyecto);
          this.api
            .obtenerVersiones(proyecto.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: (versiones) => this.versionesEstado.set(versiones) });
          completado();
        },
        error: (error: unknown) =>
          this.notificador.comunicar(error, CONTEXTO_ERROR_ACTUALIZACION_PROYECTO),
      });
  }

  private cancelarOperaciones(): void {
    this.cargaActual?.unsubscribe();
    this.seleccionActual?.unsubscribe();
    this.guardadoActual?.unsubscribe();
    this.guardandoEstado.set(false);
  }
}
