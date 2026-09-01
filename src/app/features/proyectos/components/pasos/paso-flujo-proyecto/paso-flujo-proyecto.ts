import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { EditorFlujoProyecto } from '../../../secciones/flujo/components/editor-flujo-proyecto/editor-flujo-proyecto';
import type { FlujoProyecto } from '../../../secciones/flujo/models/flujo-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta el editor de Flujo con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorFlujoProyecto, TarjetaPasoProyecto],
  templateUrl: './paso-flujo-proyecto.html',
})
export class PasoFlujoProyecto {
  public readonly datos = input.required<FlujoProyecto>();
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<FlujoProyecto>();
  protected readonly flujoTemporal = signal<FlujoProyecto | null>(null);
  protected readonly paso = ClaveSeccionProyecto.Flujo;
  protected readonly modos = ModoFormularioProyecto;
  protected readonly flujoPresentado = computed(() => this.flujoTemporal() ?? this.datos());

  public constructor() {
    effect(() => {
      const datos = this.datos();
      this.modo();
      this.flujoTemporal.set(structuredClone(datos));
    });
  }

  /** Entrega la fotografía temporal confirmada por el usuario. */
  protected confirmar(): void {
    const flujo = this.flujoTemporal();
    if (this.modo() === ModoFormularioProyecto.Edicion && flujo) this.guardar.emit(flujo);
  }
}
