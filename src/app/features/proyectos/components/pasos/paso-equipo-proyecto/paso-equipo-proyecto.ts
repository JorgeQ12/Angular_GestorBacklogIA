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
  public readonly datos = input.required<EquipoProyecto>();
  public readonly nombreEquipo = input('Team de Azure DevOps');
  public readonly modo = input(ModoFormularioProyecto.Lectura);
  public readonly editable = input(false);
  public readonly procesando = input(false);
  public readonly sincronizando = input(false);
  public readonly sincronizable = input(false);
  public readonly acciones = input<ConfiguracionAccionesPasoProyecto | null>(null);
  public readonly versionamiento = input<VersionamientoPasoProyecto | null>(null);
  public readonly editar = output<void>();
  public readonly cancelar = output<void>();
  public readonly guardar = output<EquipoProyecto>();
  public readonly sincronizar = output<EquipoProyecto>();
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
      (integrante) => integrante.perfilTecnicoCodigo && integrante.dedicacionCodigo,
    ).length;
    return { configurados, pendientes: equipo.integrantes.length - configurados };
  }
}
