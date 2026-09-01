import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../shared/forms/validadores';
import { ClavePasoEspecialProyecto } from '../../../config/pasos-proyecto.config';
import { ModoFormularioProyecto } from '../../../models/modo-formulario-proyecto.model';
import type {
  DatosVinculacionAzure,
  ResultadoVinculacionAzure,
  VinculacionAzureProyectoResumen,
} from '../../../models/vinculacion-azure-proyecto.model';
import { TarjetaPasoProyecto } from '../../tarjeta-paso-proyecto/tarjeta-paso-proyecto';
import { MENSAJES_VINCULACION_AZURE } from './config/mensajes-vinculacion-azure.config';
import { FormularioVinculacionAzureTipado } from './models/formulario-vinculacion-azure.model';

const PATRON_GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PATRON_URL_SEGURA = /^https:\/\/.+/i;

/** Captura o consulta la vinculación con Azure mediante un único paso compartido. */
@Component({
  selector: 'app-paso-vinculacion-azure-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IconoComponent,
    ErrorCampoDirective,
    MensajesFormularioDirective,
    TarjetaPasoProyecto,
  ],
  templateUrl: './paso-vinculacion-azure-proyecto.html',
  styleUrl: './paso-vinculacion-azure-proyecto.css',
})
export class PasoVinculacionAzureProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);

  /** Restaura los valores cuando el usuario regresa a la captura. */
  public readonly datosIniciales = input<DatosVinculacionAzure | null>(null);

  /** Presenta la información encontrada después de validar Azure. */
  public readonly resultadoValidacion = input<ResultadoVinculacionAzure | null>(null);

  /** Proporciona la asociación confirmada cuando el paso se consulta. */
  public readonly vinculacion = input<VinculacionAzureProyectoResumen | null>(null);

  /** Define si la asociación se captura o se consulta. */
  public readonly modo = input(ModoFormularioProyecto.Lectura);

  /** Bloquea temporalmente las acciones durante una operación remota. */
  public readonly procesando = input(false);

  /** Solicita validar en Azure los valores capturados. */
  public readonly validar = output<DatosVinculacionAzure>();

  /** Solicita regresar a la captura conservando sus valores. */
  public readonly editar = output<void>();

  /** Solicita crear el borrador con la vinculación confirmada. */
  public readonly confirmar = output<void>();

  protected readonly paso = ClavePasoEspecialProyecto.VinculacionAzure;
  protected readonly modos = ModoFormularioProyecto;
  protected readonly mensajesFormulario = MENSAJES_VINCULACION_AZURE;
  protected readonly formulario: FormularioVinculacionAzureTipado =
    this.constructorFormulario.group({
      urlBoard: [
        '',
        [validarTextoRequerido, Validators.maxLength(500), Validators.pattern(PATRON_URL_SEGURA)],
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
