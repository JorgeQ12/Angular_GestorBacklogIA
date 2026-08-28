import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CamposComunesNodoFlujoProyecto } from './campos-comunes-nodo-flujo-proyecto';

@Component({
  selector: 'project-flow-decision-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, ReactiveFormsModule, CamposComunesNodoFlujoProyecto],
  templateUrl: './formulario-decision-flujo-proyecto.html'
})
export class FormularioDecisionFlujoProyecto {
  public readonly form = input.required<FormGroup>();
}

