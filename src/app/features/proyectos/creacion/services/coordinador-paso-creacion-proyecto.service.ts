import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PARAMETROS_RUTA } from '../../../../core/navegacion/rutas';
import { ActualizacionSeccionBorrador } from '../models/actualizacion-seccion-borrador.model';
import { BorradorProyecto } from '../models/borrador-proyecto.model';
import { EstadoCreacionProyectoService } from './estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from './notificador-errores-borrador-proyecto.service';

type ConstructorDestinoPaso = (proyectoId: number) => string;

/** Coordina el ciclo remoto común de una página de sección del recorrido. */
@Injectable()
export class CoordinadorPasoCreacionProyectoService {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly proyectoId = Number(
    this.ruta.parent?.snapshot.paramMap.get(PARAMETROS_RUTA.proyectoId),
  );
  private readonly estadoBorrador = signal<BorradorProyecto | null>(null);
  private readonly estadoContenidoListo = signal(false);
  private readonly estadoErrorCarga = signal(false);
  private readonly estadoProcesando = signal(false);

  /** Expone la fotografía cargada para que la página adapte su sección. */
  public readonly borrador = this.estadoBorrador.asReadonly();

  /** Indica si la página ya puede presentar su formulario. */
  public readonly contenidoListo = this.estadoContenidoListo.asReadonly();

  /** Indica si la recuperación del borrador debe permitir reintento. */
  public readonly errorCarga = this.estadoErrorCarga.asReadonly();

  /** Indica si existe un guardado pendiente para bloquear envíos duplicados. */
  public readonly procesando = this.estadoProcesando.asReadonly();

  /** Recupera el borrador requerido por la sección vigente. */
  public cargar(): void {
    if (!Number.isInteger(this.proyectoId) || this.proyectoId <= 0) {
      this.estadoErrorCarga.set(true);
      return;
    }

    this.estadoBorrador.set(null);
    this.estadoErrorCarga.set(false);
    this.estadoContenidoListo.set(false);
    this.estadoCreacion
      .cargar(this.proyectoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (borrador) => {
          this.estadoBorrador.set(borrador);
          this.estadoContenidoListo.set(true);
        },
        error: () => this.estadoErrorCarga.set(true),
      });
  }

  /** Guarda una sección y abre el destino definido por su página. */
  public guardar(
    actualizacion: ActualizacionSeccionBorrador,
    construirDestino: ConstructorDestinoPaso,
  ): void {
    if (this.estadoProcesando()) return;

    this.estadoProcesando.set(true);
    this.estadoCreacion
      .guardarSeccion(actualizacion)
      .pipe(
        finalize(() => this.estadoProcesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (borrador) => {
          this.estadoBorrador.set(borrador);
          void this.router.navigateByUrl(construirDestino(this.proyectoId));
        },
        error: (error: unknown) => this.notificadorErrores.comunicar(error, actualizacion.seccion),
      });
  }
}
