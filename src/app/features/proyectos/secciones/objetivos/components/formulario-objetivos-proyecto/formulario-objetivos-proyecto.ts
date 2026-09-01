import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FilaFormulario } from '../../../../../../shared/forms/components/fila-formulario/fila-formulario';
import {
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../../shared/forms/validadores';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';
import {
  LIMITES_OBJETIVOS_PROYECTO,
  MENSAJES_OBJETIVO_ESPECIFICO,
  MENSAJES_OBJETIVOS_PROYECTO,
} from '../../config/objetivos-proyecto.config';
import { FormularioObjetivosProyectoTipado } from '../../models/formulario-objetivos-proyecto.model';
import { ObjetivosProyecto } from '../../models/objetivos-proyecto.model';

/** Captura Objetivos sin conocer el flujo que los persistirá. */
@Component({
  selector: 'app-formulario-objetivos-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ErrorCampoDirective,
    MensajesFormularioDirective,
    IconoComponent,
    FilaFormulario,
  ],
  templateUrl: './formulario-objetivos-proyecto.html',
  styleUrl: './formulario-objetivos-proyecto.css',
})
export class FormularioObjetivosProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);

  /** Identifica el formulario para permitir acciones externas mediante el atributo form. */
  public readonly idFormulario = input<string | null>(null);

  /** Proporciona los valores que deben presentarse en el formulario. */
  public readonly datosIniciales = input<ObjetivosProyecto | null>(null);

  /** Bloquea temporalmente los controles durante la operación coordinada por la página. */
  public readonly procesando = input(false);

  /** Define si la sección permite modificar sus valores o únicamente consultarlos. */
  public readonly modo = input(ModoFormularioProyecto.Edicion);

  /** Entrega Objetivos válidos y normalizados al flujo consumidor. */
  public readonly guardar = output<ObjetivosProyecto>();

  protected readonly limites = LIMITES_OBJETIVOS_PROYECTO;
  protected readonly mensajesFormulario = MENSAJES_OBJETIVOS_PROYECTO;
  protected readonly mensajesObjetivoEspecifico = MENSAJES_OBJETIVO_ESPECIFICO;
  protected readonly esSoloLectura = computed(() => this.modo() === ModoFormularioProyecto.Lectura);
  protected readonly formulario: FormularioObjetivosProyectoTipado =
    this.constructorFormulario.group({
      objetivoGeneral: [
        '',
        [validarTextoRequerido, Validators.maxLength(this.limites.objetivoGeneral)],
      ],
      objetivosEspecificos: this.constructorFormulario.array(
        [this.crearControlObjetivoEspecifico()],
        [Validators.minLength(1), Validators.maxLength(this.limites.objetivosEspecificos)],
      ),
    });

  protected get controlesObjetivosEspecificos(): readonly FormControl<string>[] {
    return this.formulario.controls.objetivosEspecificos.controls;
  }

  public constructor() {
    effect(() => {
      this.modo();
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

  /** Incorpora otro resultado concreto a la definición del proyecto. */
  protected agregarObjetivoEspecifico(): void {
    if (this.esSoloLectura()) return;
    const objetivos = this.formulario.controls.objetivosEspecificos;
    if (objetivos.length >= this.limites.objetivosEspecificos) return;

    objetivos.push(this.crearControlObjetivoEspecifico());
    objetivos.markAsDirty();
  }

  /** Retira un resultado específico conservando el mínimo requerido. */
  protected eliminarObjetivoEspecifico(indice: number): void {
    if (this.esSoloLectura()) return;
    const objetivos = this.formulario.controls.objetivosEspecificos;
    if (objetivos.length <= 1) return;

    objetivos.removeAt(indice);
    objetivos.markAsDirty();
  }

  /** Solicita persistir los valores cuando los objetivos están completos. */
  protected enviar(): void {
    if (this.esSoloLectura()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardar.emit({
      objetivoGeneral: valores.objetivoGeneral.trim(),
      objetivosEspecificos: valores.objetivosEspecificos.map((objetivo) => objetivo.trim()),
    });
  }

  /** Presenta una fotografía persistida sin conservar controles obsoletos. */
  private presentarDatos(datos: ObjetivosProyecto): void {
    const objetivos = this.formulario.controls.objetivosEspecificos;
    const valores = datos.objetivosEspecificos.length > 0 ? datos.objetivosEspecificos : [''];

    objetivos.clear({ emitEvent: false });
    valores.forEach((objetivo) =>
      objetivos.push(this.crearControlObjetivoEspecifico(objetivo), { emitEvent: false }),
    );
    this.formulario.controls.objetivoGeneral.setValue(datos.objetivoGeneral, { emitEvent: false });
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
  }

  /** Construye un control homogéneo para la colección dinámica. */
  private crearControlObjetivoEspecifico(valor = ''): FormControl<string> {
    return this.constructorFormulario.control(valor, [validarTextoRequerido]);
  }
}
