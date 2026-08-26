import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { OpcionCatalogo } from '../../../../../../core/catalogos/models/opcion-catalogo.model';
import { CatalogosService } from '../../../../../../core/catalogos/services/catalogos.service';
import {
  PARAMETROS_RUTA,
  crearUrlTipoSolucionProyecto,
} from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioContextoProyecto } from '../../../../secciones/contexto/components/formulario-contexto-proyecto/formulario-contexto-proyecto';
import { CATALOGO_PRIORIDADES_PROYECTO } from '../../../../secciones/contexto/config/contexto-proyecto.config';
import { ContextoProyecto } from '../../../../secciones/contexto/models/contexto-proyecto.model';
import { EstadoCreacionProyectoService } from '../../../services/estado-creacion-proyecto.service';
import { NotificadorErroresBorradorProyectoService } from '../../../services/notificador-errores-borrador-proyecto.service';

/** Coordina la edición de Contexto dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-contexto-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioContextoProyecto, IconoComponent],
  templateUrl: './pagina-contexto-proyecto.html',
  styleUrl: './pagina-contexto-proyecto.css',
})
export class PaginaContextoProyecto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogos = inject(CatalogosService);
  private readonly estadoCreacion = inject(EstadoCreacionProyectoService);
  private readonly notificadorErrores = inject(NotificadorErroresBorradorProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly proyectoId = Number(
    this.ruta.parent?.snapshot.paramMap.get(PARAMETROS_RUTA.proyectoId),
  );

  protected readonly contexto = signal<ContextoProyecto | null>(null);
  protected readonly prioridades = signal<readonly OpcionCatalogo[]>([]);
  protected readonly errorCarga = signal(false);
  protected readonly procesando = signal(false);

  public constructor() {
    this.cargarContexto();
  }

  /** Prepara el borrador y los catálogos necesarios para editar Contexto. */
  protected cargarContexto(): void {
    if (!Number.isInteger(this.proyectoId) || this.proyectoId <= 0) {
      this.errorCarga.set(true);
      return;
    }

    this.errorCarga.set(false);
    forkJoin({
      borrador: this.estadoCreacion.cargar(this.proyectoId),
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

  /** Guarda Contexto y abre el siguiente paso del recorrido. */
  protected guardarContexto(contexto: ContextoProyecto): void {
    if (this.procesando()) return;

    this.procesando.set(true);
    this.estadoCreacion
      .guardarSeccion({ seccion: ClaveSeccionProyecto.Contexto, datos: contexto })
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(crearUrlTipoSolucionProyecto(this.proyectoId));
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
