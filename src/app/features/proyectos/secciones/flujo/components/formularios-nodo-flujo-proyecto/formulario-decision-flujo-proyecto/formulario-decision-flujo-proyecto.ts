import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../../../../../../../shared/components/icono/icono.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormularioNodoFlujoProyecto } from '../../../models/formulario-nodo-flujo-proyecto.model';
import { ErrorCampoDirective } from '../../../../../../../shared/forms/errores-validacion';
import { CamposComunesNodoFlujoProyecto } from '../campos-comunes-nodo-flujo-proyecto/campos-comunes-nodo-flujo-proyecto';

@Component({
  selector: 'app-formulario-decision-flujo-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, ReactiveFormsModule, ErrorCampoDirective, CamposComunesNodoFlujoProyecto],
  templateUrl: './formulario-decision-flujo-proyecto.html',
})
export class FormularioDecisionFlujoProyecto {
  public readonly formulario = input.required<FormularioNodoFlujoProyecto>();
}

