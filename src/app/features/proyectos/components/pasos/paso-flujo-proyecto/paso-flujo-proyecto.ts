import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../../models/versionamiento-proyecto.model';
import { EditorFlujoProyecto } from '../../../secciones/flujo/components/editor-flujo-proyecto/editor-flujo-proyecto';
import type { FlujoProyecto } from '../../../secciones/flujo/models/flujo-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta el editor de Flujo con la misma composición en cualquier caso de uso. */
@Component({
  selector: 'app-paso-flujo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorFlujoProyecto, IconoComponent, TarjetaPasoProyecto],
  templateUrl: './paso-flujo-proyecto.html',
})
export class PasoFlujoProyecto {
  private readonly mensajes = inject(MensajesService);
  /** Fotografía del flujo que debe presentar o editar el paso. */
  public readonly datos = input.required<FlujoProyecto>();
  /** Modo de interacción vigente para el editor. */
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  /** Indica si el consumidor permite iniciar una edición. */
  public readonly editable = input(false);
  /** Bloquea acciones mientras se persiste el flujo. */
  public readonly procesando = input(false);
  /** Indica que existe una generación remota en curso. */
  public readonly generandoConIA = input(false);
  /** Señala cambios del borrador todavía no confirmados en esta instancia. */
  public readonly cambioInicialPendiente = input(false);
  /** Configura las acciones visibles en el pie de la tarjeta. */
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  /** Configura la selección de versiones cuando el caso de uso la ofrece. */
  public readonly versionamiento = input<VersionamientoPasoProyecto | null>(null);
  /** Solicita iniciar la edición del flujo. */
  public readonly editar = output<void>();
  /** Solicita descartar los cambios locales. */
  public readonly cancelar = output<void>();
  /** Entrega el flujo validado para finalizar el guardado del paso. */
  public readonly guardar = output<FlujoProyecto>();
  /** Entrega el flujo para una persistencia intermedia del borrador. */
  public readonly guardarBorrador = output<FlujoProyecto>();
  /** Solicita generar una propuesta de flujo mediante IA. */
  public readonly generarConIA = output<void>();
  /** Comunica la versión seleccionada por el usuario. */
  public readonly versionCambiada = output<number>();
  protected readonly flujoTemporal = signal<FlujoProyecto | null>(null);
  protected readonly paso = ClaveSeccionProyecto.Flujo;
  protected readonly modos = ModoFormularioProyecto;
  protected readonly flujoPresentado = computed(() => this.flujoTemporal() ?? this.datos());
  protected readonly tieneContenido = computed(() => this.flujoPresentado().nodos.length > 0);
  protected readonly ocupado = computed(() => this.procesando() || this.generandoConIA());
  protected readonly cambiosPendientes = computed(
    () =>
      this.cambioInicialPendiente() ||
      JSON.stringify(this.flujoPresentado()) !== JSON.stringify(this.datos()),
  );

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

  /** Entrega la fotografía modificada para guardarla sin finalizar el proyecto. */
  protected guardarCambiosEnBorrador(): void {
    const flujo = this.flujoTemporal();
    if (
      this.modo() !== ModoFormularioProyecto.Edicion ||
      !flujo ||
      !this.cambiosPendientes() ||
      this.ocupado()
    ) {
      return;
    }

    this.guardarBorrador.emit(flujo);
  }

  /** Solicita una propuesta nueva y confirma antes de reemplazar un diagrama existente. */
  protected async solicitarGeneracionConIA(): Promise<void> {
    if (this.modo() !== ModoFormularioProyecto.Edicion || this.ocupado()) return;

    if (this.tieneContenido()) {
      const confirmado = await this.mensajes.confirmar(
        'Regenerar diagrama con IA',
        'El diagrama actual será reemplazado por una nueva propuesta. Podrás revisarla antes de guardar el proyecto.',
        'Regenerar',
      );
      if (!confirmado) return;
    }

    this.generarConIA.emit();
  }
}
