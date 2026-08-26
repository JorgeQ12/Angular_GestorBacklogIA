import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  PARAMETROS_RUTA,
  crearUrlNecesidadProyecto,
} from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormularioTipoSolucionProyecto } from '../../../../secciones/tipo-solucion/components/formulario-tipo-solucion-proyecto/formulario-tipo-solucion-proyecto';
import { deserializarTipoSolucionProyecto } from '../../../../secciones/tipo-solucion/mappers/tipo-solucion-proyecto.mapper';
import { TipoSolucionProyecto } from '../../../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';

/** Coordina Tipo de solución dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-tipo-solucion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioTipoSolucionProyecto, IconoComponent],
  templateUrl: './pagina-tipo-solucion-proyecto.html',
  styleUrl: './pagina-tipo-solucion-proyecto.css',
})
export class PaginaTipoSolucionProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly proyectoId = Number(
    this.ruta.parent?.snapshot.paramMap.get(PARAMETROS_RUTA.proyectoId),
  );

  protected readonly tipoSolucion = signal<TipoSolucionProyecto | null>(null);
  protected readonly contenidoListo = signal(false);
  protected readonly errorCarga = signal(false);
  protected readonly procesando = signal(false);

  public constructor() {
    this.cargarTipoSolucion();
  }

  /** Prepara la sección desde el borrador vigente. */
  protected cargarTipoSolucion(): void {
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
          this.tipoSolucion.set(deserializarTipoSolucionProyecto(borrador.tipoSolucionJson));
          this.contenidoListo.set(true);
        },
        error: () => this.errorCarga.set(true),
      });
  }

  /** Guarda Tipo de solución y abre Necesidad de negocio. */
  protected guardarTipoSolucion(tipoSolucion: TipoSolucionProyecto): void {
    if (this.procesando()) return;

    this.procesando.set(true);
    this.estadoCreacion
      .guardarTipoSolucion(tipoSolucion)
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(crearUrlNecesidadProyecto(this.proyectoId)),
        error: (error: unknown) => this.notificadorErrores.comunicar(error, 'tipoSolucion'),
      });
  }
}
