import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../shared/forms/errores-validacion';
import {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
} from '../../models/vinculacion-azure.model';
import { MENSAJES_VINCULACION_AZURE } from './config/mensajes-vinculacion-azure.config';
import { FormularioVinculacionAzureTipado } from './models/formulario-vinculacion-azure.model';

const PATRON_GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PATRON_URL_SEGURA = /^https:\/\/.+/i;

/** Captura la vinculación y presenta su resultado antes de crear el borrador. */
@Component({
  selector: 'app-vinculacion-azure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconoComponent, ErrorCampoDirective, MensajesFormularioDirective],
  templateUrl: './vinculacion-azure.html',
  styleUrl: './vinculacion-azure.css',
})
export class VinculacionAzure {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);

  /** Restaura los valores cuando el usuario regresa a la captura. */
  public readonly datosIniciales = input<DatosVinculacionAzure | null>(null);

  /** Presenta la información encontrada después de validar Azure. */
  public readonly resultadoValidacion = input<ResultadoVinculacionAzure | null>(null);

  /** Bloquea temporalmente las acciones durante una operación remota. */
  public readonly procesando = input(false);

  /** Solicita validar en Azure los valores capturados. */
  public readonly validar = output<DatosVinculacionAzure>();

  /** Solicita regresar a la captura conservando sus valores. */
  public readonly editar = output<void>();

  /** Solicita crear el borrador con la vinculación confirmada. */
  public readonly confirmar = output<void>();

  protected readonly mensajesFormulario = MENSAJES_VINCULACION_AZURE;
  protected readonly formulario: FormularioVinculacionAzureTipado =
    this.constructorFormulario.group({
      urlBoard: [
        '',
        [Validators.required, Validators.maxLength(500), Validators.pattern(PATRON_URL_SEGURA)],
      ],
      idEpica: this.constructorFormulario.control<number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      idEquipo: ['', [Validators.pattern(PATRON_GUID)]],
    });

  public constructor() {
    effect(() => {
      const datos = this.datosIniciales();

      if (datos) {
        this.formulario.setValue({
          urlBoard: datos.urlBoard,
          idEpica: datos.idEpica,
          idEquipo: datos.idEquipo ?? '',
        });
      }
    });

    effect(() => {
      if (this.procesando() && this.formulario.enabled) {
        this.formulario.disable();
      } else if (!this.procesando() && this.formulario.disabled) {
        this.formulario.enable();
      }
    });
  }

  /** Entrega valores válidos a la página que coordina la consulta. */
  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.validar.emit({
      urlBoard: valores.urlBoard.trim(),
      idEpica: valores.idEpica!,
      idEquipo: valores.idEquipo.trim() || null,
    });
  }
}
