import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconoComponent } from '../../../../../shared/components/icono/icono.component';
import { FechaPipe } from '../../../../../shared/fechas/pipes/fecha.pipe';
import { ErrorCampoDirective } from '../../../../../shared/forms/errores-validacion';
import { validarTextoRequerido } from '../../../../../shared/forms/validadores/texto-requerido.validator';
import {
  ACCIONES_RAPIDAS_ASISTENTE_IA,
  LIMITE_MENSAJE_ASISTENTE_IA,
  MENSAJES_CAMPO_MENSAJE_ASISTENTE_IA,
} from '../../config/panel-asistente-ia.config';
import {
  EstadoPropuestaAsistenteIA,
  RolMensajeAsistenteIA,
  type MensajeAsistenteIA,
} from '../../models/asistente-ia.model';

/** Presenta el historial y emite acciones sin conocer HTTP ni modelos de Proyectos. */
@Component({
  selector: 'app-panel-asistente-ia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorCampoDirective, IconoComponent, FechaPipe],
  templateUrl: './panel-asistente-ia.html',
  styleUrl: './panel-asistente-ia.css',
})
export class PanelAsistenteIA {

  /** Construye los controles reactivos administrados por el componente. */
  private readonly constructorFormulario = inject(NonNullableFormBuilder);

  /** Referencia lista mensajes dentro de la vista. */
  private readonly listaMensajes = viewChild<ElementRef<HTMLElement>>('listaMensajes');

  /** Recibe el historial confirmado que debe presentar el panel. */
  public readonly mensajes = input.required<readonly MensajeAsistenteIA[]>();

  /** Identifica la sección utilizada como contexto del siguiente turno. */
  public readonly nombreSeccion = input.required<string>();

  /** Representa la consulta inicial del historial. */
  public readonly cargando = input(false);

  /** Impide interactuar con una conversación cuyo historial no pudo recuperarse. */
  public readonly errorCarga = input(false);

  /** Representa una interacción pendiente con el modelo. */
  public readonly enviando = input(false);

  /** Presenta optimistamente el texto mientras el backend confirma ambos turnos. */
  public readonly mensajePendiente = input<string | null>(null);

  /** Identifica la propuesta que se está aplicando o rechazando. */
  public readonly propuestaProcesando = input<number | null>(null);

  /** Solicita cerrar el panel no modal. */
  public readonly cerrar = output<void>();

  /** Solicita recuperar nuevamente el historial. */
  public readonly reintentar = output<void>();

  /** Entrega un mensaje validado y normalizado para su envío. */
  public readonly mensajeEnviado = output<string>();

  /** Solicita confirmar una propuesta identificada por su mensaje. */
  public readonly propuestaAplicada = output<number>();

  /** Solicita rechazar una propuesta identificada por su mensaje. */
  public readonly propuestaRechazada = output<number>();

  /** Conserva límite mensaje para coordinar esta responsabilidad. */
  protected readonly limiteMensaje = LIMITE_MENSAJE_ASISTENTE_IA;

  /** Conserva acciones rápidas para coordinar esta responsabilidad. */
  protected readonly accionesRapidas = ACCIONES_RAPIDAS_ASISTENTE_IA;

  /** Conserva mensajes campo mensaje para coordinar esta responsabilidad. */
  protected readonly mensajesCampoMensaje = MENSAJES_CAMPO_MENSAJE_ASISTENTE_IA;

  /** Conserva roles para coordinar esta responsabilidad. */
  protected readonly roles = RolMensajeAsistenteIA;

  /** Indica estados propuesta dentro del estado actual. */
  protected readonly estadosPropuesta = EstadoPropuestaAsistenteIA;

  /** Administra los valores y validaciones del formulario reactivo. */
  protected readonly formulario = this.constructorFormulario.group({
    mensaje: ['', [validarTextoRequerido, Validators.maxLength(this.limiteMensaje)]],
  });

  /** Deriva operación bloqueada a partir del estado vigente. */
  protected readonly operacionBloqueada = computed(
    () =>
      this.cargando() ||
      this.errorCarga() ||
      this.enviando() ||
      this.propuestaProcesando() !== null,
  );

  public constructor() {
    effect(() => {
      if (this.operacionBloqueada() && this.formulario.enabled) {
        this.formulario.disable({ emitEvent: false });
      } else if (!this.operacionBloqueada() && this.formulario.disabled) {
        this.formulario.enable({ emitEvent: false });
      }
    });
    effect(() => {
      this.mensajes().length;
      this.mensajePendiente();
      queueMicrotask(() => {
        const lista = this.listaMensajes()?.nativeElement;
        if (lista) lista.scrollTop = lista.scrollHeight;
      });
    });
  }

  /** Ejecuta enviar como parte del flujo interno. */
  protected enviar(): void {
    if (this.operacionBloqueada()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const mensaje = this.formulario.controls.mensaje.value.trim();
    this.mensajeEnviado.emit(mensaje);
    this.formulario.reset();
  }

  /** Inicia una solicitud sugerida desde el estado de bienvenida. */
  protected ejecutarAccionRapida(mensaje: string): void {
    if (this.operacionBloqueada()) return;

    this.mensajeEnviado.emit(mensaje);
    this.formulario.reset();
  }

  /** Envía con Enter y conserva Shift + Enter para redactar en varias líneas. */
  protected manejarTeclado(evento: KeyboardEvent): void {
    if (evento.key !== 'Enter' || evento.shiftKey || evento.isComposing) return;

    evento.preventDefault();
    this.enviar();
  }
}
