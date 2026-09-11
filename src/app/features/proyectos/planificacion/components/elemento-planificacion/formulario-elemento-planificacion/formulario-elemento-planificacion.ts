import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { FechaPipe } from '../../../../../../shared/fechas/pipes/fecha.pipe';
import { SelectorCampo } from '../../../../../../shared/forms/controles/selector-campo/selector-campo';
import type { OpcionSelector } from '../../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import { SelectorFecha } from '../../../../../../shared/forms/controles/selector-fecha/selector-fecha';
import {
  EnfocarPrimerControlInvalidoDirective,
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../../shared/forms/validadores';
import {
  LIMITES_FORMULARIO_ELEMENTO_PLANIFICACION,
  MENSAJES_FORMULARIO_ELEMENTO_PLANIFICACION,
} from '../../../config/formulario-elemento-planificacion.config';
import {
  ModoEditorElementoPlanificacion,
  type CatalogosFormularioElementoPlanificacion,
  type DetalleElementoPlanificacion,
  type FormularioElementoPlanificacion,
  type TipoItemPlanificacion,
  type ValoresFormularioElementoPlanificacion,
} from '../../../models/detalle-elemento-planificacion.model';
import { TipoElementoPlanificacion } from '../../../models/planificacion-proyecto.model';

/** Reutiliza una única estructura para consultar, crear y editar cualquier ítem de planificación. */
@Component({
  selector: 'app-formulario-elemento-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IconoComponent,
    FechaPipe,
    SelectorCampo,
    SelectorFecha,
    ErrorCampoDirective,
    MensajesFormularioDirective,
    EnfocarPrimerControlInvalidoDirective,
  ],
  templateUrl: './formulario-elemento-planificacion.html',
  styleUrl: './formulario-elemento-planificacion.css',
})
export class FormularioElementoPlanificacionComponent {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);

  /** Identifica el formulario para conectarlo con las acciones del modal compartido. */
  public readonly idFormulario = input.required<string>();
  /** Selecciona exhaustivamente los campos particulares que se deben presentar. */
  public readonly tipo = input.required<TipoItemPlanificacion>();
  /** Define consulta, creación o edición sin booleanos ambiguos. */
  public readonly modo = input.required<ModoEditorElementoPlanificacion>();
  /** Hidrata la fotografía consultada o los valores predeterminados de creación. */
  public readonly datosIniciales = input.required<ValoresFormularioElementoPlanificacion>();
  /** Proporciona los metadatos persistidos cuando se consulta un elemento existente. */
  public readonly detalle = input<DetalleElementoPlanificacion | null>(null);

  /** Proporciona las opciones remotas requeridas por el tipo. */
  public readonly catalogos = input.required<CatalogosFormularioElementoPlanificacion>();
  /** Bloquea temporalmente los controles durante la persistencia. */
  public readonly procesando = input(false);
  /** Entrega únicamente valores válidos y normalizados al estado consumidor. */
  public readonly guardar = output<ValoresFormularioElementoPlanificacion>();

  protected readonly tipos = TipoElementoPlanificacion;
  protected readonly limites = LIMITES_FORMULARIO_ELEMENTO_PLANIFICACION;
  protected readonly mensajesFormulario = MENSAJES_FORMULARIO_ELEMENTO_PLANIFICACION;
  protected readonly esSoloLectura = computed(
    () => this.modo() === ModoEditorElementoPlanificacion.Consulta,
  );
  protected readonly esElementoRequisito = computed(
    () =>
      this.tipo() === TipoElementoPlanificacion.ActividadRequisito ||
      this.tipo() === TipoElementoPlanificacion.TareaRequisito,
  );
  protected readonly opcionesActividadTarea = computed(() =>
    mapearOpciones(this.catalogos().actividadesTarea),
  );
  protected readonly opcionesActividadRequisito = computed(() =>
    mapearOpciones(this.catalogos().actividadesRequisito),
  );
  protected readonly opcionesPrioridadRequisito: readonly OpcionSelector[] = [
    { valor: 1, etiqueta: '1 · Crítica' },
    { valor: 2, etiqueta: '2 · Alta' },
    { valor: 3, etiqueta: '3 · Media' },
    { valor: 4, etiqueta: '4 · Normal' },
  ];

  protected readonly formulario: FormGroup<FormularioElementoPlanificacion> =
    this.constructorFormulario.group(
      {
        titulo: [''],
        descripcion: [''],
        alcance: [''],
        riesgos: [''],
        criteriosExito: [''],
        prioridadCatalogoId: this.constructorFormulario.control<number | null>(null),
        riesgoCatalogoId: this.constructorFormulario.control<number | null>(null),
        objetivo: [''],
        criteriosAceptacion: [''],
        dependencias: [''],
        actividadCatalogoId: this.constructorFormulario.control<number | null>(null),
        complejidad: [3],
        prioridad: [4],
        discusion: [''],
        responsable: [''],
        requisito: [''],
        estimacionHoras: this.constructorFormulario.control<number | null>(null),
        fechaInicio: [''],
        fechaFinal: [''],
      },
      { validators: validarRangoFechas },
    );

  public constructor() {
    effect(() => {
      const tipo = this.tipo();
      this.modo();
      const datos = this.datosIniciales();
      this.configurarValidadores(tipo);
      this.formulario.reset(datos, { emitEvent: false });
    });

    effect(() => {
      if (this.procesando() && this.formulario.enabled) {
        this.formulario.disable({ emitEvent: false });
      } else if (!this.procesando() && this.formulario.disabled) {
        this.formulario.enable({ emitEvent: false });
      }
    });
  }

  /** Emite el valor completo cuando las reglas del tipo están satisfechas. */
  protected enviar(): void {
    if (this.esSoloLectura() || this.procesando()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardar.emit(this.formulario.getRawValue());
  }

  private configurarValidadores(tipo: TipoItemPlanificacion): void {
    const controles = this.formulario.controls;
    Object.values(controles).forEach((control) => control.clearValidators());

    controles.titulo.setValidators([
      validarTextoRequerido,
      Validators.maxLength(this.limites.titulo),
    ]);
    controles.descripcion.setValidators([
      validarTextoRequerido,
      Validators.maxLength(this.limites.descripcion),
    ]);
    controles.responsable.setValidators(Validators.maxLength(this.limites.responsable));
    controles.requisito.setValidators(Validators.maxLength(this.limites.requisito));

    const esRequisito =
      tipo === TipoElementoPlanificacion.ActividadRequisito ||
      tipo === TipoElementoPlanificacion.TareaRequisito;
    if (!esRequisito) {
      controles.estimacionHoras.setValidators([Validators.required, Validators.min(0.01)]);
      controles.fechaInicio.setValidators(Validators.required);
      controles.fechaFinal.setValidators(Validators.required);
    }

    switch (tipo) {
      case TipoElementoPlanificacion.Caracteristica:
        controles.alcance.setValidators(validarTextoRequerido);
        break;
      case TipoElementoPlanificacion.Historia:
        controles.objetivo.setValidators(validarTextoRequerido);
        controles.alcance.setValidators(validarTextoRequerido);
        controles.criteriosAceptacion.setValidators(validarTextoRequerido);
        break;
      case TipoElementoPlanificacion.Tarea:
        controles.actividadCatalogoId.setValidators(Validators.required);
        controles.complejidad.setValidators([
          Validators.required,
          Validators.min(this.limites.complejidadMinima),
          Validators.max(this.limites.complejidadMaxima),
        ]);
        break;
      case TipoElementoPlanificacion.ActividadRequisito:
        controles.actividadCatalogoId.setValidators(Validators.required);
        controles.prioridad.setValidators([
          Validators.required,
          Validators.min(this.limites.prioridadMinima),
          Validators.max(this.limites.prioridadMaxima),
        ]);
        break;
      case TipoElementoPlanificacion.Epica:
      case TipoElementoPlanificacion.TareaRequisito:
        break;
    }

    Object.values(controles).forEach((control) =>
      control.updateValueAndValidity({ emitEvent: false }),
    );
  }
}

function validarRangoFechas(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('fechaInicio')?.value as string | undefined;
  const final = control.get('fechaFinal')?.value as string | undefined;
  return inicio && final && final < inicio ? { rangoFechas: true } : null;
}

function mapearOpciones(
  opciones: CatalogosFormularioElementoPlanificacion['prioridades'],
): readonly OpcionSelector[] {
  return opciones.map((opcion) => ({
    valor: opcion.id,
    etiqueta: opcion.nombre,
    descripcion: opcion.descripcion || undefined,
  }));
}
