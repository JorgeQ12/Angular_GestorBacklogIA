import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { FormularioTipoSolucionProyecto } from '../../../secciones/tipo-solucion/components/formulario-tipo-solucion-proyecto/formulario-tipo-solucion-proyecto';
import type { TipoSolucionProyecto } from '../../../secciones/tipo-solucion/models/tipo-solucion-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta Tipo de solución con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-tipo-solucion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioTipoSolucionProyecto, TarjetaPasoProyecto],
  templateUrl: './paso-tipo-solucion-proyecto.html',
})
export class PasoTipoSolucionProyecto {
  public readonly datos = input.required<TipoSolucionProyecto | null>();
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<TipoSolucionProyecto>();
  protected readonly paso = ClaveSeccionProyecto.TipoSolucion;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
