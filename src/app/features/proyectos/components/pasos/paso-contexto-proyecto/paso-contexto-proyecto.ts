import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { OpcionCatalogo } from '../../../../../core/catalogos/models/opcion-catalogo.model';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import { FormularioContextoProyecto } from '../../../secciones/contexto/components/formulario-contexto-proyecto/formulario-contexto-proyecto';
import type { ContextoProyecto } from '../../../secciones/contexto/models/contexto-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta Contexto con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-contexto-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioContextoProyecto, TarjetaPasoProyecto],
  templateUrl: './paso-contexto-proyecto.html',
})
export class PasoContextoProyecto {
  public readonly datos = input.required<ContextoProyecto | null>();
  public readonly prioridades = input<readonly OpcionCatalogo[]>([]);
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<ContextoProyecto>();
  public readonly nombreCambiado = output<string>();
  protected readonly paso = ClaveSeccionProyecto.Contexto;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
