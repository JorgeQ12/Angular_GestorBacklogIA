import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../../models/versionamiento-proyecto.model';
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
  /** Fotografía de objetivos que debe presentar o editar el paso. */
  public readonly datos = input.required<ObjetivosProyecto | null>();
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
  /** Solicita iniciar la edición de los objetivos. */
  public readonly editar = output<void>();
  /** Solicita descartar los cambios locales. */
  public readonly cancelar = output<void>();
  /** Entrega los objetivos validados para persistirlos. */
  public readonly guardar = output<ObjetivosProyecto>();
  /** Comunica la versión seleccionada por el usuario. */
  public readonly versionCambiada = output<number>();
  protected readonly paso = ClaveSeccionProyecto.Objetivos;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
