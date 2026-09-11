import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconoComponent } from '../../../../../../../shared/components/icono/icono.component';
import { FilaFormulario } from '../../../../../../../shared/forms/components/fila-formulario/fila-formulario';
import {
  ErrorCampoDirective,
  MensajesError,
} from '../../../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../../../shared/forms/validadores';
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
  imports: [IconoComponent, ReactiveFormsModule, ErrorCampoDirective, FilaFormulario],
  templateUrl: './campos-comunes-nodo-flujo-proyecto.html',
  styleUrl: './campos-comunes-nodo-flujo-proyecto.css',
})
export class CamposComunesNodoFlujoProyecto {

  /** Proporciona acceso al servicio de estado editor flujo proyecto. */
  private readonly estadoEditor = inject(EstadoEditorFlujoProyectoService);

  /** Formulario de nodo compartido por todos los editores especializados. */
  public readonly formulario = input.required<FormularioNodoFlujoProyecto>();

  /** Texto visible asociado al campo de descripción. */
  public readonly etiquetaDescripcion = input('Descripción funcional');

  /** Ejemplo contextual mostrado en la descripción. */
  public readonly marcadorDescripcion = input(
    'Describe brevemente para qué sirve este paso dentro del flujo.',
  );

  /** Ejemplo contextual mostrado al crear un criterio. */
  public readonly marcadorCriterio = input(
    'Ej.: El usuario puede completar este paso sin errores y continuar al siguiente punto.',
  );

  /** Texto visible asociado a la selección de roles. */
  public readonly etiquetaRoles = input('Roles involucrados');

  /** Explicación complementaria para la selección de roles. */
  public readonly ayudaRoles = input(
    'Selecciona los roles ya creados que participan en este bloque.',
  );

  /** Controla si la sección de roles forma parte del editor. */
  public readonly mostrarRoles = input(true);

  /** Cambia la selección simple por la matriz de permisos por rol. */
  public readonly usarPermisosRoles = input(false);

  /** Deriva roles disponibles a partir del estado vigente. */
  protected readonly rolesDisponibles = computed(() => this.estadoEditor.roles());

  /** Conserva opciones permiso para coordinar esta responsabilidad. */
  protected readonly opcionesPermiso = ACCIONES_PERMISO_MODULO;

  /** Deriva controles criterios a partir del estado vigente. */
  protected readonly controlesCriterios = computed(
    () => this.formulario().controls.criteriosAceptacion.controls,
  );

  /** Conserva mensajes criterio para coordinar esta responsabilidad. */
  protected readonly mensajesCriterio: MensajesError = {
    required: 'Escribe un criterio válido o elimina esta fila.',
  };

  /** Agrega criterio aceptacion dentro del flujo actual. */
  protected agregarCriterioAceptacion(): void {
    this.formulario().controls.criteriosAceptacion.push(
      new FormControl('', { nonNullable: true, validators: [validarTextoRequerido] }),
    );
    this.formulario().controls.criteriosAceptacion.markAsDirty();
  }

  /** Elimina criterio aceptacion dentro del flujo actual. */
  protected eliminarCriterioAceptacion(indice: number): void {
    const criterios = this.formulario().controls.criteriosAceptacion;
    if (criterios.length <= 1) return;

    criterios.removeAt(indice);
    criterios.markAsDirty();
    criterios.updateValueAndValidity();
  }

  /** Determina si ta seleccionado rol. */
  protected estaSeleccionadoRol(idRol: string): boolean {
    if (this.usarPermisosRoles()) {
      return this.obtenerPermisosRoles().some((permisoRol) => permisoRol.idRol === idRol);
    }
    return this.obtenerIdsRolesSeleccionados().includes(idRol);
  }

  /** Determina si permiso. */
  protected tienePermiso(idRol: string, permiso: AccionPermisoModulo): boolean {
    return (
      this.obtenerPermisosRoles()
        .find((permisoRol) => permisoRol.idRol === idRol)
        ?.permisos.includes(permiso) ?? false
    );
  }

  /** Ejecuta cambiar selección rol como parte del flujo interno. */
  protected cambiarSeleccionRol(rol: RolFlujoProyecto, evento: Event): void {
    const control = evento.target;
    if (!(control instanceof HTMLInputElement)) return;

    if (this.usarPermisosRoles()) {
      const permisosActuales = this.obtenerPermisosRoles();
      const permisosSiguientes: PermisoRolModulo[] = control.checked
        ? [...permisosActuales, { idRol: rol.id, permisos: [AccionPermisoModulo.Ver] }]
        : permisosActuales.filter((permisoRol) => permisoRol.idRol !== rol.id);
      this.actualizarPermisosRoles(permisosSiguientes);
      return;
    }

    const idsSiguientes = control.checked
      ? [...this.obtenerIdsRolesSeleccionados(), rol.id]
      : this.obtenerIdsRolesSeleccionados().filter((idRolActual) => idRolActual !== rol.id);
    this.actualizarNombresRolesDesdeIds(idsSiguientes);
  }

  /** Alterna permiso dentro del flujo actual. */
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

  /** Obtiene ids roles seleccionados dentro del flujo actual. */
  private obtenerIdsRolesSeleccionados(): string[] {
    const nombresSeleccionados = this.formulario()
      .controls.nombresRoles.value.split(/[\n,]/)
      .map((nombre) => nombre.trim().toLowerCase())
      .filter(Boolean);
    return this.rolesDisponibles()
      .filter((rol) => nombresSeleccionados.includes(rol.nombre.trim().toLowerCase()))
      .map((rol) => rol.id);
  }

  /** Actualiza nombres roles desde ids dentro del flujo actual. */
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

  /** Obtiene permisos roles dentro del flujo actual. */
  private obtenerPermisosRoles(): PermisoRolModulo[] {
    return this.formulario().controls.permisosRoles.value;
  }

  /** Actualiza permisos roles dentro del flujo actual. */
  private actualizarPermisosRoles(permisosRoles: PermisoRolModulo[]): void {
    const control = this.formulario().controls.permisosRoles;
    control.setValue(permisosRoles);
    control.markAsDirty();
    control.markAsTouched();
    this.actualizarNombresRolesDesdeIds(permisosRoles.map((permisoRol) => permisoRol.idRol));
  }
}
