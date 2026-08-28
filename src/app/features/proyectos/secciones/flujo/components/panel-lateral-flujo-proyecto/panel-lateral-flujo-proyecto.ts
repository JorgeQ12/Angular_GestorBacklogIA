import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PaletaBloquesFlujoProyecto } from '../paleta-bloques-flujo-proyecto/paleta-bloques-flujo-proyecto';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

@Component({
  selector: 'app-panel-lateral-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaletaBloquesFlujoProyecto],
  templateUrl: './panel-lateral-flujo-proyecto.html',
  styleUrl: './panel-lateral-flujo-proyecto.css'
})
export class PanelLateralFlujoProyecto {
  protected readonly store = inject(EstadoEditorFlujoProyectoService);
}

