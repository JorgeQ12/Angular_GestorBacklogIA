import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { crearUrlContextoProyecto } from '../../../../../../core/navegacion/rutas';
import { VinculacionAzure } from '../../../components/vinculacion-azure/vinculacion-azure';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../../../models/vinculacion-azure.model';
import { CreacionProyectoService } from '../../../services/creacion-proyecto.service';

/** Coordina la validación de Azure y la creación inicial del proyecto. */
@Component({
  selector: 'app-pagina-vinculacion-azure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VinculacionAzure],
  templateUrl: './pagina-vinculacion-azure.html',
  styleUrl: './pagina-vinculacion-azure.css',
})
export class PaginaVinculacionAzure {
  private readonly creacionProyecto = inject(CreacionProyectoService);
  private readonly mensajes = inject(MensajesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly datosVinculacion = signal<DatosVinculacionAzure | null>(null);
  protected readonly resultadoValidacion = signal<ResultadoVinculacionAzure | null>(null);
  protected readonly procesando = signal(false);

  /** Comprueba la referencia capturada y prepara su confirmación. */
  protected validarVinculacion(datos: DatosVinculacionAzure): void {
    if (this.procesando()) return;

    this.datosVinculacion.set(datos);
    this.procesando.set(true);
    this.creacionProyecto
      .validarVinculacionAzure(datos)
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => this.resultadoValidacion.set(resultado),
        error: () => {
          void this.mensajes.error(
            'No fue posible consultar Azure',
            'Revisa el enlace, la épica principal y el Team seleccionado.',
          );
        },
      });
  }

  /** Regresa a la captura para corregir la vinculación consultada. */
  protected editarVinculacion(): void {
    this.resultadoValidacion.set(null);
  }

  /** Crea el borrador confirmado y abre la etapa Contexto. */
  protected crearBorrador(): void {
    const datos = this.datosVinculacion();
    if (!datos || this.procesando()) return;

    this.procesando.set(true);
    this.creacionProyecto
      .crearBorrador(datos)
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (borrador) => {
          void this.router.navigateByUrl(crearUrlContextoProyecto(borrador.id));
        },
        error: () => {
          void this.mensajes.error(
            'No fue posible crear el proyecto',
            'La información de Azure fue validada, pero el borrador no pudo ser creado.',
          );
        },
      });
  }
}
