import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import {
  ACENTOS_TIPO_BLOQUE_FLUJO,
  ICONOS_TIPO_BLOQUE_FLUJO,
} from '../../config/flujo-proyecto.config';
import { TipoBloqueFlujo } from '../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../services/estado-editor-flujo-proyecto.service';

/** Presenta los tipos de bloque disponibles para incorporarlos al lienzo. */
@Component({
  selector: 'app-paleta-bloques-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './paleta-bloques-flujo-proyecto.html',
  styleUrl: './paleta-bloques-flujo-proyecto.css',
})
export class PaletaBloquesFlujoProyecto {

  /** Proporciona acceso al servicio de estado editor flujo proyecto. */
  protected readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);

  /** Deriva opciones a partir del estado vigente. */
  protected readonly opciones = computed(() => this.estadoEditor.opcionesTipoBloque());

  /** Conserva iconos tipo para coordinar esta responsabilidad. */
  protected readonly iconosTipo = ICONOS_TIPO_BLOQUE_FLUJO;

  /** Conserva acentos tipo para coordinar esta responsabilidad. */
  protected readonly acentosTipo = ACENTOS_TIPO_BLOQUE_FLUJO;

  /** Crea bloque dentro del flujo actual. */
  protected crearBloque(tipo: TipoBloqueFlujo): void {
    this.estadoEditor.iniciarCreacionNodo(tipo);
  }
}
