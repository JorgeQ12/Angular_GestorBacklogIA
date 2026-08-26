import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  PARAMETROS_RUTA,
  crearUrlObjetivosProyecto,
} from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormularioNecesidadProyecto } from '../../../../secciones/necesidad/components/formulario-necesidad-proyecto/formulario-necesidad-proyecto';
import { deserializarNecesidadProyecto } from '../../../../secciones/necesidad/mappers/necesidad-proyecto.mapper';
import { NecesidadProyecto } from '../../../../secciones/necesidad/models/necesidad-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';

/** Coordina Necesidad de negocio dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-necesidad-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioNecesidadProyecto, IconoComponent],
  templateUrl: './pagina-necesidad-proyecto.html',
  styleUrl: './pagina-necesidad-proyecto.css',
})
export class PaginaNecesidadProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly proyectoId = Number(
    this.ruta.parent?.snapshot.paramMap.get(PARAMETROS_RUTA.proyectoId),
  );

  protected readonly necesidad = signal<NecesidadProyecto | null>(null);
  protected readonly contenidoListo = signal(false);
  protected readonly errorCarga = signal(false);
  protected readonly procesando = signal(false);

  public constructor() {
    this.cargarNecesidad();
  }

  /** Prepara la sección desde el borrador vigente. */
  protected cargarNecesidad(): void {
    if (!Number.isInteger(this.proyectoId) || this.proyectoId <= 0) {
      this.errorCarga.set(true);
      return;
    }

    this.errorCarga.set(false);
    this.contenidoListo.set(false);
    this.estadoCreacion
      .cargar(this.proyectoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (borrador) => {
          this.necesidad.set(deserializarNecesidadProyecto(borrador.necesidadJson));
          this.contenidoListo.set(true);
        },
        error: () => this.errorCarga.set(true),
      });
  }

  /** Guarda Necesidad y abre Objetivos. */
  protected guardarNecesidad(necesidad: NecesidadProyecto): void {
    if (this.procesando()) return;

    this.procesando.set(true);
    this.estadoCreacion
      .guardarNecesidad(necesidad)
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(crearUrlObjetivosProyecto(this.proyectoId)),
        error: (error: unknown) => this.notificadorErrores.comunicar(error, 'necesidad'),
      });
  }
}
