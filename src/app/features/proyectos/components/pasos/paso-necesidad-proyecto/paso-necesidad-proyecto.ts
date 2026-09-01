import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { FormularioNecesidadProyecto } from '../../../secciones/necesidad/components/formulario-necesidad-proyecto/formulario-necesidad-proyecto';
import type { NecesidadProyecto } from '../../../secciones/necesidad/models/necesidad-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta Necesidad con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-necesidad-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioNecesidadProyecto, TarjetaPasoProyecto],
  templateUrl: './paso-necesidad-proyecto.html',
})
export class PasoNecesidadProyecto {
  public readonly datos = input.required<NecesidadProyecto | null>();
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<NecesidadProyecto>();
  protected readonly paso = ClaveSeccionProyecto.Necesidad;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
