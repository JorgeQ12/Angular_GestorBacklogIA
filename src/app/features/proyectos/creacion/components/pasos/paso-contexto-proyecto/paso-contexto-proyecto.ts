import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize, forkJoin } from 'rxjs';
import { OpcionCatalogo } from '../../../../../../core/catalogos/models/opcion-catalogo.model';
import { CatalogosService } from '../../../../../../core/catalogos/services/catalogos.service';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioContextoProyecto } from '../../../../secciones/contexto/components/formulario-contexto-proyecto/formulario-contexto-proyecto';
import { CATALOGO_PRIORIDADES_PROYECTO } from '../../../../secciones/contexto/config/contexto-proyecto.config';
import { ContextoProyecto } from '../../../../secciones/contexto/models/contexto-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';

/** Integra Contexto y sus catálogos con el recorrido de creación. */
@Component({
  selector: 'app-paso-contexto-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioContextoProyecto, IconoComponent],
  templateUrl: './paso-contexto-proyecto.html',
  styleUrl: './paso-contexto-proyecto.css',
})
export class PasoContextoProyecto {
  private readonly catalogos = inject(CatalogosService);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private cargaActual: Subscription | null = null;
  private guardadoActual: Subscription | null = null;
  private proyectoAnterior: number | null = null;

  /** Solicita a la página abrir el siguiente paso después de guardar. */
  public readonly completado = output<void>();

  protected readonly contexto = signal<ContextoProyecto | null>(null);
  protected readonly prioridades = signal<readonly OpcionCatalogo[]>([]);
  protected readonly errorCarga = signal(false);
  protected readonly procesando = signal(false);

  public constructor() {
    effect(() => {
      const proyectoId = this.estadoCreacion.proyectoId();
      if (this.proyectoAnterior !== proyectoId) {
        this.guardadoActual?.unsubscribe();
        this.guardadoActual = null;
        this.procesando.set(false);
        this.proyectoAnterior = proyectoId;
      }
      this.cargarContexto();
    });
  }

  /** Prepara el borrador y los catálogos necesarios para editar Contexto. */
  protected cargarContexto(): void {
    const proyectoId = this.estadoCreacion.proyectoId();
    this.cargaActual?.unsubscribe();
    this.contexto.set(null);
    this.prioridades.set([]);
    if (proyectoId === null) {
      this.errorCarga.set(true);
      return;
    }

    this.errorCarga.set(false);
    this.cargaActual = forkJoin({
      borrador: this.estadoCreacion.cargar(proyectoId),
      prioridades: this.catalogos.obtenerOpciones(CATALOGO_PRIORIDADES_PROYECTO),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ borrador, prioridades }) => {
          if (prioridades.length === 0) {
            this.errorCarga.set(true);
            return;
          }

          this.contexto.set(borrador.contexto);
          this.prioridades.set(prioridades);
        },
        error: () => this.errorCarga.set(true),
      });
  }

  /** Guarda Contexto antes de continuar. */
  protected guardarContexto(contexto: ContextoProyecto): void {
    const proyectoId = this.estadoCreacion.proyectoId();
    if (this.procesando() || proyectoId === null) return;

    this.procesando.set(true);
    this.guardadoActual = this.estadoCreacion
      .guardarSeccion({ seccion: ClaveSeccionProyecto.Contexto, datos: contexto })
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (this.estadoCreacion.proyectoId() === proyectoId) this.completado.emit();
        },
        error: (error: unknown) =>
          this.notificadorErrores.comunicar(error, ClaveSeccionProyecto.Contexto),
      });
  }

  /** Mantiene la identidad visible del proyecto mientras se edita Contexto. */
  protected actualizarNombreProyecto(nombre: string): void {
    this.estadoCreacion.actualizarNombreProyecto(nombre);
  }
}
