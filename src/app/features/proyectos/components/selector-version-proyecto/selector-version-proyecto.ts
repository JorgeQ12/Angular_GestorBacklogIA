import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectorCampo } from '../../../../shared/forms/controles/selector-campo/selector-campo';
import type { OpcionSelector } from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import type { VersionProyectoResumen } from '../../models/versionamiento-proyecto.model';

/** Permite cambiar la versión aplicada transversalmente a los pasos del proyecto. */
@Component({
  selector: 'app-selector-version-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SelectorCampo],
  templateUrl: './selector-version-proyecto.html',
  styleUrl: './selector-version-proyecto.css',
})
export class SelectorVersionProyecto {
  /** Proporciona el historial ordenado disponible. */
  public readonly versiones = input.required<readonly VersionProyectoResumen[]>();
  /** Identifica la fotografía presentada actualmente. */
  public readonly versionSeleccionadaId = input.required<number>();
  /** Bloquea temporalmente el selector durante operaciones remotas. */
  public readonly deshabilitado = input(false);
  /** Solicita presentar una fotografía distinta. */
  public readonly versionCambiada = output<number>();

  protected readonly control = new FormControl<number | null>(null);

  protected readonly opciones = computed<readonly OpcionSelector[]>(() =>
    this.versiones().map((version) => ({
      valor: version.id,
      etiqueta: `Versión ${version.numero}${version.esActual ? ' · Actual' : ''}`,
      descripcion: version.esActual ? 'Vigente · Editable' : 'Histórica · Solo lectura',
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
      if (versionId !== null) this.versionCambiada.emit(versionId);
    });
  }
}
