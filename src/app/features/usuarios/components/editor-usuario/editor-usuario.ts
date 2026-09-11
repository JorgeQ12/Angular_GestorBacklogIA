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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { OpcionCatalogo } from '../../../../core/catalogos/models/opcion-catalogo.model';
import { Modal } from '../../../../shared/components/modal/modal';
import { SelectorCampo } from '../../../../shared/forms/controles/selector-campo/selector-campo';
import type {
  OpcionSelector,
} from '../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import {
  EnfocarPrimerControlInvalidoDirective,
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../shared/forms/errores-validacion';
import type { ControlesFormularioPlano } from '../../../../shared/forms/models';
import { validarTextoRequerido } from '../../../../shared/forms/validadores';
import { LIMITES_USUARIO, MENSAJES_USUARIO } from '../../config/usuarios.config';
import type {
  DatosUsuario,
  Usuario,
  ValoresFormularioUsuario,
} from '../../models/usuario.model';

/** Captura los datos administrables sin conocer transporte, sesión ni navegación. */
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
  /** Proporciona la fotografía inicial o identifica una creación. */
  public readonly usuario = input<Usuario | null>(null);

  /** Proporciona únicamente perfiles técnicos activos seleccionables. */
  public readonly perfilesTecnicos = input.required<readonly OpcionCatalogo[]>();

  /** Bloquea todos los controles mientras se confirma una operación remota. */
  public readonly ocupado = input(false);

  /** Entrega los datos normalizados que el API permite persistir. */
  public readonly guardar = output<DatosUsuario>();

  /** Solicita cerrar el editor sin alterar la fotografía persistida. */
  public readonly cerrar = output<void>();

  protected readonly limites = LIMITES_USUARIO;
  protected readonly mensajes = MENSAJES_USUARIO;
  protected readonly titulo = computed(() =>
    this.usuario() ? 'Editar usuario' : 'Crear usuario',
  );
  protected readonly descripcion = computed(() => {
    const usuario = this.usuario();
    return usuario
      ? `Actualiza los datos administrables de ${usuario.nombre}. ` +
          'La identidad Azure no puede cambiarse.'
      : 'Registra la identidad de Azure y asigna el perfil técnico inicial de la persona.';
  });
  protected readonly opcionesPerfil = computed<readonly OpcionSelector[]>(() =>
    this.perfilesTecnicos().map((perfil) => ({
      valor: perfil.id,
      etiqueta: perfil.nombre,
      descripcion: perfil.descripcion || undefined,
    })),
  );

  protected readonly formulario: FormGroup<
    ControlesFormularioPlano<ValoresFormularioUsuario>
  >;

  public constructor() {
    const constructorFormulario = inject(FormBuilder);
    this.formulario = constructorFormulario.group({
      idAzure: constructorFormulario.nonNullable.control('', [
        validarTextoRequerido,
        Validators.maxLength(LIMITES_USUARIO.idAzure),
      ]),
      nombre: constructorFormulario.nonNullable.control('', [
        validarTextoRequerido,
        Validators.maxLength(LIMITES_USUARIO.nombre),
      ]),
      correo: constructorFormulario.nonNullable.control('', [
        Validators.email,
        Validators.maxLength(LIMITES_USUARIO.correo),
      ]),
      perfilTecnicoId: constructorFormulario.control<number | null>(null, Validators.required),
      limiteTokensMensual: constructorFormulario.control<number | null>(null, [
        Validators.min(0),
        Validators.max(LIMITES_USUARIO.limiteTokensMensual),
        Validators.pattern(/^\d+$/),
      ]),
    });

    effect(() => {
      const usuario = this.usuario();
      const perfilDisponible = this.perfilesTecnicos().some(
        (perfil) => perfil.id === usuario?.perfilTecnicoId,
      );
      const controlIdAzure = this.formulario.controls.idAzure;

      untracked(() => {
        if (usuario) controlIdAzure.clearValidators();
        else
          controlIdAzure.setValidators([
            validarTextoRequerido,
            Validators.maxLength(LIMITES_USUARIO.idAzure),
          ]);
        controlIdAzure.updateValueAndValidity({ emitEvent: false });
        this.formulario.reset({
          idAzure: usuario?.idAzure ?? '',
          nombre: usuario?.nombre ?? '',
          correo: usuario?.correo ?? '',
          perfilTecnicoId: perfilDisponible ? (usuario?.perfilTecnicoId ?? null) : null,
          limiteTokensMensual: usuario?.limiteTokensMensual ?? null,
        });
      });
    });

    effect(() => {
      if (this.ocupado()) this.formulario.disable();
      else this.formulario.enable();
    });
  }

  /** Rechaza envíos inválidos o duplicados y emite valores normalizados. */
  protected enviar(): void {
    if (this.ocupado() || this.formulario.disabled) return;
    this.formulario.patchValue(
      {
        idAzure: this.formulario.controls.idAzure.value.trim(),
        nombre: this.formulario.controls.nombre.value.trim(),
        correo: this.formulario.controls.correo.value.trim(),
      },
      { emitEvent: false },
    );
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    if (valores.perfilTecnicoId === null) return;
    const correo = valores.correo;
    this.guardar.emit({
      idAzure: valores.idAzure,
      nombre: valores.nombre,
      correo: correo || null,
      perfilTecnicoId: valores.perfilTecnicoId,
      limiteTokensMensual: valores.limiteTokensMensual,
    });
  }
}
