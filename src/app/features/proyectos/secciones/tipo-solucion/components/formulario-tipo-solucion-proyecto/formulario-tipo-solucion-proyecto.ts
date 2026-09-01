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
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { startWith } from 'rxjs';
import { SelectorTarjetas } from '../../../../../../shared/forms/controles/selector-tarjetas/selector-tarjetas';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../../shared/forms/errores-validacion';
import {
  MENSAJES_TIPO_SOLUCION_PROYECTO,
  OPCIONES_INTERFAZ_SOLUCION,
  OPCIONES_PLATAFORMA_SOLUCION,
} from '../../config/tipo-solucion-proyecto.config';
import { FormularioTipoSolucionProyectoTipado } from '../../models/formulario-tipo-solucion-proyecto.model';
import { TipoSolucionProyecto } from '../../models/tipo-solucion-proyecto.model';

/** Captura Tipo de solución sin conocer el flujo que lo persistirá. */
@Component({
  selector: 'app-formulario-tipo-solucion-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SelectorTarjetas,
    ErrorCampoDirective,
    MensajesFormularioDirective,
  ],
  templateUrl: './formulario-tipo-solucion-proyecto.html',
  styleUrl: './formulario-tipo-solucion-proyecto.css',
})
export class FormularioTipoSolucionProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Identifica el formulario para permitir acciones externas mediante el atributo form. */
  public readonly idFormulario = input<string | null>(null);

  /** Proporciona los valores que deben presentarse en el formulario. */
  public readonly datosIniciales = input<TipoSolucionProyecto | null>(null);

  /** Bloquea temporalmente los controles durante la operación coordinada por la página. */
  public readonly procesando = input(false);

  /** Define si la sección permite modificar sus valores o únicamente consultarlos. */
  public readonly modo = input(ModoFormularioProyecto.Edicion);

  /** Entrega un Tipo de solución válido al flujo consumidor. */
  public readonly guardar = output<TipoSolucionProyecto>();

  protected readonly opcionesInterfaz = OPCIONES_INTERFAZ_SOLUCION;
  protected readonly opcionesPlataforma = OPCIONES_PLATAFORMA_SOLUCION;
  protected readonly mensajesFormulario = MENSAJES_TIPO_SOLUCION_PROYECTO;
  protected readonly esSoloLectura = computed(() => this.modo() === ModoFormularioProyecto.Lectura);
  protected readonly formulario: FormularioTipoSolucionProyectoTipado =
    this.constructorFormulario.group({
      tieneInterfaz: this.constructorFormulario.control<boolean | null>(null, [seleccionRequerida]),
      plataforma: this.constructorFormulario.control<TipoSolucionProyecto['plataforma']>(null),
    });

  public constructor() {
    this.formulario.controls.tieneInterfaz.valueChanges
      .pipe(
        startWith(this.formulario.controls.tieneInterfaz.value),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tieneInterfaz) => this.actualizarPlataforma(tieneInterfaz));

    effect(() => {
      this.modo();
      const datos = this.datosIniciales();
      if (!datos) return;

      this.formulario.reset(datos, { emitEvent: false });
      this.actualizarPlataforma(datos.tieneInterfaz);
    });

    effect(() => {
      if (this.procesando() && this.formulario.enabled) {
        this.formulario.disable({ emitEvent: false });
      } else if (!this.procesando() && this.formulario.disabled) {
        this.formulario.enable({ emitEvent: false });
      }
    });
  }

  /** Solicita persistir los valores cuando la definición está completa. */
  protected enviar(): void {
    if (this.esSoloLectura()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardar.emit({
      tieneInterfaz: valores.tieneInterfaz!,
      plataforma: valores.tieneInterfaz ? valores.plataforma : null,
    });
  }

  private actualizarPlataforma(tieneInterfaz: boolean | null): void {
    const plataforma = this.formulario.controls.plataforma;
    if (tieneInterfaz) {
      plataforma.setValidators(Validators.required);
    } else {
      plataforma.clearValidators();
      if (plataforma.value !== null) plataforma.setValue(null, { emitEvent: false });
    }
    plataforma.updateValueAndValidity({ emitEvent: false });
  }
}

function seleccionRequerida(control: AbstractControl<boolean | null>): ValidationErrors | null {
  return control.value === null ? { required: true } : null;
}
