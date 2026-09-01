import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { FormularioAlcanceProyecto } from '../../../secciones/alcance/components/formulario-alcance-proyecto/formulario-alcance-proyecto';
import type { AlcanceProyecto } from '../../../secciones/alcance/models/alcance-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta Alcance con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-alcance-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioAlcanceProyecto, TarjetaPasoProyecto],
  templateUrl: './paso-alcance-proyecto.html',
})
export class PasoAlcanceProyecto {
  public readonly datos = input.required<AlcanceProyecto | null>();
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<AlcanceProyecto>();
  protected readonly paso = ClaveSeccionProyecto.Alcance;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
