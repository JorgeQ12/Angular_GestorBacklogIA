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
import { Modal } from '../../../../shared/components/modal/modal';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
  EnfocarPrimerControlInvalidoDirective,
} from '../../../../shared/forms/errores-validacion';
import { ControlesFormularioPlano } from '../../../../shared/forms/models';
import { validarTextoRequerido } from '../../../../shared/forms/validadores';
import { LIMITES_CATALOGO, MENSAJES_CATALOGO } from '../../config/catalogos.config';
import {
  ClaseCatalogo,
  DatosCatalogo,
  EditorCatalogo as ContextoEditor,
} from '../../models/catalogo.model';

/** Edita nombre y descripción sin conocer transporte, sesión ni navegación. */
@Component({
  selector: 'app-editor-catalogo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Modal,
    ErrorCampoDirective,
    MensajesFormularioDirective,
    EnfocarPrimerControlInvalidoDirective,
  ],
  templateUrl: './editor-catalogo.html',
})
export class EditorCatalogo {
  /** Define la clase de entidad y la fotografía inicial de la edición. */
  public readonly contexto = input.required<ContextoEditor>();

  /** Bloquea el formulario mientras la página confirma una operación remota. */
  public readonly ocupado = input(false);

  /** Entrega exclusivamente los campos editables normalizados. */
  public readonly guardar = output<DatosCatalogo>();

  /** Solicita cerrar el editor sin alterar datos persistidos. */
  public readonly cerrar = output<void>();

  protected readonly limites = LIMITES_CATALOGO;
  protected readonly mensajes = MENSAJES_CATALOGO;
  protected readonly titulo = computed(
    () =>
      `${this.contexto().entidad ? 'Editar' : 'Crear'} ${this.contexto().clase === ClaseCatalogo.Tipo ? 'catálogo' : 'opción'}`,
  );

  /** Explica el alcance concreto de la creación o edición presentada. */
  protected readonly descripcion = computed(() => {
    const contexto = this.contexto();
    if (contexto.entidad) {
      return `Actualiza el nombre y la descripción de ${contexto.entidad.nombre}.`;
    }
    return contexto.clase === ClaseCatalogo.Tipo
      ? 'Define el nombre y la descripción del nuevo catálogo.'
      : `Agrega una opción reutilizable al catálogo ${contexto.padre.nombre}.`;
  });

  /** Distingue visualmente una creación de una edición existente. */
  protected readonly icono = computed(() => (this.contexto().entidad ? 'editar' : 'agregar'));

  protected readonly formulario: FormGroup<ControlesFormularioPlano<DatosCatalogo>> = inject(
    FormBuilder,
  ).nonNullable.group({
    nombre: ['', [validarTextoRequerido, Validators.maxLength(LIMITES_CATALOGO.nombre)]],
    descripcion: ['', [validarTextoRequerido, Validators.maxLength(LIMITES_CATALOGO.descripcion)]],
  });

  constructor() {
    effect(() => {
      const entidad = this.contexto().entidad;
      untracked(() =>
        this.formulario.reset({
          nombre: entidad?.nombre ?? '',
          descripcion: entidad?.descripcion ?? '',
        }),
      );
    });
    effect(() => {
      if (this.ocupado()) this.formulario.disable();
      else this.formulario.enable();
    });
  }

  /** Rechaza envíos inválidos o remotos, incluso al enviar por teclado. */
  protected enviar(): void {
    if (this.ocupado() || this.formulario.disabled) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const datos = this.formulario.getRawValue();
    this.guardar.emit({ nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim() });
  }
}
