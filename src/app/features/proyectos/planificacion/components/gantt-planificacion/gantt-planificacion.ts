import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EstadoVacio } from '../../../../../shared/components/estado-vacio/estado-vacio';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import type { NombreIconoAplicacion } from '../../../../../shared/components/icono/iconos-aplicacion';
import { FormateadorFechaService } from '../../../../../shared/fechas/services/formateador-fecha.service';
import { CampoBusqueda } from '../../../../../shared/forms/controles/campo-busqueda/campo-busqueda';
import { SelectorCampo } from '../../../../../shared/forms/controles/selector-campo/selector-campo';
import type { OpcionSelector } from '../../../../../shared/forms/controles/selector-campo/models/opcion-selector.model';
import type { VersionPlanificacion } from '../../models/version-planificacion.model';
import { SelectorVersionPlanificacionComponent } from '../selector-version-planificacion/selector-version-planificacion';
import {
  EscalaGanttPlanificacion,
  type ElementoGanttPlanificacion,
  type GanttPlanificacion,
} from '../../models/gantt-planificacion.model';
import { TipoElementoPlanificacion } from '../../models/planificacion-proyecto.model';

interface DiaGantt {
  readonly clave: string;
  readonly fecha: Date;
  readonly numero: number;
  readonly diaSemana: string;
  readonly finSemana: boolean;
  readonly hoy: boolean;
}

interface SegmentoTemporalGantt {
  readonly clave: string;
  readonly etiqueta: string;
  readonly inicio: number;
  readonly dias: number;
}

interface ConectorJerarquiaGantt {
  readonly alto: number;
  readonly recorrido: string;
  readonly inicioX: number;
  readonly inicioY: number;
  readonly finalX: number;
  readonly finalY: number;
}

interface PosicionTooltipGantt {
  readonly clave: string;
  readonly izquierda: number;
  readonly arriba: number;
  readonly flechaIzquierda: number;
  readonly ubicacion: 'arriba' | 'abajo';
}

interface PosicionMarcaAguaGantt {
  readonly x: number;
  readonly y: number;
}

const MILISEGUNDOS_DIA = 86_400_000;
const ALTO_FILA_GANTT = 68;
const ALTO_ENCABEZADO_GANTT = 66;
const SOBRECOBERTURA_FILAS = 6;
const FILAS_VISIBLES_RESPALDO = 12;
const INICIO_CARRIL_RELACION = 14;
const SEPARACION_CARRIL_RELACION = 15;
const RETARDO_TOOLTIP_MS = 120;
const ETIQUETAS_DIA_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'] as const;

const ANCHO_DIA_POR_ESCALA: Readonly<Record<EscalaGanttPlanificacion, number>> = {
  [EscalaGanttPlanificacion.Dia]: 54,
  [EscalaGanttPlanificacion.Semana]: 22,
  [EscalaGanttPlanificacion.Mes]: 9,
  [EscalaGanttPlanificacion.Trimestre]: 4,
  [EscalaGanttPlanificacion.Anio]: 2,
};

const TAMANO_MARCA_AGUA_POR_ESCALA: Readonly<Record<EscalaGanttPlanificacion, number>> = {
  [EscalaGanttPlanificacion.Dia]: 200,
  [EscalaGanttPlanificacion.Semana]: 240,
  [EscalaGanttPlanificacion.Mes]: 280,
  [EscalaGanttPlanificacion.Trimestre]: 320,
  [EscalaGanttPlanificacion.Anio]: 360,
};

const SEPARACION_MARCA_AGUA_POR_ESCALA: Readonly<Record<EscalaGanttPlanificacion, number>> = {
  [EscalaGanttPlanificacion.Dia]: 760,
  [EscalaGanttPlanificacion.Semana]: 880,
  [EscalaGanttPlanificacion.Mes]: 1020,
  [EscalaGanttPlanificacion.Trimestre]: 1160,
  [EscalaGanttPlanificacion.Anio]: 1320,
};

/** Presenta la jerarquía principal de la planificación sobre una línea temporal. */
@Component({
  selector: 'app-gantt-planificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    EstadoVacio,
    IconoComponent,
    CampoBusqueda,
    SelectorCampo,
    SelectorVersionPlanificacionComponent,
  ],
  templateUrl: './gantt-planificacion.html',
  styleUrl: './gantt-planificacion.css',
})
export class GanttPlanificacionComponent {

  /** Proporciona acceso al servicio de formateador fecha. */
  private readonly fechas = inject(FormateadorFechaService);

  /** Proporciona la fotografía temporal que debe representarse. */
  public readonly datos = input.required<GanttPlanificacion>();
  /** Proporciona las versiones disponibles del proyecto para conservar la navegación del Gantt anterior. */
  public readonly versiones = input<readonly VersionPlanificacion[]>([]);
  /** Identifica la versión integral presentada. */
  public readonly versionSeleccionadaId = input<number | null>(null);
  /** Bloquea los controles mientras se consulta otra versión. */
  public readonly deshabilitado = input(false);
  /** Solicita volver a la vista jerárquica de la planificación. */
  public readonly volver = output<void>();
  /** Solicita presentar el Gantt de otra versión. */
  public readonly versionCambiada = output<number>();

  /** Conserva ID búsqueda para coordinar esta responsabilidad. */
  protected readonly idBusqueda = 'buscar-elemento-gantt';

  /** Conserva ID escala para coordinar esta responsabilidad. */
  protected readonly idEscala = 'escala-gantt-planificacion';

  /** Conserva ID etiqueta escala para coordinar esta responsabilidad. */
  protected readonly idEtiquetaEscala = 'escala-gantt-planificacion-label';

  /** Administra búsqueda control mediante formularios reactivos. */
  protected readonly busquedaControl = new FormControl('', { nonNullable: true });

  /** Administra escala control mediante formularios reactivos. */
  protected readonly escalaControl = new FormControl(EscalaGanttPlanificacion.Semana, {
    nonNullable: true,
  });

  /** Conserva opciones escala para coordinar esta responsabilidad. */
  protected readonly opcionesEscala: readonly OpcionSelector[] = [
    { valor: EscalaGanttPlanificacion.Dia, etiqueta: 'Día' },
    { valor: EscalaGanttPlanificacion.Semana, etiqueta: 'Semana' },
    { valor: EscalaGanttPlanificacion.Mes, etiqueta: 'Mes' },
    { valor: EscalaGanttPlanificacion.Trimestre, etiqueta: 'Trimestre' },
    { valor: EscalaGanttPlanificacion.Anio, etiqueta: 'Año' },
  ];

  /** Conserva búsqueda como estado reactivo de la instancia. */
  protected readonly busqueda = signal('');

  /** Conserva escala como estado reactivo de la instancia. */
  protected readonly escala = signal(EscalaGanttPlanificacion.Semana);

  /** Conserva mostrar relaciones como estado reactivo de la instancia. */
  protected readonly mostrarRelaciones = signal(true);

  /** Conserva panel vista abierto como estado reactivo de la instancia. */
  protected readonly panelVistaAbierto = signal(false);

  /** Conserva claves contraidas como estado reactivo de la instancia. */
  protected readonly clavesContraidas = signal<ReadonlySet<string>>(new Set<string>());

  /** Conserva relacion resaltada como estado reactivo de la instancia. */
  protected readonly relacionResaltada = signal<string | null>(null);

  /** Conserva posición tooltip como estado reactivo de la instancia. */
  protected readonly posicionTooltip = signal<PosicionTooltipGantt | null>(null);

  /** Conserva ancho ventana temporal como estado reactivo de la instancia. */
  private readonly anchoVentanaTemporal = signal(0);

  /** Conserva filas ventana como estado reactivo de la instancia. */
  private readonly filasVentana = signal(FILAS_VISIBLES_RESPALDO);

  /** Conserva primera fila visible como estado reactivo de la instancia. */
  private readonly primeraFilaVisible = signal(0);

  /** Referencia tablero dentro de la vista. */
  private readonly tablero = viewChild<ElementRef<HTMLDivElement>>('tablero');

  /** Referencia barra horizontal dentro de la vista. */
  private readonly barraHorizontal = viewChild<ElementRef<HTMLDivElement>>('barraHorizontal');

  /** Conserva temporizador tooltip para coordinar esta responsabilidad. */
  private temporizadorTooltip: ReturnType<typeof setTimeout> | null = null;

  /** Deriva ancho día a partir del estado vigente. */
  protected readonly anchoDia = computed(() => ANCHO_DIA_POR_ESCALA[this.escala()]);

  /** Deriva claves expandibles a partir del estado vigente. */
  protected readonly clavesExpandibles = computed(() =>
    this.datos()
      .elementos.filter((elemento) => elemento.tieneHijos)
      .map((elemento) => elemento.clave),
  );

  /** Deriva expansion completa a partir del estado vigente. */
  protected readonly expansionCompleta = computed(
    () => this.clavesExpandibles().length > 0 && this.clavesContraidas().size === 0,
  );

  /** Conserva ícono expansion para coordinar esta responsabilidad. */
  protected readonly iconoExpansion = computed<NombreIconoAplicacion>(() =>
    this.expansionCompleta() ? 'reducir' : 'ampliar',
  );

  /** Conserva ícono relaciones para coordinar esta responsabilidad. */
  protected readonly iconoRelaciones = computed<NombreIconoAplicacion>(() =>
    this.mostrarRelaciones() ? 'ocultar' : 'mostrar',
  );

  /** Deriva rango planificado a partir del estado vigente. */
  protected readonly rangoPlanificado = computed(() => {
    const elementos = this.datos().elementos;
    const hoy = obtenerHoyCalendario();
    if (elementos.length === 0) return { inicio: hoy, final: sumarDias(hoy, 28) };
    return {
      inicio: new Date(
        Math.min(...elementos.map((item) => parsearFecha(item.fechaInicio).getTime())),
      ),
      final: new Date(
        Math.max(...elementos.map((item) => parsearFecha(item.fechaFinal).getTime())),
      ),
    };
  });

  /** Deriva rango a partir del estado vigente. */
  protected readonly rango = computed(() => {
    const margen = Math.max(2, Math.ceil(72 / this.anchoDia()));
    const inicio = sumarDias(inicioSemana(this.rangoPlanificado().inicio), -margen);
    const finalBase = sumarDias(finalSemana(this.rangoPlanificado().final), Math.ceil(margen / 2));
    const diasBase = diferenciaDias(inicio, finalBase) + 1;
    const minimoDias = Math.ceil(this.anchoVentanaTemporal() / this.anchoDia());
    return { inicio, final: sumarDias(finalBase, Math.max(0, minimoDias - diasBase)) };
  });

  /** Conserva días para coordinar esta responsabilidad. */
  protected readonly dias = computed<readonly DiaGantt[]>(() => {
    const dias: DiaGantt[] = [];
    const hoy = claveFecha(obtenerHoyCalendario());
    for (
      let fecha = this.rango().inicio;
      fecha <= this.rango().final;
      fecha = sumarDias(fecha, 1)
    ) {
      const diaSemana = fecha.getDay();
      dias.push({
        clave: claveFecha(fecha),
        fecha,
        numero: fecha.getDate(),
        diaSemana: ETIQUETAS_DIA_SEMANA[diaSemana],
        finSemana: diaSemana === 0 || diaSemana === 6,
        hoy: claveFecha(fecha) === hoy,
      });
    }
    return dias;
  });

  /** Conserva segmentos encabezado para coordinar esta responsabilidad. */
  protected readonly segmentosEncabezado = computed<readonly SegmentoTemporalGantt[]>(() => {
    const segmentos: SegmentoTemporalGantt[] = [];
    for (const [indice, dia] of this.dias().entries()) {
      const anio = dia.fecha.getFullYear();
      const trimestre = Math.floor(dia.fecha.getMonth() / 3) + 1;
      const clave =
        this.escala() === EscalaGanttPlanificacion.Anio
          ? `${anio}`
          : this.escala() === EscalaGanttPlanificacion.Trimestre
            ? `${anio}-T${trimestre}`
            : `${anio}-${dia.fecha.getMonth()}`;
      const actual = segmentos.at(-1);
      if (actual?.clave === clave) {
        segmentos[segmentos.length - 1] = { ...actual, dias: actual.dias + 1 };
        continue;
      }
      segmentos.push({
        clave,
        etiqueta:
          this.escala() === EscalaGanttPlanificacion.Anio
            ? `${anio}`
            : this.escala() === EscalaGanttPlanificacion.Trimestre
              ? `Trimestre ${trimestre} · ${anio}`
              : this.fechas.formatear(dia.fecha, 'mesAnio'),
        inicio: indice,
        dias: 1,
      });
    }
    return segmentos;
  });

  /** Deriva ancho linea temporal a partir del estado vigente. */
  protected readonly anchoLineaTemporal = computed(() => this.dias().length * this.anchoDia());

  /** Conserva elementos visibles para coordinar esta responsabilidad. */
  protected readonly elementosVisibles = computed<readonly ElementoGanttPlanificacion[]>(() => {
    const elementos = this.datos().elementos;
    const termino = normalizarTexto(this.busqueda());
    if (termino) {
      const visibles = new Set<string>();
      const porClave = new Map(elementos.map((elemento) => [elemento.clave, elemento]));
      for (const elemento of elementos) {
        if (
          !normalizarTexto(elemento.titulo).includes(termino) &&
          !normalizarTexto(this.etiquetaTipo(elemento.tipo)).includes(termino)
        )
          continue;
        let actual: ElementoGanttPlanificacion | undefined = elemento;
        while (actual) {
          visibles.add(actual.clave);
          actual = actual.clavePadre ? porClave.get(actual.clavePadre) : undefined;
        }
      }
      return elementos.filter((elemento) => visibles.has(elemento.clave));
    }
    const ocultosPorPadre = new Set<string>();
    return elementos.filter((elemento) => {
      if (elemento.clavePadre && ocultosPorPadre.has(elemento.clavePadre)) {
        ocultosPorPadre.add(elemento.clave);
        return false;
      }
      if (this.clavesContraidas().has(elemento.clave)) ocultosPorPadre.add(elemento.clave);
      return true;
    });
  });

  /** Deriva visibles por clave a partir del estado vigente. */
  private readonly visiblesPorClave = computed(
    () => new Map(this.elementosVisibles().map((elemento) => [elemento.clave, elemento])),
  );

  /** Deriva ventana renderizado a partir del estado vigente. */
  protected readonly ventanaRenderizado = computed(() => {
    const total = this.elementosVisibles().length;
    const ancla = Math.max(0, Math.min(total, this.primeraFilaVisible()));
    const inicio = Math.max(0, ancla - SOBRECOBERTURA_FILAS);
    const final = Math.min(total, ancla + this.filasVentana() + SOBRECOBERTURA_FILAS);
    return {
      elementos: this.elementosVisibles().slice(inicio, final),
      espacioSuperior: inicio * ALTO_FILA_GANTT,
      espacioInferior: Math.max(0, total - final) * ALTO_FILA_GANTT,
    };
  });

  /** Deriva tamaño marca agua a partir del estado vigente. */
  protected readonly tamanoMarcaAgua = computed(() =>
    Math.min(
      TAMANO_MARCA_AGUA_POR_ESCALA[this.escala()],
      Math.max(140, this.anchoLineaTemporal() * 0.48),
    ),
  );

  /** Conserva posiciones marca agua para coordinar esta responsabilidad. */
  protected readonly posicionesMarcaAgua = computed<readonly PosicionMarcaAguaGantt[]>(() => {
    const ancho = this.anchoLineaTemporal();
    const alto = Math.max(ALTO_FILA_GANTT, this.elementosVisibles().length * ALTO_FILA_GANTT);
    const columnas = Math.max(
      1,
      Math.round(ancho / SEPARACION_MARCA_AGUA_POR_ESCALA[this.escala()]),
    );
    const filas = Math.max(1, Math.ceil(alto / Math.max(540, this.tamanoMarcaAgua() * 3.8)));
    const anchoSeccion = ancho / columnas;
    const altoSeccion = alto / filas;
    const posiciones: PosicionMarcaAguaGantt[] = [];
    for (let fila = 0; fila < filas; fila++) {
      for (let columna = 0; columna < columnas; columna++) {
        posiciones.push({
          x: anchoSeccion * (columna + 0.5),
          y: altoSeccion * (fila + 0.5),
        });
      }
    }
    return posiciones;
  });

  /** Conserva conectores para coordinar esta responsabilidad. */
  protected readonly conectores = computed<ReadonlyMap<string, ConectorJerarquiaGantt>>(() => {
    if (!this.mostrarRelaciones()) return new Map();
    const elementos = this.elementosVisibles();
    const porClave = new Map(elementos.map((elemento) => [elemento.clave, elemento]));
    const filaPorClave = new Map(elementos.map((elemento, indice) => [elemento.clave, indice]));
    const conectores = new Map<string, ConectorJerarquiaGantt>();
    for (const [filaHijo, elemento] of elementos.entries()) {
      if (!elemento.clavePadre) continue;
      const padre = porClave.get(elemento.clavePadre);
      const filaPadre = filaPorClave.get(elemento.clavePadre);
      if (!padre || filaPadre === undefined || filaPadre >= filaHijo) continue;
      const alto = (filaHijo - filaPadre + 1) * ALTO_FILA_GANTT;
      const carrilX = INICIO_CARRIL_RELACION + elemento.nivel * SEPARACION_CARRIL_RELACION;
      const inicioX = Math.max(carrilX + 8, this.posicionBarra(padre) - 7);
      const finalX = Math.max(carrilX + 8, this.posicionBarra(elemento) - 7);
      const inicioY = ALTO_FILA_GANTT / 2;
      const finalY = alto - ALTO_FILA_GANTT / 2;
      conectores.set(elemento.clave, {
        alto,
        recorrido: `M ${inicioX} ${inicioY} H ${carrilX} V ${finalY} H ${finalX}`,
        inicioX,
        inicioY,
        finalX,
        finalY,
      });
    }
    return conectores;
  });

  /** Deriva conteos a partir del estado vigente. */
  protected readonly conteos = computed(() => ({
    epicas: this.contar(TipoElementoPlanificacion.Epica),
    caracteristicas: this.contar(TipoElementoPlanificacion.Caracteristica),
    historias: this.contar(TipoElementoPlanificacion.Historia),
    tareas: this.contar(TipoElementoPlanificacion.Tarea),
  }));

  /** Deriva horas tareas a partir del estado vigente. */
  protected readonly horasTareas = computed(() =>
    this.datos()
      .elementos.filter((elemento) => elemento.tipo === TipoElementoPlanificacion.Tarea)
      .reduce((total, elemento) => total + elemento.estimacionHoras, 0),
  );

  /** Deriva fecha inicial a partir del estado vigente. */
  protected readonly fechaInicial = computed(() =>
    this.fechas.formatear(this.rangoPlanificado().inicio, 'breve'),
  );

  /** Deriva fecha final a partir del estado vigente. */
  protected readonly fechaFinal = computed(() =>
    this.fechas.formatear(this.rangoPlanificado().final, 'breve'),
  );

  /** Deriva duracion días a partir del estado vigente. */
  protected readonly duracionDias = computed(
    () => diferenciaDias(this.rangoPlanificado().inicio, this.rangoPlanificado().final) + 1,
  );

  /** Conserva observar tablero para coordinar esta responsabilidad. */
  private readonly observarTablero = effect((limpiar) => {
    const tablero = this.tablero()?.nativeElement;
    if (!tablero) return;
    const cabeceraLista = tablero.querySelector<HTMLElement>(
      '.gantt-planificacion__cabecera-lista',
    );
    const medir = () => {
      this.anchoVentanaTemporal.set(
        Math.max(0, Math.floor(tablero.clientWidth - (cabeceraLista?.offsetWidth ?? 0))),
      );
      this.filasVentana.set(
        Math.max(
          1,
          Math.ceil(Math.max(0, tablero.clientHeight - ALTO_ENCABEZADO_GANTT) / ALTO_FILA_GANTT),
        ),
      );
    };
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    observador.observe(tablero);
    if (cabeceraLista) observador.observe(cabeceraLista);
    limpiar(() => observador.disconnect());
  });

  public constructor() {
    this.busquedaControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((termino) => this.busqueda.set(termino));
    this.escalaControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((escala) => this.escala.set(escala));
  }

  /** Alterna todos dentro del flujo actual. */
  protected alternarTodos(): void {
    if (this.busqueda() || this.clavesExpandibles().length === 0) return;
    this.clavesContraidas.set(
      this.expansionCompleta() ? new Set(this.clavesExpandibles()) : new Set<string>(),
    );
  }

  /** Ejecuta cambiar expansion como parte del flujo interno. */
  protected cambiarExpansion(evento: Event): void {
    const control = evento.target;
    if (!(control instanceof HTMLInputElement)) return;
    this.clavesContraidas.set(
      control.checked ? new Set<string>() : new Set(this.clavesExpandibles()),
    );
  }

  /** Ejecuta cambiar relaciones como parte del flujo interno. */
  protected cambiarRelaciones(evento: Event): void {
    const control = evento.target;
    if (control instanceof HTMLInputElement) this.mostrarRelaciones.set(control.checked);
  }

  /** Alterna panel vista dentro del flujo actual. */
  protected alternarPanelVista(evento: MouseEvent): void {
    evento.stopPropagation();
    this.panelVistaAbierto.update((abierto) => !abierto);
  }

  /** Ejecuta volver al árbol como parte del flujo interno. */
  protected volverAlArbol(): void {
    this.panelVistaAbierto.set(false);
    this.volver.emit();
  }

  /** Cierra panel vista dentro del flujo actual. */
  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  protected cerrarPanelVista(): void {
    this.panelVistaAbierto.set(false);
  }

  /** Alterna elemento dentro del flujo actual. */
  protected alternarElemento(elemento: ElementoGanttPlanificacion): void {
    if (!elemento.tieneHijos) return;
    this.clavesContraidas.update((actuales) => {
      const siguientes = new Set(actuales);
      siguientes.has(elemento.clave)
        ? siguientes.delete(elemento.clave)
        : siguientes.add(elemento.clave);
      return siguientes;
    });
  }

  /** Determina si ta contraido. */
  protected estaContraido(clave: string): boolean {
    return this.clavesContraidas().has(clave);
  }

  /** Sincroniza desplazamiento dentro del flujo actual. */
  protected sincronizarDesplazamiento(): void {
    const tablero = this.tablero()?.nativeElement;
    const barra = this.barraHorizontal()?.nativeElement;
    if (!tablero) return;
    const primera = Math.max(
      0,
      Math.floor(Math.max(0, tablero.scrollTop - ALTO_ENCABEZADO_GANTT) / ALTO_FILA_GANTT),
    );
    if (primera !== this.primeraFilaVisible()) this.primeraFilaVisible.set(primera);
    if (barra && Math.abs(barra.scrollLeft - tablero.scrollLeft) >= 1)
      barra.scrollLeft = tablero.scrollLeft;
  }

  /** Ejecuta desplazar desde barra como parte del flujo interno. */
  protected desplazarDesdeBarra(): void {
    const tablero = this.tablero()?.nativeElement;
    const barra = this.barraHorizontal()?.nativeElement;
    if (tablero && barra && Math.abs(tablero.scrollLeft - barra.scrollLeft) >= 1)
      tablero.scrollLeft = barra.scrollLeft;
  }

  /** Ejecuta desplazar con rueda como parte del flujo interno. */
  protected desplazarConRueda(evento: WheelEvent): void {
    const delta =
      Math.abs(evento.deltaX) > Math.abs(evento.deltaY)
        ? evento.deltaX
        : evento.shiftKey
          ? evento.deltaY
          : 0;
    const tablero = this.tablero()?.nativeElement;
    if (!tablero || delta === 0) return;
    tablero.scrollLeft += delta;
    this.sincronizarDesplazamiento();
    evento.preventDefault();
  }

  /** Ejecuta posición barra como parte del flujo interno. */
  protected posicionBarra(elemento: ElementoGanttPlanificacion): number {
    return Math.max(
      0,
      diferenciaDias(this.rango().inicio, parsearFecha(elemento.fechaInicio)) * this.anchoDia(),
    );
  }

  /** Ejecuta ancho barra como parte del flujo interno. */
  protected anchoBarra(elemento: ElementoGanttPlanificacion): number {
    const duracion = Math.max(
      1,
      diferenciaDias(parsearFecha(elemento.fechaInicio), parsearFecha(elemento.fechaFinal)) + 1,
    );
    return Math.max(this.anchoDia() * duracion, 8);
  }

  /** Ejecuta posición segmento como parte del flujo interno. */
  protected posicionSegmento(segmento: SegmentoTemporalGantt): number {
    return segmento.inicio * this.anchoDia();
  }

  /** Ejecuta ancho segmento como parte del flujo interno. */
  protected anchoSegmento(segmento: SegmentoTemporalGantt): number {
    return segmento.dias * this.anchoDia();
  }

  /** Ejecuta sangria elemento como parte del flujo interno. */
  protected sangriaElemento(elemento: ElementoGanttPlanificacion): number {
    return 12 + elemento.nivel * 22;
  }

  /** Ejecuta semana como parte del flujo interno. */
  protected semana(fecha: Date): string {
    const primerJueves = new Date(fecha.getFullYear(), 0, 4);
    return `S${Math.floor(diferenciaDias(inicioSemana(primerJueves), inicioSemana(fecha)) / 7) + 1}`;
  }

  /** Muestra detalle días dentro del flujo actual. */
  protected mostrarDetalleDias(): boolean {
    return this.escala() === EscalaGanttPlanificacion.Dia;
  }

  /** Muestra semana dentro del flujo actual. */
  protected mostrarSemana(dia: DiaGantt): boolean {
    return this.escala() === EscalaGanttPlanificacion.Semana && dia.fecha.getDay() === 1;
  }

  /** Ejecuta resaltar relacion como parte del flujo interno. */
  protected resaltarRelacion(clave: string | null): void {
    this.relacionResaltada.set(clave);
  }

  /** Muestra tooltip dentro del flujo actual. */
  protected mostrarTooltip(clave: string, evento: Event): void {
    this.resaltarRelacion(clave);
    const disparador = evento.currentTarget;
    if (!(disparador instanceof HTMLElement)) return;

    const tooltip = disparador.nextElementSibling;
    if (!(tooltip instanceof HTMLElement)) return;

    this.cancelarAperturaTooltip();
    const presentar = (): void => {
      this.temporizadorTooltip = null;
      if (this.relacionResaltada() !== clave) return;
      this.posicionarTooltip(clave, disparador, tooltip);
    };

    if (evento.type === 'focus') {
      presentar();
      return;
    }

    this.temporizadorTooltip = setTimeout(presentar, RETARDO_TOOLTIP_MS);
  }

  /** Oculta tooltip dentro del flujo actual. */
  protected ocultarTooltip(clave: string): void {
    this.cancelarAperturaTooltip();
    if (this.posicionTooltip()?.clave === clave) this.posicionTooltip.set(null);
  }

  /** Ejecuta posicionar tooltip como parte del flujo interno. */
  private posicionarTooltip(clave: string, disparador: HTMLElement, tooltip: HTMLElement): void {
    const margen = 12;
    const separacion = 13;
    const rectangulo = disparador.getBoundingClientRect();
    const anchoTooltip = tooltip.offsetWidth;
    const altoTooltip = tooltip.offsetHeight;
    const anclaX = rectangulo.left + Math.min(rectangulo.width / 2, 38);
    const izquierda = Math.min(
      Math.max(margen, anclaX - 34),
      Math.max(margen, window.innerWidth - anchoTooltip - margen),
    );
    const arribaPreferido = rectangulo.top - altoTooltip - separacion;
    const ubicacion: PosicionTooltipGantt['ubicacion'] =
      arribaPreferido >= margen ? 'arriba' : 'abajo';
    const arribaSinLimitar =
      ubicacion === 'arriba' ? arribaPreferido : rectangulo.bottom + separacion;
    const arriba = Math.min(
      Math.max(margen, arribaSinLimitar),
      Math.max(margen, window.innerHeight - altoTooltip - margen),
    );
    const flechaIzquierda = Math.min(
      Math.max(18, anclaX - izquierda - 7),
      Math.max(18, anchoTooltip - 32),
    );
    this.posicionTooltip.set({ clave, izquierda, arriba, flechaIzquierda, ubicacion });
  }

  /** Ejecuta limpiar resaltado como parte del flujo interno. */
  protected limpiarResaltado(clave: string): void {
    this.ocultarTooltip(clave);
    if (this.relacionResaltada() === clave) this.relacionResaltada.set(null);
  }

  /** Cancela apertura tooltip dentro del flujo actual. */
  private cancelarAperturaTooltip(): void {
    if (this.temporizadorTooltip === null) return;
    clearTimeout(this.temporizadorTooltip);
    this.temporizadorTooltip = null;
  }

  /** Determina si origen relacion. */
  protected esOrigenRelacion(clave: string): boolean {
    const resaltado = this.relacionResaltada();
    if (!resaltado) return false;
    const elemento = this.visiblesPorClave().get(resaltado);
    return elemento?.clavePadre === clave || (elemento?.tieneHijos === true && resaltado === clave);
  }

  /** Determina si destino relacion. */
  protected esDestinoRelacion(clave: string): boolean {
    const resaltado = this.relacionResaltada();
    if (!resaltado) return false;
    const elementos = this.visiblesPorClave();
    const elemento = elementos.get(clave);
    const elementoResaltado = elementos.get(resaltado);
    return resaltado === clave || elemento?.clavePadre === elementoResaltado?.clave;
  }

  /** Determina si conector resaltado. */
  protected esConectorResaltado(clave: string): boolean {
    const resaltado = this.relacionResaltada();
    if (!resaltado) return false;
    const destino = this.visiblesPorClave().get(clave);
    return clave === resaltado || destino?.clavePadre === resaltado;
  }

  /** Ejecuta tipo visual conector como parte del flujo interno. */
  protected tipoVisualConector(clave: string): ElementoGanttPlanificacion['tipo'] {
    const elementos = this.visiblesPorClave();
    const destino = elementos.get(clave);
    const resaltado = this.relacionResaltada();
    if (resaltado === clave && destino?.clavePadre) {
      return elementos.get(destino.clavePadre)?.tipo ?? destino.tipo;
    }
    const elementoResaltado = resaltado ? elementos.get(resaltado) : undefined;
    return elementoResaltado && destino?.clavePadre === elementoResaltado.clave
      ? elementoResaltado.tipo
      : (destino?.tipo ?? TipoElementoPlanificacion.Tarea);
  }

  /** Ejecuta conector como parte del flujo interno. */
  protected conector(clave: string): ConectorJerarquiaGantt | undefined {
    return this.conectores().get(clave);
  }

  /** Ejecuta etiqueta tipo como parte del flujo interno. */
  protected etiquetaTipo(tipo: ElementoGanttPlanificacion['tipo']): string {
    switch (tipo) {
      case TipoElementoPlanificacion.Epica:
        return 'Épica';
      case TipoElementoPlanificacion.Caracteristica:
        return 'Característica';
      case TipoElementoPlanificacion.Historia:
        return 'Historia de usuario';
      case TipoElementoPlanificacion.Tarea:
        return 'Tarea';
    }
  }

  /** Ejecuta ícono tipo como parte del flujo interno. */
  protected iconoTipo(tipo: ElementoGanttPlanificacion['tipo']): NombreIconoAplicacion {
    switch (tipo) {
      case TipoElementoPlanificacion.Epica:
        return 'epica';
      case TipoElementoPlanificacion.Caracteristica:
        return 'caracteristica';
      case TipoElementoPlanificacion.Historia:
        return 'historiaUsuario';
      case TipoElementoPlanificacion.Tarea:
        return 'tarea';
    }
  }

  /** Ejecuta fecha elemento como parte del flujo interno. */
  protected fechaElemento(fecha: string): string {
    return this.fechas.formatear(fecha, 'breve');
  }

  /** Ejecuta descripción barra como parte del flujo interno. */
  protected descripcionBarra(elemento: ElementoGanttPlanificacion): string {
    const resumen = elemento.tieneHijos ? ' · Periodo consolidado con sus hijos' : '';
    return `${elemento.titulo}. ${this.fechaElemento(elemento.fechaInicio)} — ${this.fechaElemento(elemento.fechaFinal)}. ${elemento.estimacionHoras} horas${resumen}`;
  }

  /** Ejecuta contar como parte del flujo interno. */
  private contar(tipo: ElementoGanttPlanificacion['tipo']): number {
    return this.datos().elementos.filter((elemento) => elemento.tipo === tipo).length;
  }
}

function parsearFecha(valor: string): Date {
  const [anio, mes, dia] = valor.split('-').map(Number);
  return new Date(anio!, mes! - 1, dia!);
}
function obtenerHoyCalendario(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}
function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}
function diferenciaDias(inicio: Date, final: Date): number {
  return Math.round(
    (Date.UTC(final.getFullYear(), final.getMonth(), final.getDate()) -
      Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) /
      MILISEGUNDOS_DIA,
  );
}
function inicioSemana(fecha: Date): Date {
  const dia = fecha.getDay();
  return sumarDias(fecha, -(dia === 0 ? 6 : dia - 1));
}
function finalSemana(fecha: Date): Date {
  return sumarDias(inicioSemana(fecha), 6);
}
function claveFecha(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}
function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
