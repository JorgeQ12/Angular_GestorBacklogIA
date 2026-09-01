import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconoComponent } from '../../../../../../../shared/components/icono/icono.component';
import {
  ErrorCampoDirective,
  MensajesError,
} from '../../../../../../../shared/forms/errores-validacion';
import { ACCIONES_PERMISO_MODULO } from '../../../config/flujo-proyecto.config';
import { FormularioNodoFlujoProyecto } from '../../../models/formulario-nodo-flujo-proyecto.model';
import {
  AccionPermisoModulo,
  PermisoRolModulo,
  RolFlujoProyecto,
} from '../../../models/flujo-proyecto.model';
import { EstadoEditorFlujoProyectoService } from '../../../services/estado-editor-flujo-proyecto.service';

/** Presenta los campos compartidos por todos los tipos de nodo. */
@Component({
  selector: 'app-campos-comunes-nodo-flujo-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconoComponent, ReactiveFormsModule, ErrorCampoDirective],
  templateUrl: './campos-comunes-nodo-flujo-proyecto.html',
  styleUrl: './campos-comunes-nodo-flujo-proyecto.css',
})
export class CamposComunesNodoFlujoProyecto {
  private readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);

  public readonly formulario = input.required<FormularioNodoFlujoProyecto>();
  public readonly etiquetaDescripcion = input('Descripción funcional');
  public readonly marcadorDescripcion = input(
    'Describe brevemente para qué sirve este paso dentro del flujo.',
  );
  public readonly marcadorCriterio = input(
    'Ej.: El usuario puede completar este paso sin errores y continuar al siguiente punto.',
  );
  public readonly etiquetaRoles = input('Roles involucrados');
  public readonly ayudaRoles = input(
    'Selecciona los roles ya creados que participan en este bloque.',
  );
  public readonly usarPermisosRoles = input(false);

  protected readonly rolesDisponibles = computed(() => this.estadoEditor.roles());
  protected readonly opcionesPermiso = ACCIONES_PERMISO_MODULO;
  protected readonly controlesCriterios = computed(
    () => this.formulario().controls.criteriosAceptacion.controls,
  );
  protected readonly mensajesCriterio: MensajesError = {
    required: 'Escribe un criterio válido o elimina esta fila.',
  };

  protected agregarCriterioAceptacion(): void {
    this.formulario().controls.criteriosAceptacion.push(
      new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    );
    this.formulario().controls.criteriosAceptacion.markAsDirty();
  }

  protected eliminarCriterioAceptacion(indice: number): void {
    const criterios = this.formulario().controls.criteriosAceptacion;
    if (criterios.length <= 1) {
      criterios.at(0).setValue('');
      criterios.at(0).markAsTouched();
    } else {
      criterios.removeAt(indice);
    }
    criterios.markAsDirty();
    criterios.updateValueAndValidity();
  }

  protected estaSeleccionadoRol(idRol: string): boolean {
    if (this.usarPermisosRoles()) {
      return this.obtenerPermisosRoles().some((permisoRol) => permisoRol.idRol === idRol);
    }
    return this.obtenerIdsRolesSeleccionados().includes(idRol);
  }

  protected tienePermiso(idRol: string, permiso: AccionPermisoModulo): boolean {
    return (
      this.obtenerPermisosRoles().find((permisoRol) => permisoRol.idRol === idRol)?.permisos.includes(
        permiso,
      ) ?? false
    );
  }

  protected cambiarSeleccionRol(rol: RolFlujoProyecto, evento: Event): void {
    const control = evento.target;
    if (!(control instanceof HTMLInputElement)) return;

    if (this.usarPermisosRoles()) {
      const permisosActuales = this.obtenerPermisosRoles();
      const permisosSiguientes: PermisoRolModulo[] = control.checked
        ? [
            ...permisosActuales,
            { idRol: rol.id, permisos: [AccionPermisoModulo.Ver] },
          ]
        : permisosActuales.filter((permisoRol) => permisoRol.idRol !== rol.id);
      this.actualizarPermisosRoles(permisosSiguientes);
      return;
    }

    const idsSiguientes = control.checked
      ? [...this.obtenerIdsRolesSeleccionados(), rol.id]
      : this.obtenerIdsRolesSeleccionados().filter((idRolActual) => idRolActual !== rol.id);
    this.actualizarNombresRolesDesdeIds(idsSiguientes);
  }

  protected alternarPermiso(idRol: string, permiso: AccionPermisoModulo): void {
    const permisosSiguientes = this.obtenerPermisosRoles()
      .map((permisoRol) => {
        if (permisoRol.idRol !== idRol) return permisoRol;

        const permisos = permisoRol.permisos.includes(permiso)
          ? permisoRol.permisos.filter((permisoActual) => permisoActual !== permiso)
          : [...permisoRol.permisos, permiso];
        return { ...permisoRol, permisos };
      })
      .filter((permisoRol) => permisoRol.permisos.length > 0);
    this.actualizarPermisosRoles(permisosSiguientes);
  }

  private obtenerIdsRolesSeleccionados(): string[] {
    const nombresSeleccionados = this.formulario().controls.nombresRoles.value
      .split(/[\n,]/)
      .map((nombre) => nombre.trim().toLowerCase())
      .filter(Boolean);
    return this.rolesDisponibles()
      .filter((rol) => nombresSeleccionados.includes(rol.nombre.trim().toLowerCase()))
      .map((rol) => rol.id);
  }

  private actualizarNombresRolesDesdeIds(idsRoles: string[]): void {
    const nombresRoles = idsRoles
      .map((idRol) => this.estadoEditor.obtenerNombreRol(idRol))
      .filter((nombreRol) => nombreRol !== 'Rol sin nombre')
      .join(', ');
    const control = this.formulario().controls.nombresRoles;
    control.setValue(nombresRoles);
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  private obtenerPermisosRoles(): PermisoRolModulo[] {
    return this.formulario().controls.permisosRoles.value;
  }

  private actualizarPermisosRoles(permisosRoles: PermisoRolModulo[]): void {
    const control = this.formulario().controls.permisosRoles;
    control.setValue(permisosRoles);
    control.markAsDirty();
    control.markAsTouched();
    this.actualizarNombresRolesDesdeIds(permisosRoles.map((permisoRol) => permisoRol.idRol));
  }
}
