import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ICONOS_TIPO_BLOQUE_FLUJO } from '../../config/flujo-proyecto.config';
import { FlowBlockType } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

@Component({
  selector: 'app-paleta-bloques-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './paleta-bloques-flujo-proyecto.html',
  styleUrl: './paleta-bloques-flujo-proyecto.css'
})
export class PaletaBloquesFlujoProyecto {
  protected readonly store = inject(EstadoEditorFlujoProyectoService);

  protected readonly options = computed(() => this.store.blockTypeOptions());
  protected readonly typeIcons = ICONOS_TIPO_BLOQUE_FLUJO;

  protected createBlock(type: FlowBlockType): void {
    this.store.startNodeCreation(type);
  }
}

