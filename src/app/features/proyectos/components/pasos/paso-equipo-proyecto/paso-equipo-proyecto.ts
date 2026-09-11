import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import type { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { construirIdFormularioPasoProyecto } from '../../../config/pasos-proyecto.config';
import { ClaveSeccionProyecto } from '../../../config/secciones-proyecto.config';
import type { AccionesPasoProyecto as ConfiguracionAccionesPasoProyecto } from '../../../models/acciones-paso-proyecto.model';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type { VersionamientoPasoProyecto } from '../../../models/versionamiento-proyecto.model';
import { FormularioEquipoProyecto } from '../../../secciones/equipo/components/formulario-equipo-proyecto/formulario-equipo-proyecto';
import type {
  EquipoProyecto,
  ProgresoEquipoProyecto,
} from '../../../secciones/equipo/models/equipo-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';

/** Presenta Equipo y expone la sincronización como una capacidad opcional del consumidor. */
@Component({
  selector: 'app-paso-equipo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioEquipoProyecto, IconoComponent, TarjetaPasoProyecto],
  templateUrl: './paso-equipo-proyecto.html',
})
export class PasoEquipoProyecto {
  /** Fotografía del equipo que debe presentar o editar el paso. */
  public readonly datos = input.required<EquipoProyecto>();
  /** Nombre del equipo asociado en Azure DevOps. */
  public readonly nombreEquipo = input('Team de Azure DevOps');
  /** Perfiles técnicos activos que pueden asignarse a los integrantes. */
  public readonly perfilesTecnicos = input<readonly OpcionSelector[]>([]);
  /** Modo de interacción vigente para el formulario. */
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  /** Indica si el consumidor permite iniciar una edición. */
  public readonly editable = input(false);
  /** Bloquea acciones mientras se persiste el paso. */
  public readonly procesando = input(false);
  /** Indica que existe una sincronización remota en curso. */
  public readonly sincronizando = input(false);
  /** Habilita la acción opcional de sincronización. */
  public readonly sincronizable = input(false);
  /** Configura las acciones visibles en el pie de la tarjeta. */
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  /** Configura la selección de versiones cuando el caso de uso la ofrece. */
  public readonly versionamiento = input<VersionamientoPasoProyecto | null>(null);
  /** Solicita iniciar la edición del equipo. */
  public readonly editar = output<void>();
  /** Solicita descartar los cambios locales. */
  public readonly cancelar = output<void>();
  /** Entrega el equipo validado para persistirlo. */
  public readonly guardar = output<EquipoProyecto>();
  /** Entrega la fotografía local que debe sincronizarse. */
  public readonly sincronizar = output<EquipoProyecto>();
  /** Comunica la versión seleccionada por el usuario. */
  public readonly versionCambiada = output<number>();

  private readonly formulario = viewChild(FormularioEquipoProyecto);
  private readonly progresoTemporal = signal<ProgresoEquipoProyecto | null>(null);
  protected readonly paso = ClaveSeccionProyecto.Equipo;
  protected readonly idFormulario = construirIdFormularioPasoProyecto(this.paso);
  protected readonly modos = ModoFormularioProyecto;
  protected readonly detalle = computed(() => {
    const progreso = this.progresoTemporal() ?? this.calcularProgreso(this.datos());
    return {
      icono: 'azureDevOps' as const,
      principal: this.nombreEquipo(),
      secundario: `${progreso.configurados} configurados · ${progreso.pendientes} pendientes`,
    };
  });

  public constructor() {
    effect(() => {
      this.datos();
      this.modo();
      this.progresoTemporal.set(null);
    });
  }

  /** Conserva el progreso emitido por la edición vigente. */
  protected actualizarProgreso(progreso: ProgresoEquipoProyecto): void {
    this.progresoTemporal.set(progreso);
  }

  /** Entrega la fotografía local al consumidor antes de sincronizar. */
  protected solicitarSincronizacion(): void {
    this.sincronizar.emit(this.formulario()?.obtenerDatosVigentes() ?? this.datos());
  }

  private calcularProgreso(equipo: EquipoProyecto): ProgresoEquipoProyecto {
    const configurados = equipo.integrantes.filter(
      (integrante) => integrante.perfilTecnicoId !== null && integrante.dedicacionCodigo,
    ).length;
    return { configurados, pendientes: equipo.integrantes.length - configurados };
  }
}
