import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconoComponent } from '../../../components/icono/icono.component';
import { FormateadorFechaService } from '../../../fechas/services/formateador-fecha.service';
import { CONTROL_CAMPO_PERSONALIZADO, ControlCampoPersonalizado } from '../../errores-validacion';
import { DiaCalendario } from './models/dia-calendario.model';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'] as const;
const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Permite elegir una fecha calendario sin perder el contrato ISO del formulario. */
@Component({
  selector: 'app-selector-fecha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, IconoComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorFecha),
      multi: true,
    },
    {
      provide: CONTROL_CAMPO_PERSONALIZADO,
      useExisting: forwardRef(() => SelectorFecha),
    },
  ],
  templateUrl: './selector-fecha.html',
  styleUrl: './selector-fecha.css',
})
export class SelectorFecha implements ControlValueAccessor, ControlCampoPersonalizado {
  public readonly id = input.required<string>();
  public readonly placeholder = input('Selecciona una fecha');
  public readonly etiquetadoPor = input<string>();
  public readonly fechaMinima = input<string>();
  public readonly fechaMaxima = input<string>();

  /** Conserva la fecha visible e impide abrir o modificar el calendario. */
  public readonly soloLectura = input(false);

  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly abierto = signal(false);
  protected readonly deshabilitado = signal(false);
  protected readonly conError = signal(false);
  protected readonly valor = signal('');
  protected readonly fechaActiva = signal('');
  protected readonly mesVisible = signal(this.inicioMes(new Date()));
  protected readonly anchoOverlay = signal(0);
  protected readonly textoValor = computed(() =>
    this.formateador.formatear(this.valor(), 'breve', this.placeholder()),
  );
  protected readonly etiquetaMes = computed(() =>
    this.capitalizar(this.formateador.formatear(this.mesVisible(), 'mesAnio')),
  );
  protected readonly dias = computed<readonly DiaCalendario[]>(() =>
    this.construirDias(this.mesVisible(), this.valor()),
  );
  protected readonly posiciones: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 6,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -6,
    },
  ];

  private readonly formateador = inject(FormateadorFechaService);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly elementosDia = viewChildren<ElementRef<HTMLButtonElement>>('diaElemento');
  private notificarCambio: (valor: string) => void = () => undefined;
  private notificarTocado: () => void = () => undefined;

  public constructor() {
    effect(() => {
      if (this.soloLectura()) this.abierto.set(false);
    });
  }

  /** Sincroniza la fecha ISO recibida desde el formulario. */
  public writeValue(valor: string | null): void {
    const fecha = this.normalizarFecha(valor);
    this.valor.set(fecha);
    if (fecha) this.mesVisible.set(this.inicioMes(this.desdeIso(fecha)!));
  }

  /** Registra la función que recibirá los cambios del usuario. */
  public registerOnChange(funcion: (valor: string) => void): void {
    this.notificarCambio = funcion;
  }

  /** Registra la función que marcará la interacción del usuario. */
  public registerOnTouched(funcion: () => void): void {
    this.notificarTocado = funcion;
  }

  /** Sincroniza el estado deshabilitado administrado por el formulario. */
  public setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
    if (deshabilitado) this.abierto.set(false);
  }

  /** Entrega a la validación el botón que representa al control. */
  public obtenerElementoInteraccion(): HTMLElement | null {
    return this.trigger()?.nativeElement ?? null;
  }

  /** Refleja el error administrado por la directiva compartida. */
  public establecerEstadoError(activo: boolean): void {
    this.conError.set(activo);
  }

  /** Alterna el calendario desde el control visible. */
  protected alternar(): void {
    if (this.deshabilitado() || this.soloLectura()) return;
    this.abierto() ? this.cerrar() : this.abrir();
  }

  /** Abre el calendario desde teclas de activación estándar. */
  protected manejarTeclaTrigger(evento: KeyboardEvent): void {
    if (
      ['Enter', ' ', 'ArrowDown'].includes(evento.key) &&
      !this.deshabilitado() &&
      !this.soloLectura()
    ) {
      evento.preventDefault();
      this.abrir();
    }
  }

  /** Desplaza el mes visible conservando el calendario válido. */
  protected cambiarMes(desplazamiento: number): void {
    const actual = this.mesVisible();
    this.mesVisible.set(new Date(actual.getFullYear(), actual.getMonth() + desplazamiento, 1));
    const primerDiaDisponible = this.dias().find((dia) => !dia.otroMes && !dia.deshabilitado);
    if (primerDiaDisponible) this.fechaActiva.set(primerDiaDisponible.fecha);
    this.enfocarFechaActiva();
  }

  /** Confirma una fecha permitida y la comunica en formato ISO. */
  protected seleccionarDia(dia: DiaCalendario): void {
    if (this.soloLectura() || dia.deshabilitado) return;
    this.valor.set(dia.fecha);
    this.notificarCambio(dia.fecha);
    this.notificarTocado();
    this.cerrar(true);
  }

  /** Mantiene la navegación de la cuadrícula mediante teclado. */
  protected manejarTeclaCalendario(evento: KeyboardEvent): void {
    const desplazamientos: Readonly<Record<string, number>> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const desplazamiento = desplazamientos[evento.key];

    if (desplazamiento !== undefined) {
      evento.preventDefault();
      this.desplazarFechaActiva(desplazamiento);
      return;
    }

    switch (evento.key) {
      case 'Home':
        evento.preventDefault();
        this.desplazarAlExtremoSemana('inicio');
        break;
      case 'End':
        evento.preventDefault();
        this.desplazarAlExtremoSemana('fin');
        break;
      case 'PageUp':
        evento.preventDefault();
        this.desplazarFechaActivaPorMes(-1);
        break;
      case 'PageDown':
        evento.preventDefault();
        this.desplazarFechaActivaPorMes(1);
        break;
      case 'Enter':
      case ' ':
        evento.preventDefault();
        this.seleccionarFechaActiva();
        break;
      case 'Escape':
        evento.preventDefault();
        this.cerrar(true);
        break;
      case 'Tab':
        this.cerrar();
        break;
    }
  }

  /** Completa el enfoque cuando el calendario ya fue adjuntado. */
  protected alAdjuntarOverlay(): void {
    this.enfocarFechaActiva();
  }

  /** Cierra el calendario desde interacciones externas. */
  protected cerrarDesdeExterior(): void {
    this.cerrar();
  }

  /** Proporciona una descripción completa para cada fecha del calendario. */
  protected obtenerEtiquetaDia(fecha: string): string {
    return this.capitalizar(this.formateador.formatear(fecha, 'completa'));
  }

  private abrir(): void {
    const trigger = this.trigger()?.nativeElement;
    if (!trigger) return;

    const inicial = this.obtenerFechaInicial();
    this.fechaActiva.set(inicial);
    this.mesVisible.set(this.inicioMes(this.desdeIso(inicial)!));
    this.anchoOverlay.set(Math.max(trigger.getBoundingClientRect().width, 304));
    this.abierto.set(true);
  }

  private cerrar(devolverFoco = false): void {
    if (!this.abierto()) return;
    this.abierto.set(false);
    this.notificarTocado();
    if (devolverFoco) queueMicrotask(() => this.trigger()?.nativeElement.focus());
  }

  private obtenerFechaInicial(): string {
    const seleccionada = this.normalizarFecha(this.valor());
    if (seleccionada && !this.estaFueraDeRango(seleccionada)) return seleccionada;

    const hoy = this.aIso(new Date());
    if (!this.estaFueraDeRango(hoy)) return hoy;
    return (
      this.normalizarFecha(this.fechaMinima()) || this.normalizarFecha(this.fechaMaxima()) || hoy
    );
  }

  private construirDias(mes: Date, seleccionada: string): readonly DiaCalendario[] {
    const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const retroceso = (primerDia.getDay() + 6) % 7;
    const inicio = this.sumarDias(primerDia, -retroceso);
    const hoy = this.aIso(new Date());

    return Array.from({ length: 42 }, (_, indice) => {
      const fecha = this.sumarDias(inicio, indice);
      const iso = this.aIso(fecha);
      return {
        fecha: iso,
        numero: fecha.getDate(),
        otroMes: fecha.getMonth() !== mes.getMonth(),
        deshabilitado: this.estaFueraDeRango(iso),
        hoy: iso === hoy,
        seleccionado: iso === seleccionada,
      };
    });
  }

  private desplazarFechaActiva(dias: number): void {
    const fecha = this.desdeIso(this.fechaActiva());
    if (!fecha) return;
    this.activarFechaPermitida(this.sumarDias(fecha, dias), Math.sign(dias) || 1);
  }

  private desplazarAlExtremoSemana(extremo: 'inicio' | 'fin'): void {
    const fecha = this.desdeIso(this.fechaActiva());
    if (!fecha) return;
    const indiceLunes = (fecha.getDay() + 6) % 7;
    const desplazamiento = extremo === 'inicio' ? -indiceLunes : 6 - indiceLunes;
    this.activarFechaPermitida(
      this.sumarDias(fecha, desplazamiento),
      extremo === 'inicio' ? -1 : 1,
    );
  }

  private desplazarFechaActivaPorMes(meses: number): void {
    const fecha = this.desdeIso(this.fechaActiva());
    if (!fecha) return;
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + meses + 1, 0).getDate();
    this.activarFechaPermitida(
      new Date(fecha.getFullYear(), fecha.getMonth() + meses, Math.min(fecha.getDate(), ultimoDia)),
      Math.sign(meses),
    );
  }

  private activarFechaPermitida(candidata: Date, direccion: number): void {
    let fecha = candidata;
    for (let intentos = 0; intentos < 42; intentos += 1) {
      const iso = this.aIso(fecha);
      if (!this.estaFueraDeRango(iso)) {
        this.fechaActiva.set(iso);
        this.mesVisible.set(this.inicioMes(fecha));
        this.enfocarFechaActiva();
        return;
      }
      fecha = this.sumarDias(fecha, direccion);
    }
  }

  private seleccionarFechaActiva(): void {
    const dia = this.dias().find((item) => item.fecha === this.fechaActiva());
    if (dia) this.seleccionarDia(dia);
  }

  private enfocarFechaActiva(): void {
    queueMicrotask(() => {
      const indice = this.dias().findIndex((dia) => dia.fecha === this.fechaActiva());
      this.elementosDia()[indice]?.nativeElement.focus();
    });
  }

  private estaFueraDeRango(fecha: string): boolean {
    const minima = this.normalizarFecha(this.fechaMinima());
    const maxima = this.normalizarFecha(this.fechaMaxima());
    return (!!minima && fecha < minima) || (!!maxima && fecha > maxima);
  }

  private normalizarFecha(valor: string | null | undefined): string {
    if (!valor || !PATRON_FECHA.test(valor)) return '';
    const fecha = this.desdeIso(valor);
    return fecha && this.aIso(fecha) === valor ? valor : '';
  }

  private desdeIso(valor: string): Date | null {
    const coincidencia = PATRON_FECHA.exec(valor);
    if (!coincidencia) return null;
    return new Date(Number(coincidencia[1]), Number(coincidencia[2]) - 1, Number(coincidencia[3]));
  }

  private aIso(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
    const dia = `${fecha.getDate()}`.padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private sumarDias(fecha: Date, cantidad: number): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + cantidad);
  }

  private inicioMes(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  }

  private capitalizar(valor: string): string {
    return `${valor.charAt(0).toUpperCase()}${valor.slice(1)}`;
  }
}
