import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import {
  ACENTOS_TIPO_BLOQUE_FLUJO,
  ICONOS_TIPO_BLOQUE_FLUJO,
} from '../../config/flujo-proyecto.config';
import { TipoBloqueFlujo } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

@Component({
  selector: 'app-paleta-bloques-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './paleta-bloques-flujo-proyecto.html',
  styleUrl: './paleta-bloques-flujo-proyecto.css',
})
export class PaletaBloquesFlujoProyecto {
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);

  protected readonly opciones = computed(() => this.estadoEditor.opcionesTipoBloque());
  protected readonly iconosTipo = ICONOS_TIPO_BLOQUE_FLUJO;
  protected readonly acentosTipo = ACENTOS_TIPO_BLOQUE_FLUJO;

  protected crearBloque(tipo: TipoBloqueFlujo): void {
    this.estadoEditor.iniciarCreacionNodo(tipo);
  }
}

