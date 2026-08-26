import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpcionCatalogo } from '../../../../../../core/catalogos/models/opcion-catalogo.model';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../../shared/forms/validadores';
import { SelectorCampo } from '../../../../../../shared/forms/controles/selector-campo/selector-campo';
import { OpcionSelector } from '../../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { SelectorFecha } from '../../../../../../shared/forms/controles/selector-fecha/selector-fecha';
import {
  LIMITES_CONTEXTO_PROYECTO,
  MENSAJES_CONTEXTO_PROYECTO,
} from '../../config/contexto-proyecto.config';
import { ContextoProyecto } from '../../models/contexto-proyecto.model';
import { FormularioContextoProyectoTipado } from '../../models/formulario-contexto-proyecto.model';

/** Captura los datos de Contexto sin conocer el flujo que los persistirá. */
@Component({
  selector: 'app-formulario-contexto-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ErrorCampoDirective,
    MensajesFormularioDirective,
    SelectorCampo,
    SelectorFecha,
  ],
  templateUrl: './formulario-contexto-proyecto.html',
  styleUrl: './formulario-contexto-proyecto.css',
})
export class FormularioContextoProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Proporciona los valores que deben presentarse en el formulario. */
  public readonly datosIniciales = input<ContextoProyecto | null>(null);

  /** Proporciona las prioridades vigentes obtenidas desde el catálogo. */
  public readonly prioridades = input<readonly OpcionCatalogo[]>([]);

  /** Bloquea temporalmente los controles durante la operación coordinada por la página. */
  public readonly procesando = input(false);

  /** Entrega un Contexto válido y normalizado al flujo consumidor. */
  public readonly guardar = output<ContextoProyecto>();

  /** Comunica el nombre usado para identificar el proyecto fuera del formulario. */
  public readonly nombreCambiado = output<string>();

  protected readonly limites = LIMITES_CONTEXTO_PROYECTO;
  protected readonly mensajesFormulario = MENSAJES_CONTEXTO_PROYECTO;
  protected readonly opcionesPrioridad = computed<readonly OpcionSelector[]>(() =>
    this.prioridades().map((prioridad) => ({
      valor: prioridad.id,
      etiqueta: prioridad.nombre,
      descripcion: prioridad.descripcion ?? undefined,
    })),
  );
  protected readonly formulario: FormularioContextoProyectoTipado =
    this.constructorFormulario.group({
      nombre: ['', [validarTextoRequerido, Validators.maxLength(this.limites.nombre)]],
      responsable: ['', [validarTextoRequerido, Validators.maxLength(this.limites.responsable)]],
      fechaObjetivo: ['', Validators.required],
      prioridadCatalogoId: this.constructorFormulario.control<number | null>(null, [
        Validators.required,
      ]),
      descripcion: ['', [validarTextoRequerido, Validators.maxLength(this.limites.descripcion)]],
    });

  public constructor() {
    this.formulario.controls.nombre.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => this.nombreCambiado.emit(nombre.trim()));

    effect(() => {
      const datos = this.datosIniciales();

      if (datos) {
        this.formulario.reset(datos, { emitEvent: false });
      }
    });

    effect(() => {
      if (this.procesando() && this.formulario.enabled) {
        this.formulario.disable({ emitEvent: false });
      } else if (!this.procesando() && this.formulario.disabled) {
        this.formulario.enable({ emitEvent: false });
      }
    });
  }

  /** Solicita persistir los valores cuando todos los campos son válidos. */
  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardar.emit({
      nombre: valores.nombre.trim(),
      responsable: valores.responsable.trim(),
      fechaObjetivo: valores.fechaObjetivo,
      prioridadCatalogoId: valores.prioridadCatalogoId!,
      descripcion: valores.descripcion.trim(),
    });
  }
}
