import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioRolesProyecto } from '../../../../secciones/roles/components/formulario-roles-proyecto/formulario-roles-proyecto';
import { deserializarRolesProyecto } from '../../../../secciones/roles/mappers/roles-proyecto.mapper';
import { RolesProyecto } from '../../../../secciones/roles/models/roles-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Integra Roles con el estado del recorrido de creación. */
@Component({
  selector: 'app-paso-roles-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioRolesProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './paso-roles-proyecto.html',
  styleUrl: './paso-roles-proyecto.css',
})
export class PasoRolesProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);

  /** Solicita a la página abrir el siguiente paso después de guardar. */
  public readonly completado = output<void>();

  protected readonly roles = computed<RolesProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarRolesProyecto(borrador.rolesJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Roles antes de continuar. */
  protected guardarRoles(roles: RolesProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Roles, datos: roles },
      () => this.completado.emit(),
    );
  }
}
