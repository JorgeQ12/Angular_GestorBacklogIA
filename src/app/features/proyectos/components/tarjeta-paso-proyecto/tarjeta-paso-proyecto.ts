import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconoComponent } from '../../../../shared/components/icono/icono.component';
import type { NombreIconoAplicacion } from '../../../../shared/components/icono/iconos-aplicacion';
import { type ClavePasoProyecto, obtenerPasoProyecto } from '../../config/pasos-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../models/versionamiento-proyecto.model';
import { AccionesPasoProyecto } from '../acciones-paso-proyecto/acciones-paso-proyecto';
import { SelectorVersionProyecto } from '../selector-version-proyecto/selector-version-proyecto';

/** Describe un contexto dinámico que reemplaza la descripción estática del paso. */
export interface DetalleEncabezadoPasoProyecto {
  readonly icono: NombreIconoAplicacion;
  readonly principal: string;
  readonly secundario: string;
}

/** Proporciona encabezado, contenido y superficie común a todos los pasos del proyecto. */
@Component({
  selector: 'app-tarjeta-paso-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccionesPasoProyecto, IconoComponent, SelectorVersionProyecto],
  templateUrl: './tarjeta-paso-proyecto.html',
  styleUrl: './tarjeta-paso-proyecto.css',
})
export class TarjetaPasoProyecto {
  /** Selecciona la identidad declarada en el catálogo compartido. */
  public readonly paso = input.required<ClavePasoProyecto>();

  /** Define si el contenido se consulta o se edita. */
  public readonly modo = input(ModoFormularioProyecto.Lectura);

  /** Autoriza ofrecer edición sobre la fotografía presentada. */
  public readonly editable = input(false);

  /** Presenta información dinámica, por ejemplo el Team y su progreso. */
  public readonly detalle = input<DetalleEncabezadoPasoProyecto | null>(null);

  /** Configura el footer compartido cuando el paso se encuentra en edición. */
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);

  /** Vincula la acción principal con el formulario proyectado. */
  public readonly idFormulario = input<string | null>(null);

  /** Bloquea las acciones del footer durante una operación coordinada. */
  public readonly procesando = input(false);

  /** Habilita la selección transversal de versión en el encabezado. */
  public readonly versionamiento = input<VersionamientoPasoProyecto | null>(null);

  /** Solicita al caso de uso habilitar la edición. */
  public readonly editar = output<void>();

  /** Solicita cancelar la edición vigente. */
  public readonly cancelar = output<void>();

  /** Confirma pasos que no utilizan un formulario nativo. */
  public readonly confirmar = output<void>();

  /** Solicita presentar otra versión desde el encabezado. */
  public readonly versionCambiada = output<number>();

  protected readonly modos = ModoFormularioProyecto;
  protected readonly definicion = computed(() => obtenerPasoProyecto(this.paso()));
}
