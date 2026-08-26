import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PARAMETROS_RUTA, crearUrlRolesProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormularioAlcanceProyecto } from '../../../../secciones/alcance/components/formulario-alcance-proyecto/formulario-alcance-proyecto';
import { deserializarAlcanceProyecto } from '../../../../secciones/alcance/mappers/alcance-proyecto.mapper';
import { AlcanceProyecto } from '../../../../secciones/alcance/models/alcance-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';

/** Coordina Alcance dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-alcance-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioAlcanceProyecto, IconoComponent],
  templateUrl: './pagina-alcance-proyecto.html',
  styleUrl: './pagina-alcance-proyecto.css',
})
export class PaginaAlcanceProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly proyectoId = Number(
    this.ruta.parent?.snapshot.paramMap.get(PARAMETROS_RUTA.proyectoId),
  );

  protected readonly alcance = signal<AlcanceProyecto | null>(null);
  protected readonly contenidoListo = signal(false);
  protected readonly errorCarga = signal(false);
  protected readonly procesando = signal(false);

  public constructor() {
    this.cargarAlcance();
  }

  /** Prepara la sección desde el borrador vigente. */
  protected cargarAlcance(): void {
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
          this.alcance.set(deserializarAlcanceProyecto(borrador.alcanceJson));
          this.contenidoListo.set(true);
        },
        error: () => this.errorCarga.set(true),
      });
  }

  /** Guarda Alcance y abre Roles. */
  protected guardarAlcance(alcance: AlcanceProyecto): void {
    if (this.procesando()) return;

    this.procesando.set(true);
    this.estadoCreacion
      .guardarAlcance(alcance)
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(crearUrlRolesProyecto(this.proyectoId)),
        error: (error: unknown) => this.notificadorErrores.comunicar(error, 'alcance'),
      });
  }
}
