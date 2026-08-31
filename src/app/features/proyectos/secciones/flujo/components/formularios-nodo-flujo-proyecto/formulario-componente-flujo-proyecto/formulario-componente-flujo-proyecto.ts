import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../../../../../../../shared/components/icono/icono.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorCampoDirective } from '../../../../../../../shared/forms/errores-validacion';
import { FormularioNodoFlujoProyecto } from '../../../models/formulario-nodo-flujo-proyecto.model';
import { CamposComunesNodoFlujoProyecto } from '../campos-comunes-nodo-flujo-proyecto/campos-comunes-nodo-flujo-proyecto';

@Component({
  selector: 'app-formulario-componente-flujo-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconoComponent,
    ReactiveFormsModule,
    ErrorCampoDirective,
    CamposComunesNodoFlujoProyecto,
  ],
  templateUrl: './formulario-componente-flujo-proyecto.html',
})
export class FormularioComponenteFlujoProyecto {
  public readonly formulario = input.required<FormularioNodoFlujoProyecto>();
}

