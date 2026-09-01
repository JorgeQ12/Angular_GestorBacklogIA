import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoVacio } from '../../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../../shared/components/icono/icono.component';
import { CampoBusqueda } from '../../../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
import { SelectorCampo } from '../../../../../../shared/forms/controles/selector-campo/selector-campo';
import { OpcionSelector } from '../../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import {
  EnfocarPrimerControlInvalidoDirective,
  ErrorCampoDirective,
} from '../../../../../../shared/forms/errores-validacion';
import {
  MENSAJES_ASIGNACION_EQUIPO,
  OPCIONES_DEDICACION_EQUIPO,
  OPCIONES_PERFIL_TECNICO_EQUIPO,
} from '../../config/equipo-proyecto.config';
import {
  ControlesIntegranteEquipoProyecto,
  FiltroEquipoProyecto,
  FormularioEquipoProyectoTipado,
} from '../../models/formulario-equipo-proyecto.model';
import {
  EquipoProyecto,
  IntegranteEquipoProyecto,
  ProgresoEquipoProyecto,
} from '../../models/equipo-proyecto.model';
import { ModoFormularioProyecto } from '../../../../models/modo-formulario-proyecto.model';

const EQUIPO_VACIO: EquipoProyecto = { integrantes: [] };

/** Configura el equipo importado sin conocer el flujo que lo persistirá. */
@Component({
  selector: 'app-formulario-equipo-proyecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CampoBusqueda,
    EnfocarPrimerControlInvalidoDirective,
    ErrorCampoDirective,
    EstadoVacio,
    IconoComponent,
    SelectorCampo,
  ],
  templateUrl: './formulario-equipo-proyecto.html',
  styleUrl: './formulario-equipo-proyecto.css',
})
export class FormularioEquipoProyecto {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly versionFormulario = signal(0);

  /** Identifica el formulario para permitir acciones externas mediante el atributo form. */
  public readonly idFormulario = input<string | null>(null);

  /** Proporciona los integrantes y asignaciones que deben presentarse. */
  public readonly datosIniciales = input<EquipoProyecto>(EQUIPO_VACIO);

  /** Bloquea temporalmente el formulario durante el guardado. */
  public readonly procesando = input(false);

  /** Define si las asignaciones se editan o se presentan como información confirmada. */
  public readonly modo = input(ModoFormularioProyecto.Edicion);

  /** Indica si se está renovando la membresía desde Azure. */
  public readonly sincronizando = input(false);

  /** Proporciona los perfiles técnicos disponibles para asignación. */
  public readonly perfilesTecnicos = input<readonly OpcionSelector[]>(
    OPCIONES_PERFIL_TECNICO_EQUIPO,
  );

  /** Proporciona las dedicaciones disponibles para asignación. */
  public readonly dedicaciones = input<readonly OpcionSelector[]>(OPCIONES_DEDICACION_EQUIPO);

  /** Entrega Equipo válido y normalizado al flujo consumidor. */
  public readonly guardar = output<EquipoProyecto>();

  /** Comunica el avance vigente para presentarlo fuera del formulario. */
  public readonly progresoCambiado = output<ProgresoEquipoProyecto>();

  protected readonly mensajesAsignacion = MENSAJES_ASIGNACION_EQUIPO;
  protected readonly esSoloLectura = computed(() => this.modo() === ModoFormularioProyecto.Lectura);
  protected readonly filtros = FiltroEquipoProyecto;
  protected readonly controlBusqueda = this.constructorFormulario.control('');
  protected readonly filtro = signal(FiltroEquipoProyecto.Todos);
  protected readonly seleccionados = signal<ReadonlySet<string>>(new Set());
  protected readonly formulario: FormularioEquipoProyectoTipado = this.constructorFormulario.group({
    integrantes: this.constructorFormulario.array<FormGroup<ControlesIntegranteEquipoProyecto>>([]),
  });
  protected readonly asignacionMasiva = this.constructorFormulario.group({
    perfilTecnicoCodigo: [''],
    dedicacionCodigo: [''],
  });
  private readonly busqueda = toSignal(this.controlBusqueda.valueChanges, { initialValue: '' });
  protected readonly controlesIntegrantes = computed(() => {
    this.versionFormulario();
    return [...this.formulario.controls.integrantes.controls];
  });
  protected readonly controlesVisibles = computed(() => {
    const termino = normalizarBusqueda(this.busqueda());
    const filtro = this.filtro();
    return this.controlesIntegrantes().filter((grupo) => {
      const integrante = grupo.getRawValue();
      const configurado = estaConfigurado(integrante);
      const coincideFiltro =
        filtro === FiltroEquipoProyecto.Todos ||
        (filtro === FiltroEquipoProyecto.Configurados && configurado) ||
        (filtro === FiltroEquipoProyecto.Pendientes && !configurado);
      const contenido = normalizarBusqueda(`${integrante.nombre} ${integrante.correo ?? ''}`);
      return coincideFiltro && (!termino || contenido.includes(termino));
    });
  });
  protected readonly cantidadConfigurados = computed(
    () =>
      this.controlesIntegrantes().filter((grupo) => estaConfigurado(grupo.getRawValue())).length,
  );
  protected readonly cantidadPendientes = computed(
    () => this.controlesIntegrantes().length - this.cantidadConfigurados(),
  );
  protected readonly todosVisiblesSeleccionados = computed(() => {
    const visibles = this.controlesVisibles();
    const seleccionados = this.seleccionados();
    return (
      visibles.length > 0 &&
      visibles.every((grupo) => seleccionados.has(grupo.controls.idAzure.value))
    );
  });
  protected readonly algunosVisiblesSeleccionados = computed(() => {
    const visibles = this.controlesVisibles();
    const seleccionados = this.seleccionados();
    const cantidadSeleccionada = visibles.filter((grupo) =>
      seleccionados.has(grupo.controls.idAzure.value),
    ).length;
    return cantidadSeleccionada > 0 && cantidadSeleccionada < visibles.length;
  });
  protected readonly puedeAplicarAsignacion = computed(() => {
    this.versionFormulario();
    const asignacion = this.asignacionMasiva.getRawValue();
    return (
      this.seleccionados().size > 0 &&
      Boolean(asignacion.perfilTecnicoCodigo || asignacion.dedicacionCodigo)
    );
  });

  public constructor() {
    this.formulario.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.versionFormulario.update((version) => version + 1);
      this.comunicarProgreso();
    });
    this.asignacionMasiva.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.versionFormulario.update((version) => version + 1));

    effect(() => {
      this.modo();
      this.presentarDatos(this.datosIniciales());
    });
    effect(() => {
      const bloquear = this.procesando() || this.sincronizando();
      if (bloquear) {
        if (this.formulario.enabled) this.formulario.disable({ emitEvent: false });
        if (this.controlBusqueda.enabled) this.controlBusqueda.disable({ emitEvent: false });
        if (this.asignacionMasiva.enabled) {
          this.asignacionMasiva.disable({ emitEvent: false });
        }
      } else {
        if (this.formulario.disabled) this.formulario.enable({ emitEvent: false });
        if (this.controlBusqueda.disabled) this.controlBusqueda.enable({ emitEvent: false });
        if (this.asignacionMasiva.disabled) {
          this.asignacionMasiva.enable({ emitEvent: false });
        }
      }
      this.versionFormulario.update((version) => version + 1);
    });
  }

  /** Cambia el subconjunto presentado sin alterar la configuración. */
  protected cambiarFiltro(filtro: FiltroEquipoProyecto): void {
    if (this.esSoloLectura()) return;
    this.filtro.set(filtro);
  }

  /** Alterna la selección de un integrante para la edición masiva. */
  protected alternarSeleccion(idAzure: string, seleccionado: boolean): void {
    if (this.esSoloLectura()) return;
    this.seleccionados.update((vigentes) => {
      const nuevos = new Set(vigentes);
      seleccionado ? nuevos.add(idAzure) : nuevos.delete(idAzure);
      return nuevos;
    });
  }

  /** Traduce el evento del checkbox de integrante a una selección tipada. */
  protected alternarSeleccionDesdeEvento(idAzure: string, evento: Event): void {
    this.alternarSeleccion(idAzure, obtenerEstadoCheckbox(evento));
  }

  /** Selecciona o libera únicamente los integrantes visibles. */
  protected alternarSeleccionVisible(seleccionar: boolean): void {
    if (this.esSoloLectura()) return;
    const ids = this.controlesVisibles().map((grupo) => grupo.controls.idAzure.value);
    this.seleccionados.update((vigentes) => {
      const nuevos = new Set(vigentes);
      ids.forEach((id) => (seleccionar ? nuevos.add(id) : nuevos.delete(id)));
      return nuevos;
    });
  }

  /** Traduce el evento del checkbox general a una selección tipada. */
  protected alternarSeleccionVisibleDesdeEvento(evento: Event): void {
    this.alternarSeleccionVisible(obtenerEstadoCheckbox(evento));
  }

  /** Aplica los valores indicados a todos los integrantes seleccionados. */
  protected aplicarAsignacionMasiva(): void {
    if (this.esSoloLectura() || !this.puedeAplicarAsignacion()) return;

    const seleccionados = this.seleccionados();
    const asignacion = this.asignacionMasiva.getRawValue();
    this.controlesIntegrantes().forEach((grupo) => {
      if (!seleccionados.has(grupo.controls.idAzure.value)) return;
      if (asignacion.perfilTecnicoCodigo) {
        grupo.controls.perfilTecnicoCodigo.setValue(asignacion.perfilTecnicoCodigo);
      }
      if (asignacion.dedicacionCodigo) {
        grupo.controls.dedicacionCodigo.setValue(asignacion.dedicacionCodigo);
      }
      grupo.markAsDirty();
    });
    this.asignacionMasiva.reset();
    this.seleccionados.set(new Set());
  }

  /** Entrega la edición vigente antes de una operación coordinada por la página. */
  public obtenerDatosVigentes(): EquipoProyecto {
    return this.obtenerEquipo();
  }

  /** Solicita persistir el equipo cuando todos sus integrantes están configurados. */
  protected enviar(): void {
    if (this.esSoloLectura()) return;
    if (this.formulario.invalid || this.controlesIntegrantes().length === 0) {
      this.formulario.markAllAsTouched();
      this.filtro.set(FiltroEquipoProyecto.Pendientes);
      return;
    }
    this.guardar.emit(this.obtenerEquipo());
  }

  /** Presenta la colección vigente sin conservar controles obsoletos. */
  private presentarDatos(datos: EquipoProyecto): void {
    const integrantes = this.formulario.controls.integrantes;
    integrantes.clear({ emitEvent: false });
    datos.integrantes.forEach((integrante) =>
      integrantes.push(this.crearGrupoIntegrante(integrante), { emitEvent: false }),
    );
    this.seleccionados.set(new Set());
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
    this.versionFormulario.update((version) => version + 1);
  }

  /** Construye un grupo homogéneo para cada identidad importada. */
  private crearGrupoIntegrante(
    integrante: IntegranteEquipoProyecto,
  ): FormGroup<ControlesIntegranteEquipoProyecto> {
    return this.constructorFormulario.group({
      idAzure: [integrante.idAzure],
      nombre: [integrante.nombre],
      correo: this.constructorFormulario.control<string | null>(integrante.correo),
      esAdministradorAzure: [integrante.esAdministradorAzure],
      perfilTecnicoCodigo: [integrante.perfilTecnicoCodigo, [Validators.required]],
      dedicacionCodigo: [integrante.dedicacionCodigo, [Validators.required]],
    });
  }

  /** Obtiene una fotografía independiente de los controles del formulario. */
  private obtenerEquipo(): EquipoProyecto {
    return {
      integrantes: this.formulario.getRawValue().integrantes.map((integrante) => ({
        ...integrante,
        idAzure: integrante.idAzure.trim(),
        nombre: integrante.nombre.trim(),
        correo: integrante.correo?.trim() || null,
        perfilTecnicoCodigo: integrante.perfilTecnicoCodigo.trim(),
        dedicacionCodigo: integrante.dedicacionCodigo.trim(),
      })),
    };
  }

  /** Comunica los totales derivados de la edición vigente. */
  private comunicarProgreso(): void {
    const configurados = this.formulario.controls.integrantes.controls.filter((grupo) =>
      estaConfigurado(grupo.getRawValue()),
    ).length;
    this.progresoCambiado.emit({
      configurados,
      pendientes: this.formulario.controls.integrantes.length - configurados,
    });
  }
}

function estaConfigurado(integrante: IntegranteEquipoProyecto): boolean {
  return Boolean(integrante.perfilTecnicoCodigo && integrante.dedicacionCodigo);
}

function normalizarBusqueda(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-CO');
}

function obtenerEstadoCheckbox(evento: Event): boolean {
  return evento.target instanceof HTMLInputElement && evento.target.checked;
}
