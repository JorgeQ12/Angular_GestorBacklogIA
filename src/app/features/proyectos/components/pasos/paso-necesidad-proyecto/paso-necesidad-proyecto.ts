import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../../models/versionamiento-proyecto.model';
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
  /** Fotografía de necesidad que debe presentar o editar el paso. */
  public readonly datos = input.required<NecesidadProyecto | null>();
  /** Modo de interacción vigente para el formulario. */
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  /** Indica si el consumidor permite iniciar una edición. */
  public readonly editable = input(false);
  /** Bloquea acciones mientras se persiste el paso. */
  public readonly procesando = input(false);
  /** Configura las acciones visibles en el pie de la tarjeta. */
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  /** Configura la selección de versiones cuando el caso de uso la ofrece. */
  public readonly versionamiento = input<VersionamientoPasoProyecto | null>(null);
  /** Solicita iniciar la edición de la necesidad. */
  public readonly editar = output<void>();
  /** Solicita descartar los cambios locales. */
  public readonly cancelar = output<void>();
  /** Entrega la necesidad validada para persistirla. */
  public readonly guardar = output<NecesidadProyecto>();
  /** Comunica la versión seleccionada por el usuario. */
  public readonly versionCambiada = output<number>();
  protected readonly paso = ClaveSeccionProyecto.Necesidad;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
