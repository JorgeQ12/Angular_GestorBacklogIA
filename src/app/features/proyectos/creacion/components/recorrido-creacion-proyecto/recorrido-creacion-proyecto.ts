import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  ClavePasoCreacionProyecto,
  PASOS_CREACION_PROYECTO,
} from '../../config/pasos-creacion-proyecto.config';

/** Presenta el avance y las opciones habilitadas dentro de la creación del proyecto. */
@Component({
  selector: 'app-recorrido-creacion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './recorrido-creacion-proyecto.html',
  styleUrl: './recorrido-creacion-proyecto.css',
})
export class RecorridoCreacionProyecto {
  /** Identifica el paso activo del recorrido. */
  public readonly pasoActual = input.required<ClavePasoCreacionProyecto>();

  /** Identifica los pasos cuya información ya fue completada. */
  public readonly pasosCompletados = input<readonly ClavePasoCreacionProyecto[]>([]);

  /** Identifica los pasos que permiten navegación desde el estado actual. */
  public readonly pasosNavegables = input<readonly ClavePasoCreacionProyecto[]>([]);

  /** Solicita abrir un paso habilitado del recorrido. */
  public readonly pasoSeleccionado = output<ClavePasoCreacionProyecto>();

  protected readonly pasos = PASOS_CREACION_PROYECTO;
  protected readonly posicionActual = computed(() => {
    const indice = this.pasos.findIndex((paso) => paso.clave === this.pasoActual());
    return indice >= 0 ? indice + 1 : 1;
  });
  protected readonly porcentajeRecorrido = computed(
    () => (this.posicionActual() / this.pasos.length) * 100,
  );
  protected readonly textoProgreso = computed(
    () => `Paso ${this.posicionActual()} de ${this.pasos.length}`,
  );

  private readonly clavesCompletadas = computed(
    () => new Set<ClavePasoCreacionProyecto>(this.pasosCompletados()),
  );
  private readonly clavesNavegables = computed(
    () => new Set<ClavePasoCreacionProyecto>(this.pasosNavegables()),
  );

  /** Determina si el paso representa la ubicación actual. */
  protected esActual(clave: ClavePasoCreacionProyecto): boolean {
    return clave === this.pasoActual();
  }

  /** Determina si el paso tiene información completada. */
  protected estaCompletado(clave: ClavePasoCreacionProyecto): boolean {
    return this.clavesCompletadas().has(clave);
  }

  /** Determina si la página habilitó la navegación hacia un paso diferente. */
  protected puedeSeleccionar(clave: ClavePasoCreacionProyecto): boolean {
    return !this.esActual(clave) && this.clavesNavegables().has(clave);
  }

  /** Comunica el paso elegido para que la página resuelva su navegación. */
  protected seleccionarPaso(clave: ClavePasoCreacionProyecto): void {
    if (this.puedeSeleccionar(clave)) this.pasoSeleccionado.emit(clave);
  }
}
