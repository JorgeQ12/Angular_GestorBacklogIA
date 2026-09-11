import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { CampoBusqueda } from '../../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
import type { VersionPlanificacion } from '../../models/version-planificacion.model';
import { SelectorVersionPlanificacionComponent } from '../selector-version-planificacion/selector-version-planificacion';

/** Presenta la barra principal para buscar y cambiar la vista de planificación. */
@Component({
  selector: 'app-controles-vista-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CampoBusqueda,
    IconoComponent,
    SelectorVersionPlanificacionComponent,
  ],
  templateUrl: './controles-vista-planificacion.html',
  styleUrl: './controles-vista-planificacion.css',
})
export class ControlesVistaPlanificacionComponent {

  /** Conserva ID búsqueda para coordinar esta responsabilidad. */
  protected readonly idBusqueda = 'buscar-elemento-planificacion';
  /** Proporciona el término vigente de búsqueda. */
  public readonly terminoBusqueda = input('');
  /** Indica si alguna rama conserva expansión manual. */
  public readonly expansionCompleta = input(false);
  /** Indica si la fotografía contiene ramas expandibles. */
  public readonly expansionDeshabilitada = input(false);
  /** Controla si la versión presentada admite consultar elementos eliminados. */
  public readonly mostrarInclusionEliminados = input(true);
  /** Indica si la fotografía vigente muestra elementos eliminados. */
  public readonly incluirEliminados = input(false);
  /** Impide cambios mientras otra operación modifica la fotografía presentada. */
  public readonly deshabilitado = input(false);
  /** Determina si la versión vigente permite iniciar una generación mediante IA. */
  public readonly mostrarGeneracion = input(true);
  /** Refleja si el asistente de generación se encuentra desplegado. */
  public readonly generacionAbierta = input(false);
  /** Proporciona las versiones disponibles para la fotografía integral. */
  public readonly versiones = input<readonly VersionPlanificacion[]>([]);
  /** Identifica la versión presentada actualmente. */
  public readonly versionSeleccionadaId = input<number | null>(null);
  /** Comunica el alcance de visualización elegido por el usuario. */
  public readonly inclusionEliminadosCambiada = output<boolean>();
  /** Comunica el criterio escrito para filtrar el árbol. */
  public readonly busquedaCambiada = output<string>();
  /** Solicita expandir o contraer todas las ramas. */
  public readonly expansionCompletaCambiada = output<boolean>();
  /** Solicita presentar la planificación mediante el diagrama temporal. */
  public readonly ganttSolicitado = output<void>();
  /** Solicita abrir o cerrar el asistente de generación mediante IA. */
  public readonly generacionAlternada = output<void>();
  /** Solicita presentar otra versión integral de la planificación. */
  public readonly versionCambiada = output<number>();

  /** Administra búsqueda control mediante formularios reactivos. */
  protected readonly busquedaControl = new FormControl('', { nonNullable: true });

  /** Conserva panel vista abierto como estado reactivo de la instancia. */
  protected readonly panelVistaAbierto = signal(false);

  public constructor() {
    effect(() => {
      const termino = this.terminoBusqueda();
      if (this.busquedaControl.value !== termino) {
        this.busquedaControl.setValue(termino, { emitEvent: false });
      }

      if (this.deshabilitado()) this.busquedaControl.disable({ emitEvent: false });
      else this.busquedaControl.enable({ emitEvent: false });
    });

    this.busquedaControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((termino) => this.busquedaCambiada.emit(termino));
  }

  /** Ejecuta cambiar inclusion como parte del flujo interno. */
  protected cambiarInclusion(evento: Event): void {
    const control = evento.target;
    if (control instanceof HTMLInputElement) {
      this.inclusionEliminadosCambiada.emit(control.checked);
    }
  }

  /** Ejecuta cambiar expansion como parte del flujo interno. */
  protected cambiarExpansion(evento: Event): void {
    const control = evento.target;
    if (control instanceof HTMLInputElement) {
      this.expansionCompletaCambiada.emit(control.checked);
    }
  }

  /** Alterna panel vista dentro del flujo actual. */
  protected alternarPanelVista(evento: MouseEvent): void {
    evento.stopPropagation();
    this.panelVistaAbierto.update((abierto) => !abierto);
  }

  /** Abre gantt dentro del flujo actual. */
  protected abrirGantt(): void {
    this.panelVistaAbierto.set(false);
    this.ganttSolicitado.emit();
  }

  /** Cierra panel vista dentro del flujo actual. */
  @HostListener('document:click')
  protected cerrarPanelVista(): void {
    this.panelVistaAbierto.set(false);
  }

  /** Cierra panel vista con escape dentro del flujo actual. */
  @HostListener('document:keydown.escape')
  protected cerrarPanelVistaConEscape(): void {
    this.panelVistaAbierto.set(false);
  }
}
