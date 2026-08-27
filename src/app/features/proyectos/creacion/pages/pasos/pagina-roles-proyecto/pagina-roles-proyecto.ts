import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { crearUrlEquipoProyecto } from '../../../../../../core/navegacion/rutas';
import { EstadoError } from '../../../../../../shared/components/estado-error/estado-error';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { ClaveSeccionProyecto } from '../../../../config/secciones-proyecto.config';
import { FormularioRolesProyecto } from '../../../../secciones/roles/components/formulario-roles-proyecto/formulario-roles-proyecto';
import { deserializarRolesProyecto } from '../../../../secciones/roles/mappers/roles-proyecto.mapper';
import { RolesProyecto } from '../../../../secciones/roles/models/roles-proyecto.model';
import { CoordinadorPasoCreacionProyectoService } from '../../../services/coordinador-paso-creacion-proyecto.service';

/** Coordina Roles dentro del borrador vigente. */
@Component({
  selector: 'app-pagina-roles-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EstadoError, FormularioRolesProyecto, IconoComponent],
  providers: [CoordinadorPasoCreacionProyectoService],
  templateUrl: './pagina-roles-proyecto.html',
  styleUrl: './pagina-roles-proyecto.css',
})
export class PaginaRolesProyecto {
  protected readonly paso = inject(CoordinadorPasoCreacionProyectoService);
  protected readonly roles = computed<RolesProyecto | null>(() => {
    const borrador = this.paso.borrador();
    return borrador ? deserializarRolesProyecto(borrador.rolesJson) : null;
  });

  public constructor() {
    this.paso.cargar();
  }

  /** Guarda Roles y abre Equipo. */
  protected guardarRoles(roles: RolesProyecto): void {
    this.paso.guardar(
      { seccion: ClaveSeccionProyecto.Roles, datos: roles },
      crearUrlEquipoProyecto,
    );
  }
}
