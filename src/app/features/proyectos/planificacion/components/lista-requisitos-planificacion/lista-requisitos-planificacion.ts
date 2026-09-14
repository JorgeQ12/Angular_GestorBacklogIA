import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, startWith, type Subscription } from 'rxjs';
import { MensajesService } from '../../../../../core/mensajes/services/mensajes.service';
import { NotificadorErroresApiService } from '../../../../../core/mensajes/services/notificador-errores-api.service';
import { EstadoError } from '../../../../../shared/components/estado-error/estado-error';
import { EstadoVacio } from '../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { Modal } from '../../../../../shared/components/modal/modal';
import { SelectorCampo } from '../../../../../shared/forms/controles/selector-campo/selector-campo';
import type { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import {
  EnfocarPrimerControlInvalidoDirective,
  ErrorCampoDirective,
  MensajesFormularioDirective,
} from '../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../shared/forms/validadores';
import {
  DECISIONES_DETALLE_REQUISITO,
  DECISIONES_INICIALES_REQUISITO,
  LIMITES_FORMULARIO_REQUISITO,
  MENSAJES_FORMULARIO_REQUISITO,
  type CampoBinarioRequisito,
} from '../../config/lista-requisitos-planificacion.config';
import { agruparRequisitos } from '../../mappers/lista-requisitos.mapper';
import {
  ModoUbicacionRequisito,
  type ActualizacionRequisito,
  type CatalogoRequisitos,
  type CreacionRequisito,
  type RequisitoProyecto,
} from '../../models/lista-requisitos.model';
import { ListaRequisitosPlanificacionService } from '../../services/lista-requisitos-planificacion.service';

interface EstadoEditable {
  readonly cumple: boolean;
  readonly aplica: boolean;
  readonly transversal: boolean;
  readonly nombreResponsable: string;
}

/** Coordina la consulta, creación y revisión editable de requisitos de un proyecto. */
@Component({
  selector: 'app-lista-requisitos-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    EnfocarPrimerControlInvalidoDirective,
    ErrorCampoDirective,
    EstadoError,
    EstadoVacio,
    IconoComponent,
    MensajesFormularioDirective,
    Modal,
    SelectorCampo,
  ],
  templateUrl: './lista-requisitos-planificacion.html',
  styleUrl: './lista-requisitos-planificacion.css',
})
export class ListaRequisitosPlanificacion implements OnInit {

  /** Proporciona acceso al servicio remoto requerido por esta responsabilidad. */
  private readonly api = inject(ListaRequisitosPlanificacionService);

  /** Proporciona acceso a non nullable form builder. */
  private readonly formularios = inject(NonNullableFormBuilder);

  /** Proporciona acceso al servicio de mensajes. */
  private readonly mensajes = inject(MensajesService);

  /** Proporciona acceso al servicio de notificador errores API. */
  private readonly notificador = inject(NotificadorErroresApiService);

  /** Coordina la finalización de recursos cuando se destruye la instancia. */
  private readonly destroyRef = inject(DestroyRef);

  /** Conserva carga requisitos para controlar el ciclo de vida de la operación. */
  private cargaRequisitos?: Subscription;

  /** Conserva carga catálogo para controlar el ciclo de vida de la operación. */
  private cargaCatalogo?: Subscription;

  /** Identifica el proyecto dueño de la lista. */
  public readonly proyectoId = input.required<number>();

  /** Solicita regresar a la vista principal del backlog. */
  public readonly volver = output<void>();

  /** Informa que una creación o actualización quedó persistida. */
  public readonly cambiosGuardados = output<void>();

  /** Conserva requisitos como estado reactivo de la instancia. */
  protected readonly requisitos = signal<readonly RequisitoProyecto[]>([]);

  /** Deriva grupos a partir del estado vigente. */
  protected readonly grupos = computed(() => agruparRequisitos(this.requisitos()));

  /** Conserva cargando como estado reactivo de la instancia. */
  protected readonly cargando = signal(true);

  /** Conserva error carga como estado reactivo de la instancia. */
  protected readonly errorCarga = signal(false);

  /** Conserva catálogo como estado reactivo de la instancia. */
  protected readonly catalogo = signal<CatalogoRequisitos | null>(null);

  /** Conserva cargando catálogo como estado reactivo de la instancia. */
  protected readonly cargandoCatalogo = signal(true);

  /** Conserva error catálogo como estado reactivo de la instancia. */
  protected readonly errorCatalogo = signal(false);

  /** Conserva requisito abierto ID como estado reactivo de la instancia. */
  protected readonly requisitoAbiertoId = signal<number | null>(null);

  /** Deriva requisito abierto a partir del estado vigente. */
  protected readonly requisitoAbierto = computed(
    () => this.requisitos().find((item) => item.id === this.requisitoAbiertoId()) ?? null,
  );

  /** Conserva modal creación abierto como estado reactivo de la instancia. */
  protected readonly modalCreacionAbierto = signal(false);

  /** Conserva creando como estado reactivo de la instancia. */
  protected readonly creando = signal(false);

  /** Conserva guardando como estado reactivo de la instancia. */
  protected readonly guardando = signal(false);

  /** Conserva guardando ids como estado reactivo de la instancia. */
  protected readonly guardandoIds = signal<ReadonlySet<number>>(new Set());

  /** Conserva areas contraidas como estado reactivo de la instancia. */
  protected readonly areasContraidas = signal<ReadonlySet<string>>(new Set());

  /** Conserva secciones contraidas como estado reactivo de la instancia. */
  protected readonly seccionesContraidas = signal<ReadonlySet<string>>(new Set());

  /** Conserva estados como estado reactivo de la instancia. */
  protected readonly estados = signal<Record<number, EstadoEditable>>({});

  /** Conserva estados persistidos como estado reactivo de la instancia. */
  private readonly estadosPersistidos = signal<Record<number, EstadoEditable>>({});

  /** Conserva modo ubicacion como estado reactivo de la instancia. */
  protected readonly modoUbicacion = signal(ModoUbicacionRequisito.Existente);

  /** Conserva modos ubicacion para coordinar esta responsabilidad. */
  protected readonly modosUbicacion = ModoUbicacionRequisito;

  /** Conserva ID formulario para coordinar esta responsabilidad. */
  protected readonly idFormulario = 'formulario-nuevo-requisito';

  /** Conserva mensajes formulario para coordinar esta responsabilidad. */
  protected readonly mensajesFormulario = MENSAJES_FORMULARIO_REQUISITO;

  /** Conserva decisiones iniciales para coordinar esta responsabilidad. */
  protected readonly decisionesIniciales = DECISIONES_INICIALES_REQUISITO;

  /** Conserva decisiones detalle para coordinar esta responsabilidad. */
  protected readonly decisionesDetalle = DECISIONES_DETALLE_REQUISITO;

  /** Administra los valores y validaciones del formulario reactivo. */
  protected readonly formulario = this.formularios.group({
    areaId: this.formularios.control<number | null>(null, Validators.required),
    areaNombre: this.formularios.control('', [
      validarTextoRequerido,
      Validators.maxLength(LIMITES_FORMULARIO_REQUISITO.areaNombre),
    ]),
    seccionId: this.formularios.control<number | null>(null, Validators.required),
    seccionNombre: this.formularios.control('', [
      validarTextoRequerido,
      Validators.maxLength(LIMITES_FORMULARIO_REQUISITO.seccionNombre),
    ]),
    tipoId: this.formularios.control<number | null>(null, Validators.required),
    titulo: this.formularios.control('', [
      validarTextoRequerido,
      Validators.maxLength(LIMITES_FORMULARIO_REQUISITO.titulo),
    ]),
    descripcion: this.formularios.control('', validarTextoRequerido),
    responsable: this.formularios.control('', validarTextoRequerido),
    nombreResponsable: this.formularios.control(
      '',
      Validators.maxLength(LIMITES_FORMULARIO_REQUISITO.nombreResponsable),
    ),
    validador: this.formularios.control('', validarTextoRequerido),
    agrupador: this.formularios.control('', validarTextoRequerido),
    transversal: this.formularios.control(false),
    aplica: this.formularios.control(true),
    cumple: this.formularios.control(false),
  });

  /** Conserva área seleccionada ID para coordinar esta responsabilidad. */
  private readonly areaSeleccionadaId = toSignal(
    this.formulario.controls.areaId.valueChanges.pipe(
      startWith(this.formulario.controls.areaId.value),
    ),
    { initialValue: null },
  );

  /** Conserva opciones área para coordinar esta responsabilidad. */
  protected readonly opcionesArea = computed<readonly OpcionSelector[]>(
    () => this.catalogo()?.areas.map((item) => ({ valor: item.id, etiqueta: item.nombre })) ?? [],
  );

  /** Conserva opciones seccion para coordinar esta responsabilidad. */
  protected readonly opcionesSeccion = computed<readonly OpcionSelector[]>(() => {
    const area = this.catalogo()?.areas.find((item) => item.id === this.areaSeleccionadaId());
    return area?.secciones.map((item) => ({ valor: item.id, etiqueta: item.nombre })) ?? [];
  });

  /** Deriva opciones tipo a partir del estado vigente. */
  protected readonly opcionesTipo = computed(() => this.catalogo()?.tipos ?? []);

  /** Deriva opciones responsable a partir del estado vigente. */
  protected readonly opcionesResponsable = computed(() => this.catalogo()?.responsables ?? []);

  /** Deriva opciones validador a partir del estado vigente. */
  protected readonly opcionesValidador = computed(() => this.catalogo()?.validadores ?? []);

  /** Deriva opciones agrupador a partir del estado vigente. */
  protected readonly opcionesAgrupador = computed(() => this.catalogo()?.agrupadores ?? []);

  /** Deriva creando área a partir del estado vigente. */
  protected readonly creandoArea = computed(
    () => this.modoUbicacion() === ModoUbicacionRequisito.NuevaArea,
  );

  /** Deriva creando seccion a partir del estado vigente. */
  protected readonly creandoSeccion = computed(
    () => this.modoUbicacion() !== ModoUbicacionRequisito.Existente,
  );

  /** Deriva modificados a partir del estado vigente. */
  protected readonly modificados = computed(() =>
    this.requisitos()
      .filter((item) => {
        const actual = this.estados()[item.id];
        const guardado = this.estadosPersistidos()[item.id];
        return actual && guardado && JSON.stringify(actual) !== JSON.stringify(guardado);
      })
      .map((item) => item.id),
  );

  public constructor() {
    this.formulario.controls.areaId.valueChanges.pipe(takeUntilDestroyed()).subscribe((areaId) => {
      const controles = this.formulario.controls;
      controles.seccionId.setValue(null);
      if (this.modoUbicacion() === ModoUbicacionRequisito.Existente) {
        areaId ? controles.seccionId.enable() : controles.seccionId.disable();
      } else if (this.modoUbicacion() === ModoUbicacionRequisito.NuevaSeccion) {
        areaId ? controles.seccionNombre.enable() : controles.seccionNombre.disable();
      }
    });
    this.formulario.controls.areaNombre.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((nombre) => {
        if (this.modoUbicacion() !== ModoUbicacionRequisito.NuevaArea) return;
        nombre.trim()
          ? this.formulario.controls.seccionNombre.enable()
          : this.formulario.controls.seccionNombre.disable();
      });
    this.formulario.controls.responsable.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((valor) => {
        this.formulario.controls.nombreResponsable.setValue(
          this.catalogo()?.nombresResponsables[valor] ?? '',
        );
      });
  }

  /** Inicia las consultas independientes de requisitos y catálogos. */
  public ngOnInit(): void {
    this.cargar();
    this.cargarCatalogo();
  }

  /** Carga la operación solicitada dentro del flujo actual. */
  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.cargaRequisitos?.unsubscribe();
    this.cargaRequisitos = this.api
      .obtener(this.proyectoId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (requisitos) => {
          this.requisitos.set(requisitos);
          const estados = Object.fromEntries(
            requisitos.map((item) => [item.id, this.crearEstado(item)]),
          );
          this.estados.set(estados);
          this.estadosPersistidos.set(estados);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.errorCarga.set(true);
        },
      });
  }

  /** Carga catálogo dentro del flujo actual. */
  protected cargarCatalogo(): void {
    this.cargandoCatalogo.set(true);
    this.errorCatalogo.set(false);
    this.cargaCatalogo?.unsubscribe();
    this.cargaCatalogo = this.api
      .obtenerCatalogo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (catalogo) => {
          this.catalogo.set(catalogo);
          this.cargandoCatalogo.set(false);
        },
        error: () => {
          this.cargandoCatalogo.set(false);
          this.errorCatalogo.set(true);
        },
      });
  }

  /** Alterna área dentro del flujo actual. */
  protected alternarArea(nombre: string): void {
    this.areasContraidas.update((items) => this.alternarSet(items, nombre));
  }

  /** Alterna seccion dentro del flujo actual. */
  protected alternarSeccion(area: string, seccion: string): void {
    this.seccionesContraidas.update((items) => this.alternarSet(items, `${area}::${seccion}`));
  }

  /** Ejecuta área expandida como parte del flujo interno. */
  protected areaExpandida(nombre: string): boolean {
    return !this.areasContraidas().has(nombre);
  }

  /** Ejecuta seccion expandida como parte del flujo interno. */
  protected seccionExpandida(area: string, seccion: string): boolean {
    return !this.seccionesContraidas().has(`${area}::${seccion}`);
  }

  /** Abre detalle dentro del flujo actual. */
  protected abrirDetalle(id: number): void {
    this.requisitoAbiertoId.set(id);
  }

  /** Cierra detalle dentro del flujo actual. */
  protected cerrarDetalle(): void {
    this.requisitoAbiertoId.set(null);
  }

  /** Ejecuta estado como parte del flujo interno. */
  protected estado(id: number): EstadoEditable {
    return (
      this.estados()[id] ?? {
        cumple: false,
        aplica: false,
        transversal: false,
        nombreResponsable: '',
      }
    );
  }

  /** Actualiza binario dentro del flujo actual. */
  protected actualizarBinario(id: number, campo: CampoBinarioRequisito, valor: boolean): void {
    if (!this.guardandoIds().has(id))
      this.estados.update((items) => ({ ...items, [id]: { ...this.estado(id), [campo]: valor } }));
  }

  /** Actualiza nombre dentro del flujo actual. */
  protected actualizarNombre(id: number, evento: Event): void {
    if (this.guardandoIds().has(id)) return;
    if (!(evento.target instanceof HTMLInputElement)) return;

    const valor = evento.target.value;
    this.estados.update((items) => ({
      ...items,
      [id]: { ...this.estado(id), nombreResponsable: valor },
    }));
  }

  /** Abre creación dentro del flujo actual. */
  protected abrirCreacion(): void {
    this.formulario.reset({
      areaId: null,
      areaNombre: '',
      seccionId: null,
      seccionNombre: '',
      tipoId: null,
      titulo: '',
      descripcion: '',
      responsable: '',
      nombreResponsable: '',
      validador: '',
      agrupador: '',
      transversal: false,
      aplica: true,
      cumple: false,
    });
    this.cambiarModo(ModoUbicacionRequisito.Existente);
    this.modalCreacionAbierto.set(true);
  }

  /** Cierra creación dentro del flujo actual. */
  protected cerrarCreacion(): void {
    if (!this.creando()) this.modalCreacionAbierto.set(false);
  }

  /** Ejecuta cambiar modo como parte del flujo interno. */
  protected cambiarModo(modo: ModoUbicacionRequisito): void {
    this.modoUbicacion.set(modo);
    const c = this.formulario.controls;
    c.areaId.setValue(null);
    c.areaNombre.setValue('');
    c.seccionId.setValue(null);
    c.seccionNombre.setValue('');
    modo === ModoUbicacionRequisito.NuevaArea ? c.areaId.disable() : c.areaId.enable();
    c.seccionNombre.disable();
    c.seccionId.disable();
    modo === ModoUbicacionRequisito.NuevaArea ? c.areaNombre.enable() : c.areaNombre.disable();
  }

  /** Establece inicial dentro del flujo actual. */
  protected establecerInicial(campo: CampoBinarioRequisito, valor: boolean): void {
    this.formulario.controls[campo].setValue(valor);
  }

  /** Ejecuta valor inicial como parte del flujo interno. */
  protected valorInicial(campo: CampoBinarioRequisito): boolean {
    return this.formulario.controls[campo].value;
  }

  /** Crea la operación solicitada dentro del flujo actual. */
  protected async crear(): Promise<void> {
    if (this.formulario.invalid || !this.catalogo()) {
      this.formulario.markAllAsTouched();
      return;
    }
    const solicitud = this.construirCreacion();
    if (!solicitud) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.creando.set(true);
    this.formulario.disable({ emitEvent: false });
    try {
      const creado = await firstValueFrom(this.api.crear(this.proyectoId(), solicitud));
      const requisitos = [...this.requisitos(), creado].sort((a, b) => a.orden - b.orden);
      this.requisitos.set(requisitos);
      const estado = this.crearEstado(creado);
      this.estados.update((items) => ({ ...items, [creado.id]: estado }));
      this.estadosPersistidos.update((items) => ({ ...items, [creado.id]: estado }));
      this.modalCreacionAbierto.set(false);
      this.cambiosGuardados.emit();
      await this.mensajes.exito(
        'Requisito agregado',
        `${creado.codigo} quedó registrado en ${creado.area}.`,
      );
      if (this.modoUbicacion() !== ModoUbicacionRequisito.Existente) this.cargarCatalogo();
    } catch (error) {
      this.notificador.comunicar(error, {
        titulo: 'No fue posible agregar el requisito',
        descripcion: 'Conservamos el formulario. Revisa la información e inténtalo nuevamente.',
      });
    } finally {
      this.creando.set(false);
      this.formulario.enable({ emitEvent: false });
      this.aplicarEstadoUbicacion();
    }
  }

  /** Ejecuta solicitar volver como parte del flujo interno. */
  protected async solicitarVolver(): Promise<void> {
    const ids = this.modificados();
    if (!ids.length) {
      this.volver.emit();
      return;
    }
    const confirmar = await this.mensajes.confirmar(
      '¿Guardar cambios antes de volver?',
      `Tienes ${ids.length === 1 ? '1 requisito modificado' : `${ids.length} requisitos modificados`}.`,
      'Guardar y volver',
      'Volver sin guardar',
    );
    if (!confirmar) {
      this.restaurar();
      this.volver.emit();
      return;
    }
    await this.guardarCambios(ids);
  }

  /** Guarda cambios dentro del flujo actual. */
  private async guardarCambios(ids: readonly number[]): Promise<void> {
    this.guardando.set(true);
    this.guardandoIds.set(new Set(ids));
    let fallidos = 0;
    let primerError: unknown;
    for (const id of ids) {
      try {
        const actual = this.estado(id);
        const solicitud: ActualizacionRequisito = {
          cumple: actual.cumple,
          aplica: actual.aplica,
          transversal: actual.transversal,
          nombreResponsable: actual.nombreResponsable.trim() || null,
        };
        await firstValueFrom(this.api.actualizar(this.proyectoId(), id, solicitud));
        this.estadosPersistidos.update((items) => ({
          ...items,
          [id]: { ...actual, nombreResponsable: actual.nombreResponsable.trim() },
        }));
      } catch (error) {
        fallidos += 1;
        primerError ??= error;
      } finally {
        this.guardandoIds.update((items) => {
          const copia = new Set(items);
          copia.delete(id);
          return copia;
        });
      }
    }
    this.guardando.set(false);
    this.guardandoIds.set(new Set());
    if (fallidos && primerError) {
      this.notificador.comunicar(primerError, {
        titulo: 'No fue posible guardar todos los requisitos',
        descripcion:
          fallidos === 1
            ? 'Un requisito quedó pendiente de guardar.'
            : `${fallidos} requisitos quedaron pendientes de guardar.`,
      });
    } else {
      this.cambiosGuardados.emit();
      this.volver.emit();
    }
  }

  /** Construye creación dentro del flujo actual. */
  private construirCreacion(): CreacionRequisito | null {
    const v = this.formulario.getRawValue();
    const catalogo = this.catalogo();
    if (!catalogo) return null;
    const areaSeleccionada = catalogo.areas.find((item) => item.id === v.areaId);
    const seccionSeleccionada = areaSeleccionada?.secciones.find((item) => item.id === v.seccionId);
    const tipo = catalogo.tipos.find((item) => item.valor === v.tipoId)?.etiqueta;
    const area =
      this.modoUbicacion() === ModoUbicacionRequisito.NuevaArea
        ? v.areaNombre.trim()
        : areaSeleccionada?.nombre;
    const seccion =
      this.modoUbicacion() === ModoUbicacionRequisito.Existente
        ? seccionSeleccionada?.nombre
        : v.seccionNombre.trim();
    if (!area || !seccion || !tipo) return null;
    return {
      area,
      seccion,
      tipoRequisito: tipo,
      nombre: v.titulo.trim(),
      descripcion: v.descripcion.trim(),
      transversal: v.transversal,
      responsable: v.responsable.trim(),
      nombreResponsable: v.nombreResponsable.trim() || null,
      validador: v.validador.trim(),
      aplica: v.aplica,
      cumple: v.cumple,
      agrupador: v.agrupador.trim(),
    };
  }

  /** Crea estado dentro del flujo actual. */
  private crearEstado(item: RequisitoProyecto): EstadoEditable {
    return {
      cumple: item.cumple,
      aplica: item.aplica,
      transversal: item.transversal,
      nombreResponsable: item.nombreResponsable?.trim() ?? '',
    };
  }

  /** Ejecuta restaurar como parte del flujo interno. */
  private restaurar(): void {
    this.estados.set({ ...this.estadosPersistidos() });
  }

  /** Alterna set dentro del flujo actual. */
  private alternarSet(items: ReadonlySet<string>, valor: string): ReadonlySet<string> {
    const copia = new Set(items);
    copia.has(valor) ? copia.delete(valor) : copia.add(valor);
    return copia;
  }

  /** Aplica estado ubicacion dentro del flujo actual. */
  private aplicarEstadoUbicacion(): void {
    const controles = this.formulario.controls;
    const modo = this.modoUbicacion();
    modo === ModoUbicacionRequisito.NuevaArea
      ? controles.areaId.disable({ emitEvent: false })
      : controles.areaId.enable({ emitEvent: false });
    modo === ModoUbicacionRequisito.NuevaArea
      ? controles.areaNombre.enable({ emitEvent: false })
      : controles.areaNombre.disable({ emitEvent: false });

    if (modo === ModoUbicacionRequisito.Existente && controles.areaId.value) {
      controles.seccionId.enable({ emitEvent: false });
    } else {
      controles.seccionId.disable({ emitEvent: false });
    }

    const puedeCrearSeccion =
      (modo === ModoUbicacionRequisito.NuevaSeccion && !!controles.areaId.value) ||
      (modo === ModoUbicacionRequisito.NuevaArea && !!controles.areaNombre.value.trim());
    puedeCrearSeccion
      ? controles.seccionNombre.enable({ emitEvent: false })
      : controles.seccionNombre.disable({ emitEvent: false });
  }
}
