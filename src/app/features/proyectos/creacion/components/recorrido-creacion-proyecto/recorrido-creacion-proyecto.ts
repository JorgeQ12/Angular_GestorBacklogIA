import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  ClaveEtapaCreacionProyecto,
  ETAPAS_CREACION_PROYECTO,
} from '../../config/etapas-creacion-proyecto.config';

/** Presenta el avance y las opciones habilitadas dentro de la creación del proyecto. */
@Component({
  selector: 'app-recorrido-creacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './recorrido-creacion-proyecto.html',
  styleUrl: './recorrido-creacion-proyecto.css',
})
export class RecorridoCreacionProyecto {
  /** Identifica la etapa activa del recorrido. */
  public readonly etapaActual = input.required<ClaveEtapaCreacionProyecto>();

  /** Identifica las etapas cuya información ya fue completada. */
  public readonly etapasCompletadas = input<readonly ClaveEtapaCreacionProyecto[]>([]);

  /** Identifica las etapas que permiten navegación desde el estado actual. */
  public readonly etapasNavegables = input<readonly ClaveEtapaCreacionProyecto[]>([]);

  /** Solicita abrir una etapa habilitada del recorrido. */
  public readonly etapaSeleccionada = output<ClaveEtapaCreacionProyecto>();

  protected readonly etapas = ETAPAS_CREACION_PROYECTO;
  protected readonly posicionActual = computed(() => {
    const indice = this.etapas.findIndex((etapa) => etapa.clave === this.etapaActual());
    return indice >= 0 ? indice + 1 : 1;
  });
  protected readonly porcentajeRecorrido = computed(
    () => (this.posicionActual() / this.etapas.length) * 100,
  );
  protected readonly textoProgreso = computed(
    () => `Paso ${this.posicionActual()} de ${this.etapas.length}`,
  );

  private readonly clavesCompletadas = computed(
    () => new Set<ClaveEtapaCreacionProyecto>(this.etapasCompletadas()),
  );
  private readonly clavesNavegables = computed(
    () => new Set<ClaveEtapaCreacionProyecto>(this.etapasNavegables()),
  );

  /** Determina si la etapa representa la ubicación actual. */
  protected esActual(clave: ClaveEtapaCreacionProyecto): boolean {
    return clave === this.etapaActual();
  }

  /** Determina si la etapa tiene información completada. */
  protected estaCompletada(clave: ClaveEtapaCreacionProyecto): boolean {
    return this.clavesCompletadas().has(clave);
  }

  /** Determina si la página habilitó la navegación hacia una etapa diferente. */
  protected puedeSeleccionar(clave: ClaveEtapaCreacionProyecto): boolean {
    return !this.esActual(clave) && this.clavesNavegables().has(clave);
  }

  /** Comunica la etapa elegida para que la página resuelva su navegación. */
  protected seleccionarEtapa(clave: ClaveEtapaCreacionProyecto): void {
    if (this.puedeSeleccionar(clave)) this.etapaSeleccionada.emit(clave);
  }
}
