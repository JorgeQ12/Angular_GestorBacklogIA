import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../../models/versionamiento-proyecto.model';
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
  /** Fotografía de alcance que debe presentar o editar el paso. */
  public readonly datos = input.required<AlcanceProyecto | null>();
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
  /** Solicita iniciar la edición del alcance. */
  public readonly editar = output<void>();
  /** Solicita descartar los cambios locales. */
  public readonly cancelar = output<void>();
  /** Entrega el alcance validado para persistirlo. */
  public readonly guardar = output<AlcanceProyecto>();
  /** Comunica la versión seleccionada por el usuario. */
  public readonly versionCambiada = output<number>();

  /** Conserva paso para coordinar esta responsabilidad. */
  protected readonly paso = ClaveSeccionProyecto.Alcance;

  /** Conserva ID formulario para coordinar esta responsabilidad. */
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
