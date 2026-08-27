import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FilaFormulario } from '../../../../../../shared/forms/components/fila-formulario/fila-formulario';
import { ErrorCampoDirective } from '../../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../../shared/forms/validadores';
import {
  MENSAJES_DESCRIPCION_ROL_PROYECTO,
  MENSAJES_NOMBRE_ROL_PROYECTO,
} from '../../config/roles-proyecto.config';
import {
  ControlesRolProyecto,
  FormularioRolesProyectoTipado,
} from '../../models/formulario-roles-proyecto.model';
import { RolProyecto, RolesProyecto } from '../../models/roles-proyecto.model';

/** Captura Roles sin conocer el flujo que los persistirá. */
@Component({
  selector: 'app-formulario-roles-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorCampoDirective, IconoComponent, FilaFormulario],
  templateUrl: './formulario-roles-proyecto.html',
  styleUrl: './formulario-roles-proyecto.css',
})
export class FormularioRolesProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Proporciona los valores que deben presentarse en el formulario. */
  public readonly datosIniciales = input<RolesProyecto | null>(null);

  /** Bloquea temporalmente los controles durante la operación coordinada por la página. */
  public readonly procesando = input(false);

  /** Entrega Roles válidos y normalizados al flujo consumidor. */
  public readonly guardar = output<RolesProyecto>();

  protected readonly mensajesNombre = MENSAJES_NOMBRE_ROL_PROYECTO;
  protected readonly mensajesDescripcion = MENSAJES_DESCRIPCION_ROL_PROYECTO;
  protected readonly formulario: FormularioRolesProyectoTipado = this.constructorFormulario.group({
    roles: this.constructorFormulario.array([this.crearGrupoRol()], [Validators.minLength(1)]),
  });

  protected get controlesRoles(): readonly FormGroup<ControlesRolProyecto>[] {
    return this.formulario.controls.roles.controls;
  }

  public constructor() {
    this.formulario.controls.roles.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.validarNombresRepetidos());

    effect(() => {
      const datos = this.datosIniciales();
      if (datos) this.presentarDatos(datos);
    });

    effect(() => {
      if (this.procesando() && this.formulario.enabled) {
        this.formulario.disable({ emitEvent: false });
      } else if (!this.procesando() && this.formulario.disabled) {
        this.formulario.enable({ emitEvent: false });
      }
    });
  }

  /** Incorpora otro perfil funcional a la definición del proyecto. */
  protected agregarRol(): void {
    this.formulario.controls.roles.push(this.crearGrupoRol());
    this.formulario.controls.roles.markAsDirty();
  }

  /** Retira un perfil conservando el mínimo requerido por la sección. */
  protected eliminarRol(indice: number): void {
    const roles = this.formulario.controls.roles;
    if (roles.length <= 1) return;

    roles.removeAt(indice);
    roles.markAsDirty();
    this.validarNombresRepetidos();
  }

  /** Solicita persistir los valores cuando todos los perfiles están completos. */
  protected enviar(): void {
    this.validarNombresRepetidos();
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardar.emit({
      roles: valores.roles.map((rol) => ({
        nombre: rol.nombre.trim(),
        descripcion: rol.descripcion.trim(),
      })),
    });
  }

  /** Presenta la colección persistida sin conservar controles obsoletos. */
  private presentarDatos(datos: RolesProyecto): void {
    const roles = this.formulario.controls.roles;
    const valores = datos.roles.length > 0 ? datos.roles : [{}];

    roles.clear({ emitEvent: false });
    valores.forEach((rol) => roles.push(this.crearGrupoRol(rol), { emitEvent: false }));
    this.validarNombresRepetidos();
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
  }

  /** Construye un grupo homogéneo para la colección dinámica. */
  private crearGrupoRol(valor: Partial<RolProyecto> = {}): FormGroup<ControlesRolProyecto> {
    return this.constructorFormulario.group({
      nombre: [valor.nombre ?? '', [validarTextoRequerido, this.validarNombreUnico()]],
      descripcion: [valor.descripcion ?? '', [validarTextoRequerido]],
    });
  }

  /** Comprueba la identidad del rol dentro de la colección vigente. */
  private validarNombreUnico(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const nombre = normalizarNombre(control.value);
      const lista = control.parent?.parent;
      if (!nombre || !(lista instanceof FormArray)) return null;

      const repeticiones = lista.controls.filter((grupo) => {
        const nombreGrupo = (grupo as FormGroup<ControlesRolProyecto>).controls.nombre.value;
        return normalizarNombre(nombreGrupo) === nombre;
      }).length;
      return repeticiones > 1 ? { duplicado: true } : null;
    };
  }

  /** Renueva la validación de todos los nombres cuando cambia la colección. */
  private validarNombresRepetidos(): void {
    this.formulario.controls.roles.controls.forEach((rol) =>
      rol.controls.nombre.updateValueAndValidity({ emitEvent: false }),
    );
  }
}

function normalizarNombre(nombre: string): string {
  return nombre.trim().toLocaleLowerCase('es-CO');
}
