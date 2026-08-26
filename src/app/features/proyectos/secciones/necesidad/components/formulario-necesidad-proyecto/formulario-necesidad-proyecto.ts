import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../../shared/forms/validadores';
import {
  LIMITES_NECESIDAD_PROYECTO,
  MENSAJES_NECESIDAD_PROYECTO,
} from '../../config/necesidad-proyecto.config';
import { FormularioNecesidadProyectoTipado } from '../../models/formulario-necesidad-proyecto.model';
import { NecesidadProyecto } from '../../models/necesidad-proyecto.model';

/** Captura Necesidad de negocio sin conocer el flujo que la persistirá. */
@Component({
  selector: 'app-formulario-necesidad-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorCampoDirective, MensajesFormularioDirective],
  templateUrl: './formulario-necesidad-proyecto.html',
  styleUrl: './formulario-necesidad-proyecto.css',
})
export class FormularioNecesidadProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);

  /** Proporciona los valores que deben presentarse en el formulario. */
  public readonly datosIniciales = input<NecesidadProyecto | null>(null);

  /** Bloquea temporalmente los controles durante la operación coordinada por la página. */
  public readonly procesando = input(false);

  /** Entrega una Necesidad válida y normalizada al flujo consumidor. */
  public readonly guardar = output<NecesidadProyecto>();

  protected readonly limites = LIMITES_NECESIDAD_PROYECTO;
  protected readonly mensajesFormulario = MENSAJES_NECESIDAD_PROYECTO;
  protected readonly formulario: FormularioNecesidadProyectoTipado =
    this.constructorFormulario.group({
      situacionActual: [
        '',
        [validarTextoRequerido, Validators.maxLength(this.limites.situacionActual)],
      ],
      problemas: ['', [validarTextoRequerido, Validators.maxLength(this.limites.problemas)]],
      impacto: ['', [validarTextoRequerido, Validators.maxLength(this.limites.impacto)]],
    });

  public constructor() {
    effect(() => {
      const datos = this.datosIniciales();
      if (datos) this.formulario.reset(datos, { emitEvent: false });
    });

    effect(() => {
      if (this.procesando() && this.formulario.enabled) {
        this.formulario.disable({ emitEvent: false });
      } else if (!this.procesando() && this.formulario.disabled) {
        this.formulario.enable({ emitEvent: false });
      }
    });
  }

  /** Solicita persistir los valores cuando la necesidad está completa. */
  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardar.emit({
      situacionActual: valores.situacionActual.trim(),
      problemas: valores.problemas.trim(),
      impacto: valores.impacto.trim(),
    });
  }
}
