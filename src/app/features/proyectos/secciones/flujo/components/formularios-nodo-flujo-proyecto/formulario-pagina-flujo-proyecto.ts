import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CamposComunesNodoFlujoProyecto } from './campos-comunes-nodo-flujo-proyecto';

@Component({
  selector: 'project-flow-screen-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, ReactiveFormsModule, CamposComunesNodoFlujoProyecto],
  templateUrl: './formulario-pagina-flujo-proyecto.html'
})
export class FormularioPaginaFlujoProyecto {
  public readonly form = input.required<FormGroup>();
}

