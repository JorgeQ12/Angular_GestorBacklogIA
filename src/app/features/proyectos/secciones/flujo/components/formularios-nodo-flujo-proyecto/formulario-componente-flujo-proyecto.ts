import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CamposComunesNodoFlujoProyecto } from './campos-comunes-nodo-flujo-proyecto';

@Component({
  selector: 'project-flow-form-node-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, ReactiveFormsModule, CamposComunesNodoFlujoProyecto],
  templateUrl: './formulario-componente-flujo-proyecto.html'
})
export class FormularioComponenteFlujoProyecto {
  public readonly form = input.required<FormGroup>();

  protected isInvalid(controlName: string): boolean {
    const control = this.form().get(controlName);
    return Boolean(control?.invalid && (control.touched || control.dirty));
  }
}

