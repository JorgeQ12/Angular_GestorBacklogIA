import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MensajesService } from '../../../../../../core/mensajes/services/mensajes.service';
import { crearUrlFlujoProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioEquipoProyecto } from '../../../../secciones/equipo/components/formulario-equipo-proyecto/formulario-equipo-proyecto';
import {
  combinarEquipoConAzure,
  deserializarEquipoProyecto,
} from '../../../../secciones/equipo/mappers/equipo-proyecto.mapper';
import {
  EquipoProyecto,
  OrigenEquipoAzureProyecto,
} from '../../../../secciones/equipo/models/equipo-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';
import { CreacionProyectoService } from '../../../services/creacion-proyecto.service';

/** Coordina Equipo dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-equipo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioEquipoProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './pagina-equipo-proyecto.html',
  styleUrl: './pagina-equipo-proyecto.css',
})
export class PaginaEquipoProyecto {
  private readonly creacionProyecto = inject(CreacionProyectoService);
  private readonly mensajes = inject(MensajesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly origenActualizado = signal<OrigenEquipoAzureProyecto | null>(null);
  private readonly equipoActualizado = signal<EquipoProyecto | null>(null);

  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);
  protected readonly sincronizando = signal(false);
  protected readonly origenEquipo = computed(
    () => this.origenActualizado() ?? this.paso.borrador()?.equipoAzure ?? null,
  );
  protected readonly equipo = computed<EquipoProyecto>(() => {
    const actualizado = this.equipoActualizado();
    if (actualizado) return actualizado;

    const borrador = this.paso.borrador();
    if (!borrador) return { integrantes: [] };
    const guardado = deserializarEquipoProyecto(borrador.equipoJson) ?? { integrantes: [] };
    const origen = this.origenEquipo();
    return origen ? combinarEquipoConAzure(origen, guardado) : guardado;
  });
  protected readonly nombreEquipo = computed(
    () => this.origenEquipo()?.nombreEquipo || 'Team de Azure DevOps',
  );

  public constructor() {
    this.paso.cargar();
  }

  /** Renueva la membresía de Azure preservando las asignaciones del formulario. */
  protected sincronizarEquipo(equipoVigente: EquipoProyecto): void {
    if (this.sincronizando()) return;

    this.sincronizando.set(true);
    this.creacionProyecto
      .sincronizarEquipoAzure(this.paso.proyectoId)
      .pipe(
        finalize(() => this.sincronizando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (origen) => {
          this.origenActualizado.set(origen);
          this.equipoActualizado.set(combinarEquipoConAzure(origen, equipoVigente));
        },
        error: () => {
          void this.mensajes.error(
            'No fue posible actualizar el equipo',
            'Revisa la membresía del Team en Azure DevOps e intenta nuevamente.',
          );
        },
      });
  }

  /** Guarda Equipo y abre Flujo de usuario. */
  protected guardarEquipo(equipo: EquipoProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Equipo, datos: equipo },
      crearUrlFlujoProyecto,
    );
  }
}
