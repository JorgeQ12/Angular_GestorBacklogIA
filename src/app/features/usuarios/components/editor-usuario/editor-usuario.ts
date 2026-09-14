import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import {
  EnfocarPrimerControlInvalidoDirective,
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../shared/forms/errores-validacion';
import type { ControlesFormularioPlano } from '../../../../shared/forms/models';
import { SelectorCampo } from '../../../../shared/forms/controles/selector-campo/selector-campo';
import type { OpcionSelector } from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { validarTextoRequerido } from '../../../../shared/forms/validadores';
import {
  LIMITES_USUARIO,
  MENSAJES_USUARIO,
  validarEnteroOpcional,
} from '../../config/usuarios.config';
import type { DatosUsuario, EditorUsuario as ContextoEditor } from '../../models/usuario.model';

/** Edita la información local de un usuario sin conocer HTTP ni navegación. */
@Component({
  selector: 'app-editor-usuario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Modal,
    SelectorCampo,
    ErrorCampoDirective,
    MensajesFormularioDirective,
    EnfocarPrimerControlInvalidoDirective,
  ],
  templateUrl: './editor-usuario.html',
})
export class EditorUsuario {
  /** Proporciona la entidad confirmada o indica una creación. */
  public readonly contexto = input.required<ContextoEditor>();

  /** Proporciona los perfiles técnicos activos admitidos por el backend. */
  public readonly perfilesTecnicos = input.required<readonly OpcionSelector[]>();

  /** Bloquea toda interacción durante una mutación remota. */
  public readonly ocupado = input(false);

  /** Entrega valores normalizados para que la página persista la operación. */
  public readonly guardar = output<DatosUsuario>();

  /** Solicita cerrar el editor sin modificar la fotografía confirmada. */
  public readonly cerrar = output<void>();

  /** Conserva límites para coordinar esta responsabilidad. */
  protected readonly limites = LIMITES_USUARIO;

  /** Conserva mensajes para coordinar esta responsabilidad. */
  protected readonly mensajes = MENSAJES_USUARIO;

  /** Deriva es edicion a partir del estado vigente. */
  protected readonly esEdicion = computed(() => this.contexto().entidad !== null);

  /** Deriva título a partir del estado vigente. */
  protected readonly titulo = computed(() =>
    this.esEdicion() ? 'Editar usuario' : 'Crear usuario',
  );

  /** Deriva descripción a partir del estado vigente. */
  protected readonly descripcion = computed(() =>
    this.esEdicion()
      ? 'Actualiza sus datos locales, perfil técnico y límite mensual. La identidad de Azure no cambia.'
      : 'Registra una persona para reutilizar su perfil técnico y controlar su consumo mensual.',
  );

  /** Deriva ícono a partir del estado vigente. */
  protected readonly icono = computed(() => (this.esEdicion() ? 'editar' : 'agregar'));

  /** Administra los valores y validaciones del formulario reactivo. */
  protected readonly formulario = new FormGroup<ControlesFormularioPlano<DatosUsuario>>({
    idAzure: new FormControl('', {
      nonNullable: true,
      validators: [validarTextoRequerido, Validators.maxLength(LIMITES_USUARIO.idAzure)],
    }),
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [validarTextoRequerido, Validators.maxLength(LIMITES_USUARIO.nombre)],
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.maxLength(LIMITES_USUARIO.correo)],
    }),
    perfilTecnicoId: new FormControl<number | null>(null, Validators.required),
    limiteTokensMensual: new FormControl<number | null>(null, [
      Validators.min(0),
      validarEnteroOpcional,
    ]),
  });

  public constructor() {
    effect(() => {
      const entidad = this.contexto().entidad;
      untracked(() => {
        this.formulario.controls.idAzure.setValidators(
          entidad
            ? Validators.maxLength(LIMITES_USUARIO.idAzure)
            : [validarTextoRequerido, Validators.maxLength(LIMITES_USUARIO.idAzure)],
        );
        this.formulario.reset({
          idAzure: entidad?.idAzure ?? '',
          nombre: entidad?.nombre ?? '',
          correo: entidad?.correo ?? '',
          perfilTecnicoId: entidad?.perfilTecnicoId ?? null,
          limiteTokensMensual: entidad?.limiteTokensMensual ?? null,
        });
      });
    });
    effect(() => {
      if (this.ocupado()) this.formulario.disable();
      else this.formulario.enable();
    });
  }

  /** Rechaza envíos inválidos o duplicados y normaliza los textos permitidos. */
  protected enviar(): void {
    if (this.ocupado() || this.formulario.disabled) return;
    const perfil = this.formulario.controls.perfilTecnicoId;
    const perfilSeleccionable = this.perfilesTecnicos().some(
      (opcion) => opcion.valor === perfil.value && !opcion.deshabilitada,
    );
    if (!perfilSeleccionable) perfil.setErrors({ ...perfil.errors, required: true });
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const datos = this.formulario.getRawValue();
    this.guardar.emit({
      idAzure: datos.idAzure.trim(),
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim(),
      perfilTecnicoId: datos.perfilTecnicoId,
      limiteTokensMensual: datos.limiteTokensMensual,
    });
  }
}
