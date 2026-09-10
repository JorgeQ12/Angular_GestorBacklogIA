import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../../../../../../../shared/components/icono/icono.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormularioNodoFlujoProyecto } from '../../../models/formulario-nodo-flujo-proyecto.model';
import { ErrorCampoDirective } from '../../../../../../../shared/forms/errores-validacion';
import { CamposComunesNodoFlujoProyecto } from '../campos-comunes-nodo-flujo-proyecto/campos-comunes-nodo-flujo-proyecto';

/** Presenta la configuración de una acción mediante el formulario de nodo compartido. */
@Component({
  selector: 'app-formulario-accion-flujo-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconoComponent,
    ReactiveFormsModule,
    ErrorCampoDirective,
    CamposComunesNodoFlujoProyecto,
  ],
  templateUrl: './formulario-accion-flujo-proyecto.html',
})
export class FormularioAccionFlujoProyecto {
  /** Formulario tipado administrado por el modal contenedor. */
  public readonly formulario = input.required<FormularioNodoFlujoProyecto>();
}
