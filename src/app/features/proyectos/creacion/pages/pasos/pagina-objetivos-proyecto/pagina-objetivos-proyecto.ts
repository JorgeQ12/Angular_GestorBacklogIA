import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  PARAMETROS_RUTA,
  crearUrlAlcanceProyecto,
} from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormularioObjetivosProyecto } from '../../../../secciones/objetivos/components/formulario-objetivos-proyecto/formulario-objetivos-proyecto';
import { deserializarObjetivosProyecto } from '../../../../secciones/objetivos/mappers/objetivos-proyecto.mapper';
import { ObjetivosProyecto } from '../../../../secciones/objetivos/models/objetivos-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';

/** Coordina Objetivos dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-objetivos-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioObjetivosProyecto, IconoComponent],
  templateUrl: './pagina-objetivos-proyecto.html',
  styleUrl: './pagina-objetivos-proyecto.css',
})
export class PaginaObjetivosProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly proyectoId = Number(
    this.ruta.parent?.snapshot.paramMap.get(PARAMETROS_RUTA.proyectoId),
  );

  protected readonly objetivos = signal<ObjetivosProyecto | null>(null);
  protected readonly contenidoListo = signal(false);
  protected readonly errorCarga = signal(false);
  protected readonly procesando = signal(false);

  public constructor() {
    this.cargarObjetivos();
  }

  /** Prepara la sección desde el borrador vigente. */
  protected cargarObjetivos(): void {
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
          this.objetivos.set(deserializarObjetivosProyecto(borrador.objetivosJson));
          this.contenidoListo.set(true);
        },
        error: () => this.errorCarga.set(true),
      });
  }

  /** Guarda Objetivos y abre Alcance. */
  protected guardarObjetivos(objetivos: ObjetivosProyecto): void {
    if (this.procesando()) return;

    this.procesando.set(true);
    this.estadoCreacion
      .guardarObjetivos(objetivos)
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(crearUrlAlcanceProyecto(this.proyectoId)),
        error: (error: unknown) => this.notificadorErrores.comunicar(error, 'objetivos'),
      });
  }
}
