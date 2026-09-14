import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { OpcionCatalogo } from '../../../../../core/catalogos/models/opcion-catalogo.model';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../../models/versionamiento-proyecto.model';
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
  /** Fotografía de contexto que debe presentar o editar el paso. */
  public readonly datos = input.required<ContextoProyecto | null>();
  /** Opciones remotas disponibles para asignar la prioridad. */
  public readonly prioridades = input<readonly OpcionCatalogo[]>([]);
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
  /** Solicita iniciar la edición del contexto. */
  public readonly editar = output<void>();
  /** Solicita descartar los cambios locales. */
  public readonly cancelar = output<void>();
  /** Entrega el contexto validado para persistirlo. */
  public readonly guardar = output<ContextoProyecto>();
  /** Comunica cambios temporales para actualizar el encabezado sin persistir. */
  public readonly contextoCambiado = output<ContextoProyecto>();
  /** Comunica la versión seleccionada por el usuario. */
  public readonly versionCambiada = output<number>();

  /** Conserva paso para coordinar esta responsabilidad. */
  protected readonly paso = ClaveSeccionProyecto.Contexto;

  /** Conserva ID formulario para coordinar esta responsabilidad. */
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
}
