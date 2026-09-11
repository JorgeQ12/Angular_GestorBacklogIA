import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormateadorFechaService } from '../../../../../shared/fechas/services/formateador-fecha.service';
import { SelectorCampo } from '../../../../../shared/forms/controles/selector-campo/selector-campo';
import type { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import type { VersionPlanificacion } from '../../models/version-planificacion.model';

/** Permite seleccionar la fotografía integral presentada en planificación. */
@Component({
  selector: 'app-selector-version-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorCampo],
  templateUrl: './selector-version-planificacion.html',
  styleUrl: './selector-version-planificacion.css',
})
export class SelectorVersionPlanificacionComponent {

  /** Proporciona acceso al servicio de formateador fecha. */
  private readonly formateadorFecha = inject(FormateadorFechaService);

  /** Proporciona las versiones ordenadas disponibles para el proyecto. */
  public readonly versiones = input.required<readonly VersionPlanificacion[]>();
  /** Identifica la fotografía presentada en el árbol. */
  public readonly versionSeleccionadaId = input.required<number>();
  /** Bloquea cambios mientras otra consulta u operación continúa. */
  public readonly deshabilitado = input(false);
  /** Ajusta el selector al patrón visual del Gantt anterior. */
  public readonly aparienciaGantt = input(false);
  /** Solicita presentar una versión distinta. */
  public readonly versionCambiada = output<number>();

  /** Administra control mediante formularios reactivos. */
  protected readonly control = new FormControl<number | null>(null);

  /** Conserva opciones para coordinar esta responsabilidad. */
  protected readonly opciones = computed<readonly OpcionSelector[]>(() =>
    this.versiones().map((version) => ({
      valor: version.id,
      etiqueta: version.esActual
        ? `Versión ${version.numero} · Actual`
        : `Versión ${version.numero} · ${this.fechaBreve(version.fechaCierre ?? version.fechaInicio)}`,
      descripcion: this.aparienciaGantt()
        ? undefined
        : version.esActual
          ? 'Vigente · Editable'
          : 'Histórica · Solo lectura',
    })),
  );

  public constructor() {
    effect(() => {
      this.control.setValue(this.versionSeleccionadaId(), { emitEvent: false });
      this.deshabilitado()
        ? this.control.disable({ emitEvent: false })
        : this.control.enable({ emitEvent: false });
    });
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((versionId) => {
      if (versionId !== null && versionId !== this.versionSeleccionadaId()) {
        this.versionCambiada.emit(versionId);
      }
    });
  }

  /** Ejecuta fecha breve como parte del flujo interno. */
  private fechaBreve(fecha: string): string {
    const formateada = this.formateadorFecha.formatear(fecha, 'breve');
    return this.aparienciaGantt() ? formateada.replaceAll(' de ', ' ') : formateada;
  }
}
