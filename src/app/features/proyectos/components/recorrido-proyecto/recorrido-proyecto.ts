import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import {
  type ClavePasoProyecto,
  PASOS_PROYECTO,
} from '../../config/pasos-proyecto.config';

/** Presenta el recorrido común y delega al caso de uso sus reglas de navegación. */
@Component({
  selector: 'app-recorrido-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent],
  templateUrl: './recorrido-proyecto.html',
  styleUrl: './recorrido-proyecto.css',
})
export class RecorridoProyecto {
  /** Identifica el paso activo. */
  public readonly pasoActual = input.required<ClavePasoProyecto>();

  /** Identifica los pasos cuya información ya fue completada. */
  public readonly pasosCompletados = input<readonly ClavePasoProyecto[]>([]);

  /** Identifica los pasos que permiten navegación. */
  public readonly pasosNavegables = input<readonly ClavePasoProyecto[]>([]);

  /** Define si debe presentarse el avance secuencial de Creación. */
  public readonly mostrarProgreso = input(true);

  /** Personaliza la identidad del recorrido sin alterar sus pasos. */
  public readonly titulo = input('Definición del proyecto');

  /** Solicita al contenedor presentar otro paso habilitado. */
  public readonly pasoSeleccionado = output<ClavePasoProyecto>();

  protected readonly pasos = PASOS_PROYECTO;
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
    () => new Set<ClavePasoProyecto>(this.pasosCompletados()),
  );
  private readonly clavesNavegables = computed(
    () => new Set<ClavePasoProyecto>(this.pasosNavegables()),
  );

  /** Determina si el paso representa la ubicación actual. */
  protected esActual(clave: ClavePasoProyecto): boolean {
    return clave === this.pasoActual();
  }

  /** Determina si el paso tiene información completada. */
  protected estaCompletado(clave: ClavePasoProyecto): boolean {
    return this.clavesCompletadas().has(clave);
  }

  /** Determina si el caso de uso permite seleccionar otro paso. */
  protected puedeSeleccionar(clave: ClavePasoProyecto): boolean {
    return !this.esActual(clave) && this.clavesNavegables().has(clave);
  }

  /** Comunica una selección válida sin conocer rutas ni avance. */
  protected seleccionarPaso(clave: ClavePasoProyecto): void {
    if (this.puedeSeleccionar(clave)) this.pasoSeleccionado.emit(clave);
  }
}
