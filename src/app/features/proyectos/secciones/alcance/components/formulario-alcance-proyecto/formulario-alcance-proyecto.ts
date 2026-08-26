import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../../shared/forms/validadores';
import {
  LIMITES_ALCANCE_PROYECTO,
  MENSAJES_ALCANCE_PROYECTO,
} from '../../config/alcance-proyecto.config';
import { AlcanceProyecto } from '../../models/alcance-proyecto.model';
import { FormularioAlcanceProyectoTipado } from '../../models/formulario-alcance-proyecto.model';

/** Captura Alcance sin conocer el flujo que lo persistirá. */
@Component({
  selector: 'app-formulario-alcance-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorCampoDirective, MensajesFormularioDirective],
  templateUrl: './formulario-alcance-proyecto.html',
  styleUrl: './formulario-alcance-proyecto.css',
})
export class FormularioAlcanceProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);

  /** Proporciona los valores que deben presentarse en el formulario. */
  public readonly datosIniciales = input<AlcanceProyecto | null>(null);

  /** Bloquea temporalmente los controles durante la operación coordinada por la página. */
  public readonly procesando = input(false);

  /** Entrega un Alcance válido y normalizado al flujo consumidor. */
  public readonly guardar = output<AlcanceProyecto>();

  protected readonly limites = LIMITES_ALCANCE_PROYECTO;
  protected readonly mensajesFormulario = MENSAJES_ALCANCE_PROYECTO;
  protected readonly formulario: FormularioAlcanceProyectoTipado = this.constructorFormulario.group(
    {
      incluido: ['', [validarTextoRequerido, Validators.maxLength(this.limites.incluido)]],
      excluido: ['', [validarTextoRequerido, Validators.maxLength(this.limites.excluido)]],
    },
  );

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

  /** Solicita persistir los valores cuando los límites están definidos. */
  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardar.emit({
      incluido: valores.incluido.trim(),
      excluido: valores.excluido.trim(),
    });
  }
}
