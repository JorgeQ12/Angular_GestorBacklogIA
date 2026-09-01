import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { FormularioObjetivosProyecto } from '../../../secciones/objetivos/components/formulario-objetivos-proyecto/formulario-objetivos-proyecto';
import type { ObjetivosProyecto } from '../../../secciones/objetivos/models/objetivos-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta Objetivos con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-objetivos-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioObjetivosProyecto, TarjetaPasoProyecto],
  templateUrl: './paso-objetivos-proyecto.html',
})
export class PasoObjetivosProyecto {
  public readonly datos = input.required<ObjetivosProyecto | null>();
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<ObjetivosProyecto>();
  protected readonly paso = ClaveSeccionProyecto.Objetivos;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
