import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import {
  AlineacionAccionesPasoProyecto,
  type AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto,
} from '../../models/acciones-paso-proyecto.model';

/** Presenta el footer configurado por el caso de uso sin conocer su persistencia. */
@Component({
  selector: 'app-acciones-paso-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './acciones-paso-proyecto.html',
})
export class AccionesPasoProyecto {
  private readonly documento = inject(DOCUMENT);
  protected readonly alineaciones = AlineacionAccionesPasoProyecto;

  /** Define textos e iconos de las acciones vigentes. */
  public readonly configuracion = input.required<ConfiguracionAccionesPasoProyecto>();

  /** Bloquea el envío durante una operación remota. */
  public readonly procesando = input(false);

  /** Vincula la acción principal con el formulario presentado dentro de la tarjeta. */
  public readonly idFormulario = input<string | null>(null);

  /** Solicita ejecutar la acción secundaria configurada. */
  public readonly cancelar = output<void>();

  /** Confirma desde editores cuyo contenido no utiliza un formulario nativo. */
  public readonly confirmar = output<void>();

  /** Envía explícitamente el formulario proyectado o delega la confirmación al editor. */
  protected ejecutarAccionPrincipal(): void {
    const formularioId = this.idFormulario();
    if (!formularioId) {
      this.confirmar.emit();
      return;
    }

    const formulario = this.documento.getElementById(formularioId);
    if (formulario instanceof HTMLFormElement) formulario.requestSubmit();
  }
}
